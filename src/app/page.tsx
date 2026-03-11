import Link from 'next/link';
import { PageShell } from '@/components/mvp/page-shell';

const highlights = [
  {
    title: 'AI Studio',
    description: 'Turn short prompts into artwork drafts and prepare metadata for minting.',
    href: '/generate',
  },
  {
    title: 'Marketplace',
    description: 'Browse recently minted pieces and view listing status in one dashboard.',
    href: '/marketplace',
  },
  {
    title: 'Share',
    description: 'Generate a share card with creator attribution and mint transaction link.',
    href: '/share',
  },
] as const;

export default function HomePage() {
  return (
    <PageShell
      eyebrow="MurMur MVP"
      title="AI art generation and NFT marketplace"
      description="A focused MVP flow: generate artwork, upload to IPFS, mint to a connected wallet, then publish to marketplace and share pages."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.href} className="card space-y-3">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-ink">{item.description}</p>
            <Link href={item.href} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
              Open {item.title}
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
