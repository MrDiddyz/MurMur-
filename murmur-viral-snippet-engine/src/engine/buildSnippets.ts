import { CandidateWindow, SnippetCandidate } from "../types.js";
import { pickCaption, pickOnScreen } from "./captionGenerator.js";
import { scoreSnippet } from "./scoreSnippet.js";

function pickAdLibs(text: string): string[] {
  const lower = text.toLowerCase();
  const adLibs = ["(breathe)", "(stay)"];
  if (lower.includes("neon")) adLibs.push("(neon glow)");
  if (lower.includes("heart")) adLibs.push("(heartbeat)");
  if (lower.includes("poison") || lower.includes("kiss")) adLibs.push("(danger)");
  if (lower.includes("ghost")) adLibs.push("(ghost)");
  return adLibs.slice(0, 4);
}

export function buildSnippets(
  title: string,
  windows: CandidateWindow[],
  anchors: string[],
  creatorProfile: string
): SnippetCandidate[] {
  return windows.map((window, idx) => {
    const joined = window.lines.map(l => l.text).join(" / ");
    const { score, reasons } = scoreSnippet(window.lines, anchors);

    const [a, b, c, d] = [
      window.lines[0]?.text ?? "",
      window.lines[1]?.text ?? window.lines[0]?.text ?? "",
      window.lines[2]?.text ?? window.lines[1]?.text ?? "",
      window.lines[3]?.text ?? window.lines[1]?.text ?? window.lines[0]?.text ?? ""
    ];

    return {
      title,
      start_label: `candidate_${idx + 1}_start`,
      end_label: `candidate_${idx + 1}_end`,
      snippet_type: window.snippetType,
      creator_profile: creatorProfile,
      on_screen: pickOnScreen(joined),
      caption: pickCaption(joined),
      ad_libs: pickAdLibs(joined),
      viral_score: score,
      reasons,
      script: {
        "0_3s": a,
        "3_7s": b,
        "7_11s": c,
        "11_15s": d
      }
    };
  });
}
