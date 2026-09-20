"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/lib/format";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setMessage(
        "Akun berhasil dibuat. Cek email kamu untuk konfirmasi, lalu masuk."
      );
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Buat akun baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nama Lengkap</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="cth: Budi Santoso"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="nama@perusahaan.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Kata Sandi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Minimal 6 karakter"
            autoComplete="new-password"
            required
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {busy ? "Memproses…" : "Daftar"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="font-semibold text-slate-300 hover:text-white">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}