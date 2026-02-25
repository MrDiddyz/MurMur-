import Link from 'next/link';

const moduler = [
  {
    id: 1,
    navn: 'Kjerne-modul Alpha',
    pris: '50 000,-',
    beskrivelse: 'Komplett system for enterprise-håndtering.',
    kontaktUrl: '/contact?module=kjerne-modul-alpha',
    vippsUrl: '/contact?module=kjerne-modul-alpha&intent=vipps',
  },
  {
    id: 2,
    navn: 'Sikkerhets-node Beta',
    pris: '75 000,-',
    beskrivelse: 'Avansert kryptering og tilgangskontroll.',
    kontaktUrl: '/contact?module=sikkerhets-node-beta',
    vippsUrl: '/contact?module=sikkerhets-node-beta&intent=vipps',
  },
];

export function EnterpriseModuleGrid() {
  return (
    <section aria-labelledby="enterprise-modules-title" className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d9b574]">Utvalgte moduler</p>
        <h2 id="enterprise-modules-title" className="text-2xl font-semibold text-[#f7f1e4]">
          Enterprise-pakke
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {moduler.map((modul) => (
          <article
            key={modul.id}
            className="rounded-lg border border-[#6f2b1f] bg-gradient-to-br from-[#121212] via-[#2a201a] to-[#4e3528] p-5 text-[#f0e6d2] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
          >
            <h3 className="text-xl font-semibold text-[#d9b574]">{modul.navn}</h3>
            <p className="mt-2 text-sm text-[#e3d6bc]">{modul.beskrivelse}</p>
            <p className="mt-3 text-sm font-bold text-[#f0e6d2]">Pris: {modul.pris}</p>

            <div className="mt-4 space-y-2">
              <Link
                href={modul.kontaktUrl}
                className="block w-full rounded-md border border-[#d9b574]/50 bg-[#1c1c1c] px-4 py-2 text-center text-sm font-semibold text-[#f7f1e4] transition hover:bg-[#272727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b574]"
              >
                Book 1:1 Samtale
              </Link>
              <Link
                href={modul.vippsUrl}
                className="block w-full rounded-md bg-[#6f2b1f] px-4 py-2 text-center text-sm font-bold text-[#f7f1e4] transition hover:bg-[#8c3a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b574]"
              >
                Betal med Vipps
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
