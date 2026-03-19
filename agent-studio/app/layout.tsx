import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Studio",
  description: "MVP SaaS for deterministic scenario simulation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
