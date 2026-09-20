"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputGlass =
  "w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400";

export default function SignInCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Mohon isi email dan kata sandi.");
      return;
    }
    setBusy(true);
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#121212]">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] p-px shadow-2xl">
        <div className="flex flex-col items-center rounded-3xl bg-[#121212] p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h2 className="mb-1 text-center text-2xl font-semibold text-white">
            Tujuh Pilar
          </h2>
          <p className="mb-6 text-sm text-slate-400">Sistem Pembukuan Keuangan</p>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputGlass}
                autoComplete="email"
                required
              />
              <input
                type="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputGlass}
                autoComplete="current-password"
                required
              />
              {error ? (
                <div className="text-left text-sm text-red-400">{error}</div>
              ) : null}
            </div>
            <hr className="opacity-10" />
            <div>
              <button
                type="submit"
                disabled={busy}
                className="mb-2 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-white/20 disabled:opacity-50"
              >
                {busy ? "Memproses…" : "Masuk"}
              </button>
              <div className="mt-2 w-full text-center">
                <span className="text-xs text-slate-400">
                  Belum punya akun?{" "}
                  <Link
                    href="/auth/register"
                    className="underline text-slate-300 hover:text-white"
                  >
                    Daftar di sini
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}