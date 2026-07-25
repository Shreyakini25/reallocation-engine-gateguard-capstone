---
status: RUNNABLE-SAMPLE
todos_open: 5
last_gate: "sample-run, 2026-06-29, logs/RUN_LOG.md#2026-06-29"
attestation: null
recipe_version: 0.1.0
---

# SWE-to-AI-Engineer: H-1B Title Screen

## Purpose

I built this for a specific situation: you're a backend or data engineer on F-1 OPT with a few years of production experience, you want to move into AI/ML engineering, and you're drowning in job postings that all say "Machine Learning Engineer" but have wildly different expectations. Some of those companies actually promote SWEs into ML roles. Others only ever hire ML PhDs and use the same title as a courtesy.

The H-1B petition history tells you which is which. When a company sponsors a "Machine Learning Engineer" visa, they filed paperwork saying that's the job. If a company's H-1B history is full of "Research Scientist" and "Applied Scientist" petitions, that's who they actually hire — regardless of what their job board says.

Use this recipe when you have a target list of 5–20 companies and want to spend your OPT days on applications that have a realistic shot. It won't guarantee anything, but it'll stop you from sinking two weeks of prep into a company whose ML team has never hired someone without a PhD.

**When specifically to use it:**
- You have a list of companies you're interested in and want to prioritize before applying
- Your OPT window is finite (the mode accounts for your start date as a hard constraint)
- You're targeting AI/ML engineering titles, not data science or research roles

**When not to use it:**
- Researching large public companies (Google, Meta, AMD) — they don't appear in this dataset because they don't file Form D
- You already know a company sponsors H-1B and just want to check liveness — use `npm run ats:liveness` directly
- You need salary benchmarking — use the BLS OEWS data separately

---

## Source Inventory

| Source | Path | What it provides |
|---|---|---|
| H-1B + SEC Form D mapped dataset | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | `top_job_titles_sponsored`, `Total Approvals`, `Approval_Rate`, `latest_funding_stage`, `latest_funding_date`, `median_salary_offered` |
| H-1B dataset audit | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md` | Coverage stats: 30,369 companies total, 1,557 (5.1%) with H-1B data populated |
| H-1B join validation audit | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-join-validation-audit.md` | Entity resolution quality; confirms median approval rate = 100%, median approvals = 10 |
| BLS compact SOC table | `data/bls/compact/soc_occupation_compact.csv` | `cognitive_pivot_score` for target SOC codes |
| ATS liveness checker | `npm run ats:liveness -- <url>` | Hard gate: is the posting still accepting applications? |
| Role scorer | `npm run score` | Bayesian composite: (Σ vote·weight) × liveness × timeline |
| Candidate profile | `search/profile.yml` (local only, never committed) | OPT dates, authorization status, compensation floor |

**Proposed additions:**

- [TODO: DEV] `scripts/h1b/filter-by-title-pattern.py` — takes a company list and two title-pattern sets (practitioner / researcher), queries `SEC_DOL_H1b_data_mapped.csv`, classifies each company, outputs `data/raw/case-swe-to-ai-engineer/title-screen.json`. Right now the title screen is a manual Python one-liner; this script would make it repeatable and testable.

- [TODO: DATA SOURCE] DOL Labor Condition Application (LCA) data, current quarter — `top_job_titles_sponsored` in the mapped CSV reflects historical petition data that may be 2–3 years stale. LCA filings are public and updated quarterly. Belongs here because recency matters: a company that hired MLEs in 2021 may have shifted to a research-only team structure by now.

- [TODO: DATA SOURCE] LinkedIn job posting data or similar for ATS-provider-independent liveness — `npm run ats:liveness` works on Greenhouse/Lever/Ashby URLs but not on company-specific career portals (e.g., Workday). A broader posting source would close the gap for companies like Kensho Technologies that use Workday.

---

## Inputs

