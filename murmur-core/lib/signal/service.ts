import { SignalInputSchema, SignalOutputSchema } from "@/lib/validation/signal";

export async function analyzeSignal(input: unknown) {
  const parsed = SignalInputSchema.parse(input);
  const response = {
    core_signal: `Primary tension in ${parsed.type}: intent and execution are misaligned`,
    hidden_risks: ["Ambiguous ownership", "Unclear success metric"],
    opportunities: ["Define decision criteria", "Convert insight into weekly experiments"],
    emotional_tone: "focused but strained",
    business_value: "Improves decision speed and communication quality",
    clarity_score: 78,
    next_actions: ["Create one-page decision memo", "Assign owner and due date"]
  };
  return SignalOutputSchema.parse(response);
}
