"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import TransaksiForm from "@/components/forms/TransaksiForm";
import { PrimaryButton } from "@/components/ui";
import type { Kas, Kategori, MitraOption, Transaksi } from "@/types/database";

interface Lists {
  kasList: Kas[];
  kategoriList: Kategori[];
  mitraList: MitraOption[];
}

export function TambahTransaksiButton({ lists }: { lists: Lists }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Tambah Transaksi
      </PrimaryButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Transaksi"
      >
        <TransaksiForm {...lists} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function EditTransaksiButton({
  transaksi,
  lists,
}: {
  transaksi: Transaksi;
  lists: Lists;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Transaksi"
      >
        <TransaksiForm
          {...lists}
          transaksi={transaksi}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}