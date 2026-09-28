do $$
declare a uuid; b uuid; ca uuid; cb uuid; n int; r record; ok boolean;
begin
  select id into a from auth.users where email='rls-a@starsteps.test';
  select id into b from auth.users where email='rls-b@starsteps.test';
  if a is null or b is null then raise exception 'test users missing'; end if;
  -- trigger created parent + subscription rows
  if (select count(*) from parents where id in (a,b)) <> 2 then raise exception 'FAIL parents trigger'; end if;
  if (select count(*) from subscriptions where parent_id in (a,b) and tier='free') <> 2 then raise exception 'FAIL subscription trigger'; end if;

  -- act as parent A
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  set local role authenticated;
  insert into children(parent_id,name,grade) values (a,'Maya',2) returning id into ca;
  -- A cannot create a child for B
  begin insert into children(parent_id,name,grade) values (b,'Hack',1); raise exception 'FAIL A inserted for B';
  exception when insufficient_privilege or check_violation then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  -- save progress: first write rev 1, stale write conflicts, fresh write rev 2
  select * into r from save_progress(ca,'{"stars":5}'::jsonb,0); if r.rev<>1 or r.conflict then raise exception 'FAIL first save %',r; end if;
  select * into r from save_progress(ca,'{"stars":6}'::jsonb,0); if not r.conflict or (r.server_state->>'stars')<>'5' then raise exception 'FAIL stale not detected %',r; end if;
  select * into r from save_progress(ca,'{"stars":7}'::jsonb,1); if r.rev<>2 or r.conflict then raise exception 'FAIL second save %',r; end if;
  -- A cannot touch subscriptions or prices
  begin update subscriptions set tier='super' where parent_id=a; raise exception 'FAIL A upgraded self';
  exception when insufficient_privilege then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin perform 1 from prices; raise exception 'FAIL A read prices';
  exception when insufficient_privilege then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin update children set parent_id=b where id=ca; raise exception 'FAIL A moved child';
  exception when insufficient_privilege then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  select entitled into ok from my_plan(); if ok then raise exception 'FAIL free parent entitled'; end if;
  -- limit of 4
  insert into children(parent_id,name) values (a,'K2'),(a,'K3'),(a,'K4');
  begin insert into children(parent_id,name) values (a,'K5'); raise exception 'FAIL fifth child allowed';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; if sqlerrm not like '%up to 4%' then raise exception 'FAIL wrong limit error: %',sqlerrm; end if; end;
  -- bad names rejected
  begin insert into children(parent_id,name) values (a,'<script>'); raise exception 'FAIL bad name';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  reset role;

  -- act as parent B: sees nothing of A
  perform set_config('request.jwt.claims', json_build_object('sub',b,'role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from children; if n<>0 then raise exception 'FAIL B sees % children',n; end if;
  select count(*) into n from progress; if n<>0 then raise exception 'FAIL B sees progress'; end if;
  select count(*) into n from parents; if n<>1 then raise exception 'FAIL B sees % parents',n; end if;
  begin perform save_progress(ca,'{"stars":999}'::jsonb,2); raise exception 'FAIL B wrote A progress';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  update children set name='Pwned' where id=ca; get diagnostics n = row_count; if n<>0 then raise exception 'FAIL B renamed A child'; end if;
  delete from children where id=ca; get diagnostics n = row_count; if n<>0 then raise exception 'FAIL B deleted A child'; end if;
  reset role;

  -- anon gets nothing
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);
  set local role anon;
  begin perform 1 from children; raise exception 'FAIL anon read children';
  exception when insufficient_privilege then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  begin perform my_plan(); raise exception 'FAIL anon ran my_plan';
  exception when insufficient_privilege then null; when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  reset role;

  -- entitlement logic
  update subscriptions set tier='super', status='trialing', current_period_end=now()+interval '7 days' where parent_id=a;
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  set local role authenticated;
  select entitled into ok from my_plan(); if not ok then raise exception 'FAIL trialing not entitled'; end if;
  reset role;
  update subscriptions set status='canceled' where parent_id=a;
  set local role authenticated;
  select entitled into ok from my_plan(); if ok then raise exception 'FAIL canceled still entitled'; end if;
  reset role;
  update subscriptions set status='active', current_period_end=now()-interval '5 days' where parent_id=a;
  set local role authenticated;
  select entitled into ok from my_plan(); if ok then raise exception 'FAIL expired period entitled'; end if;
  reset role;
  raise notice 'ALL RLS TESTS PASSED';
  raise exception 'ROLLBACK_OK';  -- undo all test writes
end $$;
