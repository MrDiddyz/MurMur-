declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    body?: any;
    query: Record<string, string | string[]>;
    method?: string;
  }

  export interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
  }
}

declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    from(table: string): {
      update(values: Record<string, unknown>): {
        eq(column: string, value: string): Promise<{ error: { message: string } | null }>;
      };
    };
  }

  export function createClient(url: string, key: string, options?: Record<string, unknown>): SupabaseClient;
}
