import type { MembershipTier } from '@/lib/murmur/domain';

const tierOrder: Record<MembershipTier, number> = {
  core: 1,
  guided: 2,
  professional: 3,
};

const entitlementGate = {
  dashboard: 'core',
  learning: 'core',
  practiceLab: 'guided',
  community: 'core',
  certification: 'guided',
  ambassador: 'professional',
  admin: 'professional',
} as const;

export type EntitlementKey = keyof typeof entitlementGate;

export function hasEntitlement(tier: MembershipTier, area: EntitlementKey): boolean {
  return tierOrder[tier] >= tierOrder[entitlementGate[area]];
}

export function resolveEntitlements(tier: MembershipTier): Record<EntitlementKey, boolean> {
  return (Object.keys(entitlementGate) as EntitlementKey[]).reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: hasEntitlement(tier, key),
    }),
    {} as Record<EntitlementKey, boolean>,
  );
}
