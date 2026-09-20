"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { classNames } from "@/lib/format";
import type { Kas, Kategori, Kontak } from "@/types/database";

export default function TransaksiFilter({
  bulan,
  jenis,
  kasId,
  kategoriId,
  kontakId,
  kasList,
  kategoriList,
  kontakList,
}: {
  bulan: string;
  jenis: string;
  kasId: string;
  kategoriId: string;
  kontakId: string;
  kasList: Kas[];
  kategoriList: Kategori[];
  kontakList: Kontak[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [b1, setB1] = useState(bulan);
  const [j1, setJ1] = useState(jenis);
  const [k1, setK1] = useState(kasId);
  const [ka1, setKa1] = useState(kategoriId);
  const [ko1, setKo1] = useState(kontakId);

  function apply(v: {
    bulan?: string;
    jenis?: string;
    kasId?: string;
    kategoriId?: string;
    kontakId?: string;
    reset?: boolean;
  }) {
    if (v.reset) {
      setB1("");
      setJ1("");
      setK1("");
      setKa1("");
      setKo1("");
      router.push(pathname);
      return;
    }
    const nextB = v.bulan ?? b1;
    const nextJ = v.jenis ?? j1;
    const nextK = v.kasId ?? k1;
    const nextKa = v.kategoriId ?? ka1;
    const nextKo = v.kontakId ?? ko1;
    const params = new URLSearchParams();
    if (nextB) params.set("bulan", nextB);
    if (nextJ) params.set("jenis", nextJ);
    if (nextK) params.set("kas", nextK);
    if (nextKa) params.set("kategori", nextKa);
    if (nextKo) params.set("kontak", nextKo);
    router.push(`${pathname}?${params.toString()}`);
  }

  const now = new Date();
  const bulanOptions: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
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

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";

  const hasFilter = Boolean(jenis || kasId || kategoriId || kontakId);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Bulan
          </label>
          <select
            value={b1}
            onChange={(e) => {
              setB1(e.target.value);
              apply({ bulan: e.target.value });
            }}
            className={classNames(selectClass, "w-full")}
          >
            <option value="">Semua</option>
            {bulanOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Jenis
          </label>
          <select
            value={j1}
            onChange={(e) => {
              setJ1(e.target.value);
              apply({ jenis: e.target.value });
            }}
            className={classNames(selectClass, "w-full")}
          >
            <option value="">Semua Jenis</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Kas / Akun
          </label>
          <select
            value={k1}
            onChange={(e) => {
              setK1(e.target.value);
              apply({ kasId: e.target.value });
            }}
            className={classNames(selectClass, "w-full")}
          >
            <option value="">Semua</option>
            {kasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Kategori
          </label>
          <select
            value={ka1}
            onChange={(e) => {
              setKa1(e.target.value);
              apply({ kategoriId: e.target.value });
            }}
            className={classNames(selectClass, "w-full")}
          >
            <option value="">Semua</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Kontak
          </label>
          <select
            value={ko1}
            onChange={(e) => {
              setKo1(e.target.value);
              apply({ kontakId: e.target.value });
            }}
            className={classNames(selectClass, "w-full")}
          >
            <option value="">Semua</option>
            {kontakList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilter ? (
        <button
          type="button"
          onClick={() => apply({ reset: true })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filter
        </button>
      ) : null}
    </div>
  );
}