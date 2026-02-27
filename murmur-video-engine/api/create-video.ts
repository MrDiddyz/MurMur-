import type { NextApiRequest, NextApiResponse } from "next";
import { runVideoCreation } from "../core/orchestrator";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idea } = req.body as { idea?: string };

  if (!idea) {
    res.status(400).json({ error: "idea is required" });
    return;
  }

  const result = await runVideoCreation(idea);
  res.status(200).json(result);
}
