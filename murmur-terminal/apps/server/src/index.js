import http from 'node:http';
import { spawn } from 'node:child_process';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import pty from 'node-pty';

const port = Number(process.env.PORT || 8080);
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
const sessionImage = process.env.SESSION_IMAGE || 'murmur-session';
const idleMs = 30 * 60 * 1000;

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

const wss = new WebSocketServer({ server });

function runDocker(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('docker', args);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr || `docker exited with code ${code}`));
      }
    });
  });
}

async function killContainer(containerName) {
  try {
    await runDocker(['rm', '-f', containerName]);
  } catch {
    // no-op
  }
}

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = url.searchParams.get('token') || bearer;

  if (!token) {
    ws.close(1008, 'missing token');
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch {
    ws.close(1008, 'invalid token');
    return;
  }

  const roles = decoded.roles || [];
  const permissions = decoded.permissions || [];
  if (!roles.some((r) => ['operator', 'architect', 'a7'].includes(r))) {
    ws.close(1008, 'forbidden');
    return;
  }

  if (!permissions.includes('session:open:self') && !permissions.includes('session:open:any')) {
    ws.close(1008, 'missing session permission');
    return;
  }

  const isOperatorOnly = roles.includes('operator') && !roles.some((r) => ['architect', 'a7'].includes(r));
  const entryCommand = isOperatorOnly ? 'murmur-shell' : 'bash';
  const containerName = `murmur-${decoded.sub}-${Date.now()}`.replace(/[^a-zA-Z0-9_.-]/g, '');

  try {
    await runDocker([
      'run', '-d', '--rm', '--name', containerName,
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
      '--cap-drop=ALL',
      '--security-opt', 'no-new-privileges:true',
      '--pids-limit', '256',
      '--memory', '512m',
      '--cpus', '1.0',
      '-e', `MURMUR_API=${process.env.MURMUR_API || 'http://node-registry:8081'}`,
      '-e', `MURMUR_TOKEN=${token}`,
      sessionImage,
      entryCommand
    ]);
  } catch (err) {
    console.error(JSON.stringify({ event: 'audit.session.spawn_error', userId: decoded.sub, error: err.message }));
    ws.close(1011, 'failed to spawn container');
    return;
  }

  const terminal = pty.spawn('docker', ['exec', '-it', containerName, entryCommand], {
    name: 'xterm-color',
    cols: 120,
    rows: 40,
    cwd: '/',
    env: process.env
  });

  let idleTimer;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(async () => {
      ws.close(1000, 'idle timeout');
      terminal.kill();
      await killContainer(containerName);
      console.info(JSON.stringify({ event: 'audit.session.timeout', userId: decoded.sub, containerName }));
    }, idleMs);
  };

  terminal.onData((data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });

  ws.on('message', (msg) => {
    resetIdle();
    let payload;
    try {
      payload = JSON.parse(msg.toString());
    } catch {
      return;
    }

    if (payload.type === 'input' && typeof payload.data === 'string') {
      terminal.write(payload.data);
      return;
    }

    if (payload.type === 'resize' && Number.isInteger(payload.cols) && Number.isInteger(payload.rows)) {
      terminal.resize(payload.cols, payload.rows);
    }
  });

  ws.on('close', async () => {
    clearTimeout(idleTimer);
    terminal.kill();
    await killContainer(containerName);
    console.info(JSON.stringify({ event: 'audit.session.close', userId: decoded.sub, containerName }));
  });

  resetIdle();
  console.info(JSON.stringify({ event: 'audit.session.start', userId: decoded.sub, containerName, entryCommand }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`terminal gateway listening on :${port}`);
});
