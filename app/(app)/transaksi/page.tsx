import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  EmptyState,
  Badge,
  PageHeader,
} from "@/components/ui";
import { TambahTransaksiButton, EditTransaksiButton } from "@/components/TransaksiButtons";
import DeleteButton from "@/components/DeleteButton";
import TransaksiFilter from "@/components/TransaksiFilter";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import type {
  Kas,
  Kategori,
  Kontak,
  TransaksiWithRelasi,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const bulan = typeof params.bulan === "string" ? params.bulan : "";
  const jenis = typeof params.jenis === "string" ? params.jenis : "";
  const kas = typeof params.kas === "string" ? params.kas : "";
  const kategori = typeof params.kategori === "string" ? params.kategori : "";

  const supabase = await createClient();

  const [kasRes, kategoriRes, kontakRes] = await Promise.all([
    supabase.from("kas").select("id, nama, tipe"),
    supabase.from("kategori").select("id, nama, tipe, warna"),
    supabase.from("kontak").select("id, nama, nama_leader, telepon"),
  ]);

  const kasList = (kasRes.data ?? []) as Kas[];
  const kategoriList = (kategoriRes.data ?? []) as Kategori[];
  const kontakList = (kontakRes.data ?? []) as Kontak[];

  let query = supabase
    .from("transaksi")
    .select(
      "id, tanggal, jenis, jumlah, kas_id, kategori_id, keterangan, created_at, tipe_penjualan, nama_mitra, nama_leader, no_hp, kas(nama, tipe), kategori(nama, warna)"
    );

  if (bulan) {
    const [tahun, bulanNum] = bulan.split("-");
    query = query
      .gte("tanggal", `${tahun}-${bulanNum}-01`)
      .lt(
        "tanggal",
        `${
          bulanNum === "12"
            ? `${Number(tahun) + 1}-01-01`
            : `${tahun}-${String(Number(bulanNum) + 1).padStart(2, "0")}-01`
        }`
      );
  }
  if (jenis === "Pemasukan" || jenis === "Pengeluaran") {
    query = query.eq("jenis", jenis);
  }
  if (kas) query = query.eq("kas_id", kas);
  if (kategori) query = query.eq("kategori_id", kategori);

  const { data: transRes } = await query
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);

  const transaksi = (transRes ?? []) as unknown as TransaksiWithRelasi[];

  const lists = {
    kasList,
    kategoriList,
    kontakList,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Transaksi"
        subtitle="Catat dan kelola seluruh uang masuk & keluar"
        action={<TambahTransaksiButton lists={lists} />}
      />

      <Card>
        <div className="border-b border-white/10 p-4">
          <TransaksiFilter
            bulan={bulan}
            jenis={jenis}
            kasId={kas}
            kategoriId={kategori}
            kasList={kasList}
            kategoriList={kategoriList}
          />
        </div>

        {transaksi.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description={
              "Belum ada data untuk filter ini. Ubah filter atau tambahkan transaksi baru."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Jenis</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Mitra</th>
                  <th className="px-4 py-3 font-medium">Kas / Akun</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transaksi.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                      {formatTanggalPendek(t.tanggal)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        color={t.jenis === "Pemasukan" ? "emerald" : "red"}
                      >
                        {t.jenis}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-200">
                        {t.kategori ? (
                          <>
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: t.kategori.warna }}
                            />
                            {t.kategori.nama}
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {t.tipe_penjualan ? (
                        <Badge color="violet">{t.tipe_penjualan}</Badge>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {t.nama_mitra ? (
                        <div>
                          <p className="font-medium text-slate-200">
                            {t.nama_mitra}
                          </p>
                          <p className="text-xs text-slate-500">
                            Leader: {t.nama_leader ?? "—"} · {t.no_hp ?? "—"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                      {t.kas?.nama ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-slate-400">
                      {t.keterangan ?? "—"}
                    </td>
                    <td
                      className={
                        "whitespace-nowrap px-4 py-3 text-right font-semibold " +
                        (t.jenis === "Pemasukan"
                          ? "text-emerald-400"
                          : "text-red-400")
                      }
                    >
                      {t.jenis === "Pemasukan" ? "+" : "-"}
                      {formatRupiah(Number(t.jumlah))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <EditTransaksiButton transaksi={t} lists={lists} />
                        <DeleteButton id={t.id} table="transaksi" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {transaksi.length >= 300 ? (
          <p className="px-4 py-3 text-xs text-slate-400">
            Menampilkan maksimal 300 transaksi. Gunakan filter untuk
            mempersempit.
          </p>
        ) : null}
      </Card>
    </div>
  );
}