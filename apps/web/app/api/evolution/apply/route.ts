import { NextResponse } from "next/server";
import { applyProposal } from "../../../../../../packages/core/src/evolution/applier";
import { governor } from "../../../../../../packages/core/src/evolution/governor";
import { store } from "../../../../lib/evolutionStore";

interface ApplyRequestBody {
  proposalId?: string;
  userId?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ApplyRequestBody;
  const proposalId = typeof body.proposalId === "string" ? body.proposalId : undefined;
  const userId = typeof body.userId === "string" ? body.userId : undefined;

  if (!proposalId) {
    return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
  }

  const proposal = await store.getProposal(proposalId);
  if (!proposal) {
    return NextResponse.json({ error: "Not found", proposalId }, { status: 404 });
  }

  if (proposal.status !== "approved") {
    return NextResponse.json({ error: "Proposal not approved", proposalId, status: proposal.status }, { status: 400 });
  }

  const decision = governor(proposal);
  if (!decision.allow) {
    return NextResponse.json({ error: "Blocked by governor", decision, proposalId }, { status: 403 });
  }

  const result = await applyProposal(store, { userId, proposal });
  const updated = await store.getProposal(proposal.id);

  return NextResponse.json({ ok: true, applied: updated ?? proposal, ...result }, { status: 200 });
}
