import ListingCard from './ListingCard';

const demoListings = [
  { id: '1', title: 'Nebula Drift', priceEth: '0.15' },
  { id: '2', title: 'Solar Echo', priceEth: '0.22' },
];

export default function MarketplaceGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {demoListings.map((listing) => (
        <ListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
}
