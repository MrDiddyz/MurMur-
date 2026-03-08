"use client";

import { useEffect, useRef, useState } from 'react';
import { MurmurMusicEngine } from './lib/murmurMusicEngine';
import { makeTaskResultWithHintLevel } from './lib/makeTaskResultWithHintLevel';
import { createHintState } from './lib/hintState';
import type { TaskId } from './lib/taskSoundMap';

type PyodideLike = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (msg: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike>;
  }
}

async function ensurePyodideLoaded(): Promise<PyodideLike> {
  if (!window.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load pyodide script'));
      document.head.appendChild(script);
    });
  }

  if (!window.loadPyodide) {
    throw new Error('loadPyodide is not available');
  }

  return window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
}

function MurMurCanvas({ safetyScore, detected }: { safetyScore: number; detected?: { loopCount?: number; functionCalled?: boolean; ok?: boolean } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationId: number;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const glow = 0.3 + safetyScore * 0.7 + (detected?.loopCount ?? 0) * 0.05;
      const now = Date.now();
      const x = w / 2 + Math.sin(now / 500) * 20;
      const y = h / 2 + Math.cos(now / 700) * 10;
      const radius = 40 + Math.sin(now / 200) * 5;

      const blink = detected?.functionCalled || detected?.ok ? Math.sin(now / 100) > 0.5 : false;
      const eyeColor = blink ? '#FFF' : '#000';
      const armOffset = Math.sin(now / 400) * 10;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,200,150,${glow})`;
      ctx.shadowBlur = 30;
      ctx.shadowColor = `rgba(255,200,150,${glow})`;
      ctx.fill();

      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x - 12, y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 12, y - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y + 30 + armOffset);
      ctx.strokeStyle = '#FFB372';
      ctx.lineWidth = 4;
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [detected, safetyScore]);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#203030', borderRadius: 12 }} />;
}

function HintBox({ text, hintLevel }: { text: string; hintLevel: number }) {
  const color = hintLevel === 0 ? '#A8FFC0' : hintLevel === 1 ? '#FFF1A8' : '#FFB3B3';
  return <div style={{ background: color, padding: 8, borderRadius: 6, marginTop: 8, minHeight: 40 }}>{text}</div>;
}

function OutputBox({ lines }: { lines: string[] }) {
  return (
    <div style={{ background: '#101010', color: '#FFF', padding: 8, borderRadius: 6, marginTop: 8, minHeight: 80 }}>
      {lines.map((line, i) => (
        <div key={`${line}-${i}`}>{line}</div>
      ))}
    </div>
  );
}

function ProgressGraph({ history }: { history: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (history.length < 2) return;

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((value, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - value * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [history]);

  return <canvas ref={canvasRef} width={300} height={100} style={{ background: '#101010', borderRadius: 6, marginTop: 8 }} />;
}

export default function MurMurPyodideMultiTaskDemo() {
  const tasks: TaskId[] = ['task1', 'task2', 'task3', 'task4', 'task5'];
  const [codes, setCodes] = useState<Record<TaskId, string>>({
    task1: 'print("MurMur: Hei!")',
    task2: 'navn = "Ola"\nprint(f"MurMur: Hei, {navn}!")',
    task3: 'vær = "regn"\nif vær=="regn":\n  print("MurMur: Ta på jakke.")\nelse:\n  print("MurMur: Ta med et smil.")',
    task4: 'tall = 7\nif tall>=10:\n  print("MurMur: Det er stort.")\nelse:\n  print("MurMur: Det er lite.")',
    task5: 'for _ in range(3):\n  print("MurMur: Tre vokser")',
  });
  const [taskResults, setTaskResults] = useState<Record<TaskId, ReturnType<typeof makeTaskResultWithHintLevel> | undefined>>({
    task1: undefined,
    task2: undefined,
    task3: undefined,
    task4: undefined,
    task5: undefined,
  });
  const [engine] = useState(() => new MurmurMusicEngine());
  const [hintState] = useState(() => createHintState());
  const [safetyScoreMap, setSafetyScoreMap] = useState<Record<TaskId, number>>({ task1: 0.6, task2: 0.6, task3: 0.6, task4: 0.6, task5: 0.6 });
  const [pyodide, setPyodide] = useState<PyodideLike | null>(null);
  const [progressHistory, setProgressHistory] = useState<number[]>([]);

  useEffect(() => {
    engine.init();
  }, [engine]);

  useEffect(() => {
    let mounted = true;
    ensurePyodideLoaded()
      .then((py) => {
        if (mounted) setPyodide(py);
      })
      .catch(() => {
        if (mounted) setPyodide(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRunTask = async (taskId: TaskId) => {
    if (!pyodide) return;

    let rawOutput = '';
    let error: unknown = null;

    try {
      const stdout: string[] = [];
      pyodide.setStdout({ batched: (msg) => stdout.push(msg) });
      await pyodide.runPythonAsync(codes[taskId]);
      rawOutput = stdout.join('\n');
    } catch (e) {
      error = e;
    }

    const safetyScore = safetyScoreMap[taskId] ?? 0.6;
    const taskResult = makeTaskResultWithHintLevel({ taskId, rawOutput, error, ran: true, safetyScore, style: 'balanse', hintState });

    import('./lib/emitTaskSounds').then(({ emitTaskSounds }) => {
      emitTaskSounds({ engine, taskId, result: taskResult, safetyScore, runToken: String(Date.now()), state: hintState });
    });

    setSafetyScoreMap((prev) => ({
      ...prev,
      [taskId]: taskResult.ok ? Math.min(1, safetyScore + 0.05) : Math.max(0.1, safetyScore - 0.05),
    }));
    setTaskResults((prev) => ({ ...prev, [taskId]: taskResult }));
    setProgressHistory((prev) => [...prev, taskResult.ok ? 1 : safetyScore]);
  };

  const activeTask = tasks.find((task) => taskResults[task]) ?? 'task1';

  return (
    <div style={{ display: 'flex', gap: 20, color: '#fff' }}>
      <div>
        <MurMurCanvas safetyScore={safetyScoreMap[activeTask]} detected={taskResults[activeTask]?.detected} />
        <ProgressGraph history={progressHistory} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tasks.map((taskId) => (
          <div key={taskId} style={{ marginBottom: 12 }}>
            <textarea
              value={codes[taskId]}
              onChange={(event) => setCodes({ ...codes, [taskId]: event.target.value })}
              style={{ width: '100%', minHeight: 100, color: '#fff', background: '#111', borderRadius: 8, padding: 8 }}
            />
            <button onClick={() => handleRunTask(taskId)} style={{ marginTop: 8, color: '#000', padding: '4px 10px' }}>
              Run {taskId}
            </button>
            {taskResults[taskId] && <HintBox text={taskResults[taskId]!.murmurText} hintLevel={taskResults[taskId]!.hintLevel} />}
            {taskResults[taskId] && <OutputBox lines={taskResults[taskId]!.outputLines} />}
            {taskResults[taskId] && <div style={{ color: '#FFF', marginTop: 4 }}>Streak: {hintState.streakByTask[taskId]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
