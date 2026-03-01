'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
};

const MODULES = [
  {
    name: 'Pilot',
    summary:
      'Plan missions, set intent, and keep your team pointed toward meaningful outcomes.',
  },
  {
    name: 'Weaver',
    summary:
      'Interconnect ideas, data, and people into one evolving narrative fabric.',
  },
  {
    name: 'Mirror',
    summary:
      'Reflect signals in real time so every decision learns from reality, not guesswork.',
  },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let last = performance.now();

    const buildStars = () => {
      const area = width * height;
      const density = Math.min(0.00009, 170 / Math.max(area, 1));
      const count = Math.max(60, Math.min(170, Math.floor(area * density)));

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildStars();
    };

    const draw = (time: number) => {
      const dt = Math.min(40, time - last);
      last = time;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(6, 10, 26, 0.92)';
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        if (!reduceMotion) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.alpha += Math.sin(time * s.twinkleSpeed) * 0.002;

          if (s.x < -10) s.x = width + 10;
          if (s.x > width + 10) s.x = -10;
          if (s.y < -10) s.y = height + 10;
          if (s.y > height + 10) s.y = -10;

          s.alpha = Math.max(0.18, Math.min(0.95, s.alpha));
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 218, 255, ${s.alpha})`;
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(143, 183, 255, 0.2)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < stars.length; i += 1) {
        for (let j = i + 1; j < stars.length; j += 1) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 70 * 70) {
            const opacity = Math.max(0, 0.24 - distSq / (70 * 70 * 5));
            if (opacity <= 0.01) continue;
            ctx.strokeStyle = `rgba(143, 183, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    frameId = window.requestAnimationFrame(draw);

    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main className="landing">
      <section className="hero">
        <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
        <div className="veil" aria-hidden="true" />
        <div className="heroContent">
          <p className="kicker">Murmur Constellation</p>
          <h1>Cinematic intelligence for teams moving at starlight speed.</h1>
          <p className="subhead">
            Align operators, systems, and strategy across one living constellation of
            decision-making.
          </p>

          <div className="ctaRow">
            <Link href="/contact" className="btn btnPrimary">
              Book demo
            </Link>
            <Link href="/pricing" className="btn btnSecondary">
              Start trial
            </Link>
            <Link href="/docs" className="btn btnGhost">
              See docs
            </Link>
          </div>
        </div>
      </section>

      <section className="modules" aria-labelledby="modules-heading">
        <h2 id="modules-heading">Core modules</h2>
        <div className="moduleGrid">
          {MODULES.map((module) => (
            <article key={module.name} className="card">
              <h3>{module.name}</h3>
              <p>{module.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .landing {
          min-height: 100vh;
          color: #eaf3ff;
          background: radial-gradient(circle at 20% 20%, #141d47 0, #070b1d 45%, #050814 100%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }

        .hero {
          position: relative;
          overflow: clip;
          min-height: 72vh;
          display: grid;
          place-items: center;
          padding: 6.5rem 1.25rem 4rem;
          isolation: isolate;
        }

        .starfield,
        .veil {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .starfield {
          z-index: -3;
        }

        .veil {
          z-index: -2;
          background:
            linear-gradient(180deg, rgba(4, 8, 22, 0.1) 0%, rgba(4, 8, 22, 0.72) 90%),
            radial-gradient(circle at 50% 40%, rgba(109, 176, 255, 0.18), transparent 55%);
        }

        .heroContent {
          max-width: 880px;
          text-align: center;
        }

        .kicker {
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9ec5ff;
          font-size: 0.76rem;
          margin-bottom: 1rem;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 4.8vw, 4rem);
          line-height: 1.1;
          text-wrap: balance;
        }

        .subhead {
          margin: 1.15rem auto 0;
          max-width: 62ch;
          color: #c8d8ee;
          font-size: clamp(1rem, 1.7vw, 1.22rem);
        }

        .ctaRow {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }

        .btn {
          text-decoration: none;
          border-radius: 999px;
          padding: 0.72rem 1.15rem;
          font-size: 0.95rem;
          border: 1px solid transparent;
          transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
          will-change: transform;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btnPrimary {
          background: linear-gradient(120deg, #6ea7ff, #4f86ea);
          color: #06102a;
          font-weight: 600;
        }

        .btnSecondary {
          background: rgba(142, 180, 255, 0.15);
          color: #dbe9ff;
          border-color: rgba(142, 180, 255, 0.45);
        }

        .btnGhost {
          background: transparent;
          border-color: rgba(214, 232, 255, 0.35);
          color: #dbe9ff;
        }

        .modules {
          padding: 2rem 1.25rem 4.8rem;
          max-width: 1120px;
          margin: 0 auto;
        }

        .modules h2 {
          text-align: center;
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin: 0 0 1.4rem;
        }

        .moduleGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .card {
          background: linear-gradient(170deg, rgba(15, 26, 56, 0.95), rgba(9, 15, 35, 0.93));
          border: 1px solid rgba(133, 173, 255, 0.22);
          border-radius: 1rem;
          padding: 1.1rem;
          box-shadow: 0 12px 30px rgba(1, 2, 5, 0.35);
        }

        .card h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #f2f7ff;
        }

        .card p {
          margin: 0.62rem 0 0;
          color: #c4d1e3;
          line-height: 1.58;
        }

        @media (max-width: 900px) {
          .moduleGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .btn {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
