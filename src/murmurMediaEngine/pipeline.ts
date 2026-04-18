import { generateDailyReport } from "../dailyAIGeneration";
import { buildNarratives } from "../narrativeArchitect";
import { scanSignals } from "../signalScanner";
import { logJson } from "./logger";
import { withRetry } from "./retry";
import { MurmurStore } from "./store";
import { PipelineInput, PipelineStep } from "./types";
import { makeId } from "./utils";
import { validatePipelineInput } from "./validation";

export type PipelineResult = {
  correlationId: string;
  reportId: string;
  narrativeCount: number;
  signalCount: number;
};

async function runStep<T>(
  store: MurmurStore,
  correlationId: string,
  step: PipelineStep,
  handler: () => Promise<T> | T,
): Promise<T> {
  try {
    const result = await withRetry(() => handler(), 2, 150);
    store.logStep({
      correlationId,
      step,
      status: "ok",
      details: {
        replayable: true,
        resultType: typeof result,
      },
    });
    logJson("info", `pipeline.${step}.ok`, { correlationId, step });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown step error";
    store.logStep({
      correlationId,
      step,
      status: "error",
      details: { message },
    });
    store.deadLetter(step, correlationId, message, { step });
    logJson("error", `pipeline.${step}.error`, { correlationId, step, message });
    throw error;
  }
}

export async function runMurmurPipeline(
  input: PipelineInput,
  store: MurmurStore,
  providedCorrelationId?: string,
): Promise<PipelineResult> {
  const validInput = validatePipelineInput(input);
  const correlationId = providedCorrelationId ?? makeId("corr");

  const source = await runStep(store, correlationId, "fetch", () =>
    store.upsertSource({
      correlationId,
      name: validInput.source?.name ?? "manual-ingest",
      kind: validInput.source?.kind ?? "manual",
      url: validInput.source?.url,
    }),
  );

  const parsedArticles = await runStep(store, correlationId, "parse", () =>
    store.addRawArticles(
      validInput.articles.map((article) => ({
        correlationId,
        sourceId: source.id,
        title: article.title,
        body: article.body,
        publishedAt: article.publishedAt,
      })),
    ),
  );

  const scannedSignals = await runStep(store, correlationId, "scan", () =>
    store.addSignals(
      scanSignals(
        parsedArticles.map((article) => ({
          id: article.id,
          body: article.body,
          correlationId,
        })),
      ),
    ),
  );

  const clustered = await runStep(store, correlationId, "cluster", () => {
    const feedbackStatsByTheme = store.getFeedbackStatsByTheme();
    return buildNarratives(scannedSignals, feedbackStatsByTheme);
  });

  const analyzed = await runStep(store, correlationId, "analyze", () => store.addNarratives(clustered));

  const generated = await runStep(store, correlationId, "generate", () =>
    generateDailyReport(analyzed, correlationId),
  );

  const report = await runStep(store, correlationId, "store", () => store.addReport(generated));

  return {
    correlationId,
    reportId: report.id,
    narrativeCount: analyzed.length,
    signalCount: scannedSignals.length,
  };
}
