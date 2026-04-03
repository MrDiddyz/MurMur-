import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MurMur Mobile Engine v0.3",
  description: "Multi-agent mobile-first dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
