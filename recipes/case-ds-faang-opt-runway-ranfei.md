---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: gate-4
attestation: assignments/submissions/ranfei/worked-run.md
recipe_version: 0.2.0
---

# Data Science OPT Runway — FAANG-Tier Triage

## Purpose

Scores FAANG-tier Data Science and ML job postings for an international MS/PhD
student on F-1 OPT (12+ months remaining) who needs H-1B cap-subject filing
before the next April deadline. The recipe combines the engine's Bayesian role
scorer with H-1B sponsorship history, SOC cognitive-demand scoring, posting
liveness, and a proposed Year-1 filing-lag check to produce a
per-role Apply / Consider / Skip recommendation with a full audit trail.

**Use this recipe when:** You have a list of DS/ML postings at large tech
companies and need to triage before spending 8–12 hours per application. The
core question is not "does this company sponsor?" but "does this
company-role-timeline combination give me a realistic path to H-1B approval
before my OPT expires?"

**Do not use this recipe for:** Startup or early-stage companies (use
`case-funded-systems-analyst.md` instead); roles outside SOC 15-xxxx or
13-xxxx; candidates who do not require sponsorship.

## Source Inventory

| Source Node | Node Type | Path | Human Check |
|---|---|---|---|
| H-1B sponsorship history | file | `data/80-days-to-stay/h1b-sponsors.csv` | Confirm file exists and employer names match target companies exactly (case and legal entity). |
| BLS OES wage data | file | `data/BLS/occupational-employment-stats.csv` | Confirm SOC codes present for 15-2051, 15-1221, 15-1252. |
| Role scorer script | script | `scripts/score/role-scorer.mjs` | Confirm script version matches recipe_version. Run `npm run score -- --help` to verify. |
| Liveness checker | script | `npm run ats:liveness` | Confirm the target job URL is reachable before passing liveness=1.0. |
| DOL LCA disclosure data | [TODO: DATA SOURCE] | `data/lca/dol-lca-filings.csv` — not yet present in repo. Source: flag.dol.gov/wage-data/lca-data. Fields needed: EMPLOYER_NAME, EMPLOYMENT_START_DATE, CASE_SUBMITTED, SOC_CODE. | Download and place before running filing-lag step. |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| `roles.json` | JSON array | Student-assembled from job postings — see schema below | Yes |
| `profile.json` | JSON object | Student OPT profile — see schema below | Yes |
| OPT start date | ISO date string inside `profile.json` | Student SEVIS / I-20 | Yes |
| Target company names | strings inside `roles.json` | Job postings | Yes |
| Job posting URLs | strings inside `roles.json` | Job postings — used for liveness check | Yes |

### roles.json schema

```json
[
  {
    "role_id": "string — unique per run",
    "company": "string — legal entity name matching h1b-sponsors.csv",
    "title": "string",
    "soc_code": "string — e.g. 15-2051",
    "url": "string — live job posting URL",
    "sponsorship": { "p": 0.0–1.0, "tier": "proven|likely|possible|unknown", "source": "record" },
    "fit": { "p": 0.0–1.0, "source": "model-judgment" },
    "role_quality": { "p": 0.0–1.0, "source": "record" },
    "liveness": { "factor": 0.0 or 1.0, "source": "record" },
    "timeline": { "factor": 0.0–1.0, "source": "your-input" }
  }
]
```

### profile.json schema

```json
{
  "name": "anonymized",
  "authorization": "F-1 OPT",
  "opt_start": "YYYY-MM-DD",
  "next_h1b_deadline": "YYYY-04-01",
  "days_to_deadline": 0
}
```

## Phase Gates

1. **Source gate:** All required source paths exist or carry a typed `[TODO: DATA SOURCE]`.
   Test: `test -f data/80-days-to-stay/h1b-sponsors.csv && test -f data/BLS/occupational-employment-stats.csv && test -f scripts/score/role-scorer.mjs`
   Human capacity: domain lead confirms data freshness (H-1B data lags 12–18 months).

2. **Scope gate:** Run declares `--sample` mode or an approved live mode before network calls.
   Test: confirm `roles.json` contains no personal application notes or contact names.
   Human capacity: student confirms inputs are anonymized.

3. **Liveness gate (HARD STOP):** Every role with `liveness.factor = 0.0` is excluded from Apply/Consider before scoring proceeds. A ghost posting is not a vote — it is a closed gate.
   Test: `npm run ats:liveness -- --url <job_url>` returns HTTP 200 and no redirect to a closed-job page.
   Human capacity: student verifies each URL manually if the liveness script returns ambiguous results.

