import { generateText } from "../services/openai";

export const SceneAgent = {
  async run(script: string): Promise<string> {
    const prompt = `
Break this short-form script into detailed visual scenes.
Script: ${script}
Return concise scene-by-scene directions.
`;

    return generateText(prompt);
  },
};
