type CookieAdapter = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  remove: (name: string, options?: Record<string, unknown>) => void;
};

type ClientOptions = { cookies?: CookieAdapter };

class QueryBuilder {
  private filters: string[] = [];
  private orderBy = "";
  private limitCount = "";
  private payload: any;

  constructor(private client: SupabaseLiteClient, private table: string, private method: "select" | "insert" | "upsert", private selectCols = "*") {}

  eq(column: string, value: string | number) {
    this.filters.push(`${column}=eq.${encodeURIComponent(String(value))}`);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const direction = opts?.ascending === false ? "desc" : "asc";
    this.orderBy = `order=${column}.${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = `limit=${count}`;
    return this;
  }

  select(columns = "*") {
    this.selectCols = columns;
    return this;
  }

  single() {
    return this.execute(true, false);
  }

  maybeSingle() {
    return this.execute(true, true);
  }

  insert(payload: any) {
    this.method = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: any) {
    this.method = "upsert";
    this.payload = payload;
    return this;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute(false, false).then(onfulfilled as any, onrejected as any);
  }

  private async execute(forceSingle: boolean, allowEmpty: boolean) {
    try {
      const params = [`select=${encodeURIComponent(this.selectCols)}`, ...this.filters];
      if (this.orderBy) params.push(this.orderBy);
      if (this.limitCount) params.push(this.limitCount);
      const qs = params.join("&");
      const url = `${this.client.baseUrl}/rest/v1/${this.table}?${qs}`;
      const method = this.method === "select" ? "GET" : "POST";
      const headers: Record<string, string> = {
        apikey: this.client.anonKey,
        Authorization: `Bearer ${this.client.getToken() ?? this.client.anonKey}`,
        "Content-Type": "application/json",
        Prefer:
          this.method === "upsert"
            ? "resolution=merge-duplicates,return=representation"
            : this.method === "insert"
              ? "return=representation"
              : "return=representation",
      };
      const res = await fetch(url, {
        method,
        headers,
        body: this.method === "select" ? undefined : JSON.stringify(this.payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: json || new Error("Query failed") };
      const data = forceSingle ? (Array.isArray(json) ? json[0] ?? null : json) : json;
      if (forceSingle && !allowEmpty && !data) return { data: null, error: new Error("No rows") };
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

class SupabaseLiteClient {
  constructor(public baseUrl: string, public anonKey: string, private options?: ClientOptions) {}

  getToken() {
    return this.options?.cookies?.get("sb-access-token");
  }

  auth = {
    getSession: async () => ({ data: { session: this.getToken() ? { access_token: this.getToken() } : null }, error: null }),
    getUser: async () => {
      const token = this.getToken();
      if (!token) return { data: { user: null }, error: null };
      const res = await fetch(`${this.baseUrl}/auth/v1/user`, {
        headers: { apikey: this.anonKey, Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { data: { user: null }, error: new Error("Unauthorized") };
      const user = await res.json();
      return { data: { user }, error: null };
    },
    signInWithOtp: async ({ email, options }: { email: string; options?: { emailRedirectTo?: string } }) => {
      const res = await fetch(`${this.baseUrl}/auth/v1/otp`, {
        method: "POST",
        headers: { apikey: this.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, create_user: true, email_redirect_to: options?.emailRedirectTo }),
      });
      return { data: null, error: res.ok ? null : new Error("Failed to send OTP") };
    },
    exchangeCodeForSession: async (code: string) => {
      const res = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=pkce`, {
        method: "POST",
        headers: { apikey: this.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ auth_code: code }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.access_token && this.options?.cookies) {
        this.options.cookies.set("sb-access-token", json.access_token, { path: "/" });
      }
      return { data: json, error: res.ok ? null : new Error("Token exchange failed") };
    },
    signOut: async () => {
      this.options?.cookies?.remove("sb-access-token", { path: "/" });
      return { error: null };
    },
  };

  from(table: string) {
    const base = new QueryBuilder(this, table, "select");
    return {
      select: (columns = "*") => new QueryBuilder(this, table, "select", columns),
      insert: (payload: any) => new QueryBuilder(this, table, "insert").insert(payload),
      upsert: (payload: any) => new QueryBuilder(this, table, "upsert").upsert(payload),
    };
  }
}

export function createServerClient(url: string, key: string, options?: ClientOptions) {
  return new SupabaseLiteClient(url, key, options);
}

export function createBrowserClient(url: string, key: string) {
  return new SupabaseLiteClient(url, key);
}
