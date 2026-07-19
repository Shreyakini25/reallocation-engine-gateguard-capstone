---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: liveness
attestation: assignments/submissions/yuqinghannah/worked-run.md
recipe_version: 0.2.1
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
- `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` — company-level SEC
  Form D funding data joined with DOL H-1B petition history. Confirmed
  columns: `company_name, industry, website, city, state, zip_code, phone,
  year_incorporated, company_age_years, executive_officers, board_directors,
  total_funding, latest_funding_amount, latest_funding_stage,
  latest_funding_date, Total Approvals, Total Denials, Approval_Rate,
  median_salary_offered, top_job_titles_sponsored`
- `top_job_titles_sponsored` is the field this mode filters on — a literal
  list of job titles the company has sponsored H-1Bs for in the past (e.g.
  `['Senior UX Designer']`, `['Product Designer']`). Design roles can be
  matched directly by title text, no SOC-code mapping step needed.
- `data/ats/portals.yml` — required ATS scan config (not present in a fresh
  clone; copied from `data/ats/portals.example.yml` — see Worked Run).
- `npm run ats:scan -- --dry-run` — ATS provider detection / scan, no writes.
- `npm run ats:liveness -- <job-url>` — posting liveness check (GATE).

## Proposed Additions [TODO — typed, not yet built]
- [TODO: SCRIPT] `scripts/design/title-match.py` — a proper fuzzy/regex
  matcher over `top_job_titles_sponsored` instead of the ad-hoc `Select-String`
  text search used in the Worked Run. Justification: the current search is a
  blunt substring match and can't distinguish "Product Designer" from
  "Product Design Manager" or catch title variants without "Designer" in the
  string (e.g. "UX Lead"). Not built or run.
- [TODO: DATA] Posting-to-company linkage — the ATS scan (Job-Ops layer) and
  the H-1B/funding data (80 Days layer) are currently two separate lookups I
  cross-reference by hand. Justification: an automated join on company name
  would remove a manual step and a source of human error at scale.

## Phase Gates
1. **Liveness gate** — `npm run ats:liveness -- <job-url>` must return "live."
   A dead posting is dropped regardless of sponsorship score. Gate, not a vote.
2. **Sponsorship-history gate** — company must appear in
   `SEC_DOL_H1b_data_mapped.csv` with a designer-titled entry in
   `top_job_titles_sponsored`, OR be explicitly flagged "no history found —
   proceed at own risk." Absence of a match is not proof a company won't
   sponsor; it's a data gap, and the mode must say so, not guess.

## What This Mode Can and Cannot Verify
**Can verify:** whether a company has a documented past H-1B petition for a
designer-titled role; recency/size of its last funding round; whether a
specific job URL is currently live.
**Cannot verify:** whether that sponsorship pattern still holds today (data
is historical, not a live HR policy feed); whether a specific applicant will
be sponsored; whether a company with zero matches has simply never hired a
foreign-national designer before vs. has a policy against sponsoring one.

## Output Contract
- Agent log (JSON): `logs/RUN_LOG.md` entry — machine-parseable run record.
- Human report (Markdown table): company | sponsorship match (Y/N) |
  funding recency | liveness | recommendation.

## Stop Conditions
- If `data/ats/portals.yml` is missing and cannot be generated, the mode
  stops and reports the gap rather than skipping the ATS layer silently.
- If a company has zero rows in the H-1B dataset, the mode must report
  "no history found," never infer sponsorship likelihood from company size
  or industry alone.

## Log Template — logs/RUN_LOG.md
```
## [DATE] — ux-designer-sponsor-triage run
**Companies checked:** [list]
**Sponsorship matches (title in top_job_titles_sponsored):** [list]
**Liveness results:** [live/dead per URL]
**No-history flags:** [list]
**Notes:** [manual overrides, anomalies]
```
