import Link from 'next/link';
import { MEMBERSHIP_PLANS } from '@/lib/murmur/domain';
import { SectionShell } from '@/components/murmur/section-shell';

const journeyStages = ['Track', 'Level', 'Module', 'Lesson', 'Practice', 'Reflection', 'Certification'];

export default function MurmurAiCoreLandingPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-2xl border border-white/10 bg-[#030711]/60 p-8 md:grid-cols-[1.2fr,1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Premium Learning Operating System</p>
          <h2 className="mt-2 text-4xl font-semibold text-white">A living ecosystem for adaptive intelligence.</h2>
          <p className="mt-4 text-sm text-slate-200">
            MurMurAiCore transforms learning into structured progression with measurable outcomes, intelligent pacing, and membership-powered growth.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/murmur-aicore/auth" className="glow-button rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900">
              Start Membership
            </Link>
            <Link href="/murmur-aicore/pricing" className="glow-button rounded-full border border-white/20 px-5 py-2 text-sm text-white">
              Compare Tiers
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-950/20 p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Learning Journey</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-100">
            {journeyStages.map((stage, index) => (
              <li key={stage} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                {index + 1}. {stage}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionShell title="VIP" eyebrow="Not for everyone">
        <p className="text-base text-cyan-100">MurmurAi@proton.me</p>
        <p className="mt-2 text-lg">VIP 🍒</p>
      </SectionShell>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionShell title="System explanation" eyebrow="Core Product Concept">
          Hierarchical learning, role-based community experiences, and certification workflows are orchestrated through modular services backed by Supabase RLS and entitlement gates.
        </SectionShell>
        <SectionShell title="Value proposition" eyebrow="Precision + Depth + Clarity">
          Members receive next best action recommendations, progression analytics, and practice loops designed for long-term retention rather than one-off content consumption.
        </SectionShell>
      </div>

      <SectionShell title="Membership tiers" eyebrow="Subscription Intelligence">
        <div className="grid gap-4 md:grid-cols-3">
          {MEMBERSHIP_PLANS.map((plan) => (
            <article key={plan.tier} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <h3 className="text-lg font-semibold capitalize text-white">{plan.tier}</h3>
              <p className="mt-1 text-cyan-300">NOK {plan.monthlyPriceNok} / month</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-200">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
