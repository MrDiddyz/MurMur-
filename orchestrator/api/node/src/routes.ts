import { NextFunction, Request, Response, Router } from 'express';
import { pool } from './db';
import { CreateRunBody } from './types';

export const router = Router();

router.post('/runs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CreateRunBody;
    const idempotencyKey = req.header('Idempotency-Key') ?? null;

    if (idempotencyKey) {
      const existing = await pool.query('SELECT * FROM runs WHERE user_id = $1 AND idempotency_key = $2', [
        body.user_id,
        idempotencyKey,
      ]);
      if (existing.rowCount) {
        return res.json(existing.rows[0]);
      }
    }

    const result = await pool.query(`SELECT * FROM create_run($1, $2, $3, $4, $5, $6::jsonb, $7)`, [
      body.user_id,
      body.org_id ?? null,
      body.project_id ?? null,
      body.request_text,
      body.request_locale ?? 'en',
      JSON.stringify(body.request_json ?? {}),
      idempotencyKey,
    ]);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error?.code === '23505' && req.header('Idempotency-Key')) {
      const body = req.body as CreateRunBody;
      const existing = await pool.query('SELECT * FROM runs WHERE user_id = $1 AND idempotency_key = $2', [
        body.user_id,
        req.header('Idempotency-Key'),
      ]);
      if (existing.rowCount) {
        return res.json(existing.rows[0]);
      }
    }
    return next(error);
  }
});

router.get('/runs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM runs WHERE run_id = $1', [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ detail: 'Run not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post('/runs/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
       VALUES ($1, 'APPROVED', $2, now(), $3)`,
      [req.params.id, req.body.reviewer_id ?? null, req.body.reason ?? null],
    );
    const result = await client.query(
      `SELECT * FROM transition_run_state($1, 'APPROVED', 'run.approved', 'system', $2::jsonb)`,
      [req.params.id, JSON.stringify({ reason: req.body.reason ?? null })],
    );
    await client.query('COMMIT');
    return res.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error?.code === '23514' || error?.code === 'P0002') {
      return res.status(error.code === 'P0002' ? 404 : 400).json({ detail: error.message, code: error.code });
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/runs/:id/deny', async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
       VALUES ($1, 'DENIED', $2, now(), $3)`,
      [req.params.id, req.body.reviewer_id ?? null, req.body.reason ?? null],
    );
    const result = await client.query(
      `SELECT * FROM transition_run_state($1, 'CANCELLED', 'run.denied', 'system', $2::jsonb)`,
      [req.params.id, JSON.stringify({ reason: req.body.reason ?? null })],
    );
    await client.query('COMMIT');
    return res.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error?.code === '23514' || error?.code === 'P0002') {
      return res.status(error.code === 'P0002' ? 404 : 400).json({ detail: error.message, code: error.code });
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.to_state) {
      if (!req.body.run_id) {
        return res.status(400).json({ detail: 'run_id is required when to_state is provided' });
      }
      const result = await pool.query(
        `SELECT * FROM transition_run_state($1, $2::run_state, $3, $4, $5::jsonb)`,
        [
          req.body.run_id,
          req.body.to_state,
          req.body.type,
          req.body.actor ?? 'system',
          JSON.stringify(req.body.payload ?? {}),
        ],
      );
      return res.status(201).json(result.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO run_events (run_id, type, actor, payload, source, source_event_id)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING *`,
      [
        req.body.run_id ?? null,
        req.body.type,
        req.body.actor ?? 'system',
        JSON.stringify(req.body.payload ?? {}),
        req.body.source ?? null,
        req.body.source_event_id ?? null,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error?.code === '23514' || error?.code === 'P0002') {
      return res.status(error.code === 'P0002' ? 404 : 400).json({ detail: error.message, code: error.code });
    }
    return next(error);
  }
});
