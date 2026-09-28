-- Scale: evaluate auth.uid() once per query instead of once per row (Supabase advisor auth_rls_initplan).
begin;
drop policy parents_own_select on public.parents;
drop policy children_own_select on public.children;
drop policy children_own_insert on public.children;
drop policy children_own_update on public.children;
drop policy children_own_delete on public.children;
drop policy progress_own_select on public.progress;
drop policy subscriptions_own_select on public.subscriptions;
create policy parents_own_select on public.parents for select to authenticated using (id = (select auth.uid()));
create policy children_own_select on public.children for select to authenticated using (parent_id = (select auth.uid()));
create policy children_own_insert on public.children for insert to authenticated with check (parent_id = (select auth.uid()));
create policy children_own_update on public.children for update to authenticated using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
create policy children_own_delete on public.children for delete to authenticated using (parent_id = (select auth.uid()));
create policy progress_own_select on public.progress for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy subscriptions_own_select on public.subscriptions for select to authenticated using (parent_id = (select auth.uid()));
commit;
select tablename, policyname from pg_policies where schemaname='public' order by 1,2;
