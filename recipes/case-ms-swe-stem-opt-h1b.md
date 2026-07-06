---
status: RUNNABLE-SAMPLE
todos_open: 7
last_gate: "score+liveness verified 2026-07-03"
attestation:
  tested_by: Neha Dharanu
  date: 2026-07-03
  commands_verified:
    - npm run score -- assignments/submissions/nehadharanu/neha-target-roles.json
    - npm run score -- data/examples/ch11-roles.json
    - npm run ats:liveness -- https://www.databricks.com/company/careers/engineering/staff-software-engineer-compute-infrastructure-8579135002
    - npm run ats:liveness -- https://careers.snowflake.com/us/en/job/SNCOUS3FFB6EDD4C574ECB9F10AB8E4035BD98EXTERNALENUS8FAB44334A3F4A148DFED497702C4BE4/Software-Engineer-Full-Stack-Marketplace
    - npm run ats:liveness -- https://jobs.ashbyhq.com/anyscale/73a973b1-6377-4144-a6e5-610b78719882
    - npm run ats:liveness -- https://boards.greenhouse.io/stripe/jobs/6338084
    - npm run ats:liveness -- https://boards.greenhouse.io/fakeco/jobs/0000000
    - npm run score -- assignments/submissions/nehadharanu/broken-roles.json
    - npm run verify
recipe_version: 0.1.0
---

# case-ms-swe-stem-opt-h1b
# MS Graduate · SOC 15-1252 · OPT Oct 2026 → STEM OPT 2029 · H-1B FY2028 Target

## Purpose
This mode is for an MS graduate in a STEM field whose OPT has not yet started,
who requires H-1B sponsorship, and whose lottery deadline (FY2028, ~April 2027)
creates a hard offer-by date of December 2026 under standard processing or
March 2027 under premium processing. It is not a general sponsorship triage
mode. It is specifically designed for the gap between OPT activation and the
first viable H-1B lottery window — a period where every wasted application
against a non-sponsor or a dead posting costs unemployment days that cannot
be recovered.

Use this mode when:
- Your OPT EAD has not yet activated (status: "OPT not yet started")
- You require employer H-1B sponsorship — hard gate, not a preference
- Your STEM OPT extension is confirmed with your DSO
- Your H-1B lottery target is FY2028 (registration ~March 2027)
- Your target role is SOC 15-1252 (Software Developers and Software QA Engineers)

Do not use this mode if:
- You are already on H-1B or GC
- You do not require sponsorship
- Your target SOC is outside 15-1252

---

## Source Inventory

### Existing data and scripts — verified present in this repo

