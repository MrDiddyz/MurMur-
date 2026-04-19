export default function CompaniesPage() {
  return (
    <div className="space-y-10 pb-10">
      <h1 className="text-4xl font-semibold">For Companies</h1>
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Problems → Outcomes → Modules</h2>
        <ul className="space-y-3 text-sm text-ink">
          <li>Uklare prioriteringer → Beslutningsro → Signal to Strategy</li>
          <li>Teamfriksjon → Smidig koordinering → Frictionless Collaboration</li>
          <li>Inkonsekvent ledelse → Forutsigbar drift → Leadership OS</li>
        </ul>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          ['Signature', 'High-ticket partnerskap over 6-12 måneder for transformasjon i flere team.'],
          ['Sprint (60 dager)', 'Konsentrert leveranse med tydelig scope, artefakter og oppfølging.'],
          ['Retainer', 'Løpende strategisk læringsstøtte med månedlige iterasjoner.'],
        ].map(([name, text]) => (
          <article key={name} className="card">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="mt-3 text-sm text-ink">{text}</p>
          </article>
        ))}
      </section>
      <section className="card text-sm text-ink">
        <h2 className="text-xl font-semibold text-white">Procurement-friendly</h2>
        <p className="mt-3">Alle leveranser inkluderer scope-dokument, tidslinje, milepæler, leveranseliste og evalueringskriterier.</p>
      </section>
    </div>
  );
}
