'use client';

import { FormEvent, useMemo, useState } from 'react';

type TrackDraft = {
  title: string;
  prompt: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: number;
  instrumental: boolean;
  intensity: number;
};

const GENRES = ['Afro House', 'Techno', 'Drill', 'Pop', 'Lo-fi', 'Cinematic'];
const MOODS = ['Energetic', 'Melancholic', 'Epic', 'Dreamy', 'Dark', 'Happy'];

function buildTrackSummary(draft: TrackDraft) {
  const mode = draft.instrumental ? 'Instrumental mode aktiv' : 'Vokalspor aktiv';
  return [
    `${draft.genre} med ${draft.bpm} BPM og ${draft.duration} sekunder spilletid.`,
    `Stemning: ${draft.mood}. Intensitet: ${draft.intensity}/100.`,
    mode,
  ].join(' ');
}

export function DjCoreStudio() {
  const [title, setTitle] = useState('Midnight Circuit');
  const [prompt, setPrompt] = useState('Bygg et futuristisk klubbspor med tung bass, airy pads og store drops.');
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [bpm, setBpm] = useState(124);
  const [duration, setDuration] = useState(180);
  const [intensity, setIntensity] = useState(75);
  const [instrumental, setInstrumental] = useState(true);
  const [createdTrack, setCreatedTrack] = useState<TrackDraft | null>(null);

  const charsLeft = useMemo(() => 5000 - prompt.length, [prompt.length]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatedTrack({
      title,
      prompt,
      genre,
      mood,
      bpm,
      duration,
      instrumental,
      intensity,
    });
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form className="card space-y-6 border-accent/40" onSubmit={onSubmit}>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accent">DJ Music Core App</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-5xl text-amber-100">Lag en track med egne ord</h1>
          <p className="mt-3 text-sm text-ink">Skriv opptil 5000 bokstaver, velg lydprofil og generer et instrumental-utkast.</p>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="text-ink">Track-navn</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={80}
            className="w-full rounded-xl border border-accent/35 bg-purple-900/35 px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent/60"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="flex items-center justify-between text-ink">
            Prompt
            <strong className={charsLeft < 300 ? 'text-rose-300' : 'text-white'}>{charsLeft} igjen</strong>
          </span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value.slice(0, 5000))}
            rows={8}
            className="w-full rounded-xl border border-accent/35 bg-purple-900/35 px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent/60"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-ink">Sjanger</span>
            <select value={genre} onChange={(event) => setGenre(event.target.value)} className="w-full rounded-xl border border-accent/35 bg-purple-950/70 px-4 py-3">
              {GENRES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-ink">Mood</span>
            <select value={mood} onChange={(event) => setMood(event.target.value)} className="w-full rounded-xl border border-accent/35 bg-purple-950/70 px-4 py-3">
              {MOODS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="text-ink">BPM</span>
            <input
              type="number"
              min={60}
              max={180}
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
              className="w-full rounded-xl border border-accent/35 bg-purple-900/35 px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-ink">Lengde (sek)</span>
            <input
              type="number"
              min={30}
              max={600}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="w-full rounded-xl border border-accent/35 bg-purple-900/35 px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-ink">Intensitet</span>
            <input
              type="range"
              min={1}
              max={100}
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-accent/30 bg-purple-900/30 px-4 py-3 text-sm">
          <input type="checkbox" checked={instrumental} onChange={(event) => setInstrumental(event.target.checked)} />
          Kun instrumental (ingen vokal)
        </label>

        <button type="submit" className="w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 px-6 py-3 text-sm font-semibold text-purple-950 hover:brightness-110">
          Create Track
        </button>
      </form>

      <aside className="card space-y-5 border-accent/40">
        <h2 className="text-2xl font-semibold">Track preview</h2>
        {!createdTrack ? (
          <p className="text-sm text-ink">Ingen track generert enda. Fyll ut skjemaet og trykk «Create Track».</p>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Klar for eksport</p>
              <p className="mt-2 text-2xl font-semibold">{createdTrack.title}</p>
            </div>
            <p className="rounded-xl border border-accent/35 bg-purple-900/35 p-4 text-sm text-ink">{buildTrackSummary(createdTrack)}</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Prompt:</strong> {createdTrack.prompt}
              </p>
              <p>
                <strong>Status:</strong> Demo-mode (kan kobles til API for faktisk audio rendering)
              </p>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}