| Source | Path / Command | What it provides |
|---|---|---|
| H-1B sponsorship history | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | LCA filing history per employer, top job titles sponsored, approval rate, median salary |
| CSV audit report | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md` | Verified counts: 30,369 companies, 1,552 with H-1B data (5.1%), no SOC codes present |
| SEC Form D funding signals | `data/sec/form-d/` | Recent funding rounds — recency and amount per company |
| BLS OEWS wage data | `data/BLS/compact/` | SOC 15-1252 wage percentiles by metro (Seattle, Bay Area, LA) |
| BLS cognitive demand scores | `data/BLS/` | Role resilience scores — AI substitution risk by SOC |
| Role scorer | `npm run score -- <roles.json>` | Produces Apply/Consider/Skip per role with cognitive score |
| ATS liveness gate | `npm run ats:liveness -- <url>` | Hard gate — confirms posting is live before any application |
| ATS scan (dry run) | `npm run ats:scan -- --dry-run` | ATS provider detection without writing to tracker |
| Example roles schema | `data/examples/ch11-roles.json` | Schema reference for building your own roles.json input |
| Search profile | `search/profile.yml` | Visa gates, sponsorship requirement, geography, thresholds |
| Attested resume | `search/resume.json` | Verified skills and experience for fit scoring |
| Gap table | `search/gaps.md` | Known gaps against SOC 15-1252 target role requirements |

---

## Proposed Additions — [TODO]

**[TODO-1] SOC 15-1252 H-1B sponsor filter script**
`scripts/h1b/filter-sponsors-by-soc.py --soc 15-1252 --min-filings 3`
Justification: The current 80-days-to-stay data contains all SOC codes. An MS
SWE targeting SOC 15-1252 needs to filter specifically for employers who have
sponsored that code — not just any H-1B filing. A company that sponsors
H-1B for data scientists but has never filed for a software engineer is not
a reliable sponsor for this search. This script does not exist; output below
is proposed, not run.
Expected output: filtered CSV of employers with 3 or more LCA filings under
SOC 15-1252 in the last 3 years, with median wage and most recent filing date.

**[TODO-2] OPT unemployment-days budget tracker**
`scripts/visa/opt-days-tracker.py --start 2026-10-01 --buffer 80`
Justification: The engine has no script that tracks unemployment days consumed
against the 90-day ceiling with a configurable buffer. For a student whose OPT
starts October 2026, each application gap is a countdown. This script would
read application start/end dates from `data/ats/` and warn when the buffer
approaches. Does not exist — proposed only.

**[TODO-3] Offer-deadline back-calculator**
`scripts/visa/h1b-deadline-calc.py --lottery FY2028 --processing standard`
Justification: Given an H-1B lottery registration deadline (~April 2027 for
FY2028), the script would back-calculate the latest viable offer date under
standard vs. premium processing, and flag any pipeline company whose likely
hiring timeline extends past that date. Does not exist — proposed only.

---

## Phase Gates

These are hard stops. The mode does not proceed past a failed gate.

| Gate | Condition to pass | What fails it |
|---|---|---|
| **Data present gate** | `SEC_DOL_H1b_data_mapped.csv` exists and is readable | Missing or unreadable file → stop |
| **Sponsorship gate** | Company has 1 or more LCA filings in `data/80-days-to-stay/` | Zero filings → SKIP regardless of fit score |
| **SWE title gate** | `top_job_titles_sponsored` contains SWE-family title | No SWE title → CONSIDER only, flag for manual DOL lookup |
| **Liveness gate** | `npm run ats:liveness` returns active | Expired (404) → SKIP; uncertain → manual check required, do not apply |
| **Offer-deadline gate** | Estimated offer date before 2026-12-01 (standard) or 2027-03-01 (premium) | Past deadline → SKIP regardless of fit |
| **OPT buffer gate** | Unemployment days used fewer than 80 | [TODO-2] — not yet automated; manual input required |

---

## Steps

1. **Verify source data.** Read `SEC_DOL_H1b_data_mapped-audit.md` and confirm
   row counts before citing any figures. Record SHA or count claims only from
   the audit or a fresh command — not from memory.
   ```
   Select-String -Path "data\80-days-to-stay\data\SEC_DOL_H1b_data_mapped.csv" -Pattern "Software Engineer" | Measure-Object | Select-Object Count
   ```

2. **Filter H-1B dataset to SWE-title sponsors.**
   Filter `SEC_DOL_H1b_data_mapped.csv` to rows where `top_job_titles_sponsored`
   contains SWE-family keywords. Verified funnel from real run 2026-07-03:
   - All companies: 30,369
   - After sponsorship filter: 1,552 (94.9% skipped — no H-1B record)
   - After SWE title filter: 493
   - After CA/WA geography filter: 338
   `[TODO-1]` Replace manual filter with `filter-sponsors-by-soc.py` once built.

3. **Apply sponsorship gate.**
   For each company: confirm `Total Approvals > 0` AND `top_job_titles_sponsored`
   contains at least one SWE-family title. Companies failing this gate are
   SKIPped — 94.9% of companies have no H-1B data; the mode refuses to guess.

4. **Check SWE title family — avoid title inflation.**
   Read the actual `top_job_titles_sponsored` string for each company, not just
   whether it contains the word "engineer." A company sponsoring "AI Solutions
   Engineer", "Developer Advocate", or "QA Automation Engineer" has not
   demonstrated it will sponsor SOC 15-1252 Software Developer roles. The
   sponsored title must map to the SWE core family — not adjacent technical
   roles. If the title family is ambiguous, route to CONSIDER with manual
   DOL lookup required, not Apply.

5. **Check SEC Form D recency.**
   Cross-reference shortlisted companies against `data/sec/form-d/` for
   `latest_funding_date`. Prefer companies with funding in the last 24 months.
   Verified: Databricks latest_funding_date 2025-09-08 (strong signal).
   Snowflake latest_funding_date 2020-02-07 (public company, less relevant).

6. **Build roles.json.**
   One object per company/posting. Required fields for `npm run score`:
   - `sponsorship`: `{ p, tier, source: "record" }` from Approval_Rate
   - `fit`: `{ p, source: "model-judgment" }` bounded judgment after steps 2-5
   - `liveness`: `{ factor, source: "record" }` from ats:liveness result
   - `timeline`: `{ factor, source: "your-input" }` from search/profile.yml
   - `role_quality`: cognitive demand score from data/BLS/ for SOC 15-1252

7. **Run liveness gate on each posting URL.**
   Hard gate — not a vote. Run before finalizing roles.json liveness factor.
   ```
   npm run ats:liveness -- <job-url>
   ```
   Active → liveness.factor 1.0. Uncertain → 0.5, manual check required.
   Expired → 0.0, SKIP regardless of sponsorship strength.
   Note: my.greenhouse.io URLs consistently return uncertain — ATS subdomain
   limitation. Treat as manual check required regardless of posting status.

8. **Run composite scorer.**
   ```
   npm run score -- <roles.json> --out-dir <dir> --md <report.md>
   ```
   A healthy run skips at least 50% of evaluated roles.

9. **Produce human report.**
   Markdown table with company, SWE title evidence, funding recency,
   composite score, recommendation, verified vs inferred column, open TODOs.
   Required: funnel counts showing companies dropped at each step and why.

10. **Log the run.**
    Append to `logs/RUN_LOG.md` using the template below.

---

## What This Mode Can and Cannot Verify

### Can verify (data or script exists and ran):
- Whether a posting URL is live at time of check (`npm run ats:liveness`)
- Cognitive demand / AI-substitution risk score for SOC 15-1252 (`data/BLS/`)
- BLS wage percentiles for SOC 15-1252 in target metros (`data/BLS/compact/`)
- Whether a company appears in the H-1B sponsorship dataset with SWE titles
- ATS provider for a given employer (`npm run ats:scan -- --dry-run`)
- Company funding recency from SEC Form D data (`data/sec/form-d/`)

### Cannot verify (data missing, script not yet built, or structurally unverifiable):
- Whether a company will sponsor H-1B specifically for SOC 15-1252 going
  forward — historical LCA filings are a signal, not a guarantee
- Whether historical SWE sponsorship covers the specific role being applied
  to — a company may have sponsored Software Engineers in 2021-2024 and
  quietly stopped in 2026; the dataset has no mechanism to detect policy
  changes after the last LCA filing
- Whether SWE titles in `top_job_titles_sponsored` map to core SOC 15-1252
  roles vs adjacent technical titles (AI Solutions Engineer, Developer
  Advocate, QA Engineer) — title string matching cannot resolve this without
  reading the actual job description
- Whether OPT unemployment days budget is within buffer — [TODO-2] not built
- Recruiter responsiveness or hiring timeline at any specific company
- Liveness at time of application — gate must be re-run day-of, not cached
- Liveness on my.greenhouse.io URLs — Playwright cannot detect apply button
  on this subdomain; all results return uncertain regardless of posting status

---

## Output Contract

Two artifacts — one for agents, one for humans. They cannot be combined.

### Agent log (JSON) — written to `logs/`
```json
{
  "run_id": "ms-swe-stem-opt-<YYYYMMDD>",
  "recipe": "case-ms-swe-stem-opt-h1b",
  "recipe_version": "0.1.0",
  "operator": "<name>",
  "date": "<YYYY-MM-DD>",
  "inputs": {
    "profile": "search/profile.yml",
    "resume": "search/resume.json",
    "roles_evaluated": "<n>"
  },
  "funnel": {
    "total_companies": 30369,
    "after_sponsorship_filter": 1552,
    "after_swe_title_filter": 493,
    "after_geography_filter": 338,
    "scored": "<n>"
  },
  "gates_passed": [],
  "gates_failed": [],
  "scores": [],
  "routing": {
    "apply": [],
    "consider": [],
    "skip": []
  },
  "open_todos": ["TODO-1", "TODO-2", "TODO-3"],
  "notes": ""
}
```

### Human report (Markdown table) — written to `logs/`

| Company | SWE title in CSV | Sponsorship gate | Liveness gate | Routing | Notes |
|---|---|---|---|---|---|
| DATABRICKS INC | Software Engineer ✓ | PASS — 1,640 approvals, 99.51% | ✅ active 2026-07-03 | APPLY | Sept 2025 funding — strong recency |
| STRIPE INC | Backend Engineer ✓ | PASS — 1,250 approvals, 98.27% | ⚠️ uncertain | CONSIDER | Manual liveness check required |
| ACCOLADE INC | Software Engineer ✓ | PASS — 28 approvals, 100% | FAIL — liveness=0 | SKIP | Ghost posting demo |

---

## Stop Conditions

The mode must refuse to produce a routing recommendation when:
- CSV is missing or unreadable (data present gate fails)
- Sponsorship gate has not been checked (cannot route to Apply without it)
- Liveness gate has not been checked within 24 hours of intended application
- The roles.json input contains fewer than 3 evaluated companies
- OPT buffer days are unknown — flag and request manual input
- SWE title family is ambiguous — route to CONSIDER, not Apply, until
  job description confirms SOC 15-1252 scope
- Posting URL is on my.greenhouse.io — treat as uncertain, manual check
  required before applying

---

## Log Template — logs/RUN_LOG.md

```markdown
## Mode Run — case-ms-swe-stem-opt-h1b
**Date:** YYYY-MM-DD
**Operator:** Neha Dharanu
**Recipe version:** 0.1.0
**Status reached:** RUNNABLE-SAMPLE

### Inputs
- Profile: search/profile.yml (OPT start: 2026-10-01, H-1B target: FY2028)
- Resume: search/resume.json (attested 2026-06-25)
- Roles evaluated: <n>

### CSV filter evidence
- Total companies: 30,369
- After sponsorship filter: 1,552 (94.9% skipped)
- After SWE title filter: 493
- After geography filter: 338

### Commands run
- npm run score -- <roles.json> --out-dir <dir> --md <report.md>
- npm run ats:liveness -- <url>
- npm run ats:scan -- --dry-run

### Gates
- Sponsorship gate: PASS/FAIL — <company> — <evidence>
- Liveness gate: PASS/FAIL/UNCERTAIN — <url> — <result>
- SWE title gate: PASS/CONSIDER — <company> — <title evidence>

### Routing output
- Apply: <list>
- Consider: <list>
- Skip: <list>

### Break attempts
- Break 1: <command> → <result>
- Break 2: <command> → <result>

### Open TODOs
- TODO-1: SOC 15-1252 filter script not yet built
- TODO-2: OPT days tracker not yet built
- TODO-3: Offer-deadline back-calculator not yet built

### What went well
### What the mode missed
### Next steps
```
