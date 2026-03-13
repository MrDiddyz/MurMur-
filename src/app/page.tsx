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

const murmurWorldLocations = [
  'Aurora Gallery',
  'Nova Gallery',
  'Echo Gallery',
  'Marketplace Plaza',
  'AI Museum',
];

const promptPacks = [
  {
    name: 'Cinematic Pack',
    prompts: [
      'A wide-angle dusk shot of a rainy city street, neon reflections shimmering on wet asphalt, cinematic realism.',
      'A lone protagonist entering an abandoned theater with a flashlight, dramatic contrast, film grain.',
      'Close-up of trembling hands opening an old letter, shallow depth of field, emotional tension.',
      'Golden-hour helicopter shot over cliffs and ocean, sweeping scale, epic composition.',
      'A tense boardroom scene lit by one overhead lamp, moody shadows, suspenseful atmosphere.',
      'Slow-motion crowd crossing in a modern station, muted palette with one red accent.',
      'A post-storm sunrise over a ruined skyline, hopeful tone, cinematic matte painting style.',
      'Interior car dialogue at night, city lights bokeh through windows, intimate framing.',
      'A chase through narrow alleyways, handheld camera feel, motion blur, gritty realism.',
      'Final scene on a quiet rooftop at dawn, soft backlight, contemplative ending frame.',
    ],
  },
  {
    name: 'Lo-fi Pack',
    prompts: [
      'A cozy bedroom studio with vinyl records and warm lamp light, soft grain, lo-fi anime mood.',
      'Rain tapping on a window beside a notebook and tea cup, muted colors, peaceful vibe.',
      'A cat sleeping on a keyboard while city lights glow outside, dreamy lo-fi illustration.',
      'Late-night desk scene with cassette tapes, stickers, and headphones, nostalgic textures.',
      'A bicycle parked near a corner store at sunset, pastel palette, calm lo-fi atmosphere.',
      'Cloudy afternoon in a tiny apartment kitchen, steam from ramen bowl, relaxed mood.',
      'A train ride through suburban neighborhoods, overcast sky, reflective lo-fi tone.',
      'Street corner jazz busker under yellow streetlights, gentle haze, vintage color grading.',
      'A student highlighting books in a quiet library nook, soft focus, ambient stillness.',
      'Moonlit rooftop with a portable radio and sketchbook, contemplative, cozy minimalism.',
    ],
  },
  {
    name: 'Fantasy Pack',
    prompts: [
      'An ancient forest temple covered in glowing runes, moonlight through mist, high fantasy art.',
      'A skyship sailing above floating islands and waterfalls, vibrant clouds, adventurous tone.',
      'A dragon curled around a crystal tower in winter, intricate scales, majestic composition.',
      'A mage opening a portal inside a candlelit library, magical particles, arcane atmosphere.',
      'Elven archers in emerald armor guarding a river bridge at dawn, cinematic fantasy style.',
      'A marketplace in a desert kingdom with exotic creatures and silk banners, rich detail.',
      'A forgotten sword embedded in stone on a windswept hill, mythic lighting, epic mood.',
      'A dwarven forge deep underground, molten metal, monumental architecture, heroic scale.',
      'A queen of storms summoning lightning from a cliffside throne, dramatic sky, power fantasy.',
      'A fellowship crossing a bioluminescent cavern, glowing flora, wonder and danger combined.',
    ],
  },
  {
    name: 'Dark Ambient Pack',
    prompts: [
      'An empty industrial corridor with flickering fluorescent lights, low-key lighting, uneasy silence.',
      'A fog-covered forest path at midnight, distant silhouette, ominous atmosphere.',
      'Abandoned subway platform with broken signage and echoing darkness, cinematic horror tone.',
      'A decaying cathedral interior lit by cold moonlight, drifting dust, gothic ambience.',
      'Deep ocean trench with bioluminescent anomalies, crushing darkness, alien dread.',
      'A deserted research lab with looping warning screens, sterile yet unsettling mood.',
      'Storm clouds over a ruined coastal town, monochrome palette, haunting stillness.',
      'A candlelit ritual chamber with worn symbols and stone walls, shadow-heavy composition.',
      'A snowy radio tower at night with red beacon pulses, isolation and tension.',
      'A vast concrete bunker hallway fading into black, minimalist design, oppressive atmosphere.',
    ],
  },
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

        <section className="rounded-xl border border-[#d8c7ad] bg-[#fffaf3] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#826443]">MurMur World</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Destinations</h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-[#2f2922]">
            {murmurWorldLocations.map((location) => (
              <li key={location} className="flex items-center gap-3">
                <span aria-hidden className="text-[#826443]">
                  ├──
                </span>
                <span>{location}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#826443]">Prompt Packs</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Creative starter prompts</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {promptPacks.map((pack) => (
              <article key={pack.name} className="rounded-xl border border-[#d8c7ad] bg-white p-5">
                <h3 className="text-xl font-semibold text-[#1f1f1f]">{pack.name}</h3>
                <p className="mt-2 text-sm text-[#3c3329]">10 prompts included</p>

                <details className="mt-4">
                  <summary className="inline-flex cursor-pointer list-none items-center rounded-md bg-[#1f1b16] px-4 py-2 text-sm font-medium text-[#f5efe6] hover:bg-[#332c24]">
                    Preview
                  </summary>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#2f2922]">
                    {pack.prompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ol>
                </details>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
