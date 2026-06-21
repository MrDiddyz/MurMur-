import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold">Murmur</h1>
      <p className="text-lg text-slate-600">Generate AI art, mint NFTs, and list them on the Murmur marketplace.</p>
      <div className="flex gap-4">
        <Link href="/generate" className="rounded bg-black px-4 py-2 text-white">Generate Artwork</Link>
        <Link href="/marketplace" className="rounded border px-4 py-2">Browse Marketplace</Link>
      </div>
    </section>
  );
}
