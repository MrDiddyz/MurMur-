# Murmur Status Dashboard

En liten Next.js-app som viser status for Murmur-piloten.

## Teknologi
- Next.js 14
- API Routes (App Router)
- Vercel hosting
- GitHub integrasjon

## Miljøvariabler
Legg inn i Vercel:
- NEXT_PUBLIC_BASE_URL=https://<vercel-url>
- MURMUR_IP=<IP fra Terraform>

## Kjør lokalt

```bash
npm install
npm run dev
```

## Deploy
Push til GitHub → Vercel bygger automatisk.
