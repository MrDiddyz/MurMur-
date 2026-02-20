const FALLBACK_SITE_URL = 'https://murmurapp.no';

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) return FALLBACK_SITE_URL;

  try {
    const normalized = new URL(envUrl);
    return normalized.toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_SITE_URL;
  }
}
