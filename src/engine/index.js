// OWNER: Member C | Single public entry point used by the UI
// status is one of: "correct" | "ambiguous" | "unrecognized" | "empty"
import { preprocess } from "./preprocess.js";
import { match } from "./matcher.js";
import { decide } from "./decision.js";
import { OUT_OF_SCOPE_SUBJECTS } from "./data.js";

export function answer(text) {
  const clean = preprocess(text);
  if (!clean.trim()) return { status: "empty", item: null, score: 0 };

  const subject = clean.replace(/^(a|an|the)\s+/, "");
  if (OUT_OF_SCOPE_SUBJECTS.some(term => subject === term || subject.startsWith(`${term} `))) {
    return { status: "unrecognized", item: null, score: 0.17 };
  }

  return decide(match(clean));
}
