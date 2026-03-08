'use client';

import { useEffect, useMemo, useState } from 'react';

type GenreRule = {
  test: RegExp;
  genre: string;
  additions: string[];
};

type RemixProfile = {
  label: string;
  mood: string;
  energy: string;
  inject: string[];
};

type RemixKey = 'default' | 'ambient' | 'trap' | 'triphop' | 'cinematic';

type PromptBuildResult = {
  text: string;
  genre: string;
  mood: string;
  energy: string;
  status: string;
};

const DEMO_PROMPTS = [
  'lofi rainy music',
  'atmospheric hip hop',
  'dark trip hop',
  'sad cinematic ambient',
  'night drive synthwave',
];

const GENRE_RULES: GenreRule[] = [
  {
    test: /lofi|chillhop/i,
    genre: 'Lo-fi',
    additions: ['vinyl crackle', 'soft piano motif', 'warm bass groove', 'rain ambience'],
  },
  {
    test: /trap|808/i,
    genre: 'Trap',
    additions: ['heavy 808 pressure', 'dark bell textures', 'fast hi-hat detail', 'shadow-lit low end'],
  },
  {
    test: /trip[\s-]?hop/i,
    genre: 'Trip-Hop',
    additions: ['dusty breakbeat', 'warm sub bass', 'vinyl saturation', 'smoky nocturnal texture'],
  },
  {
    test: /ambient/i,
    genre: 'Ambient',
    additions: ['evolving pads', 'sub bass drone', 'long reverb tails', 'slow spatial movement'],
  },
  {
    test: /synthwave|night drive/i,
    genre: 'Synthwave',
    additions: ['retro pulse bass', 'analog synth glow', 'neon night texture', 'driving arpeggios'],
  },
  {
    test: /cinematic|score/i,
    genre: 'Cinematic',
    additions: [
      'wide atmospheric layers',
      'dramatic transitions',
      'subtle orchestral tension',
      'slow rising dynamics',
    ],
  },
  {
    test: /hip[\s-]?hop/i,
    genre: 'Hip-Hop',
    additions: ['warm drum pocket', 'dark velvet bass motion', 'filtered transitions', 'late-night mood'],
  },
];

const REMIX_PROFILES: Record<RemixKey, RemixProfile> = {
  default: {
    label: 'Live Enhance',
    mood: 'shadow-lit',
    energy: 'medium',
    inject: ['dark velvet', 'slow burn rhythm', 'filtered transitions'],
  },
  ambient: {
    label: 'Ambient Remix',
    mood: 'floating',
    energy: 'low',
    inject: ['evolving pads', 'sub bass drone', 'wide reverb atmosphere', 'slow spatial transitions'],
  },
  trap: {
    label: 'Trap Remix',
    mood: 'noir',
    energy: 'high',
    inject: ['heavy 808 bass', 'dark bell motif', 'sharp percussion detail', 'shadow-lit aggression'],
  },
  triphop: {
    label: 'Trip-Hop Remix',
    mood: 'smoky',
    energy: 'low-medium',
    inject: ['dusty breakbeat', 'warm sub bass', 'vinyl texture', 'late-night urban atmosphere'],
  },
  cinematic: {
    label: 'Cinematic Remix',
    mood: 'dramatic',
    energy: 'medium',
    inject: ['cinematic pads', 'slow build tension', 'widescreen transitions', 'emotional low-end movement'],
  },
};

function detectGenre(text: string) {
  for (const rule of GENRE_RULES) {
    if (rule.test.test(text)) return rule;
  }

  return {
    genre: 'Atmospheric',
    additions: ['moody pads', 'warm sub movement', 'soft texture layers', 'slow transition details'],
  };
}

