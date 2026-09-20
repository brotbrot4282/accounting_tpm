"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/lib/format";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email atau kata sandi salah.");
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell title="Masuk ke akunmu">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-semibold text-slate-900 hover:text-slate-700">
          Daftar di sini
        </Link>
      </p>
    </AuthShell>
  );
}