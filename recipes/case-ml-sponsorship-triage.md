---
status: RUNNABLE-SAMPLE
todos_open: 8
last_gate: script-readiness
attestation: see assignments/submissions/aditibailur/worked-run.md
recipe_version: 0.2.0
---

# ML Engineering Sponsorship Triage

## Purpose

Filters ML Engineering / Data Science employers down to a ranked shortlist for an
international MS student in CS/Data Science whose OPT authorization expires within
12 months, using five signals: H-1B sponsorship history, SEC Form D funding recency,
BLS/O*NET cognitive-pivot role resilience, ATS liveness, and (proposed) live tech-stack
and GitHub/ArXiv project intelligence.

**Use this mode when:**
- OPT end date is within 12 months and applications must be prioritized ruthlessly.
- Targeting ML Engineering / Data Science roles specifically, not generic SWE.
- Deciding which companies are worth full application effort vs. which to skip.

**Do not use this mode to:**
- Evaluate a single role in depth (use `recipes/oferta.md`).
- Scrape or generate net-new job postings (use `recipes/apply.md` / `scripts/ats/scan.mjs`).

## Source Inventory

| Source | Path | Verified real? |
|---|---|---|
| H-1B / sponsorship master file | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | ✅ 30,369 rows, confirmed by direct read |
| SEC Form D processed quarters | `data/sec/form-d/processed/companies-sec-{quarter}.json` | ✅ regenerated via script, real counts below |
| BLS/O*NET compact table | `data/bls/compact/soc_occupation_compact.csv` | ✅ regenerated via script, 1,016 rows |
| Bayesian role scorer | `scripts/score/role-scorer.mjs` (`npm run score`) | ✅ run twice, reproducible |
| SEC Form D refresh script | `scripts/sec/refresh-recent-sec-quarters.py` | ✅ run, all 4 quarters processed |
| BLS/O*NET extraction script | `scripts/bls/extract-soc-occupation-table.py` | ✅ run (after installing `pandas`, `openpyxl`) |
| ATS detection script | `scripts/ats/detect-ats.py` | ✅ run against 3 real companies |
| ATS liveness checker | `scripts/ats/check-liveness.mjs` (`npm run ats:liveness`) | Not yet run against a live URL in this submission |
| Sample role-scorer input | `data/examples/ch11-roles.json` | ✅ used as scorer input |

Note: my original submission assumed a script `SCRIPTS/audit_sec_dol_h1b_data.py` existed.
It does not. The H-1B filter step below uses a direct pandas read instead — the master
CSV's real columns (`Total Approvals`, `Total Denials`, `Approval_Rate`,
`median_salary_offered`, `top_job_titles_sponsored`) are richer than what I originally
assumed (`h1b_employer`, `total_lcas` — neither column exists).

## Steps (what actually ran)

### Step 1 — H-1B sponsorship filter (real, run)
Reads the master CSV directly and filters to companies with `Total Approvals > 0`,
then narrows to companies whose `top_job_titles_sponsored` field mentions
ML/Data-Science-adjacent titles. This replaces the proposed
`scripts/lca/ml-soc-sponsorship-filter.py` [TODO: DEV] — that script does not exist
yet, but `top_job_titles_sponsored` turned out to be a workable, title-level
substitute for a SOC-code filter, discoverable only by reading the real columns.

Result: 1,552 of 30,369 companies have H-1B approvals; 150 of those have strict
ML/Data-Scientist/ML-Engineer titles in their sponsorship history.

### Step 2 — Funding recency (real, run)
`python3 scripts/sec/refresh-recent-sec-quarters.py` regenerates all four quarterly
Form D JSON files from source data.

### Step 3 — Cognitive-pivot role score (real, run — with a real gap found)
`python3 scripts/bls/extract-soc-occupation-table.py` regenerates the BLS compact
table. **Gap discovered:** `cognitive_pivot_score` is populated for detailed O*NET
sub-occupations (e.g. `15-2051.01` Business Intelligence Analysts: 3.903) but is
**blank at the parent SOC base code** for 2 of my 3 target codes (`15-2051.00` Data
Scientists, `15-1299.00` Computer Occupations NEC). Only `15-1252.00` Software
Developers has a base-code score (3.834). My original mode's claim of "~4.1/~4.3/~3.6
for all three base codes" was invented for the earlier simulation and is not supported
by the real file.

