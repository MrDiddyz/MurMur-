export const murmurDictionary = {
  mood: {
    dark: { weight: 2, params: ["minor_tone", "low_brightness"] },
    nocturnal: { weight: 2, params: ["slow_tempo", "night_atmosphere"] },
    midnight: { weight: 2, params: ["intimate_space", "late_energy"] },
    hypnotic: { weight: 2, params: ["repetitive_groove"] },
    haunted: { weight: 1, params: ["reverb", "echo"] },
    ceremonial: { weight: 2, params: ["dramatic_space"] },
    sensual: { weight: 2, params: ["warm_tone"] },
    magnetic: { weight: 2, params: ["strong_presence"] },
    melancholic: { weight: 1, params: ["minor_progression"] },
    dreamlike: { weight: 1, params: ["pads", "ambient_layer"] },
    calm: { weight: 1, params: ["restrained_energy"] },
    tense: { weight: 1, params: ["suspense"] }
  },

  texture: {
    velvet: { weight: 3, params: ["warm_bass", "soft_highs"] },
    analog: { weight: 2, params: ["tape_saturation"] },
    dusty: { weight: 1, params: ["vinyl_noise"] },
    smoky: { weight: 1, params: ["low_pass_filter"] },
    mirrored: { weight: 1, params: ["stereo_delay"] },
    distorted: { weight: 2, params: ["distortion"] },
    grainy: { weight: 1, params: ["lofi_texture"] },
    liquid: { weight: 1, params: ["smooth_modulation"] },
    glossy: { weight: 1, params: ["bright_surface"] },
    thick: { weight: 1, params: ["dense_tone"] }
  },

  motion: {
    "slow burn": { weight: 3, params: ["gradual_build"] },
    pulse: { weight: 2, params: ["steady_rhythm"] },
    floating: { weight: 1, params: ["ambient_motion"] },
    stalking: { weight: 2, params: ["sparse_drums"] },
    rising: { weight: 1, params: ["build_up"] },
    collapsing: { weight: 1, params: ["energy_drop"] },
    gliding: { weight: 1, params: ["pitch_glide"] },
    flowing: { weight: 1, params: ["smooth_continuity"] }
  },

  vocal: {
    deep: { weight: 2, params: ["low_register"] },
    breathy: { weight: 1, params: ["close_mic"] },
    whisper: { weight: 1, params: ["intimate_voice"] },
    commanding: { weight: 2, params: ["strong_delivery"] },
    seductive: { weight: 2, params: ["warm_tone"] },
    spoken: { weight: 1, params: ["spoken_flow"] },
    melodic: { weight: 1, params: ["melodic_delivery"] },
    operatic: { weight: 2, params: ["dramatic_projection"] },
    baritone: { weight: 2, params: ["male_low_register"] },
    tenor: { weight: 1, params: ["male_high_register"] },
    "close mic": { weight: 2, params: ["intimate_voice"] }
  },

  persona: {
    masked: { weight: 2, params: ["mysterious_character"] },
    royal: { weight: 2, params: ["controlled_presence"] },
    shadow: { weight: 2, params: ["dark_identity"] },
    prophetic: { weight: 1, params: ["storytelling_voice"] },
    ritual: { weight: 2, params: ["ceremonial_energy"] },
    regal: { weight: 2, params: ["noble_tone"] },
    ghostlike: { weight: 1, params: ["ethereal_presence"] },
    observer: { weight: 1, params: ["detached_persona"] }
  },

  space: {
    cathedral: { weight: 2, params: ["large_reverb"] },
    underground: { weight: 2, params: ["heavy_bass"] },
    chamber: { weight: 1, params: ["intimate_room"] },
    fog: { weight: 1, params: ["ambient_pad"] },
    void: { weight: 2, params: ["deep_ambience"] },
    stage: { weight: 1, params: ["performance_space"] },
    cinematic: { weight: 2, params: ["wide_space"] },
    ambient: { weight: 1, params: ["background_space"] },
    atmospheric: { weight: 1, params: ["immersive_space"] }
  },

  production: {
    bpm: { type: "tempo" },
    tempo: { type: "tempo" },
    kick: { type: "drum" },
    snare: { type: "drum" },
    "hi-hat": { type: "drum" },
    bass: { type: "low_end" },
    sub: { type: "low_end" },
    groove: { type: "rhythm" },
    drums: { type: "rhythm" },
    pads: { type: "atmosphere" },
    synth: { type: "instrument" },
    piano: { type: "instrument" },
    strings: { type: "instrument" },
    reverb: { type: "effect" },
    delay: { type: "effect" },
    distortion: { type: "effect" },
    filter: { type: "effect" },
    transition: { type: "arrangement" },
    drop: { type: "arrangement" },
    key: { type: "tonality" }
  },

  structure: ["intro", "verse", "chorus", "hook", "bridge", "outro", "build", "drop", "breakdown", "interlude"],

  genre: [
    "hip-hop",
    "trap",
    "drill",
    "r&b",
    "soul",
    "house",
    "techno",
    "ambient",
    "opera",
    "spoken word",
    "electronic",
    "edm",
    "industrial",
    "downtempo",
    "trip-hop",
    "dark pop",
    "experimental",
    "minimal",
    "hybrid"
  ],

  murmurIdentityTerms: [
    "dark",
    "velvet",
    "midnight",
    "shadow",
    "ritual",
    "magnetic",
    "slow burn",
    "nocturnal",
    "quiet authority",
    "shadow-lit"
  ]
};
