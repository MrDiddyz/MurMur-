import { corsHeaders, withJson } from './_shared/cors.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return withJson(405, { error: 'Method not allowed' });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return withJson(400, { error: 'Invalid JSON body' });
  }

  const { linkToken } = body;

  if (!linkToken) {
    return withJson(400, { error: 'Missing linkToken' });
  }

  return withJson(200, { token: 'example-session-token' });
}
