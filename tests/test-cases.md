# Test Cases & Evaluation Scenarios
> Owner: Dev 2 (UI Track)

This document outlines the test cases that the Levenshtein Algorithm engine (Dev 1) must successfully pass to achieve a perfect 100/100 score based on the project rubric.

## Testing Matrix

| Input (User Query) | Expected Status | Expected Matched Item | Rubric Criterion Addressed |
| :--- | :--- | :--- | :--- |
| `"cpu"` | `correct` | Central Processing Unit (CPU) | Case invariance (1) |
| `"random-access memory"` | `correct` | Random Access Memory (RAM) | Punctuation/symbol handling (1) |
| `"  GPU  "` | `correct` | Graphics Processing Unit (GPU) | Whitespace normalization (1) |
| `"mobo"` | `correct` | Motherboard | Abbreviation/acronym mapping (2) |
| `"proccesor"` | `correct` | Central Processing Unit (CPU) | Typo tolerance / Levenshtein (2) |
| `"chasis"` | `correct` | Computer Case (Chassis) | Typo tolerance / Levenshtein (2) |
| `"display"` | `correct` | Monitor | Synonym handling (2) |
| `"toaster"` | `unrecognized` | None | Rejection of out-of-scope queries (3) |
| `"ca"` | `ambiguous` | None | Handling ambiguous/short inputs (3) |
| `""` *(empty)* | `empty` | None | Empty/whitespace input safety (3) |
