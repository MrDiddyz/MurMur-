import Link from "next/link"

export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>MurMur Stronghold</h1>
      <p>Public sales + dashboard shell is online.</p>
      <p>
        <Link href="/login">Login</Link> · <Link href="/dashboard">Dashboard</Link>
      </p>
    </main>
  )
}
