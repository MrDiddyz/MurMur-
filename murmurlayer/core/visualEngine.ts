export type VisualFrameInput = {
  analyser: AnalyserNode | null;
  images: HTMLImageElement[];
  isPlaying: boolean;
  width: number;
  height: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function drawVisualFrame(
  ctx: CanvasRenderingContext2D,
  input: VisualFrameInput,
  fft: { freq: Uint8Array; time: Uint8Array },
) {
  const { analyser, images, isPlaying, width: w, height: h } = input;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, w, h);

  let bass = 0;
  let mid = 0;
  let treble = 0;
  let rms = 0;

  if (analyser && isPlaying) {
    const n = analyser.frequencyBinCount;
    const freq = fft.freq.length === n ? fft.freq : new Uint8Array(n);
    const time = fft.time.length === n ? fft.time : new Uint8Array(n);

    analyser.getByteFrequencyData(freq);
    analyser.getByteTimeDomainData(time);

    let sumSq = 0;
    for (let i = 0; i < n; i += 1) {
      const v = (time[i] - 128) / 128;
      sumSq += v * v;
    }
    rms = Math.sqrt(sumSq / n);

    const bEnd = Math.floor(n * 0.12);
    const mEnd = Math.floor(n * 0.45);
    const avg = (a: number, b: number) => {
      let s = 0;
      const len = Math.max(1, b - a);
      for (let i = a; i < b; i += 1) s += freq[i];
      return s / len / 255;
    };

    bass = avg(0, bEnd);
    mid = avg(bEnd, mEnd);
    treble = avg(mEnd, n);
  }

  const energy = clamp(rms * 2.6 + bass * 0.9, 0, 1);
  const swirl = mid * 1.2 + treble * 0.8;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 3; i += 1) {
    const rr = Math.min(w, h) * 0.18 + i * 28 + energy * 90;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, rr, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 190, 80, ${0.1 + i * 0.05})`;
    ctx.lineWidth = 2 + i;
    ctx.stroke();
  }
  ctx.restore();

  if (images.length === 0) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    const steps = 220;
    for (let i = 0; i < steps; i += 1) {
      const x = (i / (steps - 1)) * w;
      const y = h * 0.5 + Math.sin(i * 0.1 + swirl * 6) * (22 + energy * 90);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(120,230,255,0.75)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return;
  }

  const t = performance.now() * 0.001;
  const count = images.length;

  for (let idx = 0; idx < count; idx += 1) {
    const img = images[idx];
    if (!img.complete || img.naturalWidth === 0) continue;

    const baseScale = 0.55 + (idx / Math.max(1, count - 1)) * 0.35;
    const pulse = 1 + energy * (0.25 + idx * 0.03);
    const scale = baseScale * pulse;

    const cx = w / 2 + Math.sin(t * (0.6 + idx * 0.07) + bass * 4) * (40 + bass * 120);
    const cy = h / 2 + Math.cos(t * (0.7 + idx * 0.05) + treble * 4) * (35 + treble * 110);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const boxW = clamp(iw * scale * 0.35, 180, w * 0.55);
    const boxH = clamp(ih * scale * 0.35, 160, h * 0.55);
    const x0 = cx - boxW / 2;
    const y0 = cy - boxH / 2;

    const strips = 18;
    for (let s = 0; s < strips; s += 1) {
      const sy = (s / strips) * ih;
      const sh = ih / strips;
      const phase = t * (1.6 + idx * 0.08) + s * 0.55;
      const offset = Math.sin(phase) * (10 + bass * 40) + Math.cos(phase * 1.2) * (6 + treble * 22);
      const wobble = Math.sin(phase + mid * 3) * (6 + mid * 24);
      const dy = y0 + (s / strips) * boxH;
      const dhStrip = boxH / strips;

      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(img, 0, sy, iw, sh, x0 + offset, dy + wobble, boxW, dhStrip + 1);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.35 + energy * 0.35;
    ctx.strokeStyle = "rgba(255, 210, 120, 0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 - 2, y0 - 2, boxW + 4, boxH + 4);
    ctx.restore();
  }
}
