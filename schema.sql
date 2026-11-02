-- รันใน Supabase: SQL Editor > New query > วางทั้งไฟล์ > Run
create table if not exists tickets (
  id bigint generated always as identity primary key,
  cat int not null,
  b text not null,
  f text,
  r text not null,
  d text not null,
  who text default '-',
  st int not null default 0,
  pri boolean not null default false,
  img text,
  log jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- รหัสแอดมินเก็บในฐานข้อมูล ไม่อยู่ในโค้ดหน้าเว็บ (เปลี่ยนค่าได้ตามต้องการ)
create table if not exists admin_secret (pin text not null);
delete from admin_secret;
insert into admin_secret (pin) values ('12345678');

alter table tickets enable row level security;
alter table admin_secret enable row level security;

drop policy if exists "tickets_read" on tickets;
drop policy if exists "tickets_insert" on tickets;
create policy "tickets_read" on tickets for select using (true);
create policy "tickets_insert" on tickets for insert with check (st = 0);
-- ไม่มี policy update/delete: การเปลี่ยนสถานะต้องผ่านฟังก์ชันด้านล่าง (ต้องมีรหัสแอดมิน)

create or replace function admin_check(p_pin text) returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from admin_secret where pin = p_pin)
$$;

create or replace function set_status(p_id bigint, p_st int, p_pin text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from admin_secret where pin = p_pin) then
    raise exception 'unauthorized';
  end if;
  if p_st < 0 or p_st > 3 then raise exception 'bad status'; end if;
  update tickets
     set st = p_st,
         log = log || jsonb_build_array(jsonb_build_array(floor(extract(epoch from now()) * 1000), p_st))
   where id = p_id;
end $$;

grant execute on function admin_check(text) to anon;
grant execute on function set_status(bigint, int, text) to anon;
