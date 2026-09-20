import {
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, Badge, PageHeader } from "@/components/ui";
import { TambahKasButton, EditKasButton } from "@/components/KasModal";
import DeleteButton from "@/components/DeleteButton";
import { formatRupiah, classNames } from "@/lib/format";
import type { Kas, Transaksi } from "@/types/database";

export const dynamic = "force-dynamic";

const TIPE_BADGE: Record<string, "blue" | "amber" | "slate"> = {
  Rekening: "blue",
  "E-Wallet": "amber",
  Kas: "slate",
};

const TIPE_ICON: Record<string, React.ReactNode> = {
  Kas: <Wallet className="h-5 w-5" />,
  Rekening: <Landmark className="h-5 w-5" />,
  "E-Wallet": <CreditCard className="h-5 w-5" />,
};

export default async function KasPage() {
  const supabase = await createClient();

  const [kasRes, transRes] = await Promise.all([
    supabase
      .from("kas")
      .select("id, nama, tipe, saldo_awal, created_at")
      .order("created_at"),
    supabase.from("transaksi").select("id, jenis, jumlah, kas_id"),
  ]);

  const kasList = (kasRes.data ?? []) as Kas[];
  const transaksi = (transRes.data ?? []) as (Transaksi & {
    kas_id: string | null;
  })[];

  const saldoMap = new Map(
    kasList.map((k) => [k.id, Number(k.saldo_awal) ?? 0])
  );
  const countMap = new Map(kasList.map((k) => [k.id, 0]));

  for (const t of transaksi) {
    if (!t.kas_id) continue;
    const curSaldo = saldoMap.get(t.kas_id) ?? 0;
    saldoMap.set(
      t.kas_id,
      curSaldo + (t.jenis === "Pemasukan" ? Number(t.jumlah) : -Number(t.jumlah))
    );
    countMap.set(t.kas_id, (countMap.get(t.kas_id) ?? 0) + 1);
  }

  const totalSaldo = [...saldoMap.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Kas / Akun"
        subtitle="Sumber dana: kas fisik, rekening bank, dan e-wallet"
        action={<TambahKasButton />}
      />

      <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#1b1b1d] px-5 py-4 shadow-sm">
        <p className="text-sm font-medium text-slate-400">Total semua kas</p>
        <p className="text-lg font-bold text-slate-100">
          {formatRupiah(totalSaldo)}
        </p>
      </div>

      {kasList.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Smartphone className="h-10 w-10" />}
            title="Belum ada kas / akun"
            description="Tambahkan kas fisik, rekening bank, atau e-wallet untuk mulai mencatat."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kasList.map((k) => (
            <Card key={k.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={classNames(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      k.tipe === "Rekening"
                        ? "bg-blue-500/10 text-blue-400"
                        : k.tipe === "E-Wallet"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-white/10 text-slate-300"
                    )}
                  >
                    {TIPE_ICON[k.tipe]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {k.nama}
                    </p>
                    <Badge color={TIPE_BADGE[k.tipe]}>{k.tipe}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-400">Saldo berjalan</p>
                <p
                  className={classNames(
                    "text-xl font-bold",
                    (saldoMap.get(k.id) ?? 0) < 0
                      ? "text-red-400"
                      : "text-slate-100"
                  )}
                >
                  {formatRupiah(saldoMap.get(k.id) ?? 0)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Saldo awal: {formatRupiah(Number(k.saldo_awal))}</span>
                <span>{countMap.get(k.id) ?? 0} transaksi</span>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <EditKasButton kas={k} />
                <DeleteButton id={k.id} table="kas" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Catatan: kas dengan saldo awal 0 tetap bisa langsung dipakai untuk
        transaksi.
      </p>
    </div>
  );
}