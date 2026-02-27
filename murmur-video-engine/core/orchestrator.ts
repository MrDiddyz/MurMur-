import { SceneAgent } from "../agents/scene.agent";
import { ScriptAgent } from "../agents/script.agent";
import { VoiceAgent, type VoiceResult } from "../agents/voice.agent";

export type VideoCreationResult = {
  script: string;
  scenes: string;
  voice: VoiceResult;
};

export async function runVideoCreation(idea: string): Promise<VideoCreationResult> {
  const script = await ScriptAgent.run(idea);
  const scenes = await SceneAgent.run(script);
  const voice = await VoiceAgent.run(script);

  return {
    script,
    scenes,
    voice,
  };
}