4. **Timeline gate (HARD STOP):** Student's OPT days-to-deadline must be > 90 days, and `timeline.factor` must reflect the actual filing-lag risk for each company. Do not set `timeline.factor = 1.0` for all companies without evidence.
   Test: `profile.json` field `days_to_deadline` > 90.
   Human capacity: student confirms timeline factors are grounded in data or clearly labeled `your-input`.

5. **Script-readiness gate:** Every step script exists or carries `[TODO: DEV]`.
   Test: `test -f scripts/score/role-scorer.mjs`
   Human capacity: confirm `lca-filing-lag.py` is marked TODO and its output is labeled proposed.

6. **Report gate:** Agent log (JSON) and human report (Markdown) are both written with required fields.
   Test: `test -f logs/case-ds-faang-opt-runway-ranfei-[DATE].json && test -f reports/generated/case-ds-faang-opt-runway-ranfei-[DATE].md`
   Human capacity: domain lead reviews recommendation column before student acts on Apply decisions.

## Steps

1. **Verify provenance.** Confirm source files exist and are not empty.
   Command: `test -f data/80-days-to-stay/h1b-sponsors.csv && wc -l data/80-days-to-stay/h1b-sponsors.csv`
   Output: line count confirming file is non-empty.
   Where output goes: terminal / gate decision log.

2. **Check posting liveness.** For each role URL, confirm the posting is still active.
   Command: `npm run ats:liveness -- --url <job_url>`
   Output: HTTP status + redirect detection. Set `liveness.factor = 1.0` if live, `0.0` if closed.
   Where output goes: `roles.json` liveness field; gate-3 decision.

3. **Look up SOC cognitive-demand score.** Cross-reference each role's SOC code against BLS data to confirm the role is in the Computer/Math tier (15-xxxx) and pull the cognitive-demand score.
   Command: `grep "15-2051\|15-1221\|15-1252" data/BLS/occupational-employment-stats.csv`
   Output: SOC title, employment count, median wage. Set `role_quality.p` from cognitive-demand score normalized to 0–1.
   Where output goes: `roles.json` role_quality field.

4. **Check H-1B sponsorship history.** Look up each company in the sponsorship dataset and pull approval count, denial rate, and median wage filed for SOC 15-xxxx.
   Command: `grep -i "meta\|amazon\|apple" data/80-days-to-stay/h1b-sponsors.csv | head -20`
   Output: approval counts and denial rates. Set `sponsorship.p` and `sponsorship.tier` from this data.
   Where output goes: `roles.json` sponsorship field.

5. **Compute Year-1 filing lag.** [TODO: DEV] Script `scripts/h1b/lca-filing-lag.py` does not yet exist. Until it does, `timeline.factor` must be set manually by the student based on community knowledge and labeled `source: your-input`. Do not label it `record`.
   Proposed command: `python3 scripts/h1b/lca-filing-lag.py --company "Meta Platforms Inc" --soc 15-2051`
   Proposed output: `first_year_filing_pct`, `median_lag_days`, `min_lag_days`.
   Where output goes: `roles.json` timeline field — labeled proposed until script exists.

6. **Run role scorer.** Combine all evidence into per-role recommendations.
   Command: `npm run score -- roles.json --profile profile.json --md reports/generated/case-ds-faang-opt-runway-ranfei-[DATE].md`
   Output: `role-scores.json` + Markdown report with Apply / Consider / Skip per role.
   Where output goes: `data/verified/case-ds-faang-opt-runway-ranfei/` and `reports/generated/`.

7. **Produce human report.** Review the Markdown report. For every Apply recommendation, confirm with a human that the company's current headcount is not frozen before submitting an application.
   Output: annotated Markdown report with human override decisions documented.
   Where output goes: `reports/generated/case-ds-faang-opt-runway-ranfei-[DATE].md`

## What This Recipe Can and Cannot Verify

### Verified by data or tested scripts

| Signal | Source | Script |
|---|---|---|
| Job posting is currently live | HTTP liveness check | `npm run ats:liveness` |
| Company H-1B approval / denial rate (historical, 3yr) | `data/80-days-to-stay/h1b-sponsors.csv` | `grep` on sponsorship CSV |
| SOC code classification (Computer/Math vs. Business) | `data/BLS/occupational-employment-stats.csv` | `grep` on BLS CSV |
| BLS median wage for SOC + state | `data/BLS/occupational-employment-stats.csv` | `grep` on BLS CSV |
| Composite score and recommendation | Bayesian scorer | `npm run score` |

### Not verifiable by this recipe

