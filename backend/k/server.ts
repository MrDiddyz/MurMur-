import { createServer } from "node:http";
import { MurmurStore, defaultStorePath } from "../../src/murmurMediaEngine/store";
import { runMurmurPipeline } from "../../src/murmurMediaEngine/pipeline";
import { logJson } from "../../src/murmurMediaEngine/logger";
import { PipelineInput } from "../../src/murmurMediaEngine/types";

const store = new MurmurStore(process.env.MURMUR_STORE_PATH ?? defaultStorePath);
const PORT = Number(process.env.MURMUR_PORT ?? 7070);

const readBody = async (req: any): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};

const json = (res: any, status: number, payload: unknown) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});

  try {
    if (req.url === "/api/run" && req.method === "POST") {
      const body = await readBody(req);
      const payload = (body ? JSON.parse(body) : { articles: [] }) as PipelineInput;
      const result = await runMurmurPipeline(payload, store);
      return json(res, 200, { ok: true, result });
    }

    if (req.url === "/api/reports" && req.method === "GET") {
      return json(res, 200, { reports: store.listReports(20) });
    }

    if (req.url === "/api/narratives" && req.method === "GET") {
      return json(res, 200, { narratives: store.listNarratives(50) });
    }

    if (req.url === "/api/signals" && req.method === "GET") {
      return json(res, 200, { signals: store.listSignals(50) });
    }

    if (req.url === "/api/feedback" && req.method === "POST") {
      const body = await readBody(req);
      const { narrativeId, score, feedback } = JSON.parse(body) as {
        narrativeId: string;
        score: number;
        feedback: string;
      };

      const updated = store.applyFeedback(narrativeId, score, feedback ?? "");
      if (!updated) return json(res, 404, { error: "Narrative not found" });
      return json(res, 200, { narrative: updated });
    }

    return json(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    logJson("error", "api.error", { message, path: req.url, method: req.method });
    return json(res, 500, { error: message });
  }
}).listen(PORT, () => {
  logJson("info", "murmur.api.started", { port: PORT });
});
