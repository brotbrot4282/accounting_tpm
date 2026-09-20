import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, Badge, PageHeader } from "@/components/ui";
import { TambahKontakButton, EditKontakButton } from "@/components/KontakModal";
import DeleteButton from "@/components/DeleteButton";
import type { Kontak } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const supabase = await createClient();

  const { data: kontakRes } = await supabase
    .from("kontak")
    .select("id, nama, tipe, telepon, keterangan, created_at")
    .order("created_at");

  const kontakList = (kontakRes ?? []) as Kontak[];
  const countCustomer = kontakList.filter((k) => k.tipe === "Customer").length;
  const countVendor = kontakList.filter((k) => k.tipe === "Vendor").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Kontak"
        subtitle="Data vendor & customer untuk menandai lawan transaksi"
        action={<TambahKontakButton />}
      />

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#1b1b1d] px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-400">Customer</p>
          <p className="text-lg font-bold text-slate-100">{countCustomer}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1b1b1d] px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-400">Vendor</p>
          <p className="text-lg font-bold text-slate-100">{countVendor}</p>
        </div>
      </div>

      {kontakList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Belum ada kontak"
            description="Tambahkan customer atau vendor untuk keperluan pencatatan transaksi."
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium">Telepon</th>
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
                    <td className="px-4 py-3">
                      <Badge color={k.tipe === "Customer" ? "emerald" : "violet"}>
                        {k.tipe}
                      </Badge>
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