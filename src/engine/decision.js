// OWNER: Member C | Threshold and status logic
// TODO: calibrate thresholds using tests/test-cases.md results
export const THRESHOLDS = {
  correct: 0.75,       // Best match must be at least 75% similar
  ambiguousGap: 0.08,  // If best - runnerUp < 0.08, it's too close to call
  minLength: 2         // Inputs shorter than 2 chars are ambiguous
};

export function decide(result) {
  const { item, score, runnerUp, inputLength } = result;

  // 1. Check short input FIRST
  if (inputLength <= THRESHOLDS.minLength) {
    return { status: "ambiguous", item: null, score: 0.50 };
  }

  // 2. Check if score is too low
  if (!item || score < THRESHOLDS.correct) {
    // Check if it's close enough to be ambiguous
    if (score >= 0.50 && score - runnerUp < THRESHOLDS.ambiguousGap) {
      return { status: "ambiguous", item: item, score: score };
    }
    return { status: "unrecognized", item: null, score: score };
  }

  // 3. Check if top two matches are too close
  if (score - runnerUp < THRESHOLDS.ambiguousGap && runnerUp > 0.50) {
    return { status: "ambiguous", item: item, score: score };
  }

  // 4. Otherwise, it's correct
  return { status: "correct", item: item, score: score };
}
