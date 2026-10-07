// OWNER: Member C | Single public entry point used by the UI
// status is one of: "correct" | "ambiguous" | "unrecognized" | "empty"
import { preprocess } from "./preprocess.js";
import { match } from "./matcher.js";
import { decide } from "./decision.js";

export function answer(text) {
  const clean = preprocess(text);
  if (!clean.trim()) return { status: "empty", item: null, score: 0 };
  return decide(match(clean));
}
