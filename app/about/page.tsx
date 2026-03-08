export default function AboutPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">Om MURMUR</h1>
      <section className="card space-y-3 text-ink">
        <p>
          Mission: bygge læringssystemer som gjør mennesker og organisasjoner mer presise, adaptive og gjennomføringssterke.
        </p>
        <p>
          Metode: vi kobler analyse, design og trening i én kontinuerlig sløyfe med tydelige beslutningspunkter.
        </p>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold">Constellation model</h2>
        <ul className="mt-4 grid gap-3 text-sm text-ink md:grid-cols-2">
          <li>Teacher: tydeliggjør konsepter og gir praktiske rammer.</li>
          <li>Experimental Agent: tester hypoteser i lav risiko.</li>
          <li>Think-tank Simulator: utforsker strategiske scenarier raskt.</li>
          <li>Reflective Persona: gjør læring personlig, konkret og varig.</li>
        </ul>
      </section>
      <section className="card text-sm text-ink">
        <h2 className="text-xl font-semibold text-white">Hvorfor vanskelig å kopiere</h2>
        <p className="mt-3">
          Fordi effekten ligger i samspillet mellom system, prosess og eksekvering — ikke i enkeltverktøy eller enkeltkurs.
        </p>
      </section>
    </div>
  );
}
