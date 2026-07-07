---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# case-de-da-live-skill-gap — Live Skill Demand Scanner for DE/DA Roles on F-1 OPT

## Purpose

Identifies which technical skills an MS Information Systems student on F-1 OPT
should learn in the next 8 weeks by combining verified H-1B sponsorship history for Data Engineer
(SOC 15-1242) and Data Analyst (SOC 15-2041) roles with live job title extraction from Greenhouse
and Lever public APIs at sponsor companies, then filtering to skills that appear in cognitively
demanding roles so study time maps to real open opportunities at verified employers, not generic advice.

**Use this mode when:** You have 4-10 weeks before your OPT start date and need to decide which
skill to learn next. Not for pre-application company triage — use `case-data-ml-h1b-triage` for that.

**Do not use this mode to:** Decide whether to apply to a specific company (use `oferta.md`),
check if a posting is live (use `npm run ats:liveness`), or get immigration advice.

## Who This Mode Is For

| Field | Value |
|---|---|
| Student | International MS Information Systems, Northeastern University |
| Graduation | August 2026 |
| OPT window | 3-year STEM extension |
| Target roles | Data Engineer (SOC 15-1242), Data Analyst (SOC 15-2041) |
| Core problem | Generic skill advice (learn Python, learn SQL) does not tell you which skills are actually demanded by companies that will sponsor your H-1B — this mode makes that signal visible |

## Source Inventory

| Source | Type | Path or Command | Verified? |
|---|---|---|---|
| 80-days company dataset | Local CSV | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | YES — verified local data |
| Greenhouse public API | Live HTTP | `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` | YES — public JSON, no auth |
| Lever public API | Live HTTP | `https://api.lever.co/v0/postings/{slug}?mode=json` | YES — public JSON, no auth |
| BLS O*NET cognitive demand | Static mapping | `data/bls/compact/soc_occupation_compact.csv` | YES — human-curated skill tier map |
| Master scan script | New script | `scripts/skill-demand/skill-gap-master.py` | YES — runs today |
| Supporting extractor | New script | `scripts/skill-demand/jd-skill-extractor.py` | YES — runs today |
| Target companies input | User file | `my_targets.txt` (repo root, gitignored) | User-provided |

## Proposed Additions (TODO)

- [TODO] Workday API scraper — Workday has no public JSON endpoint; requires Playwright.
  Justification: many large DE employers (Google, Meta, JPMorgan) use Workday exclusively.
  Without it, companies using Workday are silently absent from the skill ranking.
  Path when built: `scripts/skill-demand/providers/workday.py`


- [TODO] Ashby API scraper — some mid-size DE employers (Notion, Linear) use Ashby.
  The repo has `scripts/ats/providers/ashby.mjs` — a Python equivalent is needed here.

## Inputs

| Input | Type | Required? | Notes |
|---|---|---|---|
| `my_targets.txt` | Text file, one company name per line | Yes (or use `--all-sponsors`) | Place in repo root. Gitignored — never committed. |
| `--dry-run` flag | CLI flag | No | Skips API calls. Use to verify CSV lookup before live run. |
| `--all-sponsors` flag | CLI flag | No | Ignores targets file, scans all 38 verified DE/DA sponsors from CSV. |
| `--min-approvals` | Integer | No | Default 50. Minimum H-1B approvals to include a company. |

## Phase Gates

1. **CSV gate:** `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` must exist and be readable.
   Test: `python -c "import pandas as pd; df = pd.read_csv('data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv'); print(len(df), 'rows')"`
   Human check: confirm row count is 30,000+.

2. **Sponsor count gate:** After filtering, at least 5 verified DE/DA sponsors must be found.
   The script enforces this automatically and exits with a clear error if not met.
   Test: `python scripts/skill-demand/skill-gap-master.py --dry-run`

3. **Targets file gate:** `my_targets.txt` must exist in the repo root and contain at least one company name.
   Test: `cat my_targets.txt`

4. **Liveness gate:** Before treating any company's roles as signals, confirm the API returned HTTP 200.
   Companies returning 404 from both Greenhouse and Lever are logged in Sheet 4 (Not Found) and excluded from skill counts.
   This is enforced automatically by the script — not a vote, a hard exclude.

5. **Output gate:** Both output files must exist after the run.
   Test: `test -f data/skill-demand/skill_gap_report.xlsx && echo "OK"`

## Steps

1. **Load and filter sponsors (80 Days layer)**
   Script: `scripts/skill-demand/skill-gap-master.py` (Step 1 of 3 in terminal output)
   What it does: reads 80-days CSV, filters to companies with Total Approvals >= 50 AND
   a Data Engineer or Data Analyst title in their H-1B sponsorship history.
   Input: `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv`
   Output: filtered sponsor list (38 companies at default threshold)
   Verified: YES — local data, deterministic filter

2. **Fetch live job titles and descriptions (Job-Ops layer)**
   Script: `scripts/skill-demand/skill-gap-master.py` calls `jd-skill-extractor.py` (Step 2 of 3)
   What it does: for each sponsor, hits Greenhouse public API then Lever public API.
   Greenhouse: list endpoint for job IDs, then detail endpoint per DE/DA job for full description.
   Lever: single endpoint returns both title and descriptionPlain in one call.
   Filters returned titles to DE/DA roles only using keyword matching.
   Input: sponsor list from Step 1
   Output: list of live DE/DA job titles AND descriptions per company, with ATS source
   Verified: YES for titles and descriptions returned — UNCERTAIN for companies returning no results
   (may use Workday/iCIMS, not that they have no open roles)

