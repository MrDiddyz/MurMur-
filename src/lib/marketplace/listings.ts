export type ArtworkListing = {
  id: string;
  title: string;
  artist: string;
  medium: string;
  description: string;
  imageUrl: string;
  priceNok: number;
};

export const MAX_PRICE_NOK = 2000;
export const PLATFORM_FEE_RATE = 0.1;

const allListings: ArtworkListing[] = [
  {
    id: 'fjord-light-001',
    title: 'Fjord Light Study',
    artist: 'Ingrid Solheim',
    medium: 'Acrylic on canvas',
    description: 'Nordic twilight palette with layered brushwork inspired by winter fjords.',
    imageUrl:
      '/marketplace/fjord-light.svg',
    priceNok: 1850,
  },
  {
    id: 'aurora-grid-002',
    title: 'Aurora Grid',
    artist: 'Lukas Nilsen',
    medium: 'Digital print, signed edition',
    description: 'Geometric abstraction that maps northern lights into signal-like color bands.',
    imageUrl:
      '/marketplace/aurora-grid.svg',
    priceNok: 1990,
  },
  {
    id: 'murmur-forest-003',
    title: 'Murmur Forest',
    artist: 'Sanna Eik',
    medium: 'Mixed media',
    description: 'Textured layers of charcoal and watercolor interpreting whispering pine forests.',
    imageUrl:
      '/marketplace/murmur-forest.svg',
    priceNok: 1320,
  },
];

export const marketplaceListings = allListings.filter((listing) => listing.priceNok <= MAX_PRICE_NOK);

export function getListingById(id: string): ArtworkListing | undefined {
  return marketplaceListings.find((listing) => listing.id === id);
}

export function calculatePlatformFeeNok(priceNok: number): number {
  return Math.round(priceNok * PLATFORM_FEE_RATE);
}

export function calculateCheckoutTotalNok(priceNok: number): number {
  return priceNok + calculatePlatformFeeNok(priceNok);
}
