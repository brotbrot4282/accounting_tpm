export type JenisTransaksi = "Pemasukan" | "Pengeluaran";
export type TipeKas = "Kas" | "Rekening" | "E-Wallet";
export type TipeKontak = "Mitra";

export type TipePenjualan = "PO Paket Reguler" | "VIP";

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Kas {
  id: string;
  user_id: string;
  nama: string;
  tipe: TipeKas;
  saldo_awal: number;
  created_at: string;
}

export interface Kategori {
  id: string;
  user_id: string;
  nama: string;
  tipe: JenisTransaksi;
  warna: string;
  created_at: string;
}

export interface Kontak {
  id: string;
  user_id: string;
  nama: string;
  tipe: TipeKontak;
  nama_leader: string | null;
  telepon: string | null;
  keterangan: string | null;
  created_at: string;
}

export interface Transaksi {
  id: string;
  user_id: string;
  tanggal: string;
  jenis: JenisTransaksi;
  jumlah: number;
  keterangan: string | null;
  kas_id: string | null;
  kategori_id: string | null;
  kontak_id: string | null;
  tipe_penjualan: TipePenjualan | null;
  nama_mitra: string | null;
  nama_leader: string | null;
  no_hp: string | null;
  created_at: string;
}

export interface TransaksiWithRelasi extends Transaksi {
  kas?: { id: string; nama: string; tipe: TipeKas } | null;
  kategori?: { id: string; nama: string; warna: string; tipe: JenisTransaksi } | null;
  kontak?: { id: string; nama: string; tipe: TipeKontak } | null;
}

export interface KasWithSaldo extends Kas {
  saldo: number;
}