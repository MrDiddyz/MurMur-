import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10 text-sm text-ink">
      <div className="container-shell flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold tracking-[0.18em] text-white">MURMUR LEARNING LAB</p>
          <p className="mt-2 max-w-lg">Simple reflection workflow: write, receive AI guidance, save, and grow learning nodes.</p>
        </div>
        <div className="flex gap-6">
          <Link href="/reflection" className="hover:text-white">
            Reflection
          </Link>
          <Link href="/constellation" className="hover:text-white">
            Constellation
          </Link>
        </div>
      </div>
    </footer>
  );
}