| Signal | Why not verifiable |
|---|---|
| Year-1 H-1B filing lag per company | `lca-filing-lag.py` does not exist yet — `[TODO: DEV]` |
| Whether current headcount freeze affects sponsorship | H-1B data lags 12–18 months; no real-time signal |
| Which specific SOC code will appear on the student's LCA | Determined by employer HR at offer stage; not inferrable from posting |
| H-1B lottery outcome | Random selection; no data source can predict it |
| Whether the role will still exist at H-1B renewal (year 3–6) | Future state; cognitive score is a proxy only |

## Output Contract

### Agent output
File: `logs/case-ds-faang-opt-runway-ranfei-[DATE].json`
Fields: `workflow`, `run_id`, `mode`, `steps_completed`, `records_seen`,
`rejects`, `flags`, `stop_conditions`, `todo_items`, `source_files`,
`gate_decisions`, `generated_at`, `raw_output_paths`, `verified_output_paths`,
`report_path`.

### Human report
File: `reports/generated/case-ds-faang-opt-runway-ranfei-[DATE].md`
Reader: Student or advisor reviewing which roles to pursue.
Decision enabled: which roles to apply to, which require manual verification
before applying, which to drop.
Sections: run summary, source inventory, gate results, per-role scores with
full audit trail, verified vs. inferred split, open TODOs, next actions.

These are two separate artifacts. The JSON is for the conductor; the Markdown
is for the human. One cannot substitute for the other (P5).

## Stop Conditions

- Stop if `data/80-days-to-stay/h1b-sponsors.csv` is missing — sponsorship scoring would require guessing.
- Stop if a role's `liveness.factor = 0.0` — do not produce an Apply recommendation for a closed posting.
- Stop if `profile.json` is missing `opt_start` or `days_to_deadline` — timeline gate cannot be evaluated.
- Stop if `days_to_deadline < 90` — the mode is not designed for students within 3 months of their OPT expiry; visa risk is too high to score mechanically.
- Stop before producing an Apply recommendation if the company's H-1B data is more than 24 months old and no fresher signal is available.
- Stop if `lca-filing-lag.py` output is used without being labeled `[TODO: DEV]` — proposed outputs must never appear as verified findings.

## Snickerdoodle

### Run Commands

Sample mode (no live network calls, no writes):
```
npm run score -- /tmp/roles.json --profile /tmp/profile.json --md /tmp/score-report.md
```

### Step Commands

| Step | Command | Flags |
|---|---|---|
| Check liveness | `npm run ats:liveness -- --url <url>` | safe, read-only |
| Score roles | `npm run score -- roles.json --profile profile.json` | `--md report.md` |
| Verify BLS data present | `grep "15-2051" data/BLS/occupational-employment-stats.csv` | read-only |
| Verify sponsorship data present | `grep -i "meta" data/80-days-to-stay/h1b-sponsors.csv` | read-only |

### Script Locations

| Step | Script Path | Status |
|---|---|---|
| Role scorer | `scripts/score/role-scorer.mjs` | EXISTS — tested |
| Liveness checker | (via `npm run ats:liveness`) | EXISTS — tested |
| LCA filing lag | `scripts/h1b/lca-filing-lag.py` | [TODO: DEV] |
| Salary floor | `scripts/jobops/salary-floor.py` | [TODO: DEV] |

### Output Locations

| Output | Path | Format |
|---|---|---|
| Role scores | `data/verified/case-ds-faang-opt-runway-ranfei/role-scores.json` | JSON |
| Human report | `reports/generated/case-ds-faang-opt-runway-ranfei-[DATE].md` | Markdown |
| Gate decisions | `logs/gate-decisions/` | JSON |

## RUN_LOG Template

```markdown
## [DATE] — case-ds-faang-opt-runway-ranfei

**Status reached:** RUNNABLE-SAMPLE
**Profile:** F-1 OPT, start [DATE], [N] days to April [YEAR] H-1B deadline
**Roles checked:** [LIST]
**Commands run:**
  - `npm run verify` → [PASS/FAIL]
  - `npm run ats:liveness -- --url [URL]` → [result]
  - `npm run score -- roles.json --profile profile.json` → [Apply N · Consider N · Skip N]

**Verified signals:** H-1B history (sponsorship.p), SOC/liveness (gate), composite score
**Inferred / labeled your-input:** timeline.factor (manual — lca-filing-lag.py not yet built)
**TODOs open:** lca-filing-lag.py [TODO: DEV], salary-floor.py [TODO: DEV]
**Flags raised:** [e.g. Apple liveness=0 — closed gate, dropped before scoring]
**Next action:** [e.g. Apply to Meta; hold Amazon pending recruiter timeline confirmation]
**Open issues:** timeline.factor values are student-input not record — treat with caution
```
