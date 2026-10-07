# Intelligent Answer Key QA Chatbot

## 1. Overview

**Course:** CS for Intelligent Systems  
**Algorithm:** Levenshtein Distance — measures how many single-character edits (insertions, deletions, substitutions) are needed to turn one string into another. The chatbot uses similarity scores derived from this algorithm to match a user's typed answer against a list of 11 computer hardware items and their known aliases.

---

## 2. Team Roles

| Role | Member | Responsibility |
|------|--------|---------------|
| A | Lead / Assigner | Project coordination, task assignment, integration |
| B | Reviewer / QA | Code review, test cases in `tests/test-cases.md`, PR approval |
| C | Engine Dev | `levenshtein.js`, `matcher.js`, `decision.js`, `engine/index.js` |
| D | Data & Preprocessing Dev | `data.js` (answer key + aliases), `preprocess.js` |
| E | UI Dev | `chat.js`, `main.js`, `style.css` |
| F | Docs Dev | `docs/README.md`, flowchart, individual reflections |

---

## 3. Agreed Interface

All modules must conform to the following signatures. The UI layer **never** calls levenshtein or match directly.

```js
// src/engine/preprocess.js
preprocess(text: string) -> string

// src/engine/levenshtein.js
levenshtein(a: string, b: string) -> number   // edit distance
similarity(a: string, b: string) -> number    // 0..1 normalized score

// src/engine/matcher.js
match(cleanText: string) -> { item, alias, score, runnerUp }

// src/engine/decision.js
decide(result: object) -> { status: "correct" | "ambiguous" | "unrecognized" | "empty", item, score }

// src/engine/index.js  (public API consumed by the UI)
answer(text: string) -> { status, item, score }
```

---

## 4. Rules

- **Separation of concerns:** `src/engine/` modules must never touch the DOM. `src/ui/` modules must never compute similarity scores.
- **Branching:** Work on a dedicated feature branch (e.g., `feat/engine-levenshtein`). Open a Pull Request with `Closes #N` referencing the relevant issue.
- **Reviews:** The PR reviewer must **not** be the author. Use the pull request template in `.github/pull_request_template.md`.
- **Commit format:** Use conventional commit prefixes — `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

---

## 5. How to Run

> ES modules (`type="module"`) require a local HTTP server — they **cannot** be opened directly via `file://`.

**Option A — VS Code Live Server (recommended)**  
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).  
2. Right-click `index.html` → **Open with Live Server**.  
3. The app opens at `http://127.0.0.1:5500`.

**Option B — Python**  
```bash
python -m http.server 5500
# then open http://localhost:5500
```

**Deployment:** Push `main` to GitHub and enable **GitHub Pages** (source: root, branch: `main`).

---

## 6. Answer Key (11 Items)

| # | Item |
|---|------|
| 1 | CPU |
| 2 | Motherboard |
| 3 | RAM |
| 4 | Storage Drive (SSD/HDD) |
| 5 | PSU |
| 6 | GPU |
| 7 | Computer Case (Chassis) |
| 8 | Cooling System (CPU Cooler / Case Fans) |
| 9 | Monitor |
| 10 | Keyboard |
| 11 | Mouse |
