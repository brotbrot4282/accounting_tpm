"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/format";

type Table = "transaksi" | "kas" | "kategori" | "kontak";

export default function DeleteButton({
  id,
  table,
  label = "Hapus",
  className,
}: {
  id: string;
  table: Table;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      setError(
        error.code === "23503"
          ? "Tidak bisa dihapus: masih dipakai oleh transaksi."
          : "Gagal menghapus data."
      );
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className={classNames(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50",
          className
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </div>
  );
}