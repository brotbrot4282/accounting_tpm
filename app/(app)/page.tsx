import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  EmptyState,
  StatCard,
  Badge,
} from "@/components/ui";
import CashFlowChart, {
  type CashFlowPoint,
} from "@/components/charts/CashFlowChart";
import KategoriChart, {
  type KategoriPoint,
} from "@/components/charts/KategoriChart";
import { TambahTransaksiButton } from "@/components/TransaksiButtons";
import { TambahKasButton } from "@/components/KasModal";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import type {
  Kas,
  Kategori,
  TransaksiWithRelasi,
} from "@/types/database";

const TIPE_BADGE: Record<string, "blue" | "amber" | "slate"> = {
  Rekening: "blue",
  "E-Wallet": "amber",
  Kas: "slate",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [kasRes, transRes, kategoriRes] = await Promise.all([
    supabase.from("kas").select("id, nama, tipe, saldo_awal"),
    supabase
      .from("transaksi")
      .select(
        "id, tanggal, jenis, jumlah, kas_id, kategori_id, keterangan, created_at, tipe_penjualan, nama_mitra, nama_leader, no_hp, kas(nama, tipe), kategori(nama, warna)"
      ),
    supabase.from("kategori").select("id, nama, tipe, warna"),
  ]);

  const kasList = (kasRes.data ?? []) as Kas[];
  const transaksi = (transRes.data ?? []) as unknown as TransaksiWithRelasi[];
  const kategoriList = (kategoriRes.data ?? []) as Kategori[];

  const now = new Date();

  if (kasList.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-slate-300">
            <Landmark className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Selamat datang!</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Akunmu sudah siap. Tambahkan kas pertama (Kas Utama, rekening bank,
            atau e-wallet) untuk mulai mencatat keuangan perusahaan Tujuh Pilar.
          </p>
          <div className="mt-6 flex justify-center">
            <TambahKasButton />
          </div>
        </Card>
      </div>
    );
  }

  const saldoMap = new Map(
    kasList.map((k) => [k.id, Number(k.saldo_awal) ?? 0])
  );
  for (const t of transaksi) {
    if (t.kas_id) {
      const cur = saldoMap.get(t.kas_id) ?? 0;
      saldoMap.set(
        t.kas_id,
        cur + (t.jenis === "Pemasukan" ? Number(t.jumlah) : -Number(t.jumlah))
      );
    }
  }

  const totalSaldo = [...saldoMap.values()].reduce((a, b) => a + b, 0);

  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const perBulan: Record<string, { pemasukan: number; pengeluaran: number }> =
    {};
  for (const key of monthKeys) perBulan[key] = { pemasukan: 0, pengeluaran: 0 };

  const kategoriIn: Record<string, KategoriPoint> = {};
  const kategoriOut: Record<string, KategoriPoint> = {};

  const sixBulanAwal = monthKeys[0];
  const sixBulanAkhir = monthKeys[5];

  for (const t of transaksi) {
    const key = t.tanggal.slice(0, 7);
    if (key >= sixBulanAwal && key <= sixBulanAkhir) {
      if (t.jenis === "Pemasukan") perBulan[key].pemasukan += Number(t.jumlah);
      else perBulan[key].pengeluaran += Number(t.jumlah);

      const nama = t.kategori?.nama ?? "Tanpa Kategori";
      const warna = t.kategori?.warna ?? "#94a3b8";
      const map = t.jenis === "Pemasukan" ? kategoriIn : kategoriOut;
      if (!map[nama]) map[nama] = { name: nama, value: 0, color: warna };
      map[nama].value += Number(t.jumlah);
    }
  }

  const dataChart: CashFlowPoint[] = monthKeys.map((key) => ({
    name: new Intl.DateTimeFormat("id-ID", { month: "short" })
      .format(new Date(`${key}-01T00:00:00`))
      .toString(),
    pemasukan: perBulan[key].pemasukan,
    pengeluaran: perBulan[key].pengeluaran,
  }));

  const totalPemasukan6 = dataChart.reduce((a, b) => a + b.pemasukan, 0);
  const totalPengeluaran6 = dataChart.reduce((a, b) => a + b.pengeluaran, 0);

  const listIn = Object.values(kategoriIn).sort((a, b) => b.value - a.value);
  const listOut = Object.values(kategoriOut).sort((a, b) => b.value - a.value);

  const recent = transaksi.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Ringkasan keuangan{" "}
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(now)}
          </p>
        </div>
        <TambahTransaksiButton
          lists={{ kasList, kategoriList }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Saldo"
          value={formatRupiah(totalSaldo)}
          icon={<Wallet className="h-5 w-5" />}
          accent="slate"
        />
        <StatCard
          label="Pemasukan (6 bulan)"
          value={formatRupiah(totalPemasukan6)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Pengeluaran (6 bulan)"
          value={formatRupiah(totalPengeluaran6)}
          icon={<ArrowDownCircle className="h-5 w-5" />}
          accent="red"
        />
        <StatCard
          label="Selisih (6 bulan)"
          value={formatRupiah(totalPemasukan6 - totalPengeluaran6)}
          icon={<PiggyBank className="h-5 w-5" />}
          accent="blue"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Arus Kas 6 Bulan Terakhir" />
          <div className="p-5">
            <CashFlowChart data={dataChart} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Saldo per Kas / Akun" />
          <ul className="divide-y divide-white/10">
            {kasList.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-400">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {k.nama}
                    </p>
                    <Badge color={TIPE_BADGE[k.tipe]}>{k.tipe}</Badge>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  {formatRupiah(saldoMap.get(k.id) ?? 0)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Pemasukan per Kategori"
            subtitle="6 bulan terakhir"
          />
          <div className="p-5">
            <KategoriChart
              data={listIn}
              total={listIn.reduce((a, b) => a + b.value, 0)}
            />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Pengeluaran per Kategori"
            subtitle="6 bulan terakhir"
          />
          <div className="p-5">
            <KategoriChart
              data={listOut}
              total={listOut.reduce((a, b) => a + b.value, 0)}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Transaksi Terbaru"
          subtitle="8 transaksi terakhir"
          action={
            <Link
              href="/transaksi"
              className="text-sm font-semibold text-slate-300 hover:text-white"
            >
              Lihat semua →
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Mulai catat pemasukan atau pengeluaran pertama perusahaanmu."
          />
        ) : (
          <ul className="divide-y divide-white/10">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={
                    t.jenis === "Pemasukan"
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                      : "flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15 text-red-400"
                  }
                >
                  {t.jenis === "Pemasukan" ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {t.kategori?.nama ?? "Tanpa Kategori"}
                    {t.tipe_penjualan ? (
                      <span className="text-slate-400"> · {t.tipe_penjualan}</span>
                    ) : null}
                    {t.nama_mitra ? (
                      <span className="text-slate-400"> · {t.nama_mitra}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatTanggalPendek(t.tanggal)} · {t.kas?.nama}
                  </p>
                </div>
                <p
                  className={
                    t.jenis === "Pemasukan"
                      ? "text-sm font-semibold text-emerald-400"
                      : "text-sm font-semibold text-red-400"
                  }
                >
                  {t.jenis === "Pemasukan" ? "+" : "-"}
                  {formatRupiah(Number(t.jumlah))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}