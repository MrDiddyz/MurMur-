import type { RiskLevel } from "@/types";

const badgeStyles: Record<RiskLevel, string> = {
  LOW: "bg-[#1a2b1a] text-[#8ae58a] border border-[#295129]",
  MEDIUM: "bg-[#2d260f] text-[#f7d678] border border-[#5a4920]",
  HIGH: "bg-[#311313] text-[#f8a8a8] border border-[#613232]",
};

export function Badge({ risk }: { risk: RiskLevel }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${badgeStyles[risk]}`}>{risk}</span>;
}
