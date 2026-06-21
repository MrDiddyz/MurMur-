'use client';

import { useMemo, useState } from 'react';

type Layer = {
  key: string;
  label: string;
  keywords: string[];
};

const layers: Layer[] = [
  {
    key: 'goal',
    label: 'GOAL',
    keywords: ['goal', 'create', 'generate', 'write', 'build', 'make'],
  },
  {
    key: 'context',
    label: 'CONTEXT',
    keywords: ['context', 'setting', 'scene', 'world', 'environment', 'night drive', 'story world'],
  },
  {
    key: 'style',
    label: 'STYLE',
    keywords: ['style', 'genre', 'aesthetic', 'cinematic', 'dark', 'futuristic', 'minimalist', 'luxury'],
  },
  {
    key: 'structure',
    label: 'STRUCTURE',
    keywords: ['structure', 'intro', 'verse', 'chorus', 'bridge', 'outro', 'step', 'sequence'],
  },
  {
    key: 'sensory',
    label: 'SENSORY',
    keywords: ['sensory', 'texture', 'atmosphere', 'glow', 'rain', 'wet asphalt', 'distant traffic', 'feeling'],
  },
  {
    key: 'constraints',
    label: 'CONSTRAINTS',
    keywords: ['constraints', 'tempo', 'bpm', 'limit', 'must', 'only', 'under', 'minor key', 'length'],
  },
];

const examplePrompt = `Create a cinematic synthwave track for a night drive.
Context: neon city, rain, reflective mood.
Style: dark, futuristic, emotional.
Structure: intro, verse, chorus, outro.
Sensory: wet asphalt, glowing lights, distant traffic.
Constraints: 95 BPM, minor key, under 2 minutes.`;

type LayerResult = Layer & { found: boolean };

function hasLayer(text: string, keywords: string[]) {
  return keywords.some((word) => text.includes(word));
}

function analyzePrompt(text: string): LayerResult[] {
  const normalized = text.toLowerCase();
  return layers.map((layer) => ({
    ...layer,
    found: hasLayer(normalized, layer.keywords),
  }));
}

export default function DnaHelixPage() {
  const [prompt, setPrompt] = useState(examplePrompt);
  const [analyzedPrompt, setAnalyzedPrompt] = useState(examplePrompt);

  const results = useMemo(() => analyzePrompt(analyzedPrompt), [analyzedPrompt]);
  const score = Math.round((results.filter((result) => result.found).length / results.length) * 100);

  return (
    <div className="dna-root">
      <div className="wrap">
        <section className="panel">
          <h1>MurMur Prompt DNA Helix</h1>
          <p>
            Paste a prompt below. The helix lights up by layer: GOAL, CONTEXT, STYLE, STRUCTURE, SENSORY, and
            CONSTRAINTS.
          </p>

          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />

          <button type="button" onClick={() => setAnalyzedPrompt(prompt)}>
            Analyze DNA
          </button>

          <div className="score">{score}</div>
          <div className="mini">DNA Score</div>

          <div className="legend">
            {results.map((item) => (
              <div key={item.key} className="legend-item">
                <div className="left-row">
                  <span className={`dot ${item.found ? 'ok' : 'miss'}`} />
                  <strong>{item.label}</strong>
                </div>
                <span style={{ color: item.found ? 'var(--ok)' : 'var(--miss)' }}>{item.found ? 'Detected' : 'Missing'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel helix-card">
          <div className="helix">
            {Array.from({ length: 30 }).map((_, i) => {
              const item = results[i % results.length];
              return (
                <div
                  key={`${item.key}-${i}`}
                  className={`pair ${item.found ? 'ok' : 'miss'}`}
                  style={{
                    ['--i' as '--i']: `${i}`,
                  }}
                >
                  <span className="node left" />
                  <span className="bar" />
                  <span className="node right" />
                </div>
              );
            })}
          </div>
          <div className="mini">Animated prompt genome visualization</div>
        </section>
      </div>

      <style jsx>{`
        .dna-root {
          --bg: #07070b;
          --panel: #11111a;
          --line: #232336;
          --text: #f2f2f7;
          --muted: #8f90a6;
          --ok: #63ffb0;
          --miss: #ff5c7a;
          --accent: #7a5cff;
          margin: -1.5rem;
          min-height: 100vh;
          background: radial-gradient(circle at top, #151525 0%, #07070b 55%);
          color: var(--text);
          font-family: Inter, system-ui, sans-serif;
          display: grid;
          place-items: center;
          padding: 32px;
        }

        * {
          box-sizing: border-box;
        }

        .wrap {
          width: min(1100px, 100%);
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
        }

        .panel {
          background: rgba(17, 17, 26, 0.92);
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.38);
        }

        h1 {
          margin: 0 0 10px;
          font-size: 28px;
          letter-spacing: 0.02em;
        }

        p {
          margin: 0 0 18px;
          color: var(--muted);
          line-height: 1.55;
        }

        textarea {
          width: 100%;
          min-height: 180px;
          resize: vertical;
          background: #0c0c14;
          color: var(--text);
          border: 1px solid #27273b;
          border-radius: 16px;
          padding: 16px;
          font: inherit;
          outline: none;
        }

        button {
          margin-top: 14px;
          border: none;
          background: linear-gradient(135deg, var(--accent), #9a7dff);
          color: white;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .helix-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 620px;
          overflow: hidden;
          position: relative;
        }

        .helix {
          position: relative;
          width: 280px;
          height: 540px;
          margin: 8px auto 20px;
          perspective: 900px;
        }

        .pair {
          position: absolute;
          left: 50%;
          width: 220px;
          height: 18px;
          transform-style: preserve-3d;
          transform: translateX(-50%) rotateY(calc(var(--i) * 18deg)) translateZ(0);
          animation: spin 8s linear infinite;
          animation-delay: calc(var(--i) * -0.15s);
        }

        .node {
          position: absolute;
          top: 0;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 0 18px rgba(122, 92, 255, 0.18);
        }

        .node.left {
          left: 0;
        }

        .node.right {
          right: 0;
        }

        .bar {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 7px;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.15));
        }

        .pair.ok .node,
        .pair.ok .bar {
          background: var(--ok);
          box-shadow: 0 0 18px rgba(99, 255, 176, 0.45);
        }

        .pair.miss .node,
        .pair.miss .bar {
          background: var(--miss);
          box-shadow: 0 0 18px rgba(255, 92, 122, 0.35);
        }

        @keyframes spin {
          0% {
            transform: translateX(-50%) translateY(calc(var(--i) * 16px)) rotateY(calc(var(--i) * 18deg));
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(calc(var(--i) * 16px)) rotateY(calc(var(--i) * 18deg + 360deg));
            opacity: 0.45;
          }
        }

        .legend {
          width: 100%;
          display: grid;
          gap: 10px;
          margin-top: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border: 1px solid #242438;
          border-radius: 12px;
          background: #0d0d15;
        }

        .left-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .dot.ok {
          background: var(--ok);
        }

        .dot.miss {
          background: var(--miss);
        }

        .score {
          font-size: 42px;
          font-weight: 800;
          margin: 6px 0 14px;
        }

        .mini {
          color: var(--muted);
          font-size: 13px;
        }

        @media (max-width: 900px) {
          .wrap {
            grid-template-columns: 1fr;
          }

          .helix-card {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}
