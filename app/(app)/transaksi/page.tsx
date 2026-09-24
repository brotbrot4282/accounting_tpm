import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { TambahTransaksiButton } from "@/components/TransaksiButtons";
import TransaksiFilter from "@/components/TransaksiFilter";
import TransaksiTable from "@/components/TransaksiTable";
import { buildMitraOptions } from "@/lib/mitra";
import type {
  Kas,
  Kategori,
  Kontak,
  MitraOption,
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

  const [kasRes, kategoriRes, kontakRes, mitraTransRes] = await Promise.all([
    supabase.from("kas").select("id, nama, tipe"),
    supabase.from("kategori").select("id, nama, tipe, warna"),
    supabase.from("kontak").select("id, nama, nama_leader, telepon"),
    supabase
      .from("transaksi")
      .select("nama_mitra, nama_leader, no_hp")
      .eq("jenis", "Pemasukan")
      .not("nama_mitra", "is", null)
      .order("tanggal", { ascending: false }),
  ]);

  const kasList = (kasRes.data ?? []) as Kas[];
  const kategoriList = (kategoriRes.data ?? []) as Kategori[];
  const kontakList = (kontakRes.data ?? []) as Kontak[];
  const mitraList: MitraOption[] = buildMitraOptions(
    kontakList,
    (mitraTransRes.data ?? []).map((t) => ({
      nama: t.nama_mitra,
      nama_leader: t.nama_leader,
      no_hp: t.no_hp,
    }))
  );

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
    mitraList,
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
          <TransaksiTable transaksi={transaksi} lists={lists} />
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