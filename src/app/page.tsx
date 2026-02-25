import Link from 'next/link';
import { EnterpriseModuleGrid } from '@/components/enterprise-module-grid';

const runeCode = 'ᚠᚱᛟᛋᛏ · ᚢᛚᚠᚱ · ᛗᛁᛞᚾᚨᛏᛏ · ᛋᛏᛁᛚᛚᚻᛖᛏ';

function VikingShieldArtwork() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#d9b574]/35 bg-gradient-to-br from-[#121212] via-[#2a201a] to-[#6f2b1f] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#d9b57422,transparent_55%)]" />
      <figure className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <figcaption className="text-xs uppercase tracking-[0.24em] text-[#d9b574]">Kunstverk</figcaption>
        <h2 className="mt-3 text-3xl font-semibold text-[#f7f1e4] md:text-4xl">Viking-skjold</h2>
        <svg viewBox="0 0 420 420" role="img" aria-label="Stort kunstverk av et viking skjold" className="mt-6 h-auto w-full max-w-[420px]">
          <defs>
            <radialGradient id="wood" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8c5a3f" />
              <stop offset="55%" stopColor="#6f2b1f" />
              <stop offset="100%" stopColor="#1c1c1c" />
            </radialGradient>
          </defs>
          <circle cx="210" cy="210" r="186" fill="url(#wood)" stroke="#d9b574" strokeWidth="10" />
          <circle cx="210" cy="210" r="122" fill="none" stroke="#d9b574" strokeOpacity="0.55" strokeWidth="9" />
          <circle cx="210" cy="210" r="46" fill="#2a201a" stroke="#f0e6d2" strokeWidth="6" />
          <line x1="210" y1="26" x2="210" y2="394" stroke="#d9b574" strokeOpacity="0.45" strokeWidth="5" />
          <line x1="26" y1="210" x2="394" y2="210" stroke="#d9b574" strokeOpacity="0.45" strokeWidth="5" />
          <line x1="79" y1="79" x2="341" y2="341" stroke="#d9b574" strokeOpacity="0.35" strokeWidth="4" />
          <line x1="341" y1="79" x2="79" y2="341" stroke="#d9b574" strokeOpacity="0.35" strokeWidth="4" />
        </svg>
      </figure>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="-mx-6 -mt-6 min-h-screen bg-gradient-to-b from-[#0f0f10] via-[#2a201a] to-[#6f2b1f] px-6 pb-10 text-[#f0e6d2] md:-mx-10 md:px-10">
      <header className="mx-auto max-w-5xl border-b-4 border-[#d9b574] bg-[#101010]/80 px-6 py-14 text-center text-[#f7f1e4] backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d9b574]">Launch Edition</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">MurMur Á Learning Constellation</h1>
        <p className="mt-4 text-base md:text-lg">Eksklusive software-moduler for Maskens barn & Enterprises</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-[#d9b574] px-6 py-2 text-sm font-semibold text-[#121212] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f1e4]"
          >
            Bestill discovery-samtale
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-[#d9b574]/60 px-6 py-2 text-sm font-semibold text-[#f7f1e4] transition hover:bg-[#121212]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b574]"
          >
            Se prismodeller
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-5xl space-y-8">
        <VikingShieldArtwork />
        <EnterpriseModuleGrid />

        <section className="rounded-lg border border-[#d9b574]/40 bg-[#101010]/85 p-6 text-[#f5f5f5] shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d9b574]">Hemmelig gåte</p>
          <h2 className="mt-3 text-2xl font-semibold">Norrøn kryptisk kode</h2>
          <p className="mt-4 rounded-md bg-black/40 p-4 font-mono text-lg leading-relaxed text-[#d9b574]">{runeCode}</p>
          <p className="mt-4 text-sm text-[#ded2bc]">
            Når frosten tier, ulven snur, og midnatt speiler det første navnet du bar — da kjenner kun du nøkkelen.
          </p>
        </section>
      </main>
    </div>
  );
}
