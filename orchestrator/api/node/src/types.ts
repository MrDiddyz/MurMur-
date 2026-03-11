export type RunCreateBody = {
  user_id: string;
  org_id?: string | null;
  project_id?: string | null;
  request_text: string;
  request_locale?: string | null;
  request_json?: Record<string, unknown>;
};

export type EventBody = {
  run_id: string;
  to_state: string;
  event_type: string;
  actor?: string;
  payload?: Record<string, unknown>;
};

export type DecisionBody = {
  reviewer_id?: string | null;
  reason?: string | null;
};