### Step 4 — Chained H-1B × Form D join (real, run — bug found and fixed)
First attempt at joining the 150 ML-titled H-1B sponsors against the most recent Form D
quarter (`2026q1-d`) returned 0 matches. Investigation showed the JSON is a dict
(`{"metadata": ..., "companies": [...]}`) with company name nested at
`company["company"]["name"]`, not a flat list keyed by `company_name` as assumed.
After correcting the join (name-normalized match), 3 real matches were found: Fiddler
Labs, Imperative Care, Surgical Safety Technologies (full output in worked-run.md).

### Step 5 — ATS detection (real, run)
`python3 scripts/ats/detect-ats.py "Fiddler Labs" "Imperative Care" "Surgical Safety Technologies"`
returned `not_found` (404) on both Greenhouse and Lever default-slug guesses for all
three. **Real limitation:** the script only checks two ATS platforms with a guessed
slug; smaller/recently-funded companies may use Ashby, Workday, or a custom slug this
script cannot find. This is a genuine gate failure, not a script error — see Phase Gate
4 below.

### Step 6 — Tech stack fingerprint *(proposed, not built)*
`scripts/ml/extract-stack-signals.py` **[TODO: DEV]** — would parse live job description
text from an ATS-detected posting for framework/infra keywords (PyTorch, JAX, Ray,
Kubernetes, etc.). Blocked on Step 5 actually returning a live posting to parse.

### Step 7 — GitHub / ArXiv project intelligence *(proposed, not built)*
`scripts/intel/github-arxiv-company-signal.py` **[TODO: DEV]** — the scaffold's own
proposed-tools list already names this script; it would fetch public GitHub org
activity and Semantic Scholar-indexed papers per shortlisted company. Requires a
company-name → GitHub-org lookup table that does not exist yet.
**[TODO: DATA SOURCE]** `data/ml/github_org_map.csv`.

## Phase Gates

1. **Ingest gate** — H-1B CSV and Form D JSON must parse without error and return a
   non-empty filtered set. Test: the Step 1/4 one-liners above exit 0 and print a
   nonzero count. *(Passed in this run.)*
2. **Cognitive-pivot gate (soft)** — a target SOC code must have either a base-code
   score or a documented, human-reviewed sub-occupation substitute. Test: manual
   review of `data/bls/compact/soc_occupation_compact.csv` rows for the target codes.
   *(Passed with a documented exception — see Step 3.)*
