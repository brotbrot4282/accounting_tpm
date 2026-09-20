"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { inputClass, classNames } from "@/lib/format";

export default function LaporanControls({
  bulan: initialBulan,
  jenis: initialJenis,
}: {
  bulan: string;
  jenis: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [bulan, setBulan] = useState(initialBulan);
  const [jenis, setJenis] = useState(initialJenis);

  const now = new Date();
  const bulanOptions: { value: string; label: string }[] = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    bulanOptions.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(d),
    });
  }
  if (bulan && !bulanOptions.some((o) => o.value === bulan)) {
    const [yb, mb] = bulan.split("-").map(Number);
    bulanOptions.unshift({
      value: bulan,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(new Date(yb, mb - 1, 1)),
    });
  }

  function apply(partial: Record<string, string>) {
    const params = new URLSearchParams();
    const next = { bulan, jenis, ...partial };
    if (next.bulan) params.set("bulan", next.bulan);
    if (next.jenis) params.set("jenis", next.jenis);
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  const selectClass = classNames(inputClass, "max-w-[200px]");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={bulan}
        onChange={(e) => {
          const v = e.target.value;
          setBulan(v);
          apply({ bulan: v });
        }}
        className={selectClass}
      >
        {bulanOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={jenis}
        onChange={(e) => {
          const v = e.target.value;
          setJenis(v);
          apply({ jenis: v });
        }}
        className={selectClass}
      >
        <option value="">Semua (Masuk & Keluar)</option>
        <option value="Pemasukan">Pemasukan saja</option>
        <option value="Pengeluaran">Pengeluaran saja</option>
      </select>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 print:hidden"
      >
        <Printer className="h-4 w-4" />
        Cetak / PDF
      </button>
    </div>
  );
}