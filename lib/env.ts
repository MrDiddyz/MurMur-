const stripeLinkKeys = {
  foundation: 'NEXT_PUBLIC_STRIPE_LINK_FOUNDATION',
  growth: 'NEXT_PUBLIC_STRIPE_LINK_GROWTH',
  enterprise: 'NEXT_PUBLIC_STRIPE_LINK_ENTERPRISE',
} as const;

export type ModuleKey = keyof typeof stripeLinkKeys;

export function getStripeLink(moduleKey: ModuleKey): string | null {
  const value = process.env[stripeLinkKeys[moduleKey]];
  if (!value) {
    return null;
  }

  return value;
}
