const REQUIRED_FIELDS = ['genre', 'mood', 'artist'];

function normalizeInput(payload = {}) {
  return {
    genre: String(payload.genre || '').trim(),
    mood: String(payload.mood || '').trim(),
    artist: String(payload.artist || '').trim()
  };
}

function validateInput(input) {
  const missing = REQUIRED_FIELDS.filter((key) => !input[key]);
  if (missing.length) {
    return {
      valid: false,
      error: `Missing required field(s): ${missing.join(', ')}`,
      missing
    };
  }
  return { valid: true };
}

function templateGenerator(input) {
  const title = `${input.mood} ${input.genre} in the style of ${input.artist}`;

  return {
    prompt: `Compose an original ${input.genre} track with a ${input.mood} emotional tone, inspired by the sonic character of ${input.artist}. Include a memorable hook, dynamic transitions, and a modern mix-ready arrangement.`,
    blueprint: {
      title,
      style: `${input.genre} + ${input.artist} influence`,
      structure: 'Intro (8 bars) → Verse (16 bars) → Chorus (16 bars) → Breakdown (8 bars) → Final Chorus (16 bars) → Outro (8 bars)',
      instruments: 'Core drums, expressive bassline, atmospheric pads, lead motif, ear-candy FX',
      mood: input.mood
    }
  };
}

function generatePromptSession(payload, options = {}) {
  const strategy = options.strategy || templateGenerator;
  const input = normalizeInput(payload);
  const validation = validateInput(input);

  if (!validation.valid) {
    return {
      ok: false,
      statusCode: 400,
      error: validation.error,
      missing: validation.missing
    };
  }

  return {
    ok: true,
    statusCode: 200,
    data: strategy(input)
  };
}

/*
  Migration note:
  - To switch from templates to an AI provider, replace `templateGenerator` with a strategy
    that calls your model SDK/API and returns the same contract:
      { prompt, blueprint: { title, style, structure, instruments, mood } }
  - Use environment variables (e.g. process.env.OPENAI_API_KEY, process.env.AI_MODEL)
    in that strategy, not in route handlers, to keep API contracts stable.
*/

module.exports = {
  generatePromptSession,
  normalizeInput,
  validateInput,
  templateGenerator
};
