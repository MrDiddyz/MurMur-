import { NextResponse } from "next/server";
import { store } from "../../../../lib/evolutionStore";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requested = Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT));
  const limit = Number.isFinite(requested) ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(requested))) : DEFAULT_LIMIT;
  const userId = url.searchParams.get("userId") ?? undefined;

  const proposals = await store.listProposals({ userId, limit });
  return NextResponse.json({ proposals, limit });
}
