import type { ReactNode } from "react";

export const metadata = {
  title: "MurMur Terminal",
  description: "Terminal session UI for MurMur"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", background: "#090b10", color: "#e5e7eb" }}>
        {children}
      </body>
    </html>
  );
}
