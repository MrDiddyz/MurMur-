import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MurMur Auto Bot v0.4",
  description: "Black/gold cinematic short-form content operations dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
