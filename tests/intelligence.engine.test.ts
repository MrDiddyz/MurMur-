import {
  analyzeFragments,
  classifyFragment,
  clusterFragments,
  detectProjectCandidates,
  synthesizeProjects,
} from "../src/intelligence/index";
import { Fragment, FragmentCategory } from "../src/intelligence/intelligenceTypes";
import { sampleSeedFragments } from "../src/intelligence/seedFragments";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function runTests(): void {
  const monetizationFragment: Fragment = {
    id: "t-1",
    content: "Subscription pricing and revenue expansion for pro plan",
    source: "journal",
    createdAt: new Date().toISOString(),
    tags: ["pricing"],
    status: "raw",
  };

  const classified = classifyFragment(monetizationFragment);
  assert(classified.category === FragmentCategory.Monetization, "Expected monetization category");
  assert(classified.confidence >= 0.5, "Expected confidence >= 0.5");

  const classifiedSeed = sampleSeedFragments.map(classifyFragment);
  const clusters = clusterFragments(classifiedSeed);
  assert(clusters.length > 0, "Expected at least one cluster");
  assert(clusters.some((cluster) => cluster.fragmentIds.length > 1), "Expected multi-fragment cluster");

  const candidates = detectProjectCandidates(clusters, classifiedSeed, 0.5);
  assert(candidates.length > 0, "Expected candidate detection to produce results");
  assert(candidates[0].fragmentIds.length >= 2, "Expected candidates to be formed from non-singleton clusters");

  const result = analyzeFragments(sampleSeedFragments);
  const projects = synthesizeProjects(result.projectCandidates, result.classifiedFragments, 1);
  assert(projects.length > 0, "Expected synthesized projects");
  assert(projects[0].title.length > 0, "Expected project title");
  assert(projects[0].keyFeatures.length > 0, "Expected key features");
  assert(projects[0].roadmap.length >= 4, "Expected roadmap scaffolding");

  const noisy: Fragment[] = [
    {
      id: "noise-1",
      content: "hmm maybe thing stuff idk",
      source: "note",
      createdAt: new Date().toISOString(),
      tags: [],
      status: "raw",
    },
  ];
  const noisyResult = analyzeFragments(noisy);
  assert(noisyResult.classifiedFragments[0].category === FragmentCategory.Misc, "Expected misc for noisy fragment");
  assert(noisyResult.clusters.length === 1, "Expected one cluster for single fragment");
  assert(noisyResult.projectCandidates.length === 0, "Expected no project candidate for sparse noise");

  console.log("All Fragment Intelligence Engine tests passed.");
}

runTests();
