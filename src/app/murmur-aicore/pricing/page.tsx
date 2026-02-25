import { MEMBERSHIP_PLANS } from '@/lib/murmur/domain';
import { SectionShell } from '@/components/murmur/section-shell';

export default function MembershipPricingPage() {
  return (
    <SectionShell title="Membership pricing" eyebrow="Core · Guided · Professional">
      <div className="grid gap-4 md:grid-cols-3">
        {MEMBERSHIP_PLANS.map((plan) => (
          <article key={plan.tier} className="rounded-lg border border-white/10 bg-black/30 p-4">
            <h3 className="text-lg font-semibold capitalize">{plan.tier}</h3>
            <p className="mt-1 text-cyan-300">NOK {plan.monthlyPriceNok}/month</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
