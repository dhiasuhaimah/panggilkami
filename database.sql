create table if not exists orders (
  id text primary key,
  uid text not null default '',
  data jsonb not null,
  upd bigint not null
);
create table if not exists testimonials (
  id text primary key,
  data jsonb not null,
  upd bigint not null
);
create index if not exists orders_upd_idx on orders (upd);
create index if not exists testimonials_upd_idx on testimonials (upd);
alter table orders enable row level security;
alter table testimonials enable row level security;
drop policy if exists "pk_orders_all" on orders;
drop policy if exists "pk_testimonials_all" on testimonials;
create policy "pk_orders_all" on orders for all to anon using (true) with check (true);
create policy "pk_testimonials_all" on testimonials for all to anon using (true) with check (true);
