export default function ListingCard({ id, title, priceEth }: { id: string; title: string; priceEth: string }) {
  return (
    <article className="rounded-lg border bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-500">Token #{id}</p>
      <p className="mt-2 font-medium">{priceEth} ETH</p>
      <button className="mt-3 rounded bg-black px-3 py-2 text-sm text-white">Buy</button>
    </article>
  );
}
