"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { sinkronMitraDariTransaksi } from "@/app/actions";

export default function SinkronMitraButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSinkron() {
    setMsg("");
    startTransition(async () => {
      try {
        const res = await sinkronMitraDariTransaksi();
        setMsg(
          res.inserted > 0
            ? `${res.inserted} mitra ditambahkan dari transaksi.`
            : "Tidak ada mitra baru dari transaksi."
        );
        router.refresh();
      } catch (e) {
        setMsg(
          "Gagal sinkron: " +
            (e instanceof Error ? e.message : "Terjadi kesalahan.")
        );
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSinkron}
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={pending ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          {pending ? "Menyinkronkan…" : "Sinkron dari Transaksi"}
        </button>
      </div>
      {msg ? (
        <p
          className={
            "text-xs " +
            (msg.startsWith("Gagal") ? "text-red-400" : "text-emerald-400")
          }
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}