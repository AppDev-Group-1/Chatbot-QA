// OWNER: Member C | Score cleaned input against every alias of every item
// TODO: return the best match { item, alias, score } plus the runner-up score
import { similarity } from "./levenshtein.js";
import { ANSWER_KEY } from "./data.js";
import { preprocess } from "./preprocess.js";

export function match(cleanText) {
  let bestItem = null;
  let bestAlias = null;
  let bestScore = -1;
  let runnerUpScore = -1;
  let runnerUpItem = null;

  const inputWords = cleanText.split(" ");

  for (const item of ANSWER_KEY) {
    for (const alias of item.aliases) {
      const cleanAlias = preprocess(alias);

      // 1. Base Levenshtein Score
      let score = similarity(cleanText, cleanAlias);

      // 2. Word Overlap Bonus (Replaces aggressive substring boost)
      const aliasWords = cleanAlias.split(" ").filter(w => w.length > 2); // Ignore tiny words
      let matchedWords = 0;

      for (const w of aliasWords) {
        if (inputWords.includes(w)) matchedWords++;
      }

      if (matchedWords > 0) {
        // Boost based on HOW MANY words matched. 
        // 1 word = 0.73, 2 words = 0.81, 3 words = 0.89 (capped at 0.98)
        const overlapScore = Math.min(0.98, 0.65 + (matchedWords * 0.08));
        score = Math.max(score, overlapScore);
      }

      // 3. Track best and runner-up
      if (score > bestScore) {
        runnerUpScore = bestScore;
        runnerUpItem = bestItem;
        bestScore = score;
        bestItem = item;
        bestAlias = alias;
      } else if (score > runnerUpScore && item !== bestItem) {
        runnerUpScore = score;
        runnerUpItem = item;
      }
    }
  }

  return {
    item: bestItem,
    alias: bestAlias,
    score: bestScore,
    runnerUp: runnerUpScore,
    runnerUpItem: runnerUpItem,
    inputLength: cleanText.length
  };
}
