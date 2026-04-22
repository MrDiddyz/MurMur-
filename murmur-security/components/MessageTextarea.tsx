interface MessageTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export function MessageTextarea({ value, onChange }: MessageTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Paste message content here..."
      className="min-h-44 w-full rounded-2xl border border-zinc-700 bg-black p-4 text-sm leading-6 text-text outline-none ring-0 placeholder:text-zinc-500 focus:border-goldSoft"
      aria-label="Suspicious message"
    />
  );
}