3. **Extract and rank skills (Cognitive Pivot layer)**
   Script: `scripts/skill-demand/skill-gap-master.py` (Step 3 of 3)
   What it does: counts skill keyword frequency across all live DE/DA titles,
   assigns each skill a cognitive demand tier from a static BLS O*NET mapping,
   writes Excel report with 4 sheets.
   Input: live job titles from Step 2
   Output: `data/skill-demand/skill_gap_report.xlsx`
   Verified: skill counts are verified (keyword match); cognitive tiers are verified
   (human-curated static map to BLS O*NET elements for SOC 15-1242)

## What This Mode Can and Cannot Verify

### Can Verify (evidence from data or scripts)
- Whether a company has H-1B sponsorship history for DE/DA titles — 80-days CSV
- Whether a company's Greenhouse or Lever board returned HTTP 200 today — live API
- Whether a returned job title contains a DE/DA keyword — deterministic match
- Whether a skill keyword appears in a live job title — deterministic match
- Cognitive demand tier of a skill relative to SOC 15-1242 — static BLS mapping
- H-1B approval rate per company — 80-days CSV (Total Approvals / Total Denials)
- Latest funding stage and date per company — 80-days CSV

### Cannot Verify (honest limits)
- Companies using Workday, iCIMS, or Taleo — no public JSON API (Workday scraper proposed)
- Whether a company will sponsor YOUR specific title — history only, not intent
- Whether a live title will still be open tomorrow — point-in-time snapshot
- Salary range or seniority level for these roles — not in title data
- Whether your resume skills actually match the roles — out of scope for this mode

## Output Contract

### Agent log (JSON)
File: `data/skill-demand/skill_demand_log.json`
Fields: schema, run_timestamp, dry_run, config, summary, skill_ranking, company_scan_log.
Reader: automated downstream scripts or audit review.

### Human report (Excel)
File: `data/skill-demand/skill_gap_report.xlsx`
Reader: student deciding which skill to learn next.
Sheets:
- **Sheet 1 — Skill Rankings:** ranked skills by live appearance count, with cognitive tier
  and color coding (green = HIGH, yellow = MED, red = LOW automation risk)
- **Sheet 2 — Sponsor Scorecard:** per-company H-1B approvals, denials, approval rate,
  funding stage, funding date, median salary, ATS detected, live DE/DA role count
- **Sheet 3 — Live Job Titles:** every DE/DA title found, with ATS source, skills detected,
  cognitive tier, and job URL
- **Sheet 4 — Not Found:** companies with no Greenhouse or Lever board detected,
  with note that they may use Workday/iCIMS/Taleo

One artifact cannot serve both readers — the JSON log is for agents, the Excel is for the student.

## Stop Conditions

The script refuses to produce output and exits with a clear error if:

- The 80-days CSV is missing or unreadable
- Fewer than 5 sponsors match the filter criteria
- `my_targets.txt` is missing and `--all-sponsors` was not passed
- No DE/DA titles are found across all scanned companies (dry run is exempt)

## Run Commands

```bash
# Install dependencies (first time only)
pip install pandas requests openpyxl

# Note: on Windows use 'python' instead of 'python3'

# Step 1 — dry run: verify CSV loads and targets file is correct (no API calls)
python scripts/skill-demand/skill-gap-master.py --dry-run

# Step 2 — live run: scan all target companies
python scripts/skill-demand/skill-gap-master.py

# Step 3 — scan all 38 verified sponsors (ignore targets file)
python scripts/skill-demand/skill-gap-master.py --all-sponsors

# Step 4 — deliberate break test (for attestation)
python scripts/skill-demand/skill-gap-master.py --targets nonexistent.txt
# Expected: ERROR: Targets file not found
```

## Log Template

```
## RUN_LOG entry — case-de-da-live-skill-gap

- Date: <YYYY-MM-DD>
- Mode: case-de-da-live-skill-gap v0.1.0
- Status: RUNNABLE-SAMPLE
- Runner: Komal Pravinkumar

### Inputs
- Targets file: my_targets.txt (<N> companies)
- Min approvals threshold: 50
- Dry run: No

### Outputs
- Sponsors scanned: <N>
- Companies with live DE/DA titles: <N>
- Total DE/DA titles found: <N>
- Unique skills detected: <N>
- Output: data/skill-demand/skill_gap_report.xlsx

### Top 3 Skills
1. <skill> — <N> appearances — <N> companies — [<TIER>]
2. <skill> — <N> appearances — <N> companies — [<TIER>]
3. <skill> — <N> appearances — <N> companies — [<TIER>]

### Issues / Open Items
- <any companies returning not_found>
- <any API errors>
- TODOs open: 2 (Workday scraper, Ashby scraper)
```

## Failure Modes

**Failure Mode 1 — Silent Workday gap**
Many large DE employers (large banks, healthcare systems, tech giants) use Workday exclusively.
They will silently appear in Sheet 4 (Not Found) rather than in the skill ranking.
A student could conclude "SQL is the #1 skill" when in fact the companies they most want to work
at are Workday-only and may demand entirely different skills.
Hardest to catch for: students targeting large enterprise employers (JPMorgan, Google, UnitedHealth)
who would not recognize that these companies are absent from the scan.

## Provenance

| Claim | Source | Verified |
|---|---|---|
| 38 verified DE/DA sponsors at 50+ approvals | `mapped_student_employment_targets_v3.csv` | YES |
| Greenhouse API returns live job titles | `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` | YES |
| Lever API returns live job titles | `https://api.lever.co/v0/postings/{slug}?mode=json` | YES |
| Cognitive tier mapping to BLS O*NET | Static map in `skill-gap-master.py` lines 60-82 | YES — human-curated |
| Workday companies are absent from scan | No public Workday JSON API exists | YES — documented in Proposed Additions |