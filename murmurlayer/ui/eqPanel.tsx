'use client';

import { useStateBus } from '../core/stateBus';

const bands = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export function EqPanel() {
  const { eqValues, setEqValues } = useStateBus();

  return (
    <section className="panel glass-panel">
      <h2 className="neon-text">EQ Panel</h2>
      <div className="eq-grid">
        {bands.map((band, idx) => (
          <div key={band} className="eq-band">
            <span>{band}</span>
            <input
              type="range"
              min="-12"
              max="12"
              value={eqValues[idx] ?? 0}
              onChange={(event) => {
                const next = [...eqValues];
                next[idx] = Number(event.target.value);
                setEqValues(next);
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
