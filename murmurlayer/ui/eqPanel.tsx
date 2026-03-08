'use client';

import { useStateBus } from '../core/stateBus';

export function EqPanel() {
  const { eqBands, setEqBandGain } = useStateBus();

  return (
    <section className="murmur-panel">
      <h3>10-Band EQ</h3>
      <div className="murmur-eq-grid">
        {eqBands.map((band, index) => (
          <label key={band.frequency}>
            <span>{band.frequency >= 1000 ? `${band.frequency / 1000}k` : band.frequency}Hz</span>
            <input
              type="range"
              min={-18}
              max={18}
              step={0.5}
              value={band.gain}
              onChange={(event) => setEqBandGain(index, Number(event.target.value))}
            />
            <strong>{band.gain.toFixed(1)} dB</strong>
          </label>
        ))}
      </div>
    </section>
  );
}
