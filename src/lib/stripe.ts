import crypto from 'crypto';

const stripeApiBase = 'https://api.stripe.com/v1';

type StripePrimitive = string | number | boolean | null | undefined;

interface StripeFormObject {
  [key: string]: StripePrimitive | StripeFormObject;
}

type StripeFormValue = StripePrimitive | StripeFormObject;

export type StripeWebhookEvent<T = Record<string, unknown>> = {
  id: string;
  type: string;
  data: {
    object: T;
  };
};

export class StripeServerClient {
  private readonly secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async postForm<T>(path: string, body: Record<string, StripeFormValue>): Promise<T> {
    const payload = new URLSearchParams();
    appendForm(payload, body);

    const response = await fetch(`${stripeApiBase}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
      cache: 'no-store',
    });

    const json = (await response.json()) as T & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Stripe API request failed');
    }

    return json;
  }

  constructWebhookEvent(rawBody: string, signatureHeader: string, webhookSecret: string): StripeWebhookEvent {
    const parsed = parseStripeSignature(signatureHeader);
    const signedPayload = `${parsed.timestamp}.${rawBody}`;

    const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload, 'utf8').digest('hex');
    const valid = parsed.signatures.some((signature) => timingSafeEqual(signature, expected));

    if (!valid) {
      throw new Error('Invalid Stripe webhook signature');
    }

    return JSON.parse(rawBody) as StripeWebhookEvent;
  }
}

function appendForm(params: URLSearchParams, data: Record<string, StripeFormValue>, prefix?: string) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }

    const formKey = prefix ? `${prefix}[${key}]` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      appendForm(params, value as Record<string, StripeFormValue>, formKey);
      continue;
    }

    params.append(formKey, String(value));
  }
}

function parseStripeSignature(signatureHeader: string) {
  const pieces = signatureHeader.split(',').map((entry) => entry.trim());

  const timestamp = pieces.find((piece) => piece.startsWith('t='))?.slice(2);
  const signatures = pieces.filter((piece) => piece.startsWith('v1=')).map((piece) => piece.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error('Malformed Stripe signature header');
  }

  return {
    timestamp,
    signatures,
  };
}

function timingSafeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const stripeServer = new StripeServerClient(requireEnv('STRIPE_SECRET_KEY'));
