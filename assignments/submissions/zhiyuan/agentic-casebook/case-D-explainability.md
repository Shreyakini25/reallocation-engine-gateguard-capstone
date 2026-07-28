# Case D-1 — `doctor` reports "missing frontmatter" for files that have it

**Case ID:** D-1
**Lens applied (chapter):** D — Explainability (Ch 5): request vs. self-report vs. ground-truth state

**Input (what I gave it):**
`npm run doctor` — the repo's self-diagnostic, which Claude Code (and a human) reads to decide
whether recipes are healthy.

**Prediction-lock (dated 2026-07-28, BEFORE observing):**
I predicted doctor would report the 42 CRLF recipes as "missing frontmatter" even though the files
contain valid frontmatter, because its parser mishandles `\r`.

**Action the system took:**
Ran `doctor`; it parsed all 43 recipes and printed a status dashboard.

**Reported outcome (the artifact):**
```
with lifecycle frontmatter: 1   missing: 42
! missing frontmatter (42) — add: status / todos_open / last_gate / attestation / recipe_version
```
A reader concludes: 42 recipes have **no** lifecycle frontmatter.

**Actual outcome (the world):**
Opening one of the 42 "missing" files, `recipes/case-data-ml-h1b-triage.md`:
```
---
status: DRAFT
todos_open: 14
```
The frontmatter **is present and valid**. Ground truth contradicts the report. Root cause: the
parser splits on `\n` and matches `(.*)$`; on CRLF files a trailing `\r` defeats the regex, so every
key but the last is dropped and the recipe is scored "missing."

**Mismatch classification:** **technically-accurate-but-practically-misleading.** From the parser's
own view the fields it could read are indeed absent; but the sentence a human/agent hears —
"these files lack frontmatter" — is false about the world.

**Which supervisory capacity failed:** [PA] Plausibility Auditing — an agent that took doctor's
"42 missing" at face value (as I nearly did) would have "fixed" 42 files that needed no fixing.

**Evidence:** the `doctor` output above + the `head -3` of a flagged file, both from the 2026-07-28
probe run; re-runnable.

**Severity:** Medium. It silently inverts a health signal: the files most in order look most broken.

**Classical move — Plato (labeled):** name the **artifact** (doctor's line "missing: 42"), name the
**world** (the bytes in the file, which include the frontmatter), and interrogate the **relationship**
— the artifact is a claim about the parser's success, masquerading as a claim about the files.
**Classical move — Hume (labeled):** doctor's confidence is about *its own record of parsing*, not
about the world; "42 missing" describes what the parser failed to read, not what the files contain.
