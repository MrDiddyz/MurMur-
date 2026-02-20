export default function IndividualsPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">For Individuals</h1>
      <section className="card">
        <p className="text-ink">
          Personlige læringsforløp for deg som vil bygge struktur, kreativ kapasitet eller ny profesjonell retning uten
          standardprogram.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl font-semibold">Prisintervaller</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li>Starter-kit (2-3 uker): fra 4 900 NOK</li>
            <li>Core Path (6 uker): fra 12 000 NOK</li>
            <li>Advanced Path (10 uker): fra 22 000 NOK</li>
          </ul>
        </article>
        <article className="card">
          <h2 className="text-xl font-semibold">Tydelige grenser</h2>
          <p className="mt-3 text-sm text-ink">
            MURMUR tilbyr læringsdesign og strukturstøtte. Dette er ikke terapi, medisinsk behandling eller diagnostikk.
          </p>
        </article>
      </section>
    </div>
  );
}
