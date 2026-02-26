"use client";

import { DEFAULT_EQ } from "../core/audioEngine";

type Props = {
  eqGains: number[];
  onChange: (index: number, value: number) => void;
};

export default function EQPanel({ eqGains, onChange }: Props) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>10-band EQ</span>
        <span style={{ opacity: 0.75 }}>±12 dB</span>
      </div>

      <div className="eq">
        {DEFAULT_EQ.map((b, i) => (
          <div key={b.label} className="eqCol">
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={eqGains[i] ?? 0}
              onChange={(e) => onChange(i, parseFloat(e.target.value))}
            />
            <label>{b.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
