import { NextResponse } from "next/server";
import { evolutionTick } from "../../../../../../packages/core/src/evolution";
import { store } from "../../../../lib/evolutionStore";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { metricKey?: unknown; userId?: unknown };
  const metricKey = typeof body.metricKey === "string" && body.metricKey.length > 0 ? body.metricKey : "task_success_rate";
  const userId = typeof body.userId === "string" ? body.userId : undefined;

  const result = await evolutionTick(store, { userId, metricKey });
  return NextResponse.json(result);
}
