import CTA from "../components/CTA";
import Features from "../components/Features";
import Hero from "../components/Hero";
import Pricing from "../components/Pricing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </main>
  );
}
