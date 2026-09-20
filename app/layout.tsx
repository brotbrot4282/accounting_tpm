import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tujuh Pilar — Pembukuan Keuangan",
  description:
    "Sistem pencatatan pemasukan dan pengeluaran keuangan perusahaan Tujuh Pilar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}