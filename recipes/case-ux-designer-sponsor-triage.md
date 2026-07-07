---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: liveness
attestation: assignments/submissions/yuqinghannah/worked-run.md
recipe_version: 0.2.0
---

# ux-designer-sponsor-triage

## Purpose
For an F-1 UX/Product Designer on STEM OPT, evaluate and prioritize open
Product Designer / UX Designer postings by (1) whether the hiring company has
a *documented history of sponsoring designer-titled H-1B roles specifically*
(not just any H-1B), (2) how recent and how large its last funding round was,
and (3) whether the specific posting is still live — before spending
application time on it.

Use this mode when: you have a shortlist of open Product/UX Designer roles
and need to rank them by sponsorship probability before applying. Do not use
this mode after you already have an offer — sponsorship-history data
describes company patterns, not guarantees for a specific hire.

## Source Inventory
- `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` — company-level
  SEC Form D funding data joined with DOL H-1B petition history. Confirmed
  columns (read directly from the file header): `company_name, industry,
  website, city, state, zip_code, phone, year_incorporated,
  company_age_years, executive_officers, board_directors, total_funding,
  latest_funding_amount, latest_funding_stage, latest_funding_date,
  Total Approvals, Total Denials, Approval_Rate, median_salary_offered,
  top_job_titles_sponsored`
- `top_job_titles_sponsored` is the field this mode filters on — it is a
  literal list of job titles the company has sponsored H-1Bs for in the past
  (e.g. `['Senior UX Designer']`, `['Product Designer']`). This means design
  roles can be matched directly by title text, without needing a separate
  SOC-code mapping step.
- `data/ats/portals.yml` — required config file for the ATS scan (copied
  from `data/ats/portals.example.yml`; not present in a fresh clone — see
  Worked Run).
- `npm run ats:scan -- --dry-run` — ATS provider detection / scan, no writes.
- `npm run ats:liveness -- <job-url>` — posting liveness check (GATE).

## Proposed Additions (typed, not yet built)
- [TODO: SCRIPT] `scripts/designer-sponsor-filter.mjs` — a small script that
  greps `top_job_titles_sponsored` for design-adjacent title strings
  ("Designer", "UX", "Product Design") and outputs a filtered CSV. Currently
  done manually with `Select-String` (PowerShell) during this Worked Run —
  works, but isn't part of the repo's tested script set yet.
  Justification: without this, every run requires hand-typing a regex
  against a 6.5MB CSV, which doesn't scale past a one-off check.
- [TODO: DATA] Design-specific SOC code cross-reference — the underlying
  DOL data likely carries SOC codes internally, but they are not exposed as
  a column in `SEC_DOL_H1b_data_mapped.csv`. Without them, this mode can only
  match on the *literal job title string* a company used before, not on the
  broader occupational category. Justification: a company that sponsored a
  "Senior Interaction Designer" won't be caught by a search for "UX
  Designer" — title-string matching under-counts real matches.

## Phase Gates
1. **Liveness gate** — `npm run ats:liveness -- <job-url>` must return
   "live." A dead posting is dropped regardless of every other score. Not
   yet run against a real URL in this submission (see "Did not test" in
   Attestation).
2. **Title-match gate** — the company's `top_job_titles_sponsored` field
   must contain a design-adjacent string. Zero title matches doesn't mean
   "will never sponsor a designer," but it moves the company out of the
   top-confidence tier.
3. **Funding recency gate** — `latest_funding_date` should be within a
   reasonable runway window (not yet formally defined; currently eyeballed
   during manual review, not scripted).

## What This Mode Can and Cannot Verify
**Can verify:** whether a company's H-1B filing history includes a
design-adjacent job title string, verbatim, from `top_job_titles_sponsored`;
the company's most recent funding stage, amount, and date; via ats:scan,
whether the company's careers page uses a detectable ATS provider.

**Cannot verify:** whether the company will sponsor *this specific* design
opening (past sponsorship of one title ≠ future sponsorship of a similarly
named but different role); whether a job title that doesn't literally match
a design-adjacent string ("Interaction Designer," "Design Technologist,"
"Experience Designer") was in fact a design role — title-string matching has
no synonym handling; whether a live posting on the ATS is actually still
accepting applications (liveness ≠ actively reviewed).

## Output Contract
- Agent log: `logs/ux-designer-sponsor-triage-run.json` — one record per
  company checked: `company_name`, `matched_title_strings`,
  `latest_funding_stage`, `latest_funding_date`, `approval_rate`,
  `ats_provider_detected`, `liveness_result`.
- Human report: Markdown table — one row per company, tier (Top / Watch /
  Drop) with a one-line reason.
- These are never the same file (P5).

## Stop Conditions
- If `top_job_titles_sponsored` is empty or unparseable for a company, the
  mode reports "no title data," never assumes zero history means "won't
  sponsor."
- If `ats:liveness` cannot reach a URL (network error vs. dead posting), the
  mode reports "unknown," never guesses.

## RUN_LOG Template
```
### <date>
- Mode: ux-designer-sponsor-triage vX.X
- Inputs: <N companies/roles checked, source>
- Commands run: <verbatim>
- Result: <N top-tier, N watch, N dropped>
- Open issues: <e.g. title-matching still manual, no SOC cross-reference>
```
