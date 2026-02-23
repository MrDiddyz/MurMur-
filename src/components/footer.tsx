import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10 text-sm text-ink">
      <div className="container-shell flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold tracking-[0.18em] text-white">DJ CORE : AI MUSIC STUDIO</p>
          <p className="mt-2 max-w-lg">
            Bygg demo-tracks med egne ord, juster sjanger, BPM og intensitet, og velg ren instrumental produksjon.
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/legal" className="hover:text-white">
            Juridisk
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Personvern
          </Link>
        </div>
      </div>
    </footer>
  );
}
