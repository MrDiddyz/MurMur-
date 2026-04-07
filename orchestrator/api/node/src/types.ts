export type JsonMap = Record<string, unknown>;

export interface CreateRunBody {
  user_id: string;
  org_id?: string | null;
  project_id?: string | null;
  request_text: string;
  request_locale?: string | null;
  request_json?: JsonMap;
}

export interface TransitionBody {
  actor?: string;
  payload?: JsonMap;
}

export interface EventBody extends TransitionBody {
  run_id: string;
  to_state: string;
  event_type: string;
}
