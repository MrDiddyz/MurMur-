export default function WellbeingPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">Low-threshold wellbeing support</h1>
      <p className="max-w-3xl text-ink">
        Praktisk, ikke-klinisk støtte for struktur, daglig funksjon, reduksjon av overveldelse og vane-bygging.
      </p>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          ['Gentle Structure Plan', 'Lav terskel plan for uke- og dagsrytme med små, realistiske steg.'],
          ['Weekly Check-in', 'Kort ukentlig kalibrering for ansvar, fokus og fremdrift.'],
          ['Crisis-proof routines (non-clinical)', 'Rutiner for å gjøre hverdagen mer robust i krevende perioder.'],
        ].map(([title, text]) => (
          <article key={title} className="card">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm text-ink">{text}</p>
          </article>
        ))}
      </section>
      <section className="card space-y-3 text-sm">
        <h2 className="text-xl font-semibold">Viktig avgrensning</h2>
        <p className="text-ink">
          Dette tilbudet er ikke medisinsk rådgivning, ikke diagnostikk og ikke behandling. Vi tilbyr lærings- og
          strukturstøtte, ikke helsetjenester.
        </p>
        <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100">
          Ved akutt fare eller krise: kontakt lokale nødnummer umiddelbart. I Norge kan du ringe 113 ved akutt nød.
          Trenger du noen å snakke med, kontakt Mental Helse hjelpetelefon 116 123.
        </div>
      </section>
    </div>
  );
}
