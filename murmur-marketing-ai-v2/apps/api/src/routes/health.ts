import type { Request, Response, Router } from "express";
import { loadRuntimeConfig } from "@murmur/config";

export function registerHealthRoute(router: Router): void {
  router.get("/health", (_req: Request, res: Response) => {
    const config = loadRuntimeConfig();

    res.json({
      status: "ok",
      service: "murmur-marketing-api",
      environment: config.nodeEnv,
      placeholders: {
        supabase: true,
        spotify: true,
        tiktok: true
      }
    });
  });
}
