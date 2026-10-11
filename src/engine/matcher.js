// OWNER: Member C | Score cleaned input against every alias of every item
// TODO: return the best match { item, alias, score } plus the runner-up score
import { similarity } from "./levenshtein.js";
import { ANSWER_KEY } from "./data.js";
import { preprocess } from "./preprocess.js";

const SHORT_ACRONYMS = new Set(["cpu", "gpu", "ram", "psu", "ssd", "hdd"]);

const preparedItems = ANSWER_KEY.map(item => ({
  item,
  aliases: item.aliases.map(alias => {
    const cleanAlias = preprocess(alias);
    return { alias, cleanAlias };
  }),
  terms: [...new Map(item.aliases.flatMap(alias =>
    preprocess(alias).split(" ").filter(Boolean).map(term => [term, alias])
  ))].map(([term, alias]) => ({ term, alias }))
}));

const termItemCounts = new Map();
for (const { terms } of preparedItems) {
  for (const { term } of terms) {
    termItemCounts.set(term, (termItemCounts.get(term) ?? 0) + 1);
  }
}

const termWeights = new Map(
  [...termItemCounts].map(([term, itemCount]) => [
    term,
    1 + Math.log((preparedItems.length + 1) / (itemCount + 1))
  ])
);

function tokenSimilarity(left, right) {
  if (left === right) return 1;
  if (left.length < 4 || right.length < 4) return 0;

  const score = aliasTypoSimilarity(left, right);
  return score >= 0.78 ? score : 0;
}

function aliasTypoSimilarity(left, right) {
  if (left.length !== right.length || left.length < 3) return similarity(left, right);

  const differences = [];
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) differences.push(index);
  }

  if (
    differences.length === 2 &&
    differences[1] === differences[0] + 1 &&
    left[differences[0]] === right[differences[1]] &&
    left[differences[1]] === right[differences[0]]
  ) {
    return 1 - 1 / left.length;
  }

  return similarity(left, right);
}

export function match(cleanText) {
  const exactMatches = preparedItems.flatMap(({ item, aliases }) =>
    aliases
      .filter(({ cleanAlias }) => cleanText === cleanAlias)
      .map(({ alias }) => ({ item, alias }))
  );

  if (exactMatches.length > 0) {
    const exactItems = [...new Set(exactMatches.map(result => result.item))];
    const best = exactMatches[0];
    const runnerUpItem = exactItems.find(item => item !== best.item) ?? null;
    return {
      item: best.item,
      alias: best.alias,
      score: runnerUpItem ? 0.5 : 1,
      runnerUp: runnerUpItem ? 0.5 : 0,
      runnerUpItem,
      inputLength: cleanText.length
    };
  }

  if (!cleanText.includes(" ")) {
    const typoCandidates = preparedItems.flatMap(({ item, aliases }) =>
      aliases
        .map(({ alias, cleanAlias }) => {
          const compactAlias = cleanAlias.replace(/\s+/g, "");
          const shortAcronymTypo = SHORT_ACRONYMS.has(compactAlias) && cleanText.length === 3;
          return {
            item,
            alias,
            score: aliasTypoSimilarity(cleanText, compactAlias),
            minimumScore: shortAcronymTypo ? 2 / 3 : 0.75
          };
        })
        .filter(candidate => candidate.score >= candidate.minimumScore)
    );
    const bestByItem = new Map();
    for (const candidate of typoCandidates) {
      const current = bestByItem.get(candidate.item);
      if (!current || candidate.score > current.score) bestByItem.set(candidate.item, candidate);
    }

    const rankedTypos = [...bestByItem.values()].sort((left, right) => right.score - left.score);
    if (rankedTypos.length > 0) {
      const [best, runnerUp] = rankedTypos;
      return {
        item: best.item,
        alias: best.alias,
        score: best.score,
        runnerUp: runnerUp?.score ?? 0,
        runnerUpItem: runnerUp?.item ?? null,
        inputLength: cleanText.length
      };
    }
  }

  const evidence = new Map(preparedItems.map(({ item }) => [item, { score: 0, alias: null, strongestTerm: 0 }]));
  let totalEvidence = 0;
  let matchedTokenCount = 0;

  for (const inputToken of new Set(cleanText.split(" ").filter(Boolean))) {
    let tokenWasMatched = false;

    for (const { item, terms } of preparedItems) {
      let bestTermEvidence = 0;
      let bestTermAlias = null;
      for (const { term, alias } of terms) {
        const score = tokenSimilarity(inputToken, term);
        if (score === 0) continue;

        const termEvidence = score ** 2 * termWeights.get(term);
        if (termEvidence > bestTermEvidence) {
          bestTermEvidence = termEvidence;
          bestTermAlias = alias;
        }
      }

      if (bestTermEvidence > 0) {
        tokenWasMatched = true;
        const itemEvidence = evidence.get(item);
        itemEvidence.score += bestTermEvidence;
        if (bestTermEvidence > itemEvidence.strongestTerm) {
          itemEvidence.alias = bestTermAlias;
          itemEvidence.strongestTerm = bestTermEvidence;
        }
        totalEvidence += bestTermEvidence;
      }
    }

    if (tokenWasMatched) matchedTokenCount++;
  }

  if (totalEvidence === 0) {
    return { item: null, alias: null, score: 0, runnerUp: 0, runnerUpItem: null, inputLength: cleanText.length };
  }

  const rankedCandidates = [...evidence]
    .map(([item, result]) => ({ item, ...result }))
    .sort((left, right) => right.score - left.score);
  const [best, runnerUp] = rankedCandidates;
  const evidenceCoverage = Math.min(1, matchedTokenCount / 2);
  const topEvidence = best.score + runnerUp.score;
  const confidence = best.score / topEvidence * evidenceCoverage;
  const runnerUpConfidence = runnerUp.score / topEvidence * evidenceCoverage;

  return {
    item: best.score > 0 ? best.item : null,
    alias: best.alias,
    score: confidence,
    runnerUp: runnerUpConfidence,
    runnerUpItem: runnerUp.item,
    inputLength: cleanText.length
  };
}
