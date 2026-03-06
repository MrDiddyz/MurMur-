export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  initialStep: "teacher";
};

export const workflows: WorkflowDefinition[] = [
  {
    id: "murmur-core",
    name: "MurMur Core Workflow",
    description: "Teacher → Experimental → Thinktank → Reflective",
    initialStep: "teacher",
  },
];
