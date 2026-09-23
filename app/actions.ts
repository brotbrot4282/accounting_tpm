"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function sinkronMitraDariTransaksi() {
  const supabase = await createClient();

  const [transRes, kontakRes] = await Promise.all([
    supabase
      .from("transaksi")
      .select("nama_mitra, nama_leader, no_hp")
      .eq("jenis", "Pemasukan")
      .not("nama_mitra", "is", null)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("kontak").select("nama"),
  ]);

  if (transRes.error) throw new Error(transRes.error.message);
  if (kontakRes.error) throw new Error(kontakRes.error.message);

  const namaKontak = new Set(
    (kontakRes.data ?? [])
      .map((k) => (k.nama ?? "").trim().toLowerCase())
      .filter(Boolean)
  );

  const unik = new Map<
    string,
    { nama: string; leader: string | null; hp: string | null }
  >();
  for (const t of transRes.data ?? []) {
    const nama = (t.nama_mitra ?? "").trim();
    if (!nama) continue;
    const key = nama.toLowerCase();
    if (!unik.has(key)) {
      unik.set(key, {
        nama,
        leader: t.nama_leader,
        hp: t.no_hp,
      });
    }
  }

  let inserted = 0;
  const rows: {
    nama: string;
    tipe: "Mitra";
    nama_leader: string | null;
    telepon: string | null;
  }[] = [];
  for (const m of unik.values()) {
    if (namaKontak.has(m.nama.toLowerCase())) continue;
    rows.push({
      nama: m.nama,
      tipe: "Mitra",
      nama_leader: m.leader,
      telepon: m.hp,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("kontak").insert(rows);
    if (error) throw new Error(error.message);
    inserted = rows.length;
  }

  return { inserted, skipped: unik.size - inserted };
}