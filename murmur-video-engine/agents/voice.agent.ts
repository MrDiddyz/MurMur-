export type VoiceResult = {
  narration: string;
  voice: string;
};

export const VoiceAgent = {
  async run(script: string): Promise<VoiceResult> {
    return {
      narration: script,
      voice: "default",
    };
  },
};
