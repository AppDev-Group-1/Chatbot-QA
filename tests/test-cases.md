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

## Definition and Mixed-Clue Checks

These paraphrases check whether the matcher recognizes useful evidence without requiring the full stored wording. A prompt with clues for multiple components should be ambiguous rather than guessed.

| Input (User Query) | Expected Status | Expected Matched Item |
| :--- | :--- | :--- |
| `"The component responsible for executing program instructions and performing arithmetic and logical operations."` | `correct` | Central Processing Unit (CPU) |
| `"The main circuit board connects the processor, memory, storage, and peripherals."` | `correct` | Motherboard |
| `"Volatile memory temporarily holds data and instructions needed by active programs."` | `correct` | Random Access Memory (RAM) |
| `"A nonvolatile device stores the operating system, applications, and files persistently, retaining them without power."` | `correct` | Storage Drive (SSD / HDD) |
| `"It converts wall AC current to DC voltages for computer components."` | `correct` | Power Supply Unit (PSU) |
| `"A processor specialized to render images and video by performing parallel computations."` | `correct` | Graphics Processing Unit (GPU) |
| `"An enclosure protects and organizes the internal parts of a computer."` | `correct` | Computer Case (Chassis) |
| `"Fans and heat sinks remove heat to keep computer temperatures safe."` | `correct` | Cooling System (CPU Cooler / Case Fans) |
| `"An output screen presents visual information from a computer."` | `correct` | Monitor |
| `"A set of keys used to enter data and commands."` | `correct` | Keyboard |
| `"A handheld pointing device translates movement into cursor movement and clicks."` | `correct` | Mouse |
| `"A peripheral that sends signals to the computer based on the user's hand movements and button presses."` | `correct` | Mouse |
| `"A human-interface peripheral that converts physical movement and clicks into digital signals the operating system interprets as pointer and selection commands."` | `correct` | Mouse |
| `"The CPU and RAM work with a storage drive."` | `ambiguous` | Random Access Memory (RAM), nearest only |
| `"A printer is an output device that produces physical copies of documents."` | `unrecognized` | None |
