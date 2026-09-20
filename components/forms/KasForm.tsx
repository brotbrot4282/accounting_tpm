"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/lib/format";
import type { Kas, TipeKas } from "@/types/database";

export default function KasForm({
  kas,
  onClose,
}: {
  kas?: Kas | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(kas);
  const router = useRouter();
  const [nama, setNama] = useState(kas?.nama ?? "");
  const [tipe, setTipe] = useState<TipeKas>(kas?.tipe ?? "Kas");
  const [saldoAwal, setSaldoAwal] = useState(kas ? String(kas.saldo_awal) : "0");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      setError("Nama kas wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const payload = { nama: nama.trim(), tipe, saldo_awal: Number(saldoAwal) || 0 };
    const { error } = isEdit
      ? await supabase.from("kas").update(payload).eq("id", kas!.id)
      : await supabase.from("kas").insert(payload);
    if (error) {
      setError("Gagal menyimpan kas: " + error.message);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Kas / Akun</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="cth: Kas Utama, Bank BCA, GoPay"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Tipe</label>
        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as TipeKas)}
          className={inputClass}
        >
          <option value="Kas">Kas</option>
          <option value="Rekening">Rekening</option>
          <option value="E-Wallet">E-Wallet</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Saldo Awal (Rp)</label>
        <input
          type="number"
          min="0"
          step="any"
          value={saldoAwal}
          onChange={(e) => setSaldoAwal(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-400">
          Saldo saat kas dibuat. Saldo berjalan dihitung otomatis dari
          transaksi.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kas"}
        </button>
      </div>
    </form>
  );
}