3. **Liveness gate (HARD — gate, not a vote)** — a company with `detection_status:
   "not_found"` from `detect-ats.py`, or a `liveness` multiplier of 0 from
   `role-scorer.mjs`, is excluded from "Apply" regardless of its other scores. This
   mirrors the repo's own scorer logic, which we observed directly: the "ghost
   posting" row in `role-scores.json` shows `composite: 0` because `liveness
   multiplier: 0` zeroes the result "regardless of votes." *(Confirmed against real
   scorer output.)*
4. **Visa-timeline gate (HARD)** — no company is recommended "Apply" without an OPT
   end date supplied for the `timeline` gate factor in `role-scorer.mjs`.
   **[TODO: DEV]** — this mode does not yet feed a student-specific timeline into the
   scorer automatically; currently a manual step.
5. **Report gate** — both an agent log (JSON) and a human report (Markdown) must exist
   before a run is considered complete. *(Satisfied for this run:
   `logs/case-ml-sponsorship-triage-2026-07-06.json` +
   `reports/generated/case-ml-sponsorship-triage-2026-07-06.md`.)*

## What This Mode Can and Cannot Verify

| Claim | Status | Source |
|---|---|---|
| Company has H-1B approval history | ✅ Verified | Direct CSV read, this run |
| Company's sponsored titles include ML/DS roles | ✅ Verified | `top_job_titles_sponsored` field, this run |
| Company filed Form D in a given quarter | ✅ Verified | `refresh-recent-sec-quarters.py`, this run |
| SOC base code has a documented cognitive-pivot score | ⚠ True for 1 of 3 target codes only | `soc_occupation_compact.csv`, this run |
| Company has a live ML job posting | ⚠ Checked, not found for all 3 test companies | `detect-ats.py`, this run — real negative result |
| Tech stack used by a team | ❌ Not verifiable yet | Proposed script, blocked on Step 5 |
| Company will sponsor this specific student | ❌ Not verifiable by this mode | Requires direct contact |

## Output Contract

### Agent log
File: `logs/case-ml-sponsorship-triage-[DATE].json`
Fields: `workflow, run_id, steps_completed, records_seen (30369), h1b_approved_count (1552),
ml_titled_count (150), formd_matches (3), ats_checked, ats_found, gate_results,
todo_items, generated_at`. A real instance for this run exists at
`logs/case-ml-sponsorship-triage-2026-07-06.json`, produced manually from real run
output (numbers also recorded in `logs/RUN_LOG.md`). **[TODO: DEV]** — auto-generation
by the mode itself is not yet built.

### Human report
File: `reports/generated/case-ml-sponsorship-triage-[DATE].md`
Reader: the student (or a peer advisor) deciding which companies to apply to next.
Decision enabled: Apply / Consider / Skip per company, with the gate that produced
each decision named explicitly.
Sections: run summary, verified vs. inferred, gate results, shortlist table, typed
TODOs, next decision. A real instance for this run exists at
`reports/generated/case-ml-sponsorship-triage-2026-07-06.md` — distinct from the JSON
agent log, so P5 holds (one artifact cannot serve both readers). **[TODO: DEV]** —
auto-generation by the mode itself is not yet built.

## Stop Conditions

- Stop if the H-1B CSV or Form D JSON fails to parse — do not guess at columns.
- Stop before recommending "Apply" on any company that fails the liveness gate,
  regardless of sponsorship/funding score (see Phase Gate 3 — confirmed against real
  scorer output where a closed liveness gate zeroed an otherwise-strong composite).
- Stop before recommending "Apply" without a student-supplied OPT end date for the
  timeline gate.
- Stop if a proposed script (stack fingerprint, GitHub/ArXiv) does not exist — that
  signal must remain manual and be labeled "proposed," never "ran."
- Stop before any live network write, credential use, or contacting a company on the
  student's behalf.

## Log Template

```
## case-ml-sponsorship-triage — [DATE]

**Inputs:**
- SEC_DOL_H1b_data_mapped.csv (30,369 rows)
- SEC Form D quarters: 2025q2, 2025q3, 2025q4, 2026q1
- soc_occupation_compact.csv (1,016 occupations)

**Steps completed:**
- [x] H-1B filter run — companies with approvals: 1552; ML/DS-titled: 150
- [x] SEC Form D refresh — 4/4 quarters processed
- [x] BLS SOC lookup for 15-1252, 15-2051, 15-1299 — gap found, see Step 3
- [x] H-1B × Form D join — 3 matches (after fixing schema bug)
- [x] ATS detection run on 3 matches — 0/3 found (real negative result)
- [ ] Liveness check on a specific job URL — not run this submission
- [ ] Tech stack extraction — proposed only, script does not exist
- [ ] GitHub/ArXiv intelligence — proposed only, script does not exist

**Output:** no shortlist CSV generated yet — [TODO: DEV] `scripts/lca/ml-soc-sponsorship-filter.py`, `scripts/intel/github-arxiv-company-signal.py`
**Verified signals:** H-1B approval + title match, Form D recency, ATS liveness (negative)
**Gaps hit:** cognitive-pivot missing at base SOC code; Form D JSON schema assumption wrong (fixed); ATS script covers only 2 platforms

**What to do next:**
- [ ] Build `scripts/lca/ml-soc-sponsorship-filter.py` for a real SOC-level filter
- [ ] Build `scripts/intel/github-arxiv-company-signal.py`
- [ ] Build a SOC rollup for sub-occupation cognitive-pivot scores
- [ ] Extend ATS detection to Ashby/Workday or accept manual override
- [ ] Wire a student-supplied OPT end date into `role-scorer.mjs`'s timeline gate
```


