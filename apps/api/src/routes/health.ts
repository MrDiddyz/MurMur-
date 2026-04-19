// /health endpoint for readiness checks.
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

export const healthRouter: ExpressRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", service: "murmur-motion-avatar-api", version: "0.2.0" });
});
