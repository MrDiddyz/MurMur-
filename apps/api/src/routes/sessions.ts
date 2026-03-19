// /sessions create/get/update endpoints.
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Session } from "@murmur/shared";
import { db } from "../core/store.js";

export const sessionsRouter = Router();

const modeSchema = z.enum(["ID", "MIRROR", "FREE", "PERFORMANCE_SYNC"]);
const createSessionSchema = z.object({
  mode: modeSchema.default("ID"),
  artistId: z.string().min(1).default("artist-demo")
});

sessionsRouter.post("/", (req, res) => {
  const parsed = createSessionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid session payload", details: parsed.error.flatten() });
  }

  const { mode, artistId } = parsed.data;
  const id = randomUUID();
  const now = new Date().toISOString();
  const session: Session = {
    id,
    artistId,
    mode,
    createdAt: now,
    updatedAt: now,
    activeAvatarId: `avatar-${artistId}`
  };
  db.sessions.set(id, session);
  return res.status(201).json(session);
});

sessionsRouter.get("/:id", (req, res) => {
  const session = db.sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json(session);
});

sessionsRouter.patch("/:id/mode", (req, res) => {
  const session = db.sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const parsed = modeSchema.safeParse(req.body?.mode);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  const next: Session = {
    ...session,
    mode: parsed.data,
    updatedAt: new Date().toISOString()
  };

  db.sessions.set(req.params.id, next);
  return res.json(next);
});