| Input | Format | Where it comes from | Required? |
|---|---|---|---|
| Company list | JSON — `data/raw/case-swe-to-ai-engineer/company-list.json` | You provide this; see format below | Yes |
| Candidate profile | YAML — `search/profile.yml` | Your local profile from Assignment 4 | Yes (OPT dates drive the timeline gate) |
| Job posting URLs | One per company, in the company list JSON | Found manually on company career pages | Yes for liveness gate |

**Company list format** (`data/raw/case-swe-to-ai-engineer/company-list.json`):
```json
{
  "run_id": "sample-2026-06-29",
  "mode": "sample",
  "opt_start_date": "2026-09-08",
  "opt_end_date": "2027-09-07",
  "stem_eligible": true,
  "target_soc_codes": ["15-1221", "15-1252", "15-1299.08"],
  "companies": [
    {
      "name": "COHERE HEALTH INC",
      "posting_url": "https://job-boards.greenhouse.io/coherehealth/jobs/7617095003",
      "role_title": "Staff Machine Learning Engineer"
    }
  ]
}
```

---

## Phase Gates

**Gate 1 — Data availability:** `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` exists and has a `top_job_titles_sponsored` column.

```bash
python3 -c "import csv; r=next(csv.DictReader(open('data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv'))); print('top_job_titles_sponsored' in r)"
# must print: True
```

**Gate 2 — Company list present:** The input JSON exists and parses before any title screen runs.

```bash
python3 -m json.tool data/raw/case-swe-to-ai-engineer/company-list.json
```

**Gate 3 — OPT date known (hard stop):** Without a valid `opt_start_date`, the timeline multiplier in the scorer can't be set. A missing date means the composite score would silently drop the binding constraint.

```bash
python3 -c "import yaml; p=yaml.safe_load(open('search/profile.yml')); print(p['visa']['opt_start'])"
# must print a date, not None
```

**Gate 4 — Liveness (hard stop, per-role):** For every role that passes the title screen, `npm run ats:liveness` must return active before that role enters scoring. A dead posting zeroes the composite regardless of everything else. This gate is cleared manually — one URL at a time.

```bash
npm run ats:liveness -- <posting_url>
# must show: ✅ active
```

**Gate 5 — Score output parses:** After the scorer runs, confirm the output JSON is valid before treating the report as final.

```bash
python3 -m json.tool data/raw/case-swe-to-ai-engineer/role-scores.json > /dev/null && echo "valid"
```

---

## What this verifies vs. what it doesn't

This is the most important section. The mode is only as honest as this boundary.

**Verified from data records:**
- Whether a company name appears in `SEC_DOL_H1b_data_mapped.csv` at all
- What titles appear in `top_job_titles_sponsored` for that company
- The company's total H-1B approvals and denial count
- Whether the approval rate is statistically meaningful (flag if Total Approvals < 10)
- The company's most recent SEC Form D funding stage and date
- Whether a specific posting URL is still live (`npm run ats:liveness`)
- BLS `cognitive_pivot_score` for each target SOC code (from the compact CSV)
- The composite role score arithmetic (from `npm run score` output)

