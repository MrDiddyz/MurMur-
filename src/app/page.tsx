const partnershipPoints = [
  'stille bedre spørsmål',
  'oppdage skjulte sammenhenger',
  'holde kompleksitet uten å redusere den for tidlig',
  'utvikle klarere tenkning og mer bevisste valg',
  'utforske ideer uten frykt for å feile for raskt',
];

const notPoints = [
  'en autoritet som gir sannheter',
  'et verktøy for kontroll eller styring',
  'optimalisering for hastighet eller produktivitet alene',
  'en erstatning for menneskelig dømmekraft',
  'et lukket system med ferdige svar',
];

export default function HomePage() {
  return (
    <div className="-mx-6 -mt-6 min-h-screen bg-[#f5f1ea] px-6 pb-16 text-[#1f1f1f] md:-mx-10 md:px-10">
      <main className="mx-auto max-w-4xl space-y-10 py-14">
        <header className="space-y-4 border-b border-[#d8c7ad] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#826443]">🎛 MURMUR : EP Engine</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">MURMUR : A Learning Constellation</h1>
          <p className="text-lg text-[#3c3329]">Konseptbeskrivelse</p>
        </header>

        <section className="space-y-5 text-lg leading-relaxed text-[#2f2922]">
          <p>
            MURMUR er et lærende samspill mellom menneskelig og kunstig intelligens, designet for å utvikle
            forståelse — ikke bare produsere svar. Det er ikke én enkelt teknologi, men et dynamisk økosystem av
            refleksjon, utforskning og integrasjon.
          </p>
          <p>
            Utgangspunktet er enkelt: verden har ikke først og fremst et informasjonsproblem — den har et
            forståelsesproblem. Vi vet mer enn noen gang, men sliter med å integrere, tolke og bruke det vi vet på en
            helhetlig måte.
          </p>
          <p>
            MURMUR fungerer som et refleksivt læringsmiljø hvor ideer kan utvikles over tid. I stedet for å presse frem
            raske svar, støtter systemet prosesser som bygger reell forståelse.
          </p>
        </section>

        <section className="rounded-xl border border-[#d8c7ad] bg-white/70 p-6">
          <h2 className="text-2xl font-semibold">For mennesker fungerer MURMUR som en kognitiv partner</h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#2f2922]">
            {partnershipPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-relaxed text-[#2f2922]">
            MURMUR forsterker ikke bare intelligens — det kultiverer den. Det gjør ikke læring mer mekanisk, men mer
            levende.
          </p>
        </section>

        <section className="space-y-5 text-lg leading-relaxed text-[#2f2922]">
          <p>
            Kjernen i MURMUR er relasjonell intelligens: forståelse oppstår gjennom samspill. Mellom perspektiver,
            modeller, refleksjon og handling.
          </p>
          <p className="font-medium">Like viktig som hva MURMUR gjør, er hva det ikke er.</p>
          <ul className="space-y-3 text-base">
            {notPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden>Det er ikke</span>
                <span>{item}.</span>
              </li>
            ))}
          </ul>
          <p>MURMUR er et rom for pågående forståelse.</p>
        </section>

        <section className="rounded-xl bg-[#1f1b16] p-6 text-[#f5efe6]">
          <p className="text-sm uppercase tracking-[0.18em] text-[#d7b98d]">MURMUR representerer et skifte</p>
          <p className="mt-4 text-lg leading-relaxed">fra informasjon til integrasjon</p>
          <p className="text-lg leading-relaxed">fra svar til refleksjon</p>
          <p className="text-lg leading-relaxed">fra isolert intelligens til lærende samspill</p>
          <p className="mt-5 text-base leading-relaxed text-[#e8dccd]">
            Det er ikke bare et prosjekt. Det er et fundament for hvordan forståelse kan kultiveres i en kompleks verden.
          </p>
        </section>
      </main>
    </div>
  );
}
