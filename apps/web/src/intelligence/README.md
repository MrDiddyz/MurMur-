# Fragment Intelligence Engine (V1)

This module is the MurMur Archive Vault intelligence layer that converts raw fragments into project-ready structured outputs.

## Pipeline

1. **Classification** (`fragmentClassifier.ts`): keyword/tag/source heuristics assign a `FragmentCategory` + confidence.
2. **Clustering** (`fragmentClusterer.ts`): deterministic graph-based grouping from keyword, phrase, tag overlap, and category alignment (less order-sensitive than greedy grouping).
3. **Idea Detection** (`ideaDetector.ts`): cluster-level scoring for coherence, usefulness, buildability, and distinctiveness, with singleton-cluster filtering to reduce noisy false positives.
4. **Project Synthesis** (`projectSynthesizer.ts`): structured startup-grade project draft generation.
5. **Orchestration** (`index.ts`): `analyzeFragments(fragments)` runs the full pipeline and returns `IntelligenceResult`.

## Extension points for V2

- Swap classifier keyword map with embedding-backed semantic classifiers.
- Replace clustering similarity function with vector search/graph edges.
- Add human feedback loop to calibrate candidate thresholds over time.
- Route synthesis through LLM templates while preserving deterministic fallback.

## Example usage

See `seedFragments.ts` and `example.ts` for an end-to-end runnable input/output flow.
