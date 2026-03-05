import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(supabaseUrl, serviceKey);

type AgentId = "PAPI" | "EMMY" | "FREDRIKOS" | "TIINA";

const AGENT_IDS: AgentId[] = ["PAPI", "EMMY", "FREDRIKOS", "TIINA"];

// ---------- RNG + Beta sampling (Gamma-based) ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gammaSample(k: number, theta: number, rand: () => number): number {
  if (k < 1) {
    const u = rand() || 1e-12;
    return gammaSample(1 + k, theta, rand) * Math.pow(u, 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x: number;
    let v: number;
    do {
      const u1 = rand() || 1e-12;
      const u2 = rand() || 1e-12;
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rand() || 1e-12;
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v * theta;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * theta;
  }
}

function betaSample(alpha: number, beta: number, rand: () => number) {
  const x = gammaSample(alpha, 1, rand);
  const y = gammaSample(beta, 1, rand);
  return x / (x + y);
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function ensureAgentId(value: unknown): AgentId {
  if (typeof value !== "string" || !AGENT_IDS.includes(value as AgentId)) {
    throw new Error(`Invalid agentId. Expected one of: ${AGENT_IDS.join(", ")}.`);
  }
  return value as AgentId;
}

function ensureArms(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((arm) => typeof arm !== "string" || !arm)) {
    throw new Error("Invalid arms. Expected a non-empty string array.");
  }
  return value;
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) throw new Error(`Invalid ${field}. Expected non-empty string.`);
  return value;
}

function ensureNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error(`Invalid ${field}. Expected number.`);
  return value;
}

// ---------- Handlers ----------
async function initArms(agentId: AgentId, arms: string[]) {
  const { error: policyError } = await supabase.from("agent_policy").upsert({ agent_id: agentId });
  if (policyError) throw new Error(policyError.message);

  const rows = arms.map((arm) => ({
    agent_id: agentId,
    arm,
    alpha: 1,
    beta: 1,
    pulls: 0,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("agent_policy_arms").upsert(rows, {
    onConflict: "agent_id,arm",
  });
  if (error) throw new Error(error.message);

  return { ok: true, agentId, armsCount: arms.length };
}

async function selectArm(agentId: AgentId, seed?: number) {
  const { data, error } = await supabase
    .from("agent_policy_arms")
    .select("arm,alpha,beta,pulls")
    .eq("agent_id", agentId);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No arms found for agent ${agentId}. Run /init first.`);

  const rand = mulberry32(seed ?? Math.floor(Math.random() * 1e9));

  let bestArm = data[0].arm as string;
  let bestScore = -Infinity;

  for (const a of data) {
    const s = betaSample(Number(a.alpha), Number(a.beta), rand);
    if (s > bestScore) {
      bestScore = s;
      bestArm = a.arm;
    }
  }

  return { ok: true, agentId, selectedArm: bestArm, sampledScore: bestScore };
}

async function updateArm(agentId: AgentId, arm: string, reward01: number, trackId?: string, dimReward?: number) {
  const reward = clamp01(reward01);

  const { error } = await supabase.rpc("bandit_update_arm", {
    p_agent_id: agentId,
    p_arm: arm,
    p_reward: reward,
  });
  if (error) throw new Error(error.message);

  if (trackId) {
    const { error: auditError } = await supabase.from("agent_arm_assignments").insert({
      track_id: trackId,
      agent_id: agentId,
      arm,
      reward_total: reward,
      reward_dim: dimReward ?? null,
      meta: { source: "bandit-policy" },
    });
    if (auditError) throw new Error(auditError.message);
  }

  return { ok: true, agentId, arm, reward };
}

// ---------- Router ----------
serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop() ?? "";

    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const body = await req.json();

    if (path === "init") {
      return Response.json(await initArms(ensureAgentId(body.agentId), ensureArms(body.arms)));
    }

    if (path === "select") {
      const seed = body.seed === undefined ? undefined : ensureNumber(body.seed, "seed");
      return Response.json(await selectArm(ensureAgentId(body.agentId), seed));
    }

    if (path === "update") {
      const trackId = body.trackId === undefined ? undefined : ensureString(body.trackId, "trackId");
      const dimReward = body.dimReward === undefined ? undefined : ensureNumber(body.dimReward, "dimReward");

      return Response.json(
        await updateArm(
          ensureAgentId(body.agentId),
          ensureString(body.arm, "arm"),
          ensureNumber(body.reward, "reward"),
          trackId,
          dimReward,
        ),
      );
    }

    return new Response("Not found", { status: 404 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(message, { status: 500 });
  }
});
