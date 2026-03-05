export type JsonMap = Record<string, unknown>;

export interface CreateRunBody {
  user_id: string;
  org_id?: string | null;
  project_id?: string | null;
  request_text: string;
  request_locale?: string | null;
  request_json?: JsonMap;
}

export interface CreateEventBody {
  run_id?: string | null;
  to_state?: string | null;
  type: string;
  actor?: string;
  payload?: JsonMap;
  source?: string | null;
  source_event_id?: string | null;
}
