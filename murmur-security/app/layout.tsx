import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "MURMUR SECURITY",
  description: "Premium mobile-first scam message detector.",
  manifest: "/manifest.json",
  themeColor: "#070707",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MurMur Security",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-12">
          <header className="mb-6 pt-6">
            <p className="text-xs tracking-[0.2em] text-gold">MURMUR SECURITY</p>
            <h1 className="mt-2 text-2xl font-semibold">Message Risk Scanner</h1>
            <nav className="mt-4 flex gap-3 text-sm text-zinc-300">
              <Link className="rounded-full border border-zinc-700 px-4 py-1.5 hover:border-goldSoft" href="/">
                Scan
              </Link>
              <Link className="rounded-full border border-zinc-700 px-4 py-1.5 hover:border-goldSoft" href="/history">
                History
              </Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
