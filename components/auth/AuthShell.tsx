import { Wallet } from "lucide-react";

export default function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tujuh Pilar</h1>
          <p className="mt-1 text-sm text-emerald-100/80">
            Sistem Pembukuan Keuangan
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-emerald-100/60">
          © {new Date().getFullYear()} Tujuh Pilar. Semua data tersimpan aman &
          rahasia.
        </p>
      </div>
    </div>
  );
}