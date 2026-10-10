// OWNER: Member C | Threshold and status logic
// TODO: calibrate thresholds using tests/test-cases.md results
export const THRESHOLDS = { correct: 0.8, ambiguousGap: 0.05, minLength: 2 };
export function decide(result) {
  return { status: "unrecognized", item: null, score: 0 };
}
