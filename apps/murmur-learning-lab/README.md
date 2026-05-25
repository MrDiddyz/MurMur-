# MurMur Learning Lab

A human-centered AI learning and reflection lab built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Core Flow

1. User writes a reflection on `/reflection`.
2. AI responds with **mirror**, **insight**, **next step**, and **creative suggestion**.
3. Reflection is saved to Supabase.
4. A **learning node** is automatically created from the reflection.
5. Dashboard shows recent reflections (`/review`) and nodes (`/constellation`).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — overview and getting-started CTA |
| `/reflection` | Write a reflection and receive AI response |
| `/constellation` | Browse your personal learning node constellation |
| `/review` | Review recent reflections with AI insights |

## Stack

- **Next.js 15** App Router (Server Components + Client Components)
- **TypeScript** strict mode
- **Tailwind CSS** with custom dark theme
- **Supabase** (PostgreSQL + RLS)
- **OpenAI API** (`gpt-4o-mini` by default; mock responses when no key is set)

## Getting Started

### 1. Install dependencies

```bash
cd apps/murmur-learning-lab
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the **SQL Editor**.
3. Copy your project URL and keys.

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Optionally add OPENAI_API_KEY for real AI responses
```

### 4. Run locally

```bash
npm run dev
# Opens on http://localhost:3001
```

### 5. Build for production

```bash
npm run build
npm start
```

## Database Schema

Two tables are created by `supabase/schema.sql`:

### `reflections`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `content` | text | User's reflection text |
| `mirror` | text | AI: empathetic restatement |
| `insight` | text | AI: deeper observation |
| `next_step` | text | AI: one actionable step |
| `creative_suggestion` | text | AI: creative idea |
| `created_at` | timestamptz | Timestamp |

### `learning_nodes`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `reflection_id` | uuid | FK → reflections |
| `title` | text | Auto-extracted title |
| `summary` | text | AI insight summary |
| `tags` | text[] | Auto-extracted keywords |
| `created_at` | timestamptz | Timestamp |

## Project Structure

```
apps/murmur-learning-lab/
├── app/
│   ├── layout.tsx          # Root layout with Nav
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── api/
│   │   └── reflect/
│   │       └── route.ts    # POST /api/reflect — AI + Supabase
│   ├── reflection/
│   │   └── page.tsx        # /reflection page
│   ├── constellation/
│   │   └── page.tsx        # /constellation page
│   └── review/
│       └── page.tsx        # /review page
├── components/
│   ├── nav.tsx             # Top navigation bar
│   ├── reflection-form.tsx # Reflection input + submit
│   ├── ai-response.tsx     # AI response display card
│   ├── node-card.tsx       # Learning node card
│   └── reflection-card.tsx # Reflection history card
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── supabase.ts         # Supabase client helpers
│   └── ai.ts               # OpenAI integration + mock fallback
├── supabase/
│   └── schema.sql          # Database schema
├── .env.example            # Environment variable template
└── README.md               # This file
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | Optional | OpenAI API key — mock used if absent |
| `OPENAI_MODEL` | Optional | OpenAI model (default: `gpt-4o-mini`) |

## Development Notes

- The AI layer uses a **mock response** when `OPENAI_API_KEY` is not set, making local development possible without credentials.
- Supabase RLS policies allow public read/write for MVP simplicity. Tighten these policies when adding authentication.
- Server Components fetch data directly from Supabase; the `/api/reflect` route handles writes with the service role key.
