# Murmur Netlify Starter

A tiny static + Netlify Functions starter you can deploy quickly.

## Files

- `index.html`, `styles.css`, `app.js`: static frontend
- `netlify/functions/run.js`: POST function that forwards prompts to the Responses API
- `netlify/functions/health.js`: simple health check endpoint
- `netlify/functions/_shared/*`: shared config and CORS helpers

## Quick start

1. Install Netlify CLI:

   ```bash
   npm i -g netlify-cli
   ```

2. Copy environment file and fill values:

   ```bash
   cp .env.example .env
   ```

3. Start local dev server:

   ```bash
   netlify dev
   ```

4. Open <http://localhost:8888>.

## Endpoints

- `POST /.netlify/functions/run`
- `GET /.netlify/functions/health`

Redirect aliases in `netlify.toml`:

- `POST /api/run`
- `GET /api/health`

## Domain migration best practices

To keep your site/app running smoothly while you migrate your domain, check out this blog post on [Migrating a domain to Netlify](https://www.netlify.com/blog/2021/04/06/migrating-dns-for-a-production-site-we-made-you-a-site-migration-checklist/).
