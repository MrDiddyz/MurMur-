import { NextResponse } from "next/server";
import { growthState } from "@/growth/actions";

export async function GET(_request, { params }) {
  const accountId = params?.account_id;

  if (!accountId) {
    return NextResponse.json({ error: "account_id is required" }, { status: 400 });
  }

  const arms = growthState.bandit.getArmStats(accountId).map((arm) => ({
    ...arm,
    total_trials: arm.total_trials,
    expected_mean: arm.expected_mean,
  }));

  return NextResponse.json({
    account_id: accountId,
    total_trials: arms.reduce((sum, arm) => sum + arm.total_trials, 0),
    arms,
  });
}
