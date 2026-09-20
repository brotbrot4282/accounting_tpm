"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import KategoriForm from "@/components/forms/KategoriForm";
import { PrimaryButton } from "@/components/ui";
import type { Kategori } from "@/types/database";

export function TambahKategoriButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Tambah Kategori
      </PrimaryButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Kategori"
      >
        <KategoriForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function EditKategoriButton({ kategori }: { kategori: Kategori }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Kategori"
      >
        <KategoriForm kategori={kategori} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}