"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/lib/format";
import type { Kontak, TipeKontak } from "@/types/database";

export default function KontakForm({
  kontak,
  onClose,
}: {
  kontak?: Kontak | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(kontak);
  const router = useRouter();
  const [nama, setNama] = useState(kontak?.nama ?? "");
  const [tipe, setTipe] = useState<TipeKontak>(kontak?.tipe ?? "Customer");
  const [telepon, setTelepon] = useState(kontak?.telepon ?? "");
  const [keterangan, setKeterangan] = useState(kontak?.keterangan ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      setError("Nama kontak wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const payload = {
      nama: nama.trim(),
      tipe,
      telepon: telepon.trim() || null,
      keterangan: keterangan.trim() || null,
    };
    const { error } = isEdit
      ? await supabase.from("kontak").update(payload).eq("id", kontak!.id)
      : await supabase.from("kontak").insert(payload);
    if (error) {
      setError("Gagal menyimpan kontak: " + error.message);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Kontak</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="cth: PT Sukses Jaya"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Tipe</label>
        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as TipeKontak)}
          className={inputClass}
        >
          <option value="Customer">Customer</option>
          <option value="Vendor">Vendor</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Telepon</label>
        <input
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          className={inputClass}
          placeholder="Opsional"
        />
      </div>
      <div>
        <label className={labelClass}>Keterangan</label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Alamat / catatan (opsional)"
        />
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
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kontak"}
        </button>
      </div>
    </form>
  );
}