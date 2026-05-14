export type CouncilMember = {
  id: string;
  name: string;
  role: string;
};

export const councilMembers: CouncilMember[] = [
  { id: 'strategy', name: 'Strategy', role: 'Direction' },
  { id: 'signal', name: 'Signal', role: 'Pattern review' },
  { id: 'memory', name: 'Memory', role: 'Continuity' },
];
