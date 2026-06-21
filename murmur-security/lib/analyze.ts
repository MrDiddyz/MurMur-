import type { AnalysisResult, RiskLevel } from "@/types";

interface Rule {
  label: string;
  weight: number;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    label: "Urgent pressure language",
    weight: 14,
    patterns: [/urgent/i, /immediately/i, /within\s+\d+\s*hours?/i, /act now/i],
  },
  {
    label: "Account suspension threat",
    weight: 18,
    patterns: [/account (?:will be|is) (?:suspended|locked|restricted)/i, /service.*terminated/i],
  },
  {
    label: "Request to reply with keyword",
    weight: 12,
    patterns: [/reply\s+(?:yes|confirm|verify|ok|now)/i, /text\s+\w+\s+to/i],
  },
  {
    label: "Suspicious verification wording",
    weight: 14,
    patterns: [/verify your (?:identity|account|details)/i, /security check failed/i],
  },
  {
    label: "Generic impersonal greeting",
    weight: 8,
    patterns: [/dear (?:customer|user|member)/i, /valued customer/i],
  },
  {
    label: "External link pressure",
    weight: 12,
    patterns: [/click (?:here|below)/i, /visit\s+https?:\/\//i, /secure link/i],
  },
  {
    label: "Payment pressure",
    weight: 15,
    patterns: [/pay (?:now|today)/i, /outstanding balance/i, /gift card/i, /wire transfer/i],
  },
  {
    label: "Credential or sensitive-data request",
    weight: 20,
    patterns: [/(?:password|passcode|otp|one-time code|ssn|social security)/i, /bank (?:details|login)/i],
  },
];

const clampScore = (score: number): number => Math.max(0, Math.min(100, score));

const toRisk = (score: number): RiskLevel => {
  if (score >= 70) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
};

const recommendationByRisk: Record<RiskLevel, string> = {
  LOW: "Low immediate scam risk detected. Stay cautious and independently verify the sender if uncertain.",
  MEDIUM:
    "Medium risk detected. Do not click links or share personal data until you confirm legitimacy through an official channel.",
  HIGH:
    "High scam risk detected. Do not respond, do not click links, and report/block the sender immediately.",
};

export const analyzeMessage = (input: string): AnalysisResult => {
  const text = input.trim();

  if (!text) {
    return {
      score: 0,
      risk: "LOW",
      triggers: [],
      reasoning: "No content provided, so no scam indicators could be evaluated.",
      recommendation: "Paste a suspicious message to run analysis.",
    };
  }

  const triggers = new Set<string>();
  let score = 0;

  for (const rule of RULES) {
    const matched = rule.patterns.some((pattern) => pattern.test(text));
    if (matched) {
      triggers.add(rule.label);
      score += rule.weight;
    }
  }

  if (text.length < 20) {
    score += 4;
    triggers.add("Very short context");
  }

  if (/(\!{2,}|\b[A-Z]{4,}\b)/.test(text)) {
    score += 8;
    triggers.add("Excessive emphasis formatting");
  }

  score = clampScore(score);
  const risk = toRisk(score);
  const triggerList = Array.from(triggers);

  const reasoning =
    triggerList.length === 0
      ? "No major scam markers matched this rule set, though absence of matches is not proof of safety."
      : `Matched ${triggerList.length} indicator${triggerList.length === 1 ? "" : "s"}: ${triggerList.join(", ")}.`;

  return {
    score,
    risk,
    triggers: triggerList,
    reasoning,
    recommendation: recommendationByRisk[risk],
  };
};
