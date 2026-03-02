import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.API_PORT = '4000';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/murmur';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.TIKTOK_CLIENT_ID = 'test-client-id';
process.env.TIKTOK_CLIENT_SECRET = 'test-secret';
process.env.TIKTOK_REDIRECT_URI = 'https://example.com/callback';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require('../src/app');

describe('GET /health', () => {
  it('returns OK status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptimeSeconds).toBe('number');
  });
});
