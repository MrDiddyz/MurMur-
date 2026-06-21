import Link from 'next/link';

type Props = {
  id: string;
  prompt: string;
  imageUrl: string;
};

export default function ArtworkCard({ id, prompt, imageUrl }: Props) {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <img src={imageUrl} alt={prompt} className="h-72 w-full rounded object-cover" />
      <p className="text-sm text-slate-600">{prompt}</p>
      <Link href={`/art/${id}`} className="inline-block rounded border px-3 py-2">View & Mint</Link>
    </div>
  );
}
