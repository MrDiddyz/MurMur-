'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalPage() {
  const terminalRef = useRef(null);
  const wsRef = useRef(null);
  const termObj = useRef(null);
  const [line, setLine] = useState('');

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      theme: { background: '#0b0f14', foreground: '#d1d5db' }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termObj.current = term;

    const token = localStorage.getItem('murmur_token') || '';
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      term.focus();
    };
    ws.onmessage = (event) => term.write(event.data);
    ws.onclose = () => term.writeln('\r\n[disconnected]');

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    const onResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ws.close();
      term.dispose();
    };
  }, []);

  const sendInput = (value) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'input', data: value }));
    }
    termObj.current?.focus();
  };

  return (
    <main style={{ height: '100vh', display: 'grid', gridTemplateRows: '1fr auto' }}>
      <div ref={terminalRef} style={{ padding: 8 }} />
      <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid #1f2937' }}>
        <button onClick={() => sendInput('\u0003')}>Ctrl+C</button>
        <button onClick={() => sendInput('\u001b')}>Esc</button>
        <button onClick={() => sendInput('\t')}>Tab</button>
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Command"
          style={{ flex: 1, background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: 4 }}
        />
        <button onClick={() => { sendInput(`${line}\n`); setLine(''); }}>Run</button>
      </div>
    </main>
  );
}
