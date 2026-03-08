import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10 text-sm text-ink">
      <div className="container-shell flex flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold tracking-[0.18em] text-white">MURMUR : AI Art + NFT MVP</p>
          <p className="mt-2 max-w-lg">Generate AI artwork, mint NFTs, list in marketplace, and share collector links.</p>
        </div>
        <div className="flex gap-6">
          <Link href="/marketplace" className="hover:text-white">
            Marketplace
          </Link>
          <Link href="/share" className="hover:text-white">
            Share
          </Link>
        </div>
      </div>
    </footer>
  );
}
