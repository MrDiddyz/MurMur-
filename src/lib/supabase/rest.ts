import { getSupabaseConfig } from './env';

type SupabaseMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type SupabaseRequestOptions = {
  method?: SupabaseMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: HeadersInit;
  useServiceRole?: boolean;
  timeoutMs?: number;
  retries?: number;
};

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;

function buildQueryString(query?: SupabaseRequestOptions['query']): string {
  if (!query) {
    return '';
  }

  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    queryParams.set(key, String(value));
  }

  const serialized = queryParams.toString();
  return serialized ? `?${serialized}` : '';
}

async function doFetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseSupabasePath(path: string): string {
  return path.replace(/^\/+/, '');
}

function hasHeader(headers: HeadersInit | undefined, targetHeader: string): boolean {
  if (!headers) {
    return false;
  }

  if (headers instanceof Headers) {
    return headers.has(targetHeader);
  }

  if (Array.isArray(headers)) {
    return headers.some(([name]) => name.toLowerCase() === targetHeader.toLowerCase());
  }

  return Object.keys(headers).some((name) => name.toLowerCase() === targetHeader.toLowerCase());
}

export async function supabaseRest<T>(path: string, options: SupabaseRequestOptions = {}): Promise<T> {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = Math.max(0, options.retries ?? DEFAULT_RETRIES);

  const selectedKey = options.useServiceRole ? serviceRoleKey : anonKey;
  if (options.useServiceRole && !selectedKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required when useServiceRole is true.');
  }

  const apiKey = selectedKey ?? anonKey;
  const normalizedPath = parseSupabasePath(path);
  const endpoint = `${url}/rest/v1/${normalizedPath}${buildQueryString(options.query)}`;

  const baseHeaders: Record<string, string> = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  if (options.body !== undefined && !hasHeader(options.headers, 'content-type')) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await doFetchWithTimeout(
        endpoint,
        {
          method,
          headers: {
            ...baseHeaders,
            ...options.headers,
          },
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          cache: 'no-store',
        },
        timeoutMs,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase REST request failed (${response.status}): ${errorText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown Supabase REST error');
      if (attempt === retries) {
        break;
      }
    }
  }

  throw lastError ?? new Error('Supabase REST request failed.');
}
