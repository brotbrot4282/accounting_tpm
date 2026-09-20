-- ============================================================
-- Tujuh Pilar - Pembukuan Keuangan
-- Jalankan seluruh file ini di Supabase SQL Editor (SQL.new)
-- ============================================================

-- Ekstensi untuk UUID generator
create extension if not exists "pgcrypto";

-- ============================================================
-- TABEL PROFILES (menyambung ke auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABEL KAS (akun / sumber dana)
-- ============================================================
create table if not exists public.kas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  tipe text not null check (tipe in ('Kas', 'Rekening', 'E-Wallet')),
  saldo_awal numeric(15, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.kas enable row level security;

-- ============================================================
-- TABEL KATEGORI
-- ============================================================
create table if not exists public.kategori (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  tipe text not null check (tipe in ('Pemasukan', 'Pengeluaran')),
  warna text not null default '#10b981',
  created_at timestamptz not null default now(),
  unique (user_id, nama, tipe)
);

alter table public.kategori enable row level security;

-- ============================================================
-- TABEL KONTAK / MITRA
-- ============================================================
create table if not exists public.kontak (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  tipe text not null check (tipe = 'Mitra'),
  nama_leader text,
  telepon text,
  keterangan text,
  created_at timestamptz not null default now()
);

alter table public.kontak enable row level security;

-- ============================================================
-- TABEL TRANSAKSI
-- ============================================================
create table if not exists public.transaksi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tanggal date not null default current_date,
  jenis text not null check (jenis in ('Pemasukan', 'Pengeluaran')),
  jumlah numeric(15, 2) not null check (jumlah > 0),
  keterangan text,
  kas_id uuid references public.kas (id) on delete restrict,
  kategori_id uuid references public.kategori (id) on delete restrict,
  kontak_id uuid references public.kontak (id) on delete set null,
  tipe_penjualan text check (tipe_penjualan in ('PO Paket Reguler', 'VIP')),
  nama_mitra text,
  nama_leader text,
  no_hp text,
  created_at timestamptz not null default now()
);

alter table public.transaksi enable row level security;

-- Indeks untuk performa filter & laporan
create index if not exists idx_transaksi_user_tanggal on public.transaksi (user_id, tanggal);
create index if not exists idx_transaksi_user_jenis on public.transaksi (user_id, jenis);
create index if not exists idx_kas_user on public.kas (user_id);
create index if not exists idx_kategori_user on public.kategori (user_id);
create index if not exists idx_kontak_user on public.kontak (user_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================
-- Profiles
create policy "select own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Kas
create policy "kas per user" on public.kas
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Kategori
create policy "kategori per user" on public.kategori
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Kontak
create policy "kontak per user" on public.kontak
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Transaksi
create policy "transaksi per user" on public.transaksi
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- SEED DATA DEFAULT (dibuat otomatis saat user pertama daftar)
-- ============================================================
create or replace function public.seed_initial_data()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.kas (user_id, nama, tipe, saldo_awal)
  values (new.id, 'Kas Utama', 'Kas', 0);

  insert into public.kategori (user_id, nama, tipe, warna) values
    (new.id, 'Pendapatan Jasa', 'Pemasukan', '#10b981'),
    (new.id, 'Penjualan Produk', 'Pemasukan', '#3b82f6'),
    (new.id, 'Pendapatan Lain', 'Pemasukan', '#8b5cf6'),
    (new.id, 'Gaji Karyawan', 'Pengeluaran', '#ef4444'),
    (new.id, 'Operasional', 'Pengeluaran', '#f59e0b'),
    (new.id, 'Perlengkapan', 'Pengeluaran', '#ec4899'),
    (new.id, 'Transportasi', 'Pengeluaran', '#06b6d4'),
    (new.id, 'Lain-lain', 'Pengeluaran', '#64748b');

  return new;
end;
$$;

drop trigger if exists on_profile_created_seed on public.profiles;
create trigger on_profile_created_seed
  after insert on public.profiles
  for each row execute procedure public.seed_initial_data();