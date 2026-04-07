import { Router } from "express";
import { DatabaseError } from "pg";

import { pool } from "./db";
import { DecisionBody, EventBody, RunCreateBody } from "./types";

export const router = Router();

router.post("/runs", async (req, res, next) => {
  const body = req.body as RunCreateBody;
  const idempotencyKey = (req.header("Idempotency-Key") || null) as string | null;

  try {
    const created = await pool.query(
      `SELECT to_jsonb(r) AS run
       FROM create_run($1,$2,$3,$4,$5,$6::jsonb,$7) AS r`,
      [
        body.user_id,
        body.org_id ?? null,
        body.project_id ?? null,
        body.request_text,
        body.request_locale ?? null,
        body.request_json ?? {},
        idempotencyKey
      ]
    );
    return res.json(created.rows[0].run);
  } catch (err) {
    const dbErr = err as DatabaseError;
    if (dbErr.code === "23505" && idempotencyKey) {
      const existing = await pool.query(
        `SELECT to_jsonb(r) AS run FROM runs r WHERE user_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [body.user_id, idempotencyKey]
      );
      return res.json(existing.rows[0].run);
    }
    return next(err);
  }
});

router.get("/runs/:id", async (req, res) => {
  const row = await pool.query(`SELECT to_jsonb(r) AS run FROM runs r WHERE run_id = $1`, [req.params.id]);
  if (row.rowCount === 0) {
    return res.status(404).json({ detail: "Run not found" });
  }
  return res.json(row.rows[0].run);
});

router.post("/events", async (req, res) => {
  const body = req.body as EventBody;
  try {
    const row = await pool.query(
      `SELECT to_jsonb(r) AS run
       FROM transition_run_state($1, $2::run_state, $3, $4, $5::jsonb) AS r`,
      [body.run_id, body.to_state, body.event_type, body.actor ?? "system", body.payload ?? {}]
    );
    return res.json(row.rows[0].run);
  } catch (err) {
    const dbErr = err as DatabaseError;
    if (dbErr.code === "23514") {
      return res.status(422).json({ detail: dbErr.message });
    }
    throw err;
  }
});

router.post("/runs/:id/approve", async (req, res) => {
  const body = req.body as DecisionBody;
  await pool.query(
    `INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
     VALUES ($1, 'APPROVED', $2, now(), $3)`,
    [req.params.id, body.reviewer_id ?? null, body.reason ?? null]
  );
  const row = await pool.query(
    `SELECT to_jsonb(r) AS run
     FROM transition_run_state($1, 'APPROVED', 'run.approved', 'system', $2::jsonb) AS r`,
    [req.params.id, body.reason ? { reason: body.reason } : {}]
  );
  return res.json(row.rows[0].run);
});

router.post("/runs/:id/deny", async (req, res) => {
  const body = req.body as DecisionBody;
  await pool.query(
    `INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
     VALUES ($1, 'DENIED', $2, now(), $3)`,
    [req.params.id, body.reviewer_id ?? null, body.reason ?? null]
  );
  const row = await pool.query(
    `SELECT to_jsonb(r) AS run
     FROM transition_run_state($1, 'FAILED', 'run.denied', 'system', $2::jsonb) AS r`,
    [req.params.id, body.reason ? { reason: body.reason } : {}]
  );
  return res.json(row.rows[0].run);
});
