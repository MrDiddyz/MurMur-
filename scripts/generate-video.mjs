import { experimental_generateVideo as generateVideo } from 'ai';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const DEFAULT_MODEL = 'alibaba/wan-v2.6-i2v';
const DEFAULT_PROMPT = 'The scene slowly comes to life with gentle movement';
const DEFAULT_IMAGE = 'https://example.com/your-image.png';

const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
};

const image = getArg('--image') ?? process.env.VIDEO_SOURCE_IMAGE ?? DEFAULT_IMAGE;
const text = getArg('--text') ?? process.env.VIDEO_PROMPT ?? DEFAULT_PROMPT;
const model = getArg('--model') ?? process.env.VIDEO_MODEL ?? DEFAULT_MODEL;
const duration = Number(getArg('--duration') ?? process.env.VIDEO_DURATION ?? '5');
const outputPath = getArg('--output') ?? process.env.VIDEO_OUTPUT ?? 'output.mp4';

if (!Number.isFinite(duration) || duration <= 0) {
  throw new Error('Duration must be a positive number.');
}

if (!image) {
  throw new Error('Missing source image. Pass --image or set VIDEO_SOURCE_IMAGE.');
}

if (!text) {
  throw new Error('Missing prompt text. Pass --text or set VIDEO_PROMPT.');
}

console.log(`Generating video with model: ${model}`);
console.log(`Image: ${image}`);
console.log(`Prompt: ${text}`);
console.log(`Duration: ${duration}s`);

const result = await generateVideo({
  model,
  prompt: {
    image,
    text,
  },
  duration,
});

const firstVideo = result.videos?.[0]?.uint8Array;
if (!firstVideo) {
  throw new Error('The model returned no video output.');
}

const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
fs.writeFileSync(resolvedOutputPath, firstVideo);
console.log(`Saved video to ${resolvedOutputPath}`);