**Cannot verify — requires human judgment or external data:**
- Whether a company's current ML team actually hires practitioners vs. researchers (H-1B history is a lagging indicator — it reflects past hires, not current culture)
- Whether a job description's "Machine Learning Engineer" title matches the H-1B title historically filed
- Whether the company will sponsor H-1B for this specific candidate at this specific time
- Whether a role explicitly requires a PhD (the job description must be read; there's no local data source for this)
- Whether an OPT employer qualifies for remote work under F-1 requirements (legal question, not a data question)

**Stop conditions — the mode refuses to produce a score when:**
- The company has zero H-1B approvals AND zero denials in the dataset (undefined approval rate — do not infer)
- The company is not in the dataset at all (public companies, e.g., AMD, Google — they don't file Form D)
- `npm run ats:liveness` returns expired or uncertain for the provided URL
- `opt_start_date` is missing from the profile (timeline multiplier can't be set)
- The role's `top_job_titles_sponsored` contains only researcher titles and zero practitioner titles (researcher-only companies are skipped before scoring)

---

## Steps

**Step 1 — Run the data provenance check.**

Confirm the dataset files exist and the join validation audit is current. This takes 30 seconds and prevents wasted downstream work if a file got corrupted or moved.

```bash
python3 scripts/sec/validate-h1b-join-sample.py
# confirms: 30,369 total rows, 1,557 H-1B rows, audit written to data/80-days-to-stay/data/
```

**Step 2 — Title screen against the CSV.**

For each company in your list, look up `top_job_titles_sponsored` and classify it:
- **practitioner** — contains "Machine Learning Engineer", "AI Engineer", "MLOps Engineer", or "Applied Machine Learning"
- **researcher-only** — contains "Research Scientist", "Applied Scientist", "Research Engineer", "Senior Research Scientist", "Principal Scientist" with no practitioner titles
- **hybrid** — has both practitioner and researcher titles (manual review required)
- **no-data** — company not found in the CSV, or `top_job_titles_sponsored` is null

```bash
# run the title screen (manual Python one-liner until filter-by-title-pattern.py is built):
python3 -c "
import csv, json, sys

PRACTITIONER = [
    'machine learning engineer', 'ml engineer', 'ai engineer',
    'mlops engineer', 'applied machine learning', 'ai platform engineer'
]
RESEARCHER = [
    'research scientist', 'applied scientist', 'research engineer',
    'senior research scientist', 'principal scientist', 'staff research scientist'
]

company_list = json.load(open('data/raw/case-swe-to-ai-engineer/company-list.json'))
targets = {c['name'].upper() for c in company_list['companies']}

results = []
with open('data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv') as f:
    for row in csv.DictReader(f):
        if row['company_name'].upper() not in targets:
            continue
        titles = (row.get('top_job_titles_sponsored') or '').lower()
        p = [t for t in PRACTITIONER if t in titles]
        r = [t for t in RESEARCHER if t in titles]
        try:
            n = float(row.get('Total Approvals') or 0)
        except:
            n = 0
        results.append({
            'company': row['company_name'],
            'classification': 'hybrid' if p and r else 'practitioner' if p else 'researcher-only' if r else 'no-data',
            'practitioner_titles': p,
            'researcher_titles': r,
            'total_approvals': n,
            'approval_rate': row.get('Approval_Rate'),
            'low_n_flag': n < 10,
            'funding_stage': row.get('latest_funding_stage'),
            'funding_date': row.get('latest_funding_date'),
            'median_salary': row.get('median_salary_offered'),
        })

# companies not found in CSV
found = {r['company'].upper() for r in results}
for name in targets:
    if name not in found:
        results.append({'company': name, 'classification': 'no-data', 'note': 'not found in SEC_DOL_H1b_data_mapped.csv'})

print(json.dumps(results, indent=2))
" | tee data/raw/case-swe-to-ai-engineer/title-screen.json
```

Researcher-only and no-data companies stop here. Do not run liveness or scoring on them.

**Step 3 — Funding recency check (practitioner and hybrid companies only).**

Companies with no Form D filing in the last 24 months may have funding dry spells that make hiring unlikely. This is a soft signal, not a hard gate, but flag anything older than 24 months for manual review.

Check `latest_funding_date` in the title-screen output. Flag companies where the date is before 2024-06-29 or where `funding_stage` is Pre-Seed (too early-stage for stable H-1B sponsorship).

**Step 4 — Liveness check (per role, hard gate).**

For each company that passed the title screen, check their posting URL. A dead posting stops the workflow for that role — do not score a ghost.

```bash
npm run ats:liveness -- <posting_url>
```

Log the result for each URL. Only roles with `✅ active` proceed to scoring.

**Step 5 — Score live roles.**

Build `data/raw/case-swe-to-ai-engineer/roles.json` with one entry per role that passed both the title screen and liveness gate. Then run the scorer.

```bash
node scripts/score/role-scorer.mjs data/raw/case-swe-to-ai-engineer/roles.json \
  --md reports/generated/case-swe-to-ai-engineer-2026-06-29.md
```

The scorer formula: `composite = (sponsorship × 0.35 + fit × 0.30) × liveness × timeline`

Where:
- `sponsorship` vote: 0.9 if practitioner titles + approval_rate ≥ 90% + Total Approvals ≥ 20; 0.6 if practitioner but low-N; 0.0 if researcher-only (should never reach scorer)
- `fit` vote: model judgment — label it as such
- `liveness`: 1.0 (confirmed active) or 0.0 (gate closed)
- `timeline`: 1.0 if OPT start is within 90 days and company has sponsorship history; set manually based on `opt_start_date` from profile

**Step 6 — Write the human report.**

The scorer writes `reports/generated/case-swe-to-ai-engineer-2026-06-29.md` automatically via `--md`. Review it and add the verified/inferred split table manually before it's the final report.

---

## Output Contract

**Agent log (machine-readable):** `logs/case-swe-to-ai-engineer-2026-06-29.json`

Fields: `run_id`, `mode`, `date`, `companies_evaluated`, `title_screen_results`, `liveness_results`, `roles_scored`, `score_summary` (Apply / Consider / Skip counts), `stop_conditions_triggered`, `source_files`, `todos_open`.

**Human report (for the candidate):** `reports/generated/case-swe-to-ai-engineer-2026-06-29.md`

Reader: the candidate — an international SWE on OPT deciding which companies to apply to this week.

Decision enabled: which companies to apply to now, which need manual investigation (hybrid title history, low-N approval rate, PhD-labeled current postings), and which to drop.

Sections: run summary, title-screen results table, liveness results, role scores with verified/inferred labels per cell, stop conditions triggered, what this run could not check, recommended actions.

---

## Stop Conditions (full list)

- Company not found in `SEC_DOL_H1b_data_mapped.csv` — no data, no score
- Company found but `top_job_titles_sponsored` is null or empty — no data, no score
- Company has only researcher-only titles — skip, do not proceed to liveness
- Total Approvals < 10 — flag as low-N; approval rate is unreliable; downgrade sponsorship vote to 0.3 and flag in report
- `npm run ats:liveness` returns expired or uncertain — remove role from scoring batch
- `opt_start_date` missing from profile.yml — refuse to set timeline multiplier; stop
- Composite score below 0.05 on all roles — run is valid but all roles are Skip; report that and stop rather than guessing

---

## BLS Cognitive Pivot Reference

Target SOC codes and their scores from `data/bls/compact/soc_occupation_compact.csv`:

| SOC | Title | cognitive_pivot_score | Annual Median Wage |
|---|---|---|---|
| 15-1221 | Computer and Information Research Scientists (AI Engineer) | 4.516 | $140,910 |
| 15-1299.08 | Computer Systems Engineers/Architects (MLOps/Cloud) | 4.027 | $108,970 |
| 15-1252 | Software Developers (AI Specialist) | 3.834 | $133,080 |

The spread matters: moving from SOC 15-1252 (where most SWEs start) to 15-1221 (where AI Engineers land) is a cognitive-pivot gain of 0.68. That's the career argument for this transition — it's not just about salary, it's about landing in a role less exposed to AI substitution.

---

## Log Template

```
## 2026-06-29 — case-swe-to-ai-engineer-h1b-title-screen v0.1.0 (RUNNABLE-SAMPLE)

- Mode: case-swe-to-ai-engineer-h1b-title-screen
- Run type: sample (no live network calls except ats:liveness; no writes to private/)
- Inputs: [N] companies from data/raw/case-swe-to-ai-engineer/company-list.json; OPT start 2026-09-08
- Title screen: [N] practitioner, [N] researcher-only (skipped), [N] hybrid, [N] no-data
- Liveness: [N] active, [N] expired (removed from scoring)
- Scores: [N] Apply, [N] Consider, [N] Skip
- Artifacts: logs/case-swe-to-ai-engineer-2026-06-29.json, reports/generated/case-swe-to-ai-engineer-2026-06-29.md
- Open issues: filter-by-title-pattern.py not yet implemented [TODO: DEV]; LCA data not yet acquired [TODO: DATA SOURCE]
```
