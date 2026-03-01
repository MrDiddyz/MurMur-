import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.WS_PORT || 3001);
const TICK_MS = Number(process.env.WS_TICK_MS || 1000);
const SECTION_DURATION_MS = Number(process.env.WS_SECTION_DURATION_MS || 10000);
const MAX_BUFFERED_EVENTS = Number(process.env.WS_MAX_BUFFERED_EVENTS || 20);

const SECTION_SEQUENCE = ['idle', 'ingest', 'reason', 'synthesize', 'respond'];
const RUNTIME_PUBLISH_PATH = '/runtime/events';

class StateEngine {
  constructor() {
    this.listeners = new Set();
    this.currentSection = SECTION_SEQUENCE[0];
    this.sectionIndex = 0;
    this.beat = 0;
    this.sectionTimer = null;
    this.tickTimer = null;
    this.startedAt = Date.now();
    this.recentEvents = [];
  }

  onEvent(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  buildEvent(type, payload = {}, source = 'state-engine') {
    return {
      id: randomUUID(),
      type,
      ts: Date.now(),
      source,
      payload,
    };
  }

  pushRecent(event) {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > MAX_BUFFERED_EVENTS) {
      this.recentEvents.length = MAX_BUFFERED_EVENTS;
    }
  }

  emit(type, payload = {}, source = 'state-engine') {
    const event = this.buildEvent(type, payload, source);
    this.pushRecent(event);

    for (const listener of this.listeners) {
      listener(event);
    }

    return event;
  }

  publishRuntimeEvent(event) {
    const safeType = typeof event.type === 'string' && event.type.length > 0 ? event.type : 'runtime.event';
    const safePayload = event.payload && typeof event.payload === 'object' ? event.payload : {};
    return this.emit(safeType, safePayload, 'agent-runtime');
  }

  snapshot() {
    return {
      type: 'state.snapshot',
      ts: Date.now(),
      payload: {
        currentSection: this.currentSection,
        beat: this.beat,
        uptimeMs: Date.now() - this.startedAt,
        recentEvents: this.recentEvents,
      },
    };
  }

  rotateSection() {
    const previousSection = this.currentSection;
    this.emit('section.exit', { section: previousSection });

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

const stateEngine = new StateEngine();
const sockets = new Set();

function encodeWebSocketTextFrame(text) {
  const payload = Buffer.from(text);
  const length = payload.length;

  if (length > 65535) {
    throw new Error('payload exceeds max frame size');
  }

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), payload]);
  }

  return Buffer.concat([Buffer.from([0x81, 126, (length >> 8) & 0xff, length & 0xff]), payload]);
}

function sendEvent(socket, event) {
  if (socket.destroyed) return;
  try {
    socket.write(encodeWebSocketTextFrame(JSON.stringify(event)));
  } catch {
    socket.destroy();
    sockets.delete(socket);
  }
}

function broadcast(event) {
  for (const socket of sockets) {
    sendEvent(socket, event);
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 256_000) {
        reject(new Error('payload too large'));
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('invalid json'));
      }
    });

    req.on('error', reject);
  });
}

stateEngine.onEvent(broadcast);

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, clients: sockets.size }));
    return;
  }

  if (req.method === 'POST' && req.url === RUNTIME_PUBLISH_PATH) {
    try {
      const json = await readJsonBody(req);
      const published = stateEngine.publishRuntimeEvent(json);

      res.writeHead(202, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ accepted: true, id: published.id }));
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      const status = message === 'payload too large' ? 413 : 400;
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ accepted: false, error: message }));
      return;
    }
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];

  if (!key || typeof key !== 'string') {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
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
  sendEvent(socket, stateEngine.buildEvent('hud.connected', { currentSection: stateEngine.currentSection }, 'server'));

  socket.on('close', () => sockets.delete(socket));
  socket.on('end', () => sockets.delete(socket));
  socket.on('error', () => sockets.delete(socket));
});

server.listen(PORT, () => {
  stateEngine.start();
  console.log(`[ws-runtime-server] listening on ws://localhost:${PORT}`);
  console.log(`[ws-runtime-server] runtime publish endpoint: POST http://localhost:${PORT}${RUNTIME_PUBLISH_PATH}`);
});

function shutdown() {
  stateEngine.stop();
  for (const socket of sockets) {
    socket.destroy();
  }
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
