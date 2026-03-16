// /health endpoint for readiness checks.
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", service: "murmur-motion-avatar-api", version: "0.2.0" });
});
