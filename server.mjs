import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
app.use(express.json());

const DEFAULT_THRESHOLD = 70;
const parsedThreshold = Number(process.env.ALERT_CREATE_THRESHOLD ?? DEFAULT_THRESHOLD);
const ALERT_CREATE_THRESHOLD = Number.isFinite(parsedThreshold) ? parsedThreshold : DEFAULT_THRESHOLD;
const DATABASE_URL = process.env.DATABASE_URL;

const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
const allowedRuleFields = new Set(['source', 'device_id', 'event_type']);

const pool = new Pool(
  DATABASE_URL
    ? {
        connectionString: DATABASE_URL
      }
    : undefined
);

function baseRiskForEventType(eventType) {
  switch (eventType) {
    case 'tamper':
      return { score: 60, severity: 'high' };
    case 'offline':
      return { score: 45, severity: 'medium' };
    case 'door_open':
      return { score: 30, severity: 'medium' };
    case 'motion':
      return { score: 40, severity: 'medium' };
    default:
      return { score: 35, severity: 'medium' };
  }
}

function cmpSeverity(a, b) {
  return (severityRank[a] ?? 0) - (severityRank[b] ?? 0);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ruleMatchesEvent(rule, event) {
  const all = rule?.match_json?.all;
  if (!Array.isArray(all)) return false;

  return all.every((cond) => {
    if (!allowedRuleFields.has(cond?.field)) return false;

    const actual = event[cond.field];
    if (cond.op === 'eq') return actual === cond.value;
    if (cond.op === 'in') return Array.isArray(cond.value) && cond.value.includes(actual);

    return false;
  });
}

async function safeRollback(client) {
  try {
    await client.query('ROLLBACK');
  } catch (_e) {
    // no-op
  }
}

app.get('/health', async (_req, res) => {
  let db = false;
  let db_error = null;
  try {
    await pool.query('SELECT 1');
    db = true;
  } catch (e) {
    db = false;
    db_error = e.message;
  }

  res.json({ ok: true, db, db_error, threshold: ALERT_CREATE_THRESHOLD });
});

app.post('/events', async (req, res) => {
  const { source, device_id, event_type, payload = {} } = req.body ?? {};

  if (!source || !device_id || !event_type) {
    return res.status(400).json({ error: 'source, device_id, and event_type are required' });
  }

  if (!isPlainObject(payload)) {
    return res.status(400).json({ error: 'payload must be a JSON object' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: ruleRows } = await client.query(
      `SELECT id, name, match_json, score_delta, severity
       FROM rules
       WHERE enabled = true
       ORDER BY id ASC`
    );

    const eventForMatch = { source, device_id, event_type };
    const hits = ruleRows
      .filter((r) => ruleMatchesEvent(r, eventForMatch))
      .map((r) => ({ id: r.id, name: r.name, score_delta: r.score_delta, severity: r.severity }));

    const base = baseRiskForEventType(event_type);
    const delta = hits.reduce((sum, h) => sum + Number(h.score_delta || 0), 0);
    const risk_score = Math.max(0, Math.min(100, base.score + delta));
    const severity = hits.reduce(
      (maxS, h) => (cmpSeverity(h.severity, maxS) > 0 ? h.severity : maxS),
      base.severity
    );

    const { rows: eventRows } = await client.query(
      `INSERT INTO events(source, device_id, event_type, payload, risk_score, severity)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING id, source, device_id, event_type, risk_score, severity, created_at`,
      [source, device_id, event_type, JSON.stringify(payload), risk_score, severity]
    );

    const eventRow = eventRows[0];
    let created_alert = false;
    let alert_id = null;

    const explain = {
      base,
      hits,
      final: { risk_score, severity }
    };

    if (risk_score >= ALERT_CREATE_THRESHOLD) {
      const { rows: alertRows } = await client.query(
        `INSERT INTO alerts(event_id, status, risk_score, severity, explain)
         VALUES ($1, 'new', $2, $3, $4::jsonb)
         RETURNING id`,
        [eventRow.id, risk_score, severity, JSON.stringify(explain)]
      );

      created_alert = true;
      alert_id = alertRows[0].id;

      await client.query(
        `INSERT INTO audit_log(alert_id, action, meta)
         VALUES ($1, 'alert_created', $2::jsonb)`,
        [alert_id, JSON.stringify({ threshold: ALERT_CREATE_THRESHOLD, explain })]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      event: eventRow,
      created_alert,
      alert_id,
      explain,
      threshold: ALERT_CREATE_THRESHOLD
    });
  } catch (error) {
    await safeRollback(client);
    return res.status(500).json({ error: 'failed_to_process_event', detail: error.message });
  } finally {
    client.release();
  }
});

app.post('/alerts/:id/ack', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const actor = req.body?.actor ?? 'system';
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid alert id' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existingRows } = await client.query(
      `SELECT id, status FROM alerts WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (!existingRows.length) {
      await safeRollback(client);
      return res.status(404).json({ error: 'alert_not_found' });
    }

    const previousStatus = existingRows[0].status;
    if (previousStatus === 'resolved') {
      await safeRollback(client);
      return res.status(409).json({ error: 'cannot_ack_resolved_alert' });
    }

    const result = await client.query(
      `UPDATE alerts
       SET status = 'ack', updated_at = now()
       WHERE id = $1
       RETURNING id, status, updated_at`,
      [id]
    );

    await client.query(
      `INSERT INTO audit_log(alert_id, action, meta)
       VALUES ($1, 'alert_ack', $2::jsonb)`,
      [id, JSON.stringify({ actor, from_status: previousStatus, to_status: 'ack' })]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, alert: result.rows[0] });
  } catch (error) {
    await safeRollback(client);
    return res.status(500).json({ error: 'failed_to_ack_alert', detail: error.message });
  } finally {
    client.release();
  }
});

app.post('/alerts/:id/resolve', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const actor = req.body?.actor ?? 'system';
  const note = req.body?.note;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid alert id' });
  if (note !== undefined && typeof note !== 'string') {
    return res.status(400).json({ error: 'note must be a string when provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existingRows } = await client.query(
      `SELECT id, status FROM alerts WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (!existingRows.length) {
      await safeRollback(client);
      return res.status(404).json({ error: 'alert_not_found' });
    }

    const previousStatus = existingRows[0].status;
    const result = await client.query(
      `UPDATE alerts
       SET status = 'resolved', updated_at = now()
       WHERE id = $1
       RETURNING id, status, updated_at`,
      [id]
    );

    const meta = note === undefined
      ? { actor, from_status: previousStatus, to_status: 'resolved' }
      : { actor, note, from_status: previousStatus, to_status: 'resolved' };
    await client.query(
      `INSERT INTO audit_log(alert_id, action, meta)
       VALUES ($1, 'alert_resolve', $2::jsonb)`,
      [id, JSON.stringify(meta)]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, alert: result.rows[0] });
  } catch (error) {
    await safeRollback(client);
    return res.status(500).json({ error: 'failed_to_resolve_alert', detail: error.message });
  } finally {
    client.release();
  }
});

app.get('/alerts', async (req, res) => {
  const parsedLimit = Number.parseInt(req.query.limit ?? '100', 10);
  const limit = Number.isInteger(parsedLimit) ? Math.max(1, Math.min(500, parsedLimit)) : 100;

  try {
    const { rows } = await pool.query(
      `SELECT id, event_id, status, risk_score, severity, explain, created_at, updated_at
       FROM alerts
       ORDER BY id DESC
       LIMIT $1`,
      [limit]
    );

    return res.json({ alerts: rows });
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_list_alerts', detail: error.message });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Home Security MVP API listening on :${PORT}`);
});
