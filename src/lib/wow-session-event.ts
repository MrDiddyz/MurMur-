export const WARCRAFT_LOGS_CONNECTOR_ID = 'warcraftlogs_v1' as const;
export const WARCRAFT_LOGS_PROVIDER = 'WarcraftLogs' as const;
export const WARCRAFT_LOGS_GAME = 'WorldOfWarcraft' as const;

export const WOW_SESSION_CONTEXTS = ['raid', 'dungeon', 'pvp', 'open_world'] as const;
export type WowSessionContext = (typeof WOW_SESSION_CONTEXTS)[number];

export type WowSource = {
  connector_id: string;
  game: string;
  provider: string;
  version: string;
};

export type WowActor = {
  user_id: string;
  character_id: string;
  display_name: string;
  region: string;
  realm: string;
};

export type WowSession = {
  session_id: string;
  platform: string;
  context: string;
};

export type WowConsent = {
  scopes: string[];
  granted_at: string;
};

export type WowSessionStartedPayload = {
  context: WowSessionContext;
};

export type WowCombatMetricPayload = {
  window_sec: number;
  dps?: number;
  hps?: number;
  deaths?: number;
};

export type WowSessionStartedEvent = {
  id: string;
  type: 'session.started';
  ts: string;
  source: WowSource;
  actor: WowActor;
  session: WowSession;
  consent: WowConsent;
  payload: WowSessionStartedPayload;
};

export type WowCombatMetricEvent = {
  id: string;
  type: 'combat.metric';
  ts: string;
  source: WowSource;
  actor: WowActor;
  session: WowSession;
  consent: WowConsent;
  payload: WowCombatMetricPayload;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asObject = (value: unknown, fieldName: string): Record<string, unknown> => {
  if (!isObject(value)) {
    throw new Error(`Expected ${fieldName} to be an object`);
  }
  return value;
};

const asString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Expected ${fieldName} to be a non-empty string`);
  }
  return value;
};

const asStringArray = (value: unknown, fieldName: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected ${fieldName} to be a string array`);
  }
  return value;
};

const asNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected ${fieldName} to be a valid number`);
  }
  return value;
};

const asOptionalNumber = (value: unknown, fieldName: string): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return asNumber(value, fieldName);
};

const asSessionContext = (value: unknown, fieldName: string): WowSessionContext => {
  const context = asString(value, fieldName);
  if (!WOW_SESSION_CONTEXTS.includes(context as WowSessionContext)) {
    throw new Error(`Expected ${fieldName} to be one of: ${WOW_SESSION_CONTEXTS.join(', ')}`);
  }
  return context as WowSessionContext;
};

const parseRawEvent = (rawEvent: string | unknown): Record<string, unknown> => {
  if (typeof rawEvent === 'string') {
    try {
      const parsed: unknown = JSON.parse(rawEvent);
      return asObject(parsed, 'event');
    } catch {
      throw new Error('Expected event input to be valid JSON');
    }
  }

  return asObject(rawEvent, 'event');
};

const parseSource = (value: unknown): WowSource => {
  const source = asObject(value, 'source');
  return {
    connector_id: asString(source.connector_id, 'source.connector_id'),
    game: asString(source.game, 'source.game'),
    provider: asString(source.provider, 'source.provider'),
    version: asString(source.version, 'source.version'),
  };
};

const parseActor = (value: unknown): WowActor => {
  const actor = asObject(value, 'actor');
  return {
    user_id: asString(actor.user_id, 'actor.user_id'),
    character_id: asString(actor.character_id, 'actor.character_id'),
    display_name: asString(actor.display_name, 'actor.display_name'),
    region: asString(actor.region, 'actor.region'),
    realm: asString(actor.realm, 'actor.realm'),
  };
};

const parseSession = (value: unknown): WowSession => {
  const session = asObject(value, 'session');
  return {
    session_id: asString(session.session_id, 'session.session_id'),
    platform: asString(session.platform, 'session.platform'),
    context: asString(session.context, 'session.context'),
  };
};

const parseConsent = (value: unknown): WowConsent => {
  const consent = asObject(value, 'consent');
  return {
    scopes: asStringArray(consent.scopes, 'consent.scopes'),
    granted_at: asString(consent.granted_at, 'consent.granted_at'),
  };
};

export const parseWowSessionStartedEvent = (rawEvent: string | unknown): WowSessionStartedEvent => {
  const event = parseRawEvent(rawEvent);

  if (event.type !== 'session.started') {
    throw new Error('Expected event.type to be session.started');
  }

  const payload = asObject(event.payload, 'payload');

  return {
    id: asString(event.id, 'id'),
    type: 'session.started',
    ts: asString(event.ts, 'ts'),
    source: parseSource(event.source),
    actor: parseActor(event.actor),
    session: parseSession(event.session),
    consent: parseConsent(event.consent),
    payload: {
      context: asSessionContext(payload.context, 'payload.context'),
    },
  };
};

export const parseWowCombatMetricEvent = (rawEvent: string | unknown): WowCombatMetricEvent => {
  const event = parseRawEvent(rawEvent);

  if (event.type !== 'combat.metric') {
    throw new Error('Expected event.type to be combat.metric');
  }

  const payload = asObject(event.payload, 'payload');

  return {
    id: asString(event.id, 'id'),
    type: 'combat.metric',
    ts: asString(event.ts, 'ts'),
    source: parseSource(event.source),
    actor: parseActor(event.actor),
    session: parseSession(event.session),
    consent: parseConsent(event.consent),
    payload: {
      window_sec: asNumber(payload.window_sec, 'payload.window_sec'),
      dps: asOptionalNumber(payload.dps, 'payload.dps'),
      hps: asOptionalNumber(payload.hps, 'payload.hps'),
      deaths: asOptionalNumber(payload.deaths, 'payload.deaths'),
    },
  };
};
