# Worked Run — case-cv-integrity-backend-h1b (2026-07-06)

Every block below is pasted terminal output from real executions on 2026-07-06 (npm's `> script` preamble lines trimmed; in the live-run blocks of §4 the achievement text and metrics inside flag excerpts are masked to `[…]` because they quote my real résumé — flags, counts, paths, and exit codes untouched; nothing else edited). Machine: macOS, Node v26.4.0.

## 0 — Toolchain (per the assignment's "Before You Start")

```
$ npm run verify
conformance: 131 files (75 md · 30 py · 23 js · 1 sh · 1 yaml · 1 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
✓ manifest check passed (4 warnings)
```

Environment note, honestly: the first `verify` failed on `metadata.yaml` with `ModuleNotFoundError: No module named 'yaml'` — my Python lacked `pyyaml`. Installed it; re-ran; green. An environment defect, not a repo defect, but it *was* the first thing the toolchain caught.

```
$ npm run doctor        # required before pushing; key lines
PRIVACY (no personal data committed)
  ✓ no private/PII paths are tracked
SUMMARY
  environment: ✓ runnable
```

(An earlier doctor run flagged my own recipe — `todos_open` declared 3 while the body contained 5 `[TODO` substrings, because the status note's *prose* mentioned the literal marker twice. Reworded the prose; doctor now counts 3 = 3. The honesty note was tripping the honesty checker.)

## 1 — Inputs

- **Sample base:** `data/examples/cv-integrity/sample-base-cv.json` — fictional attested backend-engineer record (tracked fixture). Contains "mean time to detection" (abbreviation anchor) and "dashboards" (substring trap).
- **Sample variant:** `data/examples/cv-integrity/sample-variant-backend.md` — LLM-tailored with planted drift (documented in the fixture README): AWS service expansion, `Cloud SQL`, JD-pulled `Kafka`, fabricated `etcd`.
- **Live base:** `private/resume.json` — my real attested record from the setup exercise (gitignored; never committed).
- **Live variant:** `private/variants/cv-backend.tex` — a real LLM-tailored variant of my résumé (gitignored).

## 2 — Sample run: drifted variant (expect 8 flags, exit 1)

```
$ npm run resumes:integrity -- --base data/examples/cv-integrity/sample-base-cv.json \
    --variant data/examples/cv-integrity/sample-variant-backend.md \
    --json logs/cv-integrity-2026-07-06.json --report reports/generated/cv-integrity-2026-07-06.md --mode sample
cv-integrity-check v0.1.0 · mode=sample
base:    data/examples/cv-integrity/sample-base-cv.json
variant: data/examples/cv-integrity/sample-variant-backend.md
checked 73 candidate entities · anchored 22
OPEN FLAGS: 8 — zero word-boundary matches in the base. Decide each: DROP | PROMOTE.
  [ FLAG ] Cloud SQL  ->  - Built Terraform CI/CD on GCP (Cloud SQL, Pub/Sub) with least-privilege IAM; ran workloads on Kubernetes w...
  [ FLAG ] CloudWatch  ->  - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker...
  [ FLAG ] EC2  ->  - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker...
  [ FLAG ] etcd  ->  - Built Terraform CI/CD on GCP (Cloud SQL, Pub/Sub) with least-privilege IAM; ran workloads on Kubernetes w...
  [ FLAG ] Kafka  ->  - Engineered a workflows platform on GCP Pub/Sub processing 500K+ events/sec (backpressure, ordering keys, ...
  [ FLAG ] Lambda  ->  - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker...
  [ FLAG ] RDS  ->  - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker...
  [ FLAG ] S3  ->  - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker...
agent log:    logs/cv-integrity-2026-07-06.json
human report: reports/generated/cv-integrity-2026-07-06.md
```

Exit code, captured without pipes: `1` (gate blocked — render must not run). What was **not** flagged matters equally: `MTTD` anchored via abbreviation-initials to "mean time to detection" in the base; the `Cloud & DevOps` header and `SWE` were stoplisted (headers and role-family abbreviations are not claims); `AWS`, `IAM`, `Pub/Sub`, `ClickHouse` anchored because they are in the base.

## 3 — Sample run: clean re-emphasis variant (expect 0 flags, exit 0)

```
$ npm run resumes:integrity -- --base data/examples/cv-integrity/sample-base-cv.json \
    --variant data/examples/cv-integrity/sample-variant-clean.md --mode sample
cv-integrity-check v0.1.0 · mode=sample
base:    data/examples/cv-integrity/sample-base-cv.json
variant: data/examples/cv-integrity/sample-variant-clean.md
checked 72 candidate entities · anchored 21
OPEN FLAGS: 0 — every named entity in the variant is anchored to the attested base.
```

Exit: `0`. Rewording and reordering alone do not trip the gate — re-emphasis is allowed by design.

## 4 — Live run: my real attested base vs my real tailored variant

```
$ node scripts/resumes/cv-integrity-check.mjs --base private/resume.json \
    --variant private/variants/cv-backend.tex \
    --json private/reports/cv-integrity-live-2026-07-06.json \
    --report private/reports/cv-integrity-live-2026-07-06.md --mode live
cv-integrity-check v0.1.0 · mode=live
base:    private/resume.json
variant: private/variants/cv-backend.tex
checked 77 candidate entities · anchored 35
OPEN FLAGS: 3 — zero word-boundary matches in the base. Decide each: DROP | PROMOTE.
  [ FLAG ] ClickHouse  ->  \resumeItem{Led migration of a […] data store from MongoDB to ClickHouse, […]
  [ FLAG ] ETL  ->  \resumeItem{\textbf{Databases \& Data:} ClickHouse ([…] migration […]), […]
  [ FLAG ] GraphQL  ->  \resumeItem{[…] rule engine in Python and Java behind REST[…]
agent log:    private/reports/cv-integrity-live-2026-07-06.json
human report: private/reports/cv-integrity-live-2026-07-06.md
```

Exit (captured without pipes): `1`. Both live artifacts were written into `private/` (never committed); `git status --porcelain private/` confirms nothing tracked. What is quoted above: flagged technology tokens and the tool's own 110-character truncations of achievement text — no names, employers, dates, or contact details.

**Decisions on the live flags.** `ClickHouse` → **PROMOTE**: this is true experience (present in my original source CV) that my attested base had *accidentally dropped during extraction* — the mode's most valuable live finding was a hole in my own attested record, not a lie in the variant. I applied the promote for real (highlight + skill restored to `private/resume.json`, `attested_date` bumped with a note) and re-ran:

```
$ node scripts/resumes/cv-integrity-check.mjs --base private/resume.json \
    --variant private/variants/cv-backend.tex --mode live
cv-integrity-check v0.1.0 · mode=live
base:    private/resume.json
variant: private/variants/cv-backend.tex
checked 77 candidate entities · anchored 36
OPEN FLAGS: 2 — zero word-boundary matches in the base. Decide each: DROP | PROMOTE.
  [ FLAG ] ETL  ->  \resumeItem{\textbf{Databases \& Data:} ClickHouse ([…] migration […]), […]
  [ FLAG ] GraphQL  ->  \resumeItem{[…] rule engine in Python and Java behind REST[…]
```

Exit (captured without pipes): `1`. The promote round-trips — ClickHouse anchored (35 → 36), flag gone. `ETL` and `GraphQL` → **left OPEN deliberately**: they are exactly the bounded human judgments the mode exists to force, and I record them as undecided rather than back-fill a tidy answer. Consequence, per the recipe's stop conditions: **this variant's render gate stays blocked (exit 1) until I decide.** That is the mode working, not failing.

### 4c — After the metadata-corpus fix, the live re-run got worse — honestly, better

A hostile review (see the AI-use disclosure) demonstrated a false PASS on the sample fixture: the corpus walk ingested the base's `attestation_note`, so a note that merely *mentions* a claim re-anchors it. I fixed the walk to exclude metadata (`attestation`, `_`-prefixed keys) and re-ran live:

```
$ node scripts/resumes/cv-integrity-check.mjs --base private/resume.json \
    --variant private/variants/cv-backend.tex --mode live
cv-integrity-check v0.1.0 · mode=live
base:    private/resume.json
variant: private/variants/cv-backend.tex
checked 77 candidate entities · anchored 32
OPEN FLAGS: 6 — zero word-boundary matches in the base. Decide each: DROP | PROMOTE.
  [ FLAG ] Airflow  ->  […masked achievement text…]
  [ FLAG ] ETL  ->  […masked achievement text…]
  [ FLAG ] GraphQL  ->  […masked achievement text…]
  [ FLAG ] Jenkins  ->  […masked achievement text…]
  [ FLAG ] Kafka  ->  […masked achievement text…]
  [ FLAG ] Spark  ->  […masked achievement text…]
```

Exit (captured without pipes): `1`. **Four new flags — `Kafka`, `Spark`, `Airflow`, `Jenkins` — are precisely the skills my setup-exercise attestation removed as aspirational** ("not backed by hands-on production experience"). The old tailored variant still claims all four, and until the fix, the attestation note *naming the removals* had been silently re-anchoring them: the reviewer's predicted false PASS, live on my own résumé. Decisions: all four → **DROP** (my own attestation already ruled on them). `ETL`, `GraphQL` → still open; render gate stays blocked.

## 5 — The existing repo script, run for real (render step the gate protects)

```
$ npm run resumes:pdf -- --all
resumes/aarav-patel-cv.md -> output/resumes/aarav-patel-cv.pdf (2 pages)
resumes/maya-sehgal-cv.md -> output/resumes/maya-sehgal-cv.pdf (2 pages)
resumes/priya-nair-cv.md -> output/resumes/priya-nair-cv.pdf (2 pages)
resumes/rohan-desai-cv.md -> output/resumes/rohan-desai-cv.pdf (2 pages)
```

(First attempt failed: Playwright's headless Chromium was not installed — `npx playwright install chromium`, then green. Pasted result is the successful re-run on the repo's four tracked sample CVs.)

## 6 — Verified vs. inferred (line by line)

| Item | Verified (record/script) or Inferred (human/model judgment) |
|---|---|
| The flag sets (8 sample · 3 live pre-metadata-fix · 6 live after) and anchored lists | **Verified** — deterministic word-boundary membership vs the base corpus; reproduces identically on re-run; no model call exists in the tool |
| `MTTD` anchoring | **Verified** — initials expansion against base text "mean time to detection" |
| `etcd` catch and `rds`/"dashboards" non-anchor | **Verified** — demonstrated in runs 2 and the break table below |
| Exit codes 0 / 1 / 2 | **Verified** — captured directly (`echo $?`), no pipes |
| DROP vs PROMOTE on each flag | **Inferred — human judgment**, by design (P1); the tool refuses to make it |
| "ClickHouse is true experience" | **Inferred — my attestation**, cross-checked against my source CV text, then written into the base |
| Whether a rewording overstates ("built" → "led") | **Not checked** — outside the deterministic boundary; proposed as a labeled, non-gating model assist `[TODO: DEV]` |

## 7 — Attestation

- Recipe: case-cv-integrity-backend-h1b v0.1.0
- By: Laksh Dhamija · 2026-07-06 (refreshed same day: the post-attestation hostile-review fixes below edited the script, which per SNICKERDOODLE voids a prior attestation — every row re-run against the final code; pre-fix crash output preserved in `prefix-break-evidence.txt`)

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | 131 files, all conform (after installing pyyaml) | conformance green before any recipe work |
| Sample run, drifted variant | 8 flags (EC2, S3, Lambda, RDS, CloudWatch, Cloud SQL, Kafka, etcd); exit 1 | exactly the planted drift, and only it |
| Sample run, clean variant | 0 flags; exit 0 | re-emphasis passes the gate |
| Live run, real base vs real variant | 3 flags (ClickHouse, ETL, GraphQL); exit 1 | small real flag set; render blocked pending decisions |
| **Break: `--base` pointing at a missing file** | **First: `ReferenceError: Cannot access 'candidates' before initialization`, exit 1 — a real crash** | designed stop: exit 2 with a STOP message |
| Same break, after the fix | `STOP: base record not found … Refusing to score rather than guess (stop condition, exit 2).` | graceful stop, exit 2 |
| Break: base with `attestation.attested: false` | `STOP: … an unattested base is the agent's guess about your past, not a source of truth`; exit 2 | refuse to anchor against an unattested record |
| Break: empty variant file | `STOP: variant … is empty — nothing to check`; exit 2 | no false PASS on empty input |
| Substring trap: `grep -c "dashboards" sample-base-cv.json` → `1`, then drifted run | `RDS` still flagged despite `rds` appearing inside "dashboards" in the base | word-boundary matching holds |
| **Break: base JSON with the attestation block deleted** | **First: ran to completion, exit 1 — the guard only tested the block if it existed** | designed stop: exit 2 |
| Same break, after the fix | `STOP: … has no attestation block …`; exit 2 | refuse to anchor without an attestation |
| **Hostile variant claiming `CRM` (fabricated) and `Salesforce` (novel single-capital tool)** | **First: `CRM` passed as anchored (exit 0) — initials were matched across field boundaries.** After scoping initials to a single base field/line: `CRM` flags; `Salesforce` still passes unflagged | `CRM` must flag; `Salesforce` passing confirms the stated dictionary false-negative boundary |
| Regression after both fixes: drifted + clean sample runs | identical counts and flags (73/22/8 exit 1 · 72/21/0 exit 0); `MTTD` still anchors within its single highlight | fixes change no legitimate result |
| Markdown base path: `.md` file as base, itself as variant | 72/21/0, exit 0 — and it ran **without any attestation check** | works, but confirms the attestation gate is JSON-only (documented in the recipe) |
| **Hostile: base `attestation_note` amended to mention "Kafka"; variant claims Kafka** | **First: Kafka passed as anchored, exit 0 — the note documenting a claim re-anchored it.** After excluding metadata from the corpus: Kafka flags | a note ABOUT the record must never anchor the record |
| Live re-run after the metadata fix | 6 flags — the 4 skills my setup-exercise attestation had *removed* (Kafka, Spark, Airflow, Jenkins) surfaced; they had been silently anchored by the note naming their removal | the false PASS was real on my own data, not hypothetical |
| **Break: a directory passed as `--base`** | **First: raw `EISDIR` stack trace, exit 1 — a crash wearing the gate-open code** | any unexpected error must exit 2; fixed (global handlers), re-tested: STOP, exit 2 |
| Break: `--mode banana` | `STOP: --mode must be "sample" or "live" …`; exit 2 | an unrecognized mode must not run as if approved |
| Break: live mode with `--json logs/leak.json` (outside `private/`) | `STOP: live mode requires --json to write inside private/ …`; exit 2 — **first fix attempt still wrote the stop-log to the refused path; caught, fixed; now nothing is written** | the tool must not violate the privacy contract it is enforcing |
| Regression after all fixes | sample runs identical (73/22/8 exit 1 · 72/21/0 exit 0); CRM still flags; MTTD still anchors; all prior breaks still exit 2 | fixes change no legitimate result |
| `python3 -m json.tool logs/cv-integrity-2026-07-06.json` | parses | agent log is valid JSON (P5 artifact) |
| `npm run resumes:pdf -- --all` | 4 PDFs rendered from the repo's sample CVs | the render step the gate protects actually runs |

### Did not test
- LaTeX-heavy variants beyond my own one file — escaping oddities (`\&`, custom macros) could confuse excerpt extraction (not the matching itself).
- Within-segment acronym chance-anchoring: initials are now scoped to a single base field/line, but a short acronym could still coincidentally match initials inside one long sentence. Not exhaustively probed; stated in the recipe.
- Non-English text, very large files, or concurrent runs.

### Broke during testing, fixed
- The three stop-condition paths all crashed with `ReferenceError: Cannot access 'candidates' before initialization` (temporal dead zone: the early-exit logger referenced a `const` declared later; the `typeof` guard I wrote does not protect against TDZ). Wrong exit code (1, crash) instead of the designed graceful 2. Fixed by hoisting a mutable `candidatesChecked` counter set after extraction; all three breaks then exited 2 with honest STOP messages, and the two sample runs regressed clean (1 and 0). The deliberate break attempt found a real bug — the attestation format earned its keep.
- A base JSON with **no attestation block at all** bypassed the attestation stop entirely (the guard only inspected the block when it existed) and ran to completion. Found in a post-attestation hostile review; fixed with an explicit missing-block stop condition; re-tested to exit 2; the `attested: false` and valid-base paths re-tested unchanged.
- The acronym anchor built one initials string over the **entire** base corpus, so words from unrelated fields juxtaposed and a fabricated `CRM` chance-anchored (passed as verified, exit 0). Same hostile review; fixed by scoping initials runs to a single base field/line; `CRM` now flags, `MTTD` still anchors, and both sample runs reproduce identical counts.
- **Metadata-corpus pollution — the worst one.** The corpus walk ingested `attestation_note`/`_note` strings, so a note that *mentions* a claim anchored it. A second, independent hostile review demonstrated the false PASS on the fixture; excluding metadata from the walk then revealed the live impact: four skills my setup-exercise attestation had removed as aspirational (Kafka, Spark, Airflow, Jenkins) had been silently re-anchored — by the note documenting their removal — in every prior live run. Fixed; regression-tested; live re-run now flags all four.
- An unhandled crash (directory as `--base` → `EISDIR`) exited **1**, the same code that means "flags open" — a crash wearing the gate's uniform. Fixed with global handlers: any unexpected error now exits 2.
- The first version of the live-path guard refused to write outside `private/` — and then `hardStop` wrote the stop-log to the refused path anyway. Caught in re-testing; the stop-log now respects the same rule it enforces.
- Cosmetic: the agent log's `run_id` used the UTC date and drifted one day ahead of the artifact's local-date filename after ~8pm; now derived from the local date.

## 8 — Reflection

**What went well.** The gate behaves as designed end-to-end: planted drift caught exactly (8/8, nothing else), re-emphasis passes, stop conditions refuse rather than guess, and the two-artifact output contract (JSON for agents, Markdown for the human) fell naturally out of P5. Anchoring to the setup exercise's attested `resume.json` — including *refusing an unattested base* — made the two assignments compose into one pipeline.

**What the mode got wrong or missed.** (1) My first fixture polluted its own check — explanatory prose inside the variant file produced junk flags (`LLM`, `SWE`) and wrong excerpts; fixture hygiene is part of the mode's correctness, and I moved documentation into the fixture README. (2) The stop-condition crash above — my own "graceful refusal" paths were the buggiest code in the tool until the break attempt hit them. (3) The live run showed the check is only as good as the base: `ClickHouse` was flagged because my attested record was incomplete, not because the variant lied. The mode caught it, but it reframes the maintenance burden — the base needs re-attestation discipline, not just the variants. (4) Four more holes surfaced only under independent hostile review after I thought testing was done — the missing-attestation-block bypass, the cross-field `CRM` false-anchor, the crash that wore the gate's exit code, and worst, metadata-corpus pollution, whose impact turned out to be live: four skills my own attestation had removed were being re-anchored by the note that removed them. My break attempts had probed the paths I designed; the reviews attacked the guarantees I *claimed*. The lesson is the course's: the author's tests inherit the author's blind spots — which is also the argument for this mode existing at all.

**Next steps.** Close the three typed TODOs in order of value: `--apply-promote` (one-keystroke promotion — 6 of 8 sample flags were true-but-undocumented; if promoting is tedious the gate rots into rubber-stamping), the labeled non-gating semantic-drift assist, and dictionary provenance from a versioned external source. Then decide `ETL`/`GraphQL`, re-run to exit 0, and take the recipe to RUNNABLE-LIVE with logged gate decisions.
