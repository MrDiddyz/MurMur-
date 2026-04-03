"use client";

const suggestions = [
  "Design a micro-launch plan",
  "Improve daily focus with one system",
  "Test a retention experiment",
  "Plan product feedback loop"
];

type Props = {
  onSelect: (value: string) => void;
};

export function QuickInputs({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
