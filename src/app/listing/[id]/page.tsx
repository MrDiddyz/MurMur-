import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CheckoutButton } from '@/components/marketplace/checkout-button';
import {
  PLATFORM_FEE_RATE,
  calculateCheckoutTotalNok,
  calculatePlatformFeeNok,
  getListingById,
} from '@/lib/marketplace/listings';

type ListingPageProps = {
  params: {
    id: string;
  };
};

export default function ListingPage({ params }: ListingPageProps) {
  const listing = getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const platformFeeNok = calculatePlatformFeeNok(listing.priceNok);
  const totalNok = calculateCheckoutTotalNok(listing.priceNok);

  return (
    <div className="space-y-8 pb-10">
      <Link href="/marketplace" className="text-sm text-cyan-200 hover:text-cyan-100">
        ← Back to marketplace
      </Link>

      <section className="grid gap-8 lg:grid-cols-2">
        <Image src={listing.imageUrl} alt={listing.title} width={1200} height={900} className="h-[420px] w-full rounded-2xl object-cover" />

        <article className="card space-y-4">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">{listing.artist}</p>
          <h1 className="text-4xl font-semibold">{listing.title}</h1>
          <p className="text-white/80">{listing.medium}</p>
          <p className="text-white/80">{listing.description}</p>

          <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm">
            <div className="flex justify-between">
              <span>Artwork price</span>
              <span>{listing.priceNok.toLocaleString('nb-NO')} NOK</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%)</span>
              <span>{platformFeeNok.toLocaleString('nb-NO')} NOK</span>
            </div>
            <div className="flex justify-between border-t border-white/15 pt-2 text-base font-semibold text-cyan-200">
              <span>Total</span>
              <span>{totalNok.toLocaleString('nb-NO')} NOK</span>
            </div>
          </div>

          <CheckoutButton listingId={listing.id} />
        </article>
      </section>
    </div>
  );
}
