// OWNER: Member C | Pure algorithm, no DOM, no data imports
// TODO: levenshtein(a, b) -> number ; similarity(a, b) -> 0..1
export function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const left = a.length >= b.length ? a : b;
  const right = a.length >= b.length ? b : a;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  let current = new Array(right.length + 1);

  for (let i = 1; i <= left.length; i++) {
    current[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    [previous, current] = [current, previous];
  }

  return previous[right.length];
}

export function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0; // Both strings are empty
  return 1 - (levenshtein(a, b) / maxLen);
}
