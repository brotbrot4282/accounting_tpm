"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass, classNames } from "@/lib/format";
import type {
  JenisTransaksi,
  Kas,
  Kategori,
  Kontak,
  TipePenjualan,
  Transaksi,
} from "@/types/database";

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
  const [tipePenjualan, setTipePenjualan] = useState<TipePenjualan | "">(
    transaksi?.tipe_penjualan ?? ""
  );
  const [namaMitra, setNamaMitra] = useState(transaksi?.nama_mitra ?? "");
  const [namaLeader, setNamaLeader] = useState(transaksi?.nama_leader ?? "");
  const [noHp, setNoHp] = useState(transaksi?.no_hp ?? "");
  const [keterangan, setKeterangan] = useState(transaksi?.keterangan ?? "");
  const [bulkMode, setBulkMode] = useState(false);
  const [rows, setRows] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mitraOpen, setMitraOpen] = useState(false);
  const [mitraIndex, setMitraIndex] = useState(-1);
  const mitraRef = useRef<HTMLDivElement>(null);

  const mitraSuggest = useMemo(() => {
    const q = namaMitra.trim().toLowerCase();
    if (!q) return [];
    return kontakList
      .filter(
        (k) =>
          k.nama.toLowerCase().includes(q) ||
          (k.telepon ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => a.nama.localeCompare(b.nama))
      .slice(0, 8);
  }, [kontakList, namaMitra]);

  function pilihMitra(k: Kontak) {
    setNamaMitra(k.nama);
    setNamaLeader(k.nama_leader ?? "");
    setNoHp(k.telepon ?? "");
    setMitraOpen(false);
    setMitraIndex(-1);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (mitraRef.current && !mitraRef.current.contains(e.target as Node)) {
        setMitraOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onNamaMitraKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mitraSuggest.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMitraOpen(true);
      setMitraIndex((prev) => (prev + 1) % mitraSuggest.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMitraIndex((prev) =>
        prev <= 0 ? mitraSuggest.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && mitraOpen && mitraIndex >= 0) {
      e.preventDefault();
      pilihMitra(mitraSuggest[mitraIndex]);
    } else if (e.key === "Escape") {
      setMitraOpen(false);
      setMitraIndex(-1);
    }
  }

  const isPemasukan = jenis === "Pemasukan";
  const isBulk = isPemasukan && !isEdit && bulkMode;

  function tambahBaris() {
    setRows((r) => [...r, ""]);
  }

  function hapusBaris(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  const kategoriFiltered = kategoriList.filter((k) => k.tipe === jenis);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const jumlahList = isBulk ? rows : [jumlah];
    if (kasId === "" || kategoriId === "") {
      setError("Jumlah, Kas, dan Kategori wajib diisi.");
      return;
    }
    if (jumlahList.some((j) => j === "" || Number(j) <= 0)) {
      setError(
        isBulk
          ? "Semua baris jumlah wajib diisi dan lebih dari 0."
          : "Jumlah wajib diisi dan lebih dari 0."
      );
      return;
    }
    if (isPemasukan && !tipePenjualan) {
      setError("Tipe Order wajib dipilih (PO Paket Reguler atau VIP).");
      return;
    }
    if (
      isPemasukan &&
      (!namaMitra.trim() || !namaLeader.trim() || !noHp.trim())
    ) {
      setError(
        "Nama Mitra, Nama Leader, dan No. HP wajib diisi untuk pemasukan."
      );
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const base = {
      jenis,
      tanggal,
      kas_id: kasId,
      kategori_id: kategoriId,
      keterangan: keterangan || null,
      tipe_penjualan: isPemasukan ? tipePenjualan : null,
      nama_mitra: isPemasukan ? namaMitra.trim() : null,
      nama_leader: isPemasukan ? namaLeader.trim() : null,
      no_hp: isPemasukan ? noHp.trim() : null,
    };
    const payloads = jumlahList.map((j) => ({
      ...base,
      jumlah: Number(j),
    }));
    const { error } = isEdit
      ? await supabase
          .from("transaksi")
          .update(payloads[0])
          .eq("id", transaksi!.id)
      : await supabase.from("transaksi").insert(payloads);
    if (error) {
      setError("Gagal menyimpan transaksi: " + error.message);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  }

  const jenisLabel = isEdit
    ? "Simpan Perubahan"
    : isBulk
      ? `Simpan ${rows.length} Transaksi`
      : "Simpan Transaksi";

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
                setBulkMode(false);
                setRows([""]);
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

      {isPemasukan && !isEdit ? (
        <div>
          <span className={labelClass}>Input</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBulkMode(false)}
              className={classNames(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                !isBulk
                  ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              Satu Transaksi
            </button>
            <button
              type="button"
              onClick={() => setBulkMode(true)}
              className={classNames(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                isBulk
                  ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              Beberapa Sekaligus
            </button>
          </div>
        </div>
      ) : null}

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
        {!isBulk ? (
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
        ) : null}
      </div>

      {isBulk ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              Daftar Jumlah
            </span>
            <button
              type="button"
              onClick={tambahBaris}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Baris
            </button>
          </div>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder={`Jumlah #${i + 1}`}
                  value={r}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((v, idx) =>
                        idx === i ? e.target.value : v
                      )
                    )
                  }
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => hapusBaris(i)}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={rows.length === 1}
                  aria-label={`Hapus baris ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Tanggal, Kas, Kategori, Tipe Order, dan data mitra berlaku untuk
            semua baris.
          </p>
        </div>
      ) : null}

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

      {isPemasukan ? (
        <>
          <div>
            <span className={labelClass}>Tipe Order</span>
            <div className="grid grid-cols-2 gap-2">
              {(["PO Paket Reguler", "VIP"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTipePenjualan(tp)}
                  className={classNames(
                    "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                    tipePenjualan === tp
                      ? "border-violet-400/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nama Mitra</label>
              <div ref={mitraRef} className="relative">
                <input
                  value={namaMitra}
                  onChange={(e) => {
                    setNamaMitra(e.target.value);
                    setMitraOpen(true);
                    setMitraIndex(-1);
                  }}
                  onFocus={() => setMitraOpen(true)}
                  onBlur={() => setMitraOpen(false)}
                  onKeyDown={onNamaMitraKeyDown}
                  placeholder="Ketik nama atau pilih dari saran"
                  className={inputClass}
                  required
                />
                {mitraOpen && mitraSuggest.length > 0 ? (
                  <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1f1f22] shadow-xl">
                    {mitraSuggest.map((k, i) => (
                      <li key={k.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pilihMitra(k);
                          }}
                          onMouseEnter={() => setMitraIndex(i)}
                          className={classNames(
                            "w-full px-3 py-2 text-left transition-colors",
                            i === mitraIndex ? "bg-white/10" : "hover:bg-white/5"
                          )}
                        >
                          <p className="text-sm font-medium text-slate-200">
                            {k.nama}
                          </p>
                          <p className="text-xs text-slate-500">
                            {[k.telepon, k.nama_leader]
                              .filter(Boolean)
                              .join(" · ") || "No data"}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {mitraOpen && kontakList.length === 0 ? (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#1f1f22] px-3 py-2 text-xs text-slate-400 shadow-xl">
                    Belum ada data mitra. Ketik manual atau tambahkan di menu
                    Mitra.
                  </div>
                ) : mitraOpen &&
                  mitraSuggest.length === 0 &&
                  namaMitra.trim() ? (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#1f1f22] px-3 py-2 text-xs text-slate-400 shadow-xl">
                    Tidak ada mitra cocok — nama akan disimpan sebagai mitra
                    baru.
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <label className={labelClass}>Nama Leader</label>
              <input
                value={namaLeader}
                onChange={(e) => setNamaLeader(e.target.value)}
                placeholder="Nama leader (jaringan)"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>No. HP Mitra</label>
              <input
                type="tel"
                inputMode="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="cth: 0812xxxxxxx"
                className={inputClass}
                required
              />
            </div>
          </div>
        </>
      ) : null}

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