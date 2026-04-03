"use client";

type Props = {
  loading: boolean;
  onClick: () => void;
};

export function RunButton({ loading, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
    >
      {loading ? "Running council..." : "Run MurMur Engine"}
    </button>
  );
}
