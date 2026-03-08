import { runVideoCreation } from "../core/orchestrator";

type CreateVideoRequest = {
  body?: {
    idea?: string;
  };
};

type CreateVideoResponse = {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
};

export default async function handler(req: CreateVideoRequest, res: CreateVideoResponse) {
  const { idea } = req.body ?? {};

  if (!idea) {
    res.status(400).json({ error: "idea is required" });
    return;
  }

  const result = await runVideoCreation(idea);
  res.status(200).json(result);
}
