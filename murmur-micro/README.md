# MurMur Micro

MurMur Micro is a compact, production-like starter that demonstrates a multi-agent loop in one request:

1. **Idea** creates a first answer
2. **Critic** points out weaknesses
3. **Synth** improves using critique
4. **Judge** selects the winner
5. The full run is persisted to Supabase and shown in the UI

## Architecture Summary

- **Next.js 14 (App Router) + TypeScript** frontend and API routes
- **OpenAI SDK** for agent text generation
- **Supabase** for persistence (`episodes`, `agent_runs`)
- No auth, billing, teams, or external UI libraries

## File Structure

```txt
murmur-micro/
  app/
    api/
      feedback/route.ts
      run/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    AgentTrace.tsx
    FeedbackBar.tsx
    PromptForm.tsx
    ResultPanel.tsx
  lib/
    murmur-run.ts
    openai.ts
    prompts.ts
    scoring.ts
    supabase.ts
  public/
    .gitkeep
  supabase/
    schema.sql
  types/
    murmur.ts
  .env.example
  .gitignore
  next.config.js
  package.json
  tsconfig.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Fill env vars in `.env.local`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Create tables in Supabase by running SQL in `supabase/schema.sql`.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## How the Agent Flow Works

`POST /api/run` receives `{ prompt }`, runs the full flow in `lib/murmur-run.ts`, then:

- inserts one row in `episodes`
- inserts each agent step in `agent_runs`
- returns:

```json
{
  "episodeId": "...",
  "final": "...",
  "winner": "idea or synth",
  "rationale": "...",
  "score": 0,
  "trace": []
}
```

`POST /api/feedback` receives `{ episodeId, feedback }` where feedback is `1` or `-1`, updates `episodes.feedback`, and returns `{ "ok": true }`.

## Future Upgrade Ideas

- Add auth and per-user history
- Add richer judge logic with confidence scores
- Stream token-by-token agent outputs in the UI
- Add replay mode for old episodes
- Add experiment flags for different prompt templates and models
