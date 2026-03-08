export type CreatorPrompt = {
  id: string;
  title: string;
  description: string;
};

export type CreatorPromptPack = {
  id: string;
  name: string;
  description: string;
  promptCount: number;
};

export type CreatorProfile = {
  username: string;
  name: string;
  prompts: CreatorPrompt[];
  promptPacks: CreatorPromptPack[];
};

export const creatorProfiles: CreatorProfile[] = [
  {
    username: 'nova',
    name: 'Nova Kim',
    prompts: [
      {
        id: 'p_nova_01',
        title: 'Strategic Weekly Reflection',
        description: 'Turn raw team updates into strategic priorities and next actions.',
      },
      {
        id: 'p_nova_02',
        title: 'Launch Debrief Synthesizer',
        description: 'Summarize launch outcomes, surprises, and process improvements.',
      },
    ],
    promptPacks: [
      {
        id: 'pp_nova_01',
        name: 'Operator Planning Pack',
        description: 'Prompts for weekly planning, risk checks, and decision snapshots.',
        promptCount: 6,
      },
      {
        id: 'pp_nova_02',
        name: 'Postmortem Builder Pack',
        description: 'Prompts for incident reviews and actionable process upgrades.',
        promptCount: 4,
      },
    ],
  },
  {
    username: 'echo',
    name: 'Echo Rivera',
    prompts: [
      {
        id: 'p_echo_01',
        title: 'Narrative Clarity Rewrite',
        description: 'Refine rough ideas into concise, audience-specific communication.',
      },
      {
        id: 'p_echo_02',
        title: 'Creative Angle Generator',
        description: 'Generate campaign angles with tone and channel variations.',
      },
    ],
    promptPacks: [
      {
        id: 'pp_echo_01',
        name: 'Story Studio Pack',
        description: 'Prompt collection for concepting, editing, and narrative alignment.',
        promptCount: 8,
      },
    ],
  },
];

export function getCreatorProfileByUsername(username: string): CreatorProfile | undefined {
  return creatorProfiles.find((profile) => profile.username === username);
}
