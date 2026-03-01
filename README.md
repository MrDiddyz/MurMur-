# murmur-discord-node

Day 1–5 foundation for a production-safe Discord bot with OpenAI replies, Supabase logging, hourly metrics, and a conservative growth loop.

## Setup

1. Copy env template and fill values:
   ```bash
   cp .env.example .env
   ```
2. Apply Supabase schema:
   - Run SQL in `supabase/schema.sql` in your Supabase project.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in dev mode:
   ```bash
   npm run dev
   ```

## Runtime behavior

- `messageCreate` logs hashed user activity and handles `!ask` with per-user rate limiting.
- `guildMemberAdd` logs joins and sends a welcome message in the configured channel.
- Hourly aggregator runs every hour at minute `0`.
- Growth cycle runs every hour at minute `5` with an 8-hour cooldown between posts.
- If `GUILD_ID` is set, growth cycle targets that guild; otherwise it uses the first cached guild.

## Commands

```bash
npm run dev
npm start
```
