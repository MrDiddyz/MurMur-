import { analyzeFragments } from './analyzeFragments';
import { SAMPLE_FRAGMENTS } from './sampleFragments';

export function runIntelligenceDemo(): void {
  const result = analyzeFragments(SAMPLE_FRAGMENTS);
  console.log(JSON.stringify(result, null, 2));
}
