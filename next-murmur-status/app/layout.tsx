import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0A0F1E", color: "white" }}>
        {children}
      </body>
    </html>
  )
}
