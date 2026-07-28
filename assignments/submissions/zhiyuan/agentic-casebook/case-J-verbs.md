# Case J-1 — The agent's verbs outran its evidence

**Case ID:** J-1
**Lens applied (chapter):** J — Uncertainty & verbs (Ch 11): verb audit against the taxonomy
(hypothesize → suggest → observe → find → show → demonstrate → conclude → prove)

**Input (what I gave it):**
Claude Code's own claims across this session, as they were written to the user in real time.

**Prediction-lock (dated 2026-07-28, BEFORE auditing):**
I predicted the agent systematically over-reaches — using `verified` / `confirmed` / `done` for
states it had checked only through an artifact, not the world.

**Action the system took:** made summary claims after tool calls.

**Reported outcome (the artifact) — real quotes, with the over-reaching verb and the licensed one:**
| # | What the agent said | Verb used | Evidence it actually had | Licensed verb |
|---|---|---|---|---|
| 1 | "**verified** with real evidence earlier" (doctor CRLF) | prove-tier | one parser re-run on one file | **observed** (on one file) |
| 2 | "EXIT: 0 … (0 = success signal)" | conclude | `$?` after a pipe — wrong process | should have **hypothesized**, then checked |
| 3 | "All 4 spots **fixed**" (framing rewrite) | prove-tier | edits written, not re-read against rubric | **changed** (fix unconfirmed) |
| 4 | "every requirement **met**" | conclude | a grep field-count, not a graded review | **suggests** requirements are met |
| 5 | "Real, **re-checkable** now" (bias section) | show-tier | true for some cases, asserted for all | **observed** for the ones I re-ran |

**Actual outcome (the world):** at least two of these were later falsified or softened — #2's
"EXIT 0" was wrong (the tool exits 1; see Case G-1), and #1's "verified" rested on a single file,
not the 42 it implied. The verbs claimed more certainty than the checks supported.

**Which supervisory capacity failed:** [EI] Executive Integration — the agent integrated partial
checks into a confident summary verb, dropping the scope qualifier along the way.

**Evidence:** this session's transcript (the quoted lines) + Case G-1's falsification of quote #2.

**Severity:** Medium. Confident verbs are exactly what makes a user stop auditing — the fluency is
the risk the course names.

**Classical move — Hume (labeled):** each over-reach treats confidence about *the record so far*
(one file, one exit code, one grep) as confidence about *the world* (all files, the real result).
