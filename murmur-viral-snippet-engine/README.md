# MurMur Viral Snippet Engine

Engine for auto-generating TikTok-first snippets from MurMur songs.

## MVP features
- parse track lyrics + cues
- validate track input before generation
- find hook candidates (contiguous + non-contiguous)
- score viral potential with cue-aware weighting
- generate up to 10 snippet scripts
- assign on-screen text + caption + ad-libs
- attach creator profile metadata for publishing pipelines
- rank best snippets and emit metrics

## Run
1. npm install
2. npm run dev

## Redeploy
Use the built-in redeploy flow to rebuild, regenerate snippets, rerun tests, and validate output JSON.

```bash
npm run redeploy
```

Override profile (optional):

```bash
TIKTOK_PROFILE=@murmur_artist_001 npm run redeploy
```

## CLI options
- `--input <path>`: track json input
- `--output <path>`: snippet output json
- `--metrics <path>`: metrics output json
- `--profile <@handle>`: override TikTok profile used in output

Example:
`npm run start -- --input data/tracks/neon_addiction.json --profile @murmur_artist_001`

## Output
Snippets are written to:
`data/snippets/*.snippets.json`
