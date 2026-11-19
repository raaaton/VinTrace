begin;
alter table public.vehicles
 add column if not exists public_token uuid not null default gen_random_uuid(),
 add column if not exists showroom_description text not null default '',
 add column if not exists showroom_gallery text[] not null default '{}',
 add column if not exists showroom_show_costs boolean not null default true,
 add column if not exists showroom_mask_vin boolean not null default false,
 add column if not exists showroom_entry_preference text not null default 'ask'
 check (showroom_entry_preference in ('ask','public','private'));
create unique index if not exists vehicles_public_token_idx on public.vehicles(public_token);
alter table public.entries
 add column if not exists showroom_visible boolean,
 add column if not exists showroom_show_notes boolean not null default false,
 add column if not exists showroom_photo_indices integer[] not null default '{}';
update public.entries set showroom_visible=true where showroom_visible is null;

-- Public access must go through the server's field allowlist, never raw rows.
alter table public.vehicles enable row level security;
alter table public.entries enable row level security;
drop policy if exists showroom_owner_read_guard on public.vehicles;
create policy showroom_owner_read_guard on public.vehicles as restrictive for select to anon, authenticated using (owner_id=auth.uid());
drop policy if exists showroom_owner_read_guard on public.entries;
create policy showroom_owner_read_guard on public.entries as restrictive for select to anon, authenticated using (owner_id=auth.uid());
-- These permissive policies work alongside existing restrictive policies.
drop policy if exists showroom_owner_access on public.vehicles;
create policy showroom_owner_access on public.vehicles for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists showroom_owner_access on public.entries;
create policy showroom_owner_access on public.entries for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and exists(select 1 from public.vehicles v where v.id=vehicle_id and v.owner_id=auth.uid()));

create or replace function public.showroom_entry_visibility() returns trigger language plpgsql set search_path='' as $$
declare v public.vehicles;
begin
 select * into v from public.vehicles where id=new.vehicle_id for share;
 if v.id is null or v.owner_id <> new.owner_id then raise exception 'Vehicle ownership mismatch'; end if;
 if not v.is_public then new.showroom_visible:=coalesce(new.showroom_visible,true);
 elsif v.showroom_entry_preference='public' then new.showroom_visible:=true;
 elsif v.showroom_entry_preference='private' then new.showroom_visible:=false;
 elsif new.showroom_visible is null then raise exception 'Choose showroom visibility'; end if;
 return new;
end $$;
drop trigger if exists showroom_entry_visibility on public.entries;
create trigger showroom_entry_visibility before insert on public.entries for each row execute function public.showroom_entry_visibility();
-- Keep legacy event_files metadata private too (including original URLs).
alter table public.event_files enable row level security;
drop policy if exists showroom_owner_read_guard on public.event_files;
create policy showroom_owner_read_guard on public.event_files as restrictive for select to anon, authenticated using(owner_id=auth.uid());

-- All customization changes commit together, including privacy changes.
create or replace function public.save_showroom_settings(p_vehicle_id uuid, p_settings jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare v public.vehicles; item jsonb;
begin
 select * into v from public.vehicles where id=p_vehicle_id and owner_id=auth.uid() for update;
 if v.id is null then raise exception 'Vehicle not found'; end if;
 if length(p_settings->>'description')>5000
  or p_settings->>'preference' not in ('ask','public','private')
  or jsonb_array_length(p_settings->'gallery')>20 then raise exception 'Invalid settings'; end if;
 update public.vehicles set
  showroom_description=p_settings->>'description',
  showroom_show_costs=(p_settings->>'showCosts')::boolean,
  showroom_mask_vin=(p_settings->>'maskVin')::boolean,
  showroom_entry_preference=p_settings->>'preference',
  showroom_gallery=array(select jsonb_array_elements_text(p_settings->'gallery'))
 where id=v.id and owner_id=auth.uid();
 for item in select jsonb_array_elements(p_settings->'entries') loop
  update public.entries set
   showroom_visible=(item->>'visible')::boolean,
   showroom_show_notes=(item->>'showNotes')::boolean,
   showroom_photo_indices=array(select value::integer from jsonb_array_elements_text(item->'photos'))
  where id=(item->>'id')::uuid and vehicle_id=v.id and owner_id=auth.uid();
  if not found then raise exception 'Event not found'; end if;
 end loop;
end $$;
revoke all on function public.save_showroom_settings(uuid,jsonb) from public, anon;
grant execute on function public.save_showroom_settings(uuid,jsonb) to authenticated;
commit;
