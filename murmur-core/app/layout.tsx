import "./globals.css";
import { ShellLayout } from "@/components/layout/shell-layout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
