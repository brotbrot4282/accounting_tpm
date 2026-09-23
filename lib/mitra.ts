import type { Kontak, MitraOption } from "@/types/database";

export interface MitraDariTransaksi {
  nama: string | null;
  nama_leader: string | null;
  no_hp: string | null;
}

export function buildMitraOptions(
  kontakList: Kontak[],
  mitraTransaksi: MitraDariTransaksi[]
): MitraOption[] {
  const map = new Map<string, MitraOption>();
  let counter = 0;

  for (const k of kontakList) {
    const nama = k.nama.trim();
    const key = nama.toLowerCase();
    if (nama && !map.has(key)) {
      map.set(key, {
        id: k.id,
        nama,
        nama_leader: k.nama_leader,
        telepon: k.telepon,
      });
    }
  }

  for (const t of mitraTransaksi) {
    const nama = (t.nama ?? "").trim();
    if (!nama) continue;
    const key = nama.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: `t-${counter++}`,
        nama,
        nama_leader: t.nama_leader,
        telepon: t.no_hp,
      });
    }
  }

  return [...map.values()];
}