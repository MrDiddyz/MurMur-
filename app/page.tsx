import { FeatureGrid } from '@/components/FeatureGrid';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureGrid />
    </main>
  );
}
