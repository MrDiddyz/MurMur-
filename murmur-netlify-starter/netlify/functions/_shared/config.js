const API_BASE_URL = process.env.MURMUR_API_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.MURMUR_API_KEY || '';
const MODEL = process.env.MURMUR_MODEL || 'gpt-4o-mini';

export function getConfig() {
  return {
    apiBaseUrl: API_BASE_URL,
    apiKey: API_KEY,
    model: MODEL,
  };
}
