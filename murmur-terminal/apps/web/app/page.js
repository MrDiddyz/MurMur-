import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>MurMur Cloud Terminal</h1>
      <p>MVP control plane is online.</p>
      <Link href="/terminal">Open Terminal</Link>
    </main>
  );
}
