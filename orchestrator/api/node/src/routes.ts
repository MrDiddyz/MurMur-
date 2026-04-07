import { Router, type Request, type Response } from 'express';
import { pool } from './db.js';
import type { CreateRunBody, EventBody, TransitionBody } from './types.js';

export const router = Router();

async function transition(runId: string, toState: string, eventType: string, actor = 'system', payload: object = {}) {
  const result = await pool.query(
    `SELECT row_to_json(transition_run_state($1::uuid, $2::run_state, $3, $4, $5::jsonb)) AS run`,
    [runId, toState, eventType, actor, JSON.stringify(payload)],
  );
  return result.rows[0]?.run;
}

router.post('/runs', async (req: Request<unknown, unknown, CreateRunBody>, res: Response) => {
  const idempotencyKey = req.header('Idempotency-Key') ?? null;
  const body = req.body;

  if (idempotencyKey) {
    const existing = await pool.query(
      `SELECT row_to_json(runs) AS run FROM runs WHERE user_id=$1::uuid AND idempotency_key=$2 LIMIT 1`,
      [body.user_id, idempotencyKey],
    );
    if (existing.rows[0]?.run) {
      return res.status(200).json(existing.rows[0].run);
    }
  }

  const result = await pool.query(
    `SELECT row_to_json(create_run($1::uuid,$2::uuid,$3::uuid,$4,$5,$6::jsonb,$7)) AS run`,
    [
      body.user_id,
      body.org_id ?? null,
      body.project_id ?? null,
      body.request_text,
      body.request_locale ?? 'en',
      JSON.stringify(body.request_json ?? {}),
      idempotencyKey,
    ],
  );

  return res.status(201).json(result.rows[0].run);
});

router.get('/runs/:id', async (req, res) => {
  const result = await pool.query('SELECT row_to_json(runs) AS run FROM runs WHERE run_id = $1::uuid', [req.params.id]);
  if (!result.rows[0]?.run) {
    return res.status(404).json({ error: 'Run not found' });
  }
  return res.json(result.rows[0].run);
});

router.post('/runs/:id/approve', async (req: Request<{id: string}, unknown, TransitionBody>, res) => {
  try {
    const run = await transition(req.params.id, 'APPROVED', 'run.approved', req.body?.actor ?? 'system', req.body?.payload ?? {});
    return res.json(run);
  } catch (error: any) {
    return res.status(409).json({ error: error.message, code: error.code });
  }
});

router.post('/runs/:id/deny', async (req: Request<{id: string}, unknown, TransitionBody>, res) => {
  try {
    const run = await transition(req.params.id, 'CANCELLED', 'run.denied', req.body?.actor ?? 'system', req.body?.payload ?? {});
    return res.json(run);
  } catch (error: any) {
    return res.status(409).json({ error: error.message, code: error.code });
  }
});

router.post('/events', async (req: Request<unknown, unknown, EventBody>, res) => {
  try {
    const run = await transition(
      req.body.run_id,
      req.body.to_state,
      req.body.event_type,
      req.body.actor ?? 'system',
      req.body.payload ?? {},
    );
    return res.json(run);
  } catch (error: any) {
    return res.status(409).json({ error: error.message, code: error.code });
  }
});
