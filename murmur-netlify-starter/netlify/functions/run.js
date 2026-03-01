import { getConfig } from './_shared/config.js';
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

  const { apiBaseUrl, apiKey, model } = getConfig();
  if (!apiKey) {
    return withJson(500, { error: 'Missing MURMUR_API_KEY in environment.' });
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return withJson(400, { error: 'A non-empty `prompt` string is required.' });
    }

    const upstream = await fetch(`${apiBaseUrl}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return withJson(upstream.status, {
        error: data?.error?.message || 'Upstream API error',
        details: data,
      });
    }

    return withJson(200, {
      model,
      output_text: data.output_text || '',
      raw: data,
    });
  } catch (error) {
    return withJson(500, { error: error.message || 'Unknown server error' });
  }
}
