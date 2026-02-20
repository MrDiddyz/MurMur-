const groups = {
  companies: [
    ['Signature', 'fra 190 000 NOK', 'Strategisk transformasjon med lederstøtte og modulstack'],
    ['Sprint 60', 'fra 85 000 NOK', 'Konsentrert 60-dagers leveranse med tydelige artefakter'],
    ['Retainer', 'fra 45 000 NOK / mnd', 'Kontinuerlig rådgivning og månedlige iterasjoner'],
  ],
  individuals: [
    ['Core Path', 'fra 12 000 NOK', 'Personlig modulforløp med ukentlig oppfølging'],
    ['Advanced Path', 'fra 22 000 NOK', 'Dypere læringsarkitektur for langsiktig endring'],
  ],
};

export default function PricingPage() {
  return (
    <div className="space-y-10 pb-10">
      <h1 className="text-4xl font-semibold">Prising</h1>
      <section>
        <h2 className="text-2xl font-semibold">Selskaper</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {groups.companies.map(([name, price, text]) => (
            <article key={name} className="card">
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-accent">{price}</p>
              <p className="mt-3 text-sm text-ink">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Individer</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {groups.individuals.map(([name, price, text]) => (
            <article key={name} className="card">
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-accent">{price}</p>
              <p className="mt-3 text-sm text-ink">{text}</p>
            </article>
          ))}
          <article className="card">
            <h3 className="text-lg font-semibold">Wellbeing low-threshold</h3>
            <p className="mt-2 text-accent">fra 2 900 NOK</p>
            <p className="mt-3 text-sm text-ink">Ikke-klinisk støtte for struktur, funksjon og vanescaffolding.</p>
          </article>
        </div>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink">
          <li><strong>Hva får jeg?</strong> Moduldesign, verktøy, oppfølging og evaluerbare leveranser.</li>
          <li><strong>Tidslinje?</strong> Vanligvis 2-12 uker avhengig av omfang.</li>
          <li><strong>Konfidensialitet?</strong> Vi jobber med tydelige fortrolighetsrammer i avtale.</li>
          <li><strong>Datahåndtering?</strong> Kontaktdata lagres minimalt for oppfølging og slettes ved forespørsel.</li>
        </ul>
      </section>
    </div>
  );
}
