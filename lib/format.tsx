export function classNames(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

export function formatRupiah(value: number | string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTanggal(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(d);
}

export function formatTanggalPendek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function namaBulan(bulan: string): string {
  const [tahun, bulanNum] = bulan.split("-").map(Number);
  if (!tahun || !bulanNum) return bulan;
  return new Intl.DateTimeFormat("id-ID", { month: "long" })
    .format(new Date(tahun, bulanNum - 1, 1))
    .replace(/^./, (c) => c.toUpperCase());
}

// ---- Gaya form bersama (dipakai komponen form & filter) ----
export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30";
export const selectClass = inputClass;
export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

// ---- Konstanta pilihan ----
export const JENIS_TRANSAKSI = ["Pemasukan", "Pengeluaran"] as const;
export const TIPE_KAS = ["Kas", "Rekening", "E-Wallet"] as const;
export const TIPE_KONTAK = ["Vendor", "Customer"] as const;

export const WARNA_KATEGORI = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#6366f1",
  "#84cc16",
  "#f97316",
  "#14b8a6",
  "#0ea5e9",
  "#a855f7",
  "#64748b",
  "#78716c",
];
