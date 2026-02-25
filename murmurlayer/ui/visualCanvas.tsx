'use client';

import { useMemo } from 'react';
import { generateBars } from '../core/visualEngine';
import { useStateBus } from '../core/stateBus';

export function VisualCanvas() {
  const { images, activeImageIdx } = useStateBus();
  const bars = useMemo(() => generateBars(28), []);
  const activeImage = images[activeImageIdx];

  return (
    <section className="panel glass-panel">
      <h2 className="neon-text">Visualizer</h2>
      {activeImage ? <img className="visual-image" src={activeImage.url} alt="Active visual" /> : null}
      <div className="visualizer">
        {bars.map((height, index) => (
          <span key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
    </section>
  );
}
