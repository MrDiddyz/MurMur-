import path from "node:path";
import { buildSnippets } from "./engine/buildSnippets.js";
import { hookFinder } from "./engine/hookFinder.js";
import { rankSnippets } from "./engine/rankSnippets.js";
import { Track } from "./types.js";
import { readJsonFile, writeJsonFile } from "./utils/json.js";
import { validateTrack } from "./utils/validation.js";

type CliOptions = {
  input: string;
  output: string;
  metrics: string;
  profile?: string;
};

function parseArgs(): CliOptions {
  const root = process.cwd();
  const defaults: CliOptions = {
    input: path.join(root, "data", "tracks", "neon_addiction.json"),
    output: path.join(root, "data", "snippets", "neon_addiction.snippets.json"),
    metrics: path.join(root, "data", "metrics", "snippet_metrics.json")
  };

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--input" && args[i + 1]) defaults.input = path.resolve(args[i + 1]);
    if (args[i] === "--output" && args[i + 1]) defaults.output = path.resolve(args[i + 1]);
    if (args[i] === "--metrics" && args[i + 1]) defaults.metrics = path.resolve(args[i + 1]);
    if (args[i] === "--profile" && args[i + 1]) defaults.profile = args[i + 1];
  }

  return defaults;
}

function main() {
  const opts = parseArgs();

  const track = readJsonFile<Track>(opts.input);
  const errors = validateTrack(track);
  if (errors.length > 0) {
    throw new Error(`Invalid track input:\n- ${errors.join("\n- ")}`);
  }

  const creatorProfile = opts.profile ?? track.tiktok_profile ?? "@murmur_artist_001";
  const windows = hookFinder(track);
  const snippets = buildSnippets(track.title, windows, track.anchor_words, creatorProfile);
  const ranked = rankSnippets(snippets);

  writeJsonFile(opts.output, ranked);
  writeJsonFile(opts.metrics, {
    track_id: track.id,
    creator_profile: creatorProfile,
    generated_count: ranked.length,
    top_score: ranked[0]?.viral_score ?? 0,
    average_score: ranked.length ? Math.round(ranked.reduce((sum, item) => sum + item.viral_score, 0) / ranked.length) : 0
  });

  console.log(`Generated ${ranked.length} snippet candidates for ${track.title}`);
  console.log(`TikTok profile: ${creatorProfile}`);
  console.table(
    ranked.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      type: item.snippet_type,
      score: item.viral_score,
      caption: item.caption
    }))
  );
}

main();
