"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { EditTransaksiButton } from "@/components/TransaksiButtons";
import DeleteButton from "@/components/DeleteButton";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import type {
  Kas,
  Kategori,
  MitraOption,
  TransaksiWithRelasi,
} from "@/types/database";

const PER_PAGE = 7;

interface Lists {
  kasList: Kas[];
  kategoriList: Kategori[];
  mitraList: MitraOption[];
}

export default function TransaksiTable({
  transaksi,
  lists,
}: {
  transaksi: TransaksiWithRelasi[];
  lists: Lists;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(transaksi.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PER_PAGE;
  const shown = transaksi.slice(start, start + PER_PAGE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[960px]">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Mitra</th>
              <th className="px-4 py-3 font-medium">Kas / Akun</th>
              <th className="px-4 py-3 font-medium">Keterangan</th>
              <th className="px-4 py-3 text-right font-medium">Jumlah</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {shown.map((t) => (
              <tr key={t.id} className="hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                  {formatTanggalPendek(t.tanggal)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    color={t.jenis === "Pemasukan" ? "emerald" : "red"}
                  >
                    {t.jenis}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-200">
                    {t.kategori ? (
                      <>
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: t.kategori.warna }}
                        />
                        {t.kategori.nama}
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {t.tipe_penjualan ? (
                    <Badge color="violet">{t.tipe_penjualan}</Badge>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {t.nama_mitra ? (
                    <div>
                      <p className="font-medium text-slate-200">
                        {t.nama_mitra}
                      </p>
                      <p className="text-xs text-slate-500">
                        Leader: {t.nama_leader ?? "—"} · {t.no_hp ?? "—"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                  {t.kas?.nama ?? "—"}
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-slate-400">
                  {t.keterangan ?? "—"}
                </td>
                <td
                  className={
                    "whitespace-nowrap px-4 py-3 text-right font-semibold " +
                    (t.jenis === "Pemasukan"
                      ? "text-emerald-400"
                      : "text-red-400")
                  }
                >
                  {t.jenis === "Pemasukan" ? "+" : "-"}
                  {formatRupiah(Number(t.jumlah))}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <EditTransaksiButton transaksi={t} lists={lists} />
                    <DeleteButton id={t.id} table="transaksi" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <p className="text-xs text-slate-400">
            Menampilkan {start + 1}–{Math.min(start + PER_PAGE, transaksi.length)}{" "}
            dari {transaksi.length} transaksi
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Sebelumnya
            </button>
            <span className="px-2 text-xs text-slate-400">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}