export type CreatorPrompt = {
  id: string;
  title: string;
  description: string;
};

export type CreatorPromptPack = {
  id: string;
  title: string;
  description: string;
  promptCount: number;
};

export type CreatorProfile = {
  username: string;
  name: string;
  bio: string;
  prompts: CreatorPrompt[];
  promptPacks: CreatorPromptPack[];
};

export const creatorProfiles: CreatorProfile[] = [
  {
    username: 'luna',
    name: 'Luna Rivera',
    bio: 'Narrative systems designer focusing on cinematic prompt flows.',
    prompts: [
      {
        id: 'prompt-luna-1',
        title: 'Midnight City Moodboard',
        description: 'Generate visual motifs and color language for neo-noir scenes.',
      },
      {
        id: 'prompt-luna-2',
        title: 'Character Voice Tuner',
        description: 'Refine dialogue tone across tension, intimacy, and reveal beats.',
      },
      {
        id: 'prompt-luna-3',
        title: 'Scene-to-Storyboard Mapper',
        description: 'Convert screenplay snippets into shot-ready storyboard prompts.',
      },
    ],
    promptPacks: [
      {
        id: 'pack-luna-1',
        title: 'Neo-Noir Starter Pack',
        description: 'A complete set of prompts to build noir-inspired worlds.',
        promptCount: 12,
      },
      {
        id: 'pack-luna-2',
        title: 'Dialogue Dynamics Bundle',
        description: 'Prompt collection for conflict, subtext, and emotional pacing.',
        promptCount: 8,
      },
    ],
  },
  {
    username: 'kai',
    name: 'Kai Okafor',
    bio: 'Workflow architect creating practical prompt stacks for product teams.',
    prompts: [
      {
        id: 'prompt-kai-1',
        title: 'Launch Plan Draft',
        description: 'Turn rough product notes into a phased launch strategy.',
      },
      {
        id: 'prompt-kai-2',
        title: 'Customer Insight Synthesizer',
        description: 'Extract recurring pain points from interview transcripts.',
      },
    ],
    promptPacks: [
      {
        id: 'pack-kai-1',
        title: 'PM Toolkit Essentials',
        description: 'Foundational prompts for discovery, planning, and execution.',
        promptCount: 10,
      },
    ],
  },
];

export const creatorProfilesByUsername = Object.fromEntries(
  creatorProfiles.map((profile) => [profile.username, profile]),
) as Record<string, CreatorProfile>;
