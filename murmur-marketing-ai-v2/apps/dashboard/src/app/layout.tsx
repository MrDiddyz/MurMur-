import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murmur Marketing AI",
  description: "AI music marketing control center"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
