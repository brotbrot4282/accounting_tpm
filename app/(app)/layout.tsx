import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const fullName =
    user.user_metadata?.full_name || user.email || "Pengguna";

  return (
    <div className="flex min-h-screen">
      <Sidebar fullName={fullName} email={user.email ?? ""} />
      <main className="min-h-screen w-full flex-1 overflow-x-auto bg-slate-100">
        {children}
      </main>
    </div>
  );
}