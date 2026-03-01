import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murmur Nala Reflection OS",
  description: "Real-time reflective intelligence for adaptive learning systems."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
