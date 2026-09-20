import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, EmptyState, Badge, PageHeader } from "@/components/ui";
import KategoriChart, { type KategoriPoint } from "@/components/charts/KategoriChart";
import LaporanControls from "@/components/LaporanControls";
import { formatRupiah, formatTanggalPendek, namaBulan } from "@/lib/format";
import type { TransaksiWithRelasi } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const bulan = typeof params.bulan === "string" ? params.bulan : defaultBulan;
  const jenis =
    typeof params.jenis === "string" && params.jenis ? params.jenis : "";

  const [tahun, bulanNum] = bulan.split("-");
  const akhir =
    bulanNum === "12"
      ? `${Number(tahun) + 1}-01-01`
      : `${tahun}-${String(Number(bulanNum) + 1).padStart(2, "0")}-01`;

  const supabase = await createClient();

  let query = supabase
    .from("transaksi")
    .select(
      "id, tanggal, jenis, jumlah, kas_id, kategori_id, kontak_id, keterangan, created_at, kas(nama), kategori(nama, warna), kontak(nama)"
    )
    .gte("tanggal", `${tahun}-${bulanNum}-01`)
    .lt("tanggal", akhir);

  const { data: transRes } = await query.order("tanggal").order("created_at");

  const transaksi = (transRes ?? []) as unknown as TransaksiWithRelasi[];

  const filtered = jenis ? transaksi.filter((t) => t.jenis === jenis) : transaksi;

  const totalMasuk = transaksi
    .filter((t) => t.jenis === "Pemasukan")
    .reduce((a, b) => a + Number(b.jumlah), 0);
  const totalKeluar = transaksi
    .filter((t) => t.jenis === "Pengeluaran")
    .reduce((a, b) => a + Number(b.jumlah), 0);

  function breakdown(prevFilter: string): KategoriPoint[] {
    const map: Record<string, KategoriPoint> = {};
    for (const t of transaksi) {
      if (t.jenis !== prevFilter) continue;
      const nama = t.kategori?.nama ?? "Tanpa Kategori";
      if (!map[nama]) {
        map[nama] = {
          name: nama,
          value: 0,
          color: t.kategori?.warna ?? "#94a3b8",
        };
      }
      map[nama].value += Number(t.jumlah);
    }
    return Object.values(map).sort((a, b) => b.value - a.value);
  }

  const breakdownIn = breakdown("Pemasukan");
  const breakdownOut = breakdown("Pengeluaran");

  const labelBulan = namaBulan(bulan);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0">
      <div className="print:hidden">
        <PageHeader
          title="Laporan"
          subtitle="Rekap pemasukan & pengeluaran per periode"
          action={
            <LaporanControls bulan={bulan} jenis={jenis} />
          }
        />
      </div>

      {/* Header untuk cetak */}
      <div className="mb-6 border-b-2 border-white/20 pb-4">
        <h1 className="text-xl font-bold text-slate-100">
          Laporan Keuangan — Tujuh Pilar
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Periode: {labelBulan} {tahun}
          {jenis ? ` · ${jenis}` : ""}
        </p>
        <p className="text-xs text-slate-400">
          Dicetak: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}
        </p>
      </div>

      {transaksi.length === 0 ? (
        <Card>
          <EmptyState
            title="Tidak ada transaksi pada periode ini"
            description="Coba pilih bulan lain atau catat transaksi baru."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
              <p className="text-sm text-emerald-400">Total Pemasukan</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatRupiah(totalMasuk)}
              </p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <p className="text-sm text-red-400">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-400">
                {formatRupiah(totalKeluar)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-sm text-slate-400">
                Selisih / Laba (bulan ini)
              </p>
              <p className="text-xl font-bold text-slate-100">
                {formatRupiah(totalMasuk - totalKeluar)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(jenis === "" || jenis === "Pemasukan") && breakdownIn.length > 0 ? (
              <Card>
                <CardHeader title="Rekap Pemasukan per Kategori" />
                <div className="p-5">
                  <KategoriChart
                    data={breakdownIn}
                    total={breakdownIn.reduce((a, b) => a + b.value, 0)}
                  />
                  <table className="mt-4 w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                        <th className="py-2 font-medium">Kategori</th>
                        <th className="py-2 text-right font-medium">Jumlah</th>
                        <th className="py-2 text-right font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {breakdownIn.map((b) => (
                        <tr key={b.name}>
                          <td className="py-2 text-slate-200">{b.name}</td>
                          <td className="py-2 text-right font-medium text-emerald-400">
                            {formatRupiah(b.value)}
                          </td>
                          <td className="py-2 text-right text-slate-400">
                            {totalMasuk > 0
                              ? ((b.value / totalMasuk) * 100).toFixed(1)
                              : "0"}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}

            {(jenis === "" || jenis === "Pengeluaran") && breakdownOut.length > 0 ? (
              <Card>
                <CardHeader title="Rekap Pengeluaran per Kategori" />
                <div className="p-5">
                  <KategoriChart
                    data={breakdownOut}
                    total={breakdownOut.reduce((a, b) => a + b.value, 0)}
                  />
                  <table className="mt-4 w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                        <th className="py-2 font-medium">Kategori</th>
                        <th className="py-2 text-right font-medium">Jumlah</th>
                        <th className="py-2 text-right font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {breakdownOut.map((b) => (
                        <tr key={b.name}>
                          <td className="py-2 text-slate-200">{b.name}</td>
                          <td className="py-2 text-right font-medium text-red-400">
                            {formatRupiah(b.value)}
                          </td>
                          <td className="py-2 text-right text-slate-400">
                            {totalKeluar > 0
                              ? ((b.value / totalKeluar) * 100).toFixed(1)
                              : "0"}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}
          </div>

          <Card className="mt-6">
            <CardHeader title={`Detail Transaksi — ${labelBulan} ${tahun}`} />
            {filtered.length === 0 ? (
              <EmptyState
                title="Tidak ada transaksi untuk filter ini"
                description="Ubah filter jenis untuk melihat data."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Jenis</th>
                      <th className="px-4 py-3 font-medium">Kategori</th>
                      <th className="px-4 py-3 font-medium">Kas</th>
                      <th className="px-4 py-3 font-medium">Kontak</th>
                      <th className="px-4 py-3 font-medium">Keterangan</th>
                      <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filtered.map((t) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-300">
                          {formatTanggalPendek(t.tanggal)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge color={t.jenis === "Pemasukan" ? "emerald" : "red"}>
                            {t.jenis}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-slate-200">
                          {t.kategori?.nama ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-300">
                          {t.kas?.nama ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-300">
                          {t.kontak?.nama ?? "—"}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2.5 text-slate-400">
                          {t.keterangan ?? "—"}
                        </td>
                        <td
                          className={
                            "whitespace-nowrap px-4 py-2.5 text-right font-semibold " +
                            (t.jenis === "Pemasukan"
                              ? "text-emerald-400"
                              : "text-red-400")
                          }
                        >
                          {t.jenis === "Pemasukan" ? "+" : "-"}
                          {formatRupiah(Number(t.jumlah))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/20">
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-right text-sm font-semibold text-slate-100"
                      >
                        Total ({jenis || "Semua"})
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-slate-100">
                        {formatRupiah(
                          jenis === "Pemasukan"
                            ? totalMasuk
                            : jenis === "Pengeluaran"
                            ? totalKeluar
                            : totalMasuk - totalKeluar
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}