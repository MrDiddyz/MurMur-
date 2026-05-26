export const metadata = {
  title: "MurMur Terminal",
  description: "Cloud terminal constellation"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#070b14", color: "#dce3f1", fontFamily: "Inter, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
