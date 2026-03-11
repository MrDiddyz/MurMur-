import { PageShell } from '@/components/mvp/page-shell';

const listings = [
  { id: 'MMR-101', title: 'Aurora Drift', price: '0.42 ETH', status: 'Live' },
  { id: 'MMR-102', title: 'Neon Canopy', price: '0.31 ETH', status: 'Live' },
  { id: 'MMR-103', title: 'Rainlight Echo', price: '0.27 ETH', status: 'Pending transfer' },
];

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow="Marketplace"
      title="Freshly minted drops"
      description="A minimal marketplace table with consistent visual language and clear listing statuses."
    >
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-ink">
            <tr>
              <th className="py-2">Token</th>
              <th className="py-2">Artwork</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-white/10">
                <td className="py-3">{listing.id}</td>
                <td className="py-3">{listing.title}</td>
                <td className="py-3">{listing.price}</td>
                <td className="py-3 text-cyan-100">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
