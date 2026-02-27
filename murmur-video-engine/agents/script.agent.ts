import { generateText } from "../services/openai";

export const ScriptAgent = {
  async run(idea: string): Promise<string> {
    const prompt = `
Create a short viral vertical video script.
Idea: ${idea}
Max 45 seconds.
Hook first 2 seconds.
Split into scenes.
`;

    return generateText(prompt);
  },
};
