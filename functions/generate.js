const { generatePromptSession } = require('./lib/generation-engine');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body.' })
    };
  }

  const result = generatePromptSession(payload);

  if (!result.ok) {
    return {
      statusCode: result.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: result.error,
        missing: result.missing
      })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data)
  };
};
