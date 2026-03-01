import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.WS_PORT || 3001);
const TICK_MS = Number(process.env.WS_TICK_MS || 1000);
const SECTION_DURATION_MS = Number(process.env.WS_SECTION_DURATION_MS || 10000);

const SECTION_SEQUENCE = ['idle', 'ingest', 'reason', 'synthesize', 'respond'];

class StateEngine {
  constructor() {
    this.listeners = new Set();
    this.currentSection = SECTION_SEQUENCE[0];
    this.sectionIndex = 0;
    this.beat = 0;
    this.sectionTimer = null;
    this.tickTimer = null;
    this.startedAt = Date.now();
  }

  onEvent(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  snapshot() {
    return {
      type: 'state.snapshot',
      ts: Date.now(),
      payload: {
        currentSection: this.currentSection,
        beat: this.beat,
        uptimeMs: Date.now() - this.startedAt,
      },
    };
  }

  emit(type, payload = {}) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      type,
      ts: Date.now(),
      payload,
    };

    for (const listener of this.listeners) {
      listener(event);
    }
  }

  rotateSection() {
    const prevSection = this.currentSection;
    this.emit('section.exit', { section: prevSection });

    this.sectionIndex = (this.sectionIndex + 1) % SECTION_SEQUENCE.length;
    this.currentSection = SECTION_SEQUENCE[this.sectionIndex];

    this.emit('section.enter', { section: this.currentSection });
  }

  tickBeat() {
    this.beat += 1;
    this.emit('beat.tick', {
      beat: this.beat,
      section: this.currentSection,
      mock: true,
    });
  }

  start() {
    this.emit('section.enter', { section: this.currentSection });

    this.tickTimer = setInterval(() => this.tickBeat(), TICK_MS);
    this.sectionTimer = setInterval(() => this.rotateSection(), SECTION_DURATION_MS);
  }

  stop() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.sectionTimer) clearInterval(this.sectionTimer);
  }
}

const sockets = new Set();

function encodeWebSocketTextFrame(text) {
  const payload = Buffer.from(text);
  const length = payload.length;

  if (length > 65535) {
    throw new Error('Payload too large for this demo server');
  }

  let header;
  if (length < 126) {
    header = Buffer.from([0x81, length]);
  } else {
    header = Buffer.from([0x81, 126, (length >> 8) & 0xff, length & 0xff]);
  }

  return Buffer.concat([header, payload]);
}

function sendEvent(socket, event) {
  if (socket.destroyed) return;
  const data = encodeWebSocketTextFrame(JSON.stringify(event));
  socket.write(data);
}

const stateEngine = new StateEngine();

stateEngine.onEvent((event) => {
  for (const socket of sockets) {
    sendEvent(socket, event);
  }
});

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];

  if (!key || typeof key !== 'string') {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '\r\n',
    ].join('\r\n')
  );

  sockets.add(socket);
  sendEvent(socket, stateEngine.snapshot());
  sendEvent(socket, {
    id: `${Date.now()}-connected`,
    type: 'hud.connected',
    ts: Date.now(),
    payload: { currentSection: stateEngine.currentSection },
  });

  socket.on('close', () => sockets.delete(socket));
  socket.on('error', () => sockets.delete(socket));
  socket.on('end', () => sockets.delete(socket));
});

server.listen(PORT, () => {
  stateEngine.start();
  console.log(`[ws-runtime-server] listening on ws://localhost:${PORT}`);
});

const shutdown = () => {
  stateEngine.stop();
  for (const socket of sockets) {
    socket.destroy();
  }

  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
