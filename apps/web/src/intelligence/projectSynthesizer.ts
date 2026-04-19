import {
  ClassifiedFragment,
  ProjectCandidate,
  SynthesizedProject,
} from "./intelligenceTypes";

function deriveProblemStatement(fragments: ClassifiedFragment[]): string {
  const signal = fragments.map((fragment) => fragment.content).slice(0, 2).join(" ");
  return `Users currently juggle scattered intents and lose momentum. Signals: ${signal.slice(0, 180)}.`;
}

function deriveFeatureList(fragments: ClassifiedFragment[]): string[] {
  const keywords = Array.from(new Set(fragments.flatMap((fragment) => fragment.metadata?.keywords ?? [])));
  const features = keywords
    .filter((keyword) => keyword.length > 4)
    .slice(0, 5)
    .map((keyword) => `Capability around ${keyword}`);

  return features.length > 0
    ? features
    : [
        "Archive ingestion and normalization",
        "Fragment intelligence scoring",
        "Project blueprint synthesis",
      ];
}

export function synthesizeProject(
  candidate: ProjectCandidate,
  classifiedFragments: ClassifiedFragment[],
): SynthesizedProject {
  const fragments = classifiedFragments.filter((fragment) => candidate.fragmentIds.includes(fragment.id));

  return {
    title: candidate.title,
    oneLiner: `An intelligence-first product that turns archive fragments into a shippable ${candidate.title.toLowerCase()}.`,
    problem: deriveProblemStatement(fragments),
    solution:
      "Use deterministic fragment classification, semantic clustering, and candidate scoring to continuously convert idea archives into execution-ready project blueprints.",
    targetUser: "Creators, product leads, and startup operators with high-fragment ideation workflows.",
    keyFeatures: deriveFeatureList(fragments),
    architectureNotes: [
      "Keep ingestion and intelligence engine as pure application service layer.",
      "Store fragment vectors/embeddings in a swappable adapter in V2.",
      "Expose analysis pipeline through composable functions and API boundary.",
    ],
    roadmap: [
      "Week 1: ingest + classify + human validation panel.",
      "Week 2: cluster quality tuning and candidate ranking calibration.",
      "Week 3: synthesis templates and project export endpoints.",
      "Week 4: instrument analytics, confidence tracking, and feedback loop.",
    ],
    repoStructureSuggestion: [
      "src/intelligence/* for pure analysis modules",
      "src/services/intelligenceService.ts for orchestration",
      "src/api/intelligence/* for HTTP or RPC endpoints",
      "tests/intelligence/* for deterministic quality checks",
    ],
  };
}

export function synthesizeProjects(
  candidates: ProjectCandidate[],
  classifiedFragments: ClassifiedFragment[],
  maxProjects = 3,
): SynthesizedProject[] {
  return candidates.slice(0, maxProjects).map((candidate) => synthesizeProject(candidate, classifiedFragments));
}
