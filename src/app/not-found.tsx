import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">Fant ikke siden</h1>
      <p className="mt-4 text-ink">Siden finnes ikke eller har blitt flyttet.</p>
      <Link href="/" className="mt-6 inline-block text-accent underline">
        Tilbake til forsiden
      </Link>
    </div>
  );
}
