import type { VoiceResult } from "../agents/voice.agent";

export type ComposeVideoInput = {
  scenes: string;
  voice: VoiceResult;
};

export async function composeVideo({ scenes, voice }: ComposeVideoInput) {
  return {
    video_url: "generated-video.mp4",
    duration: 42,
    metadata: {
      scenes,
      voice,
    },
  };
}
