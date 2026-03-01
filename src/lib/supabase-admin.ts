type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type QueryBuilderOptions = {
  filters?: Record<string, string>;
};

class QueryBuilder {
  private readonly table: string;
  private readonly filters: Record<string, string>;

  constructor(table: string, options: QueryBuilderOptions = {}) {
    this.table = table;
    this.filters = options.filters ?? {};
  }

  eq(column: string, value: string) {
    return new QueryBuilder(this.table, {
      filters: {
        ...this.filters,
        [column]: `eq.${value}`,
      },
    });
  }

  async select(columns: string) {
    const query = new URLSearchParams({ select: columns });

    for (const [column, filter] of Object.entries(this.filters)) {
      query.set(column, filter);
    }

    return request<Json[]>(this.table, {
      method: 'GET',
      query,
    });
  }

  async upsert(payload: Record<string, Json>) {
    return request<Json[]>(this.table, {
      method: 'POST',
      body: payload,
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
    });
  }
}

function adminHeaders(additional?: HeadersInit): Headers {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const headers = new Headers(additional);
  headers.set('apikey', supabaseServiceRoleKey);
  headers.set('Authorization', `Bearer ${supabaseServiceRoleKey}`);
  headers.set('Content-Type', 'application/json');
  return headers;
}

async function request<T>(table: string, options: { method: string; query?: URLSearchParams; body?: Json; headers?: HeadersInit }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL is required.');
  }

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);

  if (options.query) {
    url.search = options.query.toString();
  }

  const response = await fetch(url, {
    method: options.method,
    headers: adminHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    return {
      data: null,
      error: {
        message: error.message ?? `Supabase request failed with status ${response.status}`,
      },
    };
  }

  const data = (await response.json().catch(() => null)) as T | null;
  return { data, error: null };
}

export const supabaseAdmin = {
  from(table: string) {
    return new QueryBuilder(table);
  },
};
