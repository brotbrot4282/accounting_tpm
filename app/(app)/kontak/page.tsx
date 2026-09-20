import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { TambahKontakButton, EditKontakButton } from "@/components/KontakModal";
import DeleteButton from "@/components/DeleteButton";
import type { Kontak } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const supabase = await createClient();

  const { data: kontakRes } = await supabase
    .from("kontak")
    .select("id, nama, tipe, nama_leader, telepon, keterangan, created_at")
    .order("created_at");

  const kontakList = (kontakRes ?? []) as Kontak[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Mitra"
        subtitle="Data mitra jaringan (poin jaringan / afiliasi)"
        action={<TambahKontakButton />}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#1b1b1d] px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-400">Total Mitra</p>
          <p className="text-lg font-bold text-slate-100">{kontakList.length}</p>
        </div>
      </div>

      {kontakList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Belum ada mitra"
            description="Tambahkan mitra jaringan untuk keperluan pencatatan transaksi."
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Leader</th>
                  <th className="px-4 py-3 font-medium">No. HP</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {kontakList.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {k.nama}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {k.nama_leader ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {k.telepon ?? "—"}
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-slate-400">
                      {k.keterangan ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <EditKontakButton kontak={k} />
                        <DeleteButton id={k.id} table="kontak" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}