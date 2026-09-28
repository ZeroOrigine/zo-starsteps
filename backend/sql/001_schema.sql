-- Star Steps schema v1 (2026-09-28). Parents own everything; children are first name + grade only.
create extension if not exists pgcrypto;

create table public.parents (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 20 and name !~ '[<>@/\\]'),
  grade smallint not null default 1 check (grade between 0 and 6),
  created_at timestamptz not null default now()
);
create index children_parent_idx on public.children(parent_id);

create table public.progress (
  child_id uuid primary key references public.children(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  rev bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint progress_state_size check (pg_column_size(state) < 524288)
);

create table public.subscriptions (
  parent_id uuid primary key references public.parents(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null default 'free' check (tier in ('free','pro','super')),
  cycle text check (cycle in ('monthly','yearly')),
  status text not null default 'none',
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  had_trial boolean not null default false,
  livemode boolean,
  updated_at timestamptz not null default now()
);

-- server-only tables
create table public.prices (
  key text primary key check (key ~ '^(pro|super)_(monthly|yearly)_(live|test)$'),
  stripe_price_id text not null unique,
  tier text not null check (tier in ('pro','super')),
  cycle text not null check (cycle in ('monthly','yearly')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  livemode boolean not null
);
create table public.app_config (key text primary key, value text not null, updated_at timestamptz not null default now());
create table public.stripe_events (
  id text primary key, type text not null, livemode boolean,
  received_at timestamptz not null default now(), processed_at timestamptz, error text
);
create table public.email_log (
  id bigint generated always as identity primary key,
  parent_id uuid, kind text not null, to_email text, status integer, error text,
  created_at timestamptz not null default now()
);

-- a family has up to 4 child profiles (race-safe)
create or replace function public.enforce_child_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext('children:'||new.parent_id::text));
  if (select count(*) from public.children where parent_id = new.parent_id) >= 4 then
    raise exception 'A family can have up to 4 child profiles' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger children_limit before insert on public.children
  for each row execute function public.enforce_child_limit();

-- every new sign-up gets a parent row and a free subscription row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.parents(id, email) values (new.id, coalesce(new.email,'')) on conflict (id) do nothing;
  insert into public.subscriptions(parent_id) values (new.id) on conflict (parent_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.parents set email = coalesce(new.email,'') where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_email after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- progress save with optimistic concurrency: writes only when the caller saw the latest rev
create or replace function public.save_progress(p_child uuid, p_state jsonb, p_base_rev bigint)
returns table(rev bigint, conflict boolean, server_state jsonb, server_updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare cur record;
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if not exists (select 1 from public.children c where c.id = p_child and c.parent_id = auth.uid()) then
    raise exception 'not your child profile' using errcode = '42501';
  end if;
  if jsonb_typeof(p_state) <> 'object' then raise exception 'state must be an object' using errcode = '22023'; end if;
  select * into cur from public.progress where child_id = p_child for update;
  if not found then
    if coalesce(p_base_rev,0) <> 0 then
      return query select 0::bigint, true, null::jsonb, null::timestamptz; return;
    end if;
    insert into public.progress(child_id, state, rev, updated_at) values (p_child, p_state, 1, now());
    return query select 1::bigint, false, null::jsonb, now(); return;
  end if;
  if cur.rev <> coalesce(p_base_rev,-1) then
    return query select cur.rev, true, cur.state, cur.updated_at; return;
  end if;
  update public.progress set state = p_state, rev = cur.rev + 1, updated_at = now() where child_id = p_child;
  return query select cur.rev + 1, false, null::jsonb, now();
end $$;

-- the plan a parent is entitled to right now (server truth)
create or replace function public.my_plan()
returns table(tier text, status text, cycle text, entitled boolean, current_period_end timestamptz,
              trial_end timestamptz, cancel_at_period_end boolean, had_trial boolean)
language sql stable security definer set search_path = public as $$
  select s.tier, s.status, s.cycle,
         (s.tier <> 'free' and s.status in ('active','trialing','past_due')
          and (s.current_period_end is null or s.current_period_end > now() - interval '3 days')) as entitled,
         s.current_period_end, s.trial_end, s.cancel_at_period_end, s.had_trial
  from public.subscriptions s where s.parent_id = auth.uid();
$$;

-- row level security: a parent sees only their own family
alter table public.parents enable row level security;
alter table public.children enable row level security;
alter table public.progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.prices enable row level security;
alter table public.app_config enable row level security;
alter table public.stripe_events enable row level security;
alter table public.email_log enable row level security;

create policy parents_own_select on public.parents for select to authenticated using (id = auth.uid());
create policy children_own_select on public.children for select to authenticated using (parent_id = auth.uid());
create policy children_own_insert on public.children for insert to authenticated with check (parent_id = auth.uid());
create policy children_own_update on public.children for update to authenticated using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy children_own_delete on public.children for delete to authenticated using (parent_id = auth.uid());
create policy progress_own_select on public.progress for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid()));
create policy subscriptions_own_select on public.subscriptions for select to authenticated using (parent_id = auth.uid());

-- least privilege: anon gets nothing; signed-in parents only what the policies allow
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;
grant select on public.parents to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select on public.progress to authenticated;
grant select on public.subscriptions to authenticated;
revoke update on public.children from authenticated;
grant update (name, grade) on public.children to authenticated;
grant execute on function public.save_progress(uuid, jsonb, bigint) to authenticated;
grant execute on function public.my_plan() to authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated, public;
