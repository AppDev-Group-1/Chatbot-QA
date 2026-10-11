// OWNER: Member D | Text cleaning
// TODO: lowercase, strip punctuation/symbols, collapse whitespace, trim
export function preprocess(text) {
  let clean = String(text ?? "").toLowerCase();

  // 1. Replace hyphens with spaces (to handle "random-access")
  clean = clean.replace(/-/g, ' ');

  // 2. Remove punctuation/symbols and normalize whitespace
  clean = clean.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

  // 3. Remove stopwords (handles long sentences like "It is the brain of the computer")
  const stopwords = [
    "it", "is", "the", "a", "an", "of", "in", "on", "to", "and", "or", "that", "this", "are", "was", "were", "for", "with", "as",
    // NEW GENERIC WORDS TO IGNORE:
    "device", "component", "hardware", "general", "purpose", "runs", "repeatedly",
    "temperature", "temperatures"
  ];
  let words = clean.split(" ").filter(w => w && !stopwords.includes(w));
  clean = words.join(" ");

  return clean;
}
