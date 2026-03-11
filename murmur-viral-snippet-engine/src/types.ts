export type LyricLine = {
  section: string;
  text: string;
  cue: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  genre?: string[];
  tiktok_profile?: string;
  anchor_words: string[];
  lyrics: LyricLine[];
};

export type SnippetScript = {
  "0_3s": string;
  "3_7s": string;
  "7_11s": string;
  "11_15s": string;
};

export type SnippetCandidate = {
  title: string;
  start_label: string;
  end_label: string;
  snippet_type: string;
  creator_profile: string;
  on_screen: string;
  caption: string;
  ad_libs: string[];
  viral_score: number;
  script: SnippetScript;
  reasons: string[];
};

export type CandidateWindow = {
  lines: LyricLine[];
  snippetType: string;
};
