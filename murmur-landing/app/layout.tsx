import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "MurMur | Smarter Security Awareness",
  description:
    "MurMur helps teams build a human firewall with practical, adaptive security awareness training.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
