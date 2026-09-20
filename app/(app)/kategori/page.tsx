import { Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { TambahKategoriButton, EditKategoriButton } from "@/components/KategoriModal";
import DeleteButton from "@/components/DeleteButton";
import type { Kategori } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const supabase = await createClient();

  const [kategoriRes, transRes] = await Promise.all([
    supabase
      .from("kategori")
      .select("id, nama, tipe, warna, created_at")
      .order("created_at"),
    supabase.from("transaksi").select("kategori_id"),
  ]);

  const kategoriList = (kategoriRes.data ?? []) as Kategori[];

  const countMap = new Map<string, number>();
  for (const t of transRes.data ?? []) {
    if (t.kategori_id) {
      countMap.set(t.kategori_id, (countMap.get(t.kategori_id) ?? 0) + 1);
    }
  }

  const pemasukan = kategoriList.filter((k) => k.tipe === "Pemasukan");
  const pengeluaran = kategoriList.filter((k) => k.tipe === "Pengeluaran");

  function renderSection(tipe: string, items: Kategori[]) {
    return (
      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{tipe}</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {items.length} kategori
          </p>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title={`Belum ada kategori ${tipe.toLowerCase()}`}
            description="Tambahkan kategori untuk mempermudah laporan keuangan."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: k.warna }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {k.nama}
                    </p>
                    <p className="text-xs text-slate-400">
                      {countMap.get(k.id) ?? 0} transaksi
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <EditKategoriButton kategori={k} />
                  <DeleteButton id={k.id} table="kategori" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Kategori"
        subtitle="Kelompokkan pemasukan & pengeluaran untuk laporan yang rapi"
        action={<TambahKategoriButton />}
      />

      {kategoriList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Palette className="h-10 w-10" />}
            title="Belum ada kategori"
            description="Kategori default akan dibuat otomatis saat akun baru terdaftar."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {renderSection("Pemasukan", pemasukan)}
          {renderSection("Pengeluaran", pengeluaran)}
        </div>
      )}
    </div>
  );
}