export default function LegalPage() {
  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-4xl font-semibold">Juridisk</h1>
      <section className="card space-y-3 text-sm text-ink">
        <h2 className="text-xl font-semibold text-white">Terms (placeholder)</h2>
        <p>Bruk av tjenester reguleres av avtalt scope, leveranseplan og betalingsbetingelser.</p>
      </section>
      <section className="card space-y-3 text-sm text-ink">
        <h2 className="text-xl font-semibold text-white">Wellbeing disclaimer</h2>
        <p>
          MURMUR wellbeing-tilbud er ikke medisinsk rådgivning, diagnostikk eller behandling, og skal ikke erstatte
          helsehjelp.
        </p>
        <p>Ved krise eller fare: kontakt lokale nødtjenester (i Norge: 113) eller relevante hjelpelinjer.</p>
      </section>
    </div>
  );
}
