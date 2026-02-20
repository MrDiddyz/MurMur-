import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10 text-sm text-ink">
      <div className="container-shell flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold tracking-[0.18em] text-white">MURMUR : A Learning Constellation</p>
          <p className="mt-2 max-w-lg">
            Skreddersydde læringsmoduler for selskaper og individer. Wellbeing-tilbudet er ikke medisinsk eller
            diagnostisk.
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/legal" className="hover:text-white">Juridisk</Link>
          <Link href="/privacy" className="hover:text-white">Personvern</Link>
        </div>
      </div>
    </footer>
  );
}
