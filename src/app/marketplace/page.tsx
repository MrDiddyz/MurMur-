import Image from 'next/image';
import Link from 'next/link';

import { MAX_PRICE_NOK, PLATFORM_FEE_RATE, marketplaceListings } from '@/lib/marketplace/listings';

export default function MarketplacePage() {
  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-3">
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
          MurMur Marketplace
        </p>
        <h1 className="text-4xl font-semibold">Discover curated artworks</h1>
        <p className="max-w-2xl text-white/80">
          Every listing is capped at {MAX_PRICE_NOK.toLocaleString('nb-NO')} NOK and includes a
          {(PLATFORM_FEE_RATE * 100).toFixed(0)}% platform fee at checkout.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {marketplaceListings.map((listing) => (
          <article key={listing.id} className="card flex h-full flex-col overflow-hidden p-0">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              width={1200}
              height={800}
              className="h-56 w-full object-cover"
            />
            <div className="flex flex-1 flex-col space-y-3 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">{listing.artist}</p>
                <h2 className="mt-1 text-2xl font-semibold">{listing.title}</h2>
                <p className="text-sm text-white/70">{listing.medium}</p>
              </div>
              <p className="text-sm text-white/80">{listing.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <p className="text-lg font-semibold text-cyan-300">{listing.priceNok.toLocaleString('nb-NO')} NOK</p>
                <Link
                  href={`/listing/${listing.id}`}
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:border-cyan-300 hover:text-cyan-200"
                >
                  View listing
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
