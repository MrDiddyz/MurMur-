import MintButton from '@/components/MintButton';

export default function ArtDetailPage({ params }: { params: { id: string } }) {
  return (
    <article className="space-y-4">
      <h2 className="text-2xl font-semibold">Artwork #{params.id}</h2>
      <div className="h-72 rounded-lg border bg-white" />
      <MintButton artworkId={params.id} />
    </article>
  );
}
