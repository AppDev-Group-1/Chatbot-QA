// OWNER: Member C | Threshold and status logic
// TODO: calibrate thresholds using tests/test-cases.md results
export const THRESHOLDS = {
  correct: 0.66,       // Best component must have a clear share of the evidence
  ambiguousGap: 0.25,  // Similar top scores indicate mixed or unclear clues
  minLength: 2,        // Inputs shorter than 2 chars are ambiguous
  minScore: 0.55       // Reject weak single-component evidence
};

export function decide(result) {
  const { item, score, runnerUp, inputLength } = result;

  // 1. Short input -> Ambiguous (e.g., "ca", "un")
  if (inputLength <= THRESHOLDS.minLength && score < THRESHOLDS.correct) {
    return { status: "ambiguous", item: null, score: 0.50 };
  }

  if (!item) {
    return { status: "unrecognized", item: null, score: score > 0 ? score : 0.17 };
  }

  // Preserve uncertainty when the prompt contains comparable evidence for multiple items.
  if (runnerUp >= 0.35 && score - runnerUp < THRESHOLDS.ambiguousGap) {
    return { status: "ambiguous", item, score };
  }

  // Reject weak single-item evidence, such as an unrelated word with one fuzzy overlap.
  if (score < THRESHOLDS.minScore) {
    return { status: "unrecognized", item: null, score };
  }

  if (score < THRESHOLDS.correct) {
    return { status: "unrecognized", item: null, score: score };
  }

  return { status: "correct", item: item, score: score };
}
