import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-murmur-black text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
