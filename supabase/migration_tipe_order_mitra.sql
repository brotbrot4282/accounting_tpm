-- ============================================================
-- MIGRASI: Tipe Order (PO Paket Reguler / VIP) + data Mitra di transaksi
-- dan kontak: semua jadi 'Mitra' (+ kolom nama_leader)
-- ============================================================

-- 1. transaksi: kolom baru (tipe order + data mitra)
alter table public.transaksi
  add column if not exists tipe_penjualan text check (tipe_penjualan in ('PO Paket Reguler', 'VIP')),
  add column if not exists nama_mitra text,
  add column if not exists nama_leader text,
  add column if not exists no_hp text;

-- 2. kontak: semua tipe menjadi 'Mitra' + kolom nama_leader
alter table public.kontak
  add column if not exists nama_leader text;

update public.kontak
  set tipe = 'Mitra'
  where tipe in ('Vendor', 'Customer');

alter table public.kontak
  drop constraint if exists kontak_tipe_check;

alter table public.kontak
  add constraint kontak_tipe_check check (tipe = 'Mitra');