function detectMood(text: string, remixKey: RemixKey) {
  const lowered = text.toLowerCase();
  if (/dark|noir|midnight|shadow|night/.test(lowered)) return 'noir';
  if (/sad|melancholy|lonely|blue/.test(lowered)) return 'melancholic';
  if (/dream|float|air|ambient/.test(lowered)) return 'dreamy';
  if (/rain|lofi|soft|cozy/.test(lowered)) return 'cozy';
  return REMIX_PROFILES[remixKey].mood;
}

function detectEnergy(text: string, remixKey: RemixKey) {
  const lowered = text.toLowerCase();
  if (/club|dance|hard|fast|aggressive|trap/.test(lowered)) return 'high';
  if (/ambient|soft|slow|rain|dream/.test(lowered)) return 'low';
  return REMIX_PROFILES[remixKey].energy;
}

function uniqueParts(parts: string[]) {
  return [...new Set(parts.filter(Boolean).map((item) => item.trim()).filter(Boolean))];
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function energyToPercent(energy: string) {
  if (energy.toLowerCase().includes('high')) return 88;
  if (energy.toLowerCase().includes('low')) return 38;
  return 64;
}

function buildPrompt(sourceText: string, remixKey: RemixKey): PromptBuildResult {
  const trimmed = sourceText.trim() || 'lofi rainy music';
  const genreInfo = detectGenre(trimmed);
  const remix = REMIX_PROFILES[remixKey];
  const mood = detectMood(trimmed, remixKey);
  const energy = detectEnergy(trimmed, remixKey);

  const baseParts = trimmed
    .replace(/\s+/g, ' ')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const descriptors = uniqueParts([
    ...baseParts,
    genreInfo.genre.toLowerCase(),
    `${mood} atmosphere`,
    ...genreInfo.additions,
    ...remix.inject,
  ]);

  return {
    text: `${descriptors.slice(0, 2).join(', ')},\n${descriptors.slice(2).join(', ')}`,
    genre: genreInfo.genre,
    mood: capitalize(mood),
    energy: capitalize(energy),
    status: remix.label,
  };
}

export default function LandingPage() {
  const [input, setInput] = useState('');
  const [currentRemix, setCurrentRemix] = useState<RemixKey>('default');
  const [copyLabel, setCopyLabel] = useState('Copy Output');

  const built = useMemo(() => buildPrompt(input, currentRemix), [input, currentRemix]);
  const energyPercent = useMemo(() => energyToPercent(built.energy), [built.energy]);

  useEffect(() => {
    let i = 0;
    const demoText = 'lofi rainy music';
    const timer = window.setInterval(() => {
      setInput(demoText.slice(0, i + 1));
      i += 1;
      if (i >= demoText.length) {
        window.clearInterval(timer);
      }
    }, 65);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const fillRandomPrompt = () => {
    setInput(DEMO_PROMPTS[Math.floor(Math.random() * DEMO_PROMPTS.length)]);
  };

  const handleCopyOutput = async () => {
    const text = built.text.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy Output'), 1200);
    } catch {
      setCopyLabel('Copy Failed');
      window.setTimeout(() => setCopyLabel('Copy Output'), 1200);
    }
  };

  return (
    <main>
      <section className="murmur-hero" aria-labelledby="murmur-hero-title">
        <div className="murmur-hero__tech-grid" aria-hidden="true" />
        <div className="murmur-hero__gold-orbit" aria-hidden="true" />
        <div className="murmur-hero__wrap">
          <div className="murmur-hero__copy">
            <div className="murmur-hero__eyebrow">AI Music Prompt Studio</div>
            <h1 className="murmur-hero__title" id="murmur-hero-title">
              Generate Better <span className="murmur-hero__title-accent">AI Music Prompts</span> for Suno &amp;
              Udio in Seconds
            </h1>
            <p className="murmur-hero__subtitle">
              Turn rough ideas into structured, production-rich music prompts with MurMur’s instant enhancer and
              remix engine.
            </p>

            <div className="murmur-hero__telemetry" aria-label="System telemetry">
              <div className="murmur-hero__telemetry-label">Signal Bus • LIVE</div>
              <div className="murmur-hero__telemetry-value">Prompt Matrix: 03 / Gold Channel Active</div>
            </div>

            <div className="murmur-hero__cta-row">
              <a href="#murmur-hero-demo" className="murmur-hero__button murmur-hero__button--gold">
                Try Interactive Demo
              </a>
              <button
                className="murmur-hero__button"
                type="button"
                onClick={() => {
                  setInput('atmospheric hip hop');
                  setCurrentRemix('default');
                }}
              >
                Load Demo Prompt
              </button>
            </div>

            <div className="murmur-hero__meta" aria-label="Key features">
              <div className="murmur-hero__meta-pill">Prompt Intelligence</div>
              <div className="murmur-hero__meta-pill">Instant Remix</div>
              <div className="murmur-hero__meta-pill">Suno / Udio Ready</div>
            </div>
          </div>

          <div className="murmur-hero__demo" id="murmur-hero-demo" aria-label="Interactive MurMur hero demo">
            <div className="murmur-hero__demo-topbar">
              <div className="murmur-hero__demo-label">Interactive Hero Demo</div>
              <div className="murmur-hero__demo-badge">{built.status}</div>
            </div>

            <div className="murmur-hero__signal" aria-hidden="true">
              <div className="murmur-hero__signal-meta">Energy calibration</div>
              <div className="murmur-hero__signal-track">
                <div className="murmur-hero__signal-fill" style={{ width: `${energyPercent}%` }} />
              </div>
            </div>

            <div className="murmur-hero__demo-body">
              <div className="murmur-hero__field">
                <div className="murmur-hero__field-label">
                  <span>Your prompt</span>
                  <span className="murmur-hero__hint">Type anything simple</span>
                </div>
                <textarea
                  id="mm-input"
                  className="murmur-hero__textarea"
                  placeholder="lofi rainy music"
                  aria-label="Enter a music prompt"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
              </div>

              <div className="murmur-hero__actions">
                <button className="murmur-hero__button murmur-hero__button--gold" type="button">
                  Enhance Prompt
                </button>
                <button className="murmur-hero__button" type="button" onClick={fillRandomPrompt}>
                  Random Example
                </button>
                <button className="murmur-hero__button" type="button" onClick={handleCopyOutput}>
                  {copyLabel}
                </button>
              </div>

              <div className="murmur-hero__remix-row" aria-label="Remix styles">
                {(Object.keys(REMIX_PROFILES) as RemixKey[]).map((key) => (
                  <button
                    key={key}
                    className={`murmur-hero__chip${currentRemix === key ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => setCurrentRemix(key)}
                  >
                    {key === 'default'
                      ? 'Original Enhance'
                      : `${key === 'triphop' ? 'Trip-Hop' : capitalize(key)} Remix`}
                  </button>
                ))}
              </div>

              <div className="murmur-hero__field">
                <div className="murmur-hero__field-label">
                  <span>MurMur output</span>
                  <span className="murmur-hero__hint">Updates instantly</span>
                </div>
                <div className="murmur-hero__output" aria-live="polite">
                  {built.text}
                </div>
              </div>

              <div className="murmur-hero__stats" aria-label="Prompt analysis summary">
                <div className="murmur-hero__stat">
                  <div className="murmur-hero__stat-label">Genre</div>
                  <div className="murmur-hero__stat-value">Detected: {built.genre}</div>
                </div>
                <div className="murmur-hero__stat">
                  <div className="murmur-hero__stat-label">Mood</div>
                  <div className="murmur-hero__stat-value">Mood: {built.mood}</div>
                </div>
                <div className="murmur-hero__stat">
                  <div className="murmur-hero__stat-label">Energy</div>
                  <div className="murmur-hero__stat-value">Energy: {built.energy}</div>
                </div>
              </div>

              <div className="murmur-hero__footer-note">
                Example workflow: rough idea → enhanced prompt → remix into new directions.
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .murmur-hero {
          --mm-bg: #050505;
          --mm-panel: rgba(255, 214, 108, 0.05);
          --mm-panel-strong: rgba(255, 214, 108, 0.08);
          --mm-border: rgba(255, 214, 108, 0.22);
          --mm-border-strong: rgba(255, 214, 108, 0.42);
          --mm-text: #f8f4e7;
          --mm-muted: rgba(240, 226, 184, 0.72);
          --mm-gold: #ffd86e;
          --mm-green: #86efac;
          --mm-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
          --mm-radius: 24px;
          position: relative;
          overflow: hidden;
          padding: 72px 20px 56px;
          color: var(--mm-text);
          background:
            radial-gradient(circle at 18% 12%, rgba(255, 216, 110, 0.14), transparent 32%),
            radial-gradient(circle at 88% 18%, rgba(255, 216, 110, 0.08), transparent 26%),
            linear-gradient(180deg, #030303 0%, #090806 100%);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .murmur-hero__tech-grid,
        .murmur-hero__gold-orbit {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .murmur-hero__tech-grid {
          background-image:
            linear-gradient(rgba(255, 214, 108, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 214, 108, 0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 78%);
          opacity: 0.35;
        }

        .murmur-hero__gold-orbit {
          background: radial-gradient(circle at 70% 28%, rgba(255, 216, 110, 0.2), transparent 34%);
        }

        .murmur-hero * {
          box-sizing: border-box;
        }

        .murmur-hero__wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 28px;
          align-items: center;
        }

        .murmur-hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid var(--mm-border);
          background: rgba(255, 255, 255, 0.04);
          color: var(--mm-gold);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .murmur-hero__title {
          margin: 0;
          max-width: 12ch;
          font-size: clamp(2.4rem, 6vw, 4.9rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
        }

        .murmur-hero__title-accent {
          color: var(--mm-gold);
        }

        .murmur-hero__subtitle {
          margin: 18px 0 0;
          max-width: 62ch;
          color: var(--mm-muted);
          font-size: clamp(1rem, 1.5vw, 1.14rem);
          line-height: 1.6;
        }

        .murmur-hero__telemetry {
          margin-top: 16px;
          border: 1px solid rgba(255, 214, 108, 0.18);
          border-radius: 12px;
          padding: 10px 12px;
          background: rgba(255, 216, 110, 0.04);
          max-width: 460px;
        }

        .murmur-hero__telemetry-label {
          color: var(--mm-gold);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .murmur-hero__telemetry-value {
          margin-top: 4px;
          color: var(--mm-muted);
          font-size: 0.88rem;
        }

        .murmur-hero__cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .murmur-hero__button {
          appearance: none;
          border: 1px solid var(--mm-border);
          border-radius: 999px;
          padding: 12px 18px;
          background: linear-gradient(180deg, rgba(55, 28, 75, 0.96), rgba(17, 10, 24, 0.98));
          color: var(--mm-text);
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
        }

        .murmur-hero__button:hover {
          transform: translateY(-1px);
          border-color: var(--mm-border-strong);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .murmur-hero__button--gold {
          background:
            radial-gradient(circle at top, rgba(255, 216, 110, 0.16), transparent 55%),
            linear-gradient(180deg, rgba(86, 49, 15, 0.95), rgba(33, 21, 9, 0.98));
          border-color: rgba(255, 216, 110, 0.28);
          color: #fff4cc;
        }

        .murmur-hero__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .murmur-hero__meta-pill {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 214, 108, 0.12);
          background: rgba(255, 255, 255, 0.035);
          color: var(--mm-muted);
          font-size: 0.92rem;
        }

        .murmur-hero__demo {
          position: relative;
          border: 1px solid var(--mm-border);
          border-radius: var(--mm-radius);
          background: linear-gradient(180deg, rgba(14, 12, 8, 0.98), rgba(7, 7, 6, 0.98));
          box-shadow: var(--mm-shadow);
          overflow: hidden;
        }

        .murmur-hero__demo-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 214, 108, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }

        .murmur-hero__demo-label {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--mm-gold);
          letter-spacing: 0.02em;
        }

        .murmur-hero__demo-badge {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(134, 239, 172, 0.2);
          background: rgba(134, 239, 172, 0.08);
          color: var(--mm-green);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .murmur-hero__signal {
          padding: 10px 16px 0;
        }

        .murmur-hero__signal-meta {
          color: var(--mm-muted);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 7px;
        }

        .murmur-hero__signal-track {
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 214, 108, 0.12);
          overflow: hidden;
        }

        .murmur-hero__signal-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255, 214, 108, 0.55), #ffd86e);
          box-shadow: 0 0 14px rgba(255, 216, 110, 0.5);
          transition: width 0.25s ease;
        }

        .murmur-hero__demo-body {
          padding: 18px;
        }

        .murmur-hero__field {
          display: grid;
          gap: 8px;
        }

        .murmur-hero__field + .murmur-hero__field {
          margin-top: 16px;
        }

        .murmur-hero__field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--mm-text);
        }

        .murmur-hero__hint {
          color: var(--mm-muted);
          font-size: 0.78rem;
          font-weight: 500;
        }

        .murmur-hero__textarea,
        .murmur-hero__output {
          width: 100%;
          min-height: 132px;
          border-radius: 18px;
          padding: 14px 16px;
          border: 1px solid rgba(255, 214, 108, 0.16);
          background: var(--mm-panel);
          color: var(--mm-text);
          font: inherit;
          line-height: 1.55;
        }

        .murmur-hero__textarea {
          resize: vertical;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .murmur-hero__textarea::placeholder {
          color: rgba(247, 241, 255, 0.42);
        }

        .murmur-hero__textarea:focus {
          outline: none;
          border-color: var(--mm-border-strong);
          box-shadow: 0 0 0 3px rgba(255, 214, 108, 0.1);
          background: var(--mm-panel-strong);
        }

        .murmur-hero__output {
          white-space: pre-wrap;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.03));
        }

        .murmur-hero__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .murmur-hero__remix-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .murmur-hero__chip {
          appearance: none;
          border: 1px solid rgba(255, 214, 108, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: var(--mm-text);
          padding: 9px 12px;
          border-radius: 999px;
          cursor: pointer;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          transition: border-color 0.18s ease, transform 0.15s ease, background 0.18s ease;
        }

        .murmur-hero__chip:hover,
        .murmur-hero__chip.is-active {
          border-color: rgba(255, 214, 108, 0.32);
          background: rgba(255, 255, 255, 0.075);
          transform: translateY(-1px);
        }

        .murmur-hero__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .murmur-hero__stat {
          border: 1px solid rgba(255, 214, 108, 0.1);
          border-radius: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
        }

        .murmur-hero__stat-label {
          color: var(--mm-muted);
          font-size: 0.77rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .murmur-hero__stat-value {
          margin-top: 6px;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--mm-text);
        }

        .murmur-hero__footer-note {
          margin-top: 12px;
          color: var(--mm-muted);
          font-size: 0.8rem;
        }

        @media (max-width: 980px) {
          .murmur-hero__wrap {
            grid-template-columns: 1fr;
          }

          .murmur-hero__title {
            max-width: 14ch;
          }
        }

        @media (max-width: 640px) {
          .murmur-hero {
            padding: 56px 14px 36px;
          }

          .murmur-hero__stats {
            grid-template-columns: 1fr;
          }

          .murmur-hero__cta-row,
          .murmur-hero__actions,
          .murmur-hero__remix-row {
            display: grid;
            grid-template-columns: 1fr;
          }

          .murmur-hero__button,
          .murmur-hero__chip {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
