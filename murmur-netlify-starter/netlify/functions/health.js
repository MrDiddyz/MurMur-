import { corsHeaders, withJson } from './_shared/cors.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  return withJson(200, { ok: true, timestamp: new Date().toISOString() });
}
