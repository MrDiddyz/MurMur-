import { PsychedelicEqualizer } from '@/components/psychedelic-equalizer';

export default function StudioPage() {
  return (
    <div className="space-y-8 py-10 pb-10">
      <section className="card space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-accent">MurMur Studio</p>
        <h1 className="text-4xl font-semibold">Music Studio</h1>
        <p className="max-w-3xl text-ink">
          Egen studio-sone for lyd og visualizer. Koble til audio-kilde og bruk equalizeren for live, psykedelisk respons.
        </p>
      </section>

      <PsychedelicEqualizer />
    </div>
  );
}
