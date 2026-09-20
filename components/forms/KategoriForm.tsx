"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass, classNames, WARNA_KATEGORI } from "@/lib/format";
import type { JenisTransaksi, Kategori } from "@/types/database";

export default function KategoriForm({
  kategori,
  onClose,
}: {
  kategori?: Kategori | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(kategori);
  const router = useRouter();
  const [nama, setNama] = useState(kategori?.nama ?? "");
  const [tipe, setTipe] = useState<JenisTransaksi>(kategori?.tipe ?? "Pengeluaran");
  const [warna, setWarna] = useState(kategori?.warna ?? WARNA_KATEGORI[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const payload = { nama: nama.trim(), tipe, warna };
    const { error } = isEdit
      ? await supabase.from("kategori").update(payload).eq("id", kategori!.id)
      : await supabase.from("kategori").insert(payload);
    if (error) {
      setError("Gagal menyimpan kategori: " + error.message);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Kategori</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="cth: Gaji Karyawan"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Tipe</label>
        <div className="grid grid-cols-2 gap-2">
          {(["Pemasukan", "Pengeluaran"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipe(t)}
              className={classNames(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                tipe === t
                  ? t === "Pemasukan"
                    ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                    : "border-red-400/60 bg-red-500/15 text-red-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Warna</label>
        <div className="flex flex-wrap gap-2">
          {WARNA_KATEGORI.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWarna(w)}
              style={{ backgroundColor: w }}
              className={classNames(
                "h-8 w-8 rounded-full transition-transform",
                warna === w
                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1c1c1f]"
                  : "hover:scale-110"
              )}
              aria-label={`Warna ${w}`}
            />
          ))}
        </div>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:opacity-50"
        >
          {busy ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
      </div>
    </form>
  );
}