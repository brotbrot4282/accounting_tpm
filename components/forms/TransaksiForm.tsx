"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass, classNames } from "@/lib/format";
import type { JenisTransaksi, Kas, Kategori, Kontak, Transaksi } from "@/types/database";

export default function TransaksiForm({
  kasList,
  kategoriList,
  kontakList,
  transaksi,
  onClose,
}: {
  kasList: Kas[];
  kategoriList: Kategori[];
  kontakList: Kontak[];
  transaksi?: Transaksi | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(transaksi);
  const router = useRouter();
  const [jenis, setJenis] = useState<JenisTransaksi>(
    transaksi?.jenis ?? "Pemasukan"
  );
  const [tanggal, setTanggal] = useState(transaksi?.tanggal ?? new Date().toISOString().slice(0, 10));
  const [jumlah, setJumlah] = useState(transaksi ? String(transaksi.jumlah) : "");
  const [kasId, setKasId] = useState(transaksi?.kas_id ?? kasList[0]?.id ?? "");
  const [kategoriId, setKategoriId] = useState(transaksi?.kategori_id ?? "");
  const [kontakId, setKontakId] = useState(transaksi?.kontak_id ?? "");
  const [keterangan, setKeterangan] = useState(transaksi?.keterangan ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const kategoriFiltered = kategoriList.filter((k) => k.tipe === jenis);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jumlah === "" || kasId === "" || kategoriId === "") {
      setError("Jumlah, Kas, dan Kategori wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const payload = {
      jenis,
      tanggal,
      jumlah: Number(jumlah),
      kas_id: kasId,
      kategori_id: kategoriId,
      kontak_id: kontakId || null,
      keterangan: keterangan || null,
    };
    const { error } = isEdit
      ? await supabase.from("transaksi").update(payload).eq("id", transaksi!.id)
      : await supabase.from("transaksi").insert(payload);
    if (error) {
      setError("Gagal menyimpan transaksi: " + error.message);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  }

  const jenisLabel = isEdit ? "Simpan Perubahan" : "Simpan Transaksi";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className={labelClass}>Jenis</span>
        <div className="grid grid-cols-2 gap-2">
          {(["Pemasukan", "Pengeluaran"] as const).map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => {
                setJenis(j);
                setKategoriId("");
              }}
              className={classNames(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                jenis === j
                  ? j === "Pemasukan"
                    ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                    : "border-red-400/60 bg-red-500/15 text-red-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {j}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Jumlah (Rp)</label>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Kas / Akun</label>
        <select
          value={kasId}
          onChange={(e) => setKasId(e.target.value)}
          className={inputClass}
          required
        >
          {kasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama} ({k.tipe})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Kategori</label>
        <select
          value={kategoriId}
          onChange={(e) => setKategoriId(e.target.value)}
          className={inputClass}
          required
        >
          <option value="">— Pilih kategori —</option>
          {kategoriFiltered.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
        {kategoriFiltered.length === 0 ? (
          <p className="mt-1 text-xs text-amber-400">
            Belum ada kategori {jenis.toLowerCase()}. Tambahkan di menu
            Kategori.
          </p>
        ) : null}
      </div>

      <div>
        <label className={labelClass}>
          Kontak (Vendor / Customer){" "}
          <span className="font-normal text-slate-400">— opsional</span>
        </label>
        <select
          value={kontakId}
          onChange={(e) => setKontakId(e.target.value)}
          className={inputClass}
        >
          <option value="">Tidak ada</option>
          {kontakList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama} ({k.tipe})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Keterangan</label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className={inputClass}
          rows={2}
          placeholder="Catatan tambahan (opsional)"
        />
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
          {busy ? "Menyimpan…" : jenisLabel}
        </button>
      </div>
    </form>
  );
}