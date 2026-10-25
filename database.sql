-- ============================================================
-- SKRIP DATABASE SUPABASE PANGGILKAMI
-- Jalankan di SQL Editor Supabase (https://supabase.com)
-- ============================================================

-- 1. TABEL PESANAN (Orders & Bukti Pembayaran)
create table if not exists orders (
  id text primary key,
  uid text not null default '',
  data jsonb not null,
  upd bigint not null
);
create index if not exists orders_upd_idx on orders (upd);
create index if not exists orders_uid_idx on orders (uid);
alter table orders enable row level security;
drop policy if exists "pk_orders_all" on orders;
create policy "pk_orders_all" on orders for all to public using (true) with check (true);

-- 2. TABEL PENGGUNA (Users & Pelanggan Terdaftar)
create table if not exists users (
  id text primary key,
  email text not null,
  role text not null default 'user',
  data jsonb not null,
  upd bigint not null
);
create index if not exists users_upd_idx on users (upd);
create index if not exists users_email_idx on users (email);
alter table users enable row level security;
drop policy if exists "pk_users_all" on users;
create policy "pk_users_all" on users for all to public using (true) with check (true);

-- 3. TABEL TESTIMONI & ULASAN (Testimonials)
create table if not exists testimonials (
  id text primary key,
  data jsonb not null,
  upd bigint not null
);
create index if not exists testimonials_upd_idx on testimonials (upd);
alter table testimonials enable row level security;
drop policy if exists "pk_testimonials_all" on testimonials;
create policy "pk_testimonials_all" on testimonials for all to public using (true) with check (true);
