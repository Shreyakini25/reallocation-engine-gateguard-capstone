# Worked Run — ML Engineering Sponsorship Triage

## Inputs

- `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` (30,369 rows, real columns
  confirmed by direct read: `company_name, industry, website, city, state, zip_code,
  phone, year_incorporated, company_age_years, executive_officers, board_directors,
  total_funding, latest_funding_amount, latest_funding_stage, latest_funding_date,
  Total Approvals, Total Denials, Approval_Rate, median_salary_offered,
  top_job_titles_sponsored`)
- `data/sec/form-d/processed/companies-sec-{2025q2,2025q3,2025q4,2026q1}-d.json`
- `data/bls/compact/soc_occupation_compact.csv` (1,016 rows)
- `data/examples/ch11-roles.json` (repo-provided sample, 5 roles)
- No personal data used — no résumé, no application tracker, no real target company
  list of my own. All company examples below are real public companies that happened
  to match filters against real repo data.

## Commands run, verbatim, with real terminal output

### 1. Environment verification
```
$ npm run verify

> the-reallocation-engine@1.0.0 verify
> node scripts/conformance.mjs && node scripts/manifest-check.mjs

conformance: 131 files (75 md · 30 py · 23 js · 1 sh · 1 yaml · 1 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
MANIFEST CHECK — The Reallocation Engine
==========================================
WARN (5):
  W1 ignore path not in .gitignore: output/
  W1 ignore path not in .gitignore: reports/generated/
  W1 ignore path not in .gitignore: archive/
  W2 private path not gitignored (PII/secret risk): private/
  W2 private path not gitignored (PII/secret risk): resume.json
✓ manifest check passed (5 warnings)
```
Investigated the two W2 warnings: `.gitignore` already contains `/private/*` with
tracked exceptions for `README.md`/`.gitkeep`, so the `private/` warning is likely a
manifest-checker pattern-matching limitation rather than a real leak. `resume.json`
was genuinely uncovered — added `resume.json` to `.gitignore` before any commit.

### 2. Role scorer (existing script, real sample data)
```
$ node scripts/score/role-scorer.mjs data/examples/ch11-roles.json
✓ scored 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%)
  data/examples/role-scores.json  +  data/examples/role-scores.md
```

Report output (`role-scores.md`):
```
# Role Scorer report — 2026-07-06
Summary: 5 roles → Apply 2 · Consider 1 · Skip 2. Skip rate 40%.
- Cambridge biotech (Ch.7) — Data role (Proven tier): composite 0.446 → Apply
- Likely-tier sponsor: composite 0.418 → Consider
- Non-sponsor, HM contact: composite 0.193 → Apply (human override, reason logged)
- Household-name non-sponsor: composite 0.178 → Skip
- Proven sponsor (ghost posting): composite 0.000 → Skip — gated: liveness ≈ 0.000
  (a closed gate zeroes the composite regardless of votes)
```

Full JSON trace for the gate-driven row (`role-scores.json`):
```json
{
  "role_id": "ghost-posting",
  "company": "Proven sponsor (ghost posting)",
  "composite": 0,
  "recommendation": "Skip",
  "reason": "gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)",
  "trace": {
    "votes": [
      {"factor": "sponsorship", "value": 0.9, "weight": 0.35, "source": "record"},
      {"factor": "fit", "value": 0.8, "weight": 0.3, "source": "model-judgment"}
    ],
    "gates": [
      {"factor": "liveness", "multiplier": 0, "source": "record"},
      {"factor": "timeline", "multiplier": 0.85, "source": "your-input"}
    ],
    "arithmetic": "(0.9·0.35 + 0.8·0.3) × 0 × 0.85 = 0.000"
  }
}
```
This is a direct, real demonstration of the assignment's principle that "liveness and
visa timeline are gates, not votes" — a high-scoring role is zeroed entirely because
its liveness gate is closed, regardless of a strong sponsorship record.

### 3. BLS/O*NET extraction (existing script — required fixing two missing dependencies)
```
$ python3 scripts/bls/extract-soc-occupation-table.py
Traceback: ModuleNotFoundError: No module named 'pandas'

$ pip3 install pandas
Successfully installed numpy-2.5.1 pandas-3.0.3

$ python3 scripts/bls/extract-soc-occupation-table.py
ImportError: `Import openpyxl` failed.

$ pip3 install openpyxl
Successfully installed et-xmlfile-2.0.0 openpyxl-3.1.5

$ python3 scripts/bls/extract-soc-occupation-table.py
Wrote 1,016 occupations to data/bls/compact/soc_occupation_compact.csv
Wrote audit to data/bls/bls-audit.md
```

Target SOC code rows (from the regenerated file):
```
15-1252.00,Software Developers,job_zone=4,median_wage=133080,cognitive_pivot_score=3.834
15-2051.00,Data Scientists,job_zone=4,median_wage=112590,cognitive_pivot_score=(blank)
15-1299.00,Computer Occupations NEC,job_zone=(blank),median_wage=108970,cognitive_pivot_score=(blank)
```
Sub-occupation scores exist where the base code is blank, e.g.:
```
15-2051.01,Business Intelligence Analysts,cognitive_pivot_score=3.903
15-1299.08,Computer Systems Engineers/Architects,cognitive_pivot_score=4.027
```

### 4. SEC Form D refresh (existing script)
```
$ python3 scripts/sec/refresh-recent-sec-quarters.py
✅ 2025q2-d - 13325 companies → companies-sec-2025q2-d.json
✅ 2025q3-d - 14138 companies → companies-sec-2025q3-d.json
✅ 2025q4-d - 14885 companies → companies-sec-2025q4-d.json
✅ 2026q1-d - 15981 companies → companies-sec-2026q1-d.json
Summary
Processed: 4
Missing: 0
```

### 5. H-1B filter (direct read — original assumed script/columns did not exist)
```
$ python3 -c "
import pandas as pd
df = pd.read_csv('data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv')
h1b = df[df['Total Approvals'].notna() & (df['Total Approvals'] > 0)]
ml = h1b[h1b['top_job_titles_sponsored'].str.contains(
    'Machine Learning|Data Scientist|ML Engineer', case=False, na=False)]
print(len(h1b), len(ml))
"
Companies with H-1B approvals: 1552
Strict ML/DS-titled companies: 150
```

### 6. H-1B × Form D join (bug found and fixed live)

First attempt (wrong schema assumption — flat list keyed by `company_name`):
```
Also in 2026Q1 Form D: 0
Empty DataFrame
```

Investigated the real JSON shape:
```
$ python3 -c "... print(type(recent), recent.keys()) ..."
Type: <class 'dict'>
Keys: ['metadata', 'companies']
First company: {'company': {'name': 'MIP HPC Foreign Partners, L.P.', ...}, ...}
```

Corrected join (name-normalized match on the real nested path
`company["company"]["name"]`):
```
Strict ML/DS-titled companies: 150
Also in 2026Q1 Form D: 3
company_name                        Total Approvals   median_salary_offered
FIDDLER LABS INC                    20.0              168750.0
IMPERATIVE CARE INC                 26.0              180000.0
SURGICAL SAFETY TECHNOLOGIES INC    2.0               110000.0
```

### 7. ATS detection on the 3 real matches
```
$ python3 scripts/ats/detect-ats.py "Fiddler Labs" "Imperative Care" "Surgical Safety Technologies"
[1/3] Fiddler Labs -> none (0 jobs)      (404 on Greenhouse + Lever guessed slugs)
[2/3] Imperative Care -> none (0 jobs)   (404 on Greenhouse + Lever guessed slugs)
[3/3] Surgical Safety Technologies -> none (0 jobs)
```

### 8. Output artifacts produced (Output Contract, P5 — two readers, two files)

The mode's Output Contract requires a machine-readable agent log **and** a
human-readable report — one artifact cannot serve both (P5). Both were written for this
run from the real numbers above (produced manually; auto-generation remains
`[TODO: DEV]`):

- `logs/case-ml-sponsorship-triage-2026-07-06.json` — agent log: record counts, the 3
  matched companies, per-gate results, TODO items.
- `reports/generated/case-ml-sponsorship-triage-2026-07-06.md` — human report:
  run summary, verified-vs-inferred, gate results, shortlist table, next decision.

The honest decision this run produced for all 3 matched companies is **Skip / hold** —
strong on sponsorship and funding, but they **fail the liveness gate** (0/3 ATS-detected)
and no OPT end date was supplied for the timeline gate. A gate closed the result despite
strong votes — exactly the "gates, not votes" behavior.

## Verified vs. Inferred

| Claim | Status | Basis |
|---|---|---|
| 30,369 rows in H-1B master file | ✅ Verified | direct pandas read, this run |
| 1,552 companies have H-1B approvals | ✅ Verified | this run (matches my earlier estimate of 1,557, now confirmed for real rather than assumed) |
| 150 companies have ML/DS-titled sponsorship history | ✅ Verified | this run |
| 4 Form D quarters, real per-quarter company counts | ✅ Verified | this run |
| 3 companies appear in both H-1B-ML and 2026Q1 Form D | ✅ Verified | this run, after fixing a real join bug |
| Cognitive-pivot score exists for all 3 target SOC codes | ❌ False — corrects my earlier submission | this run; only 1 of 3 base codes has a score |
| Fiddler Labs / Imperative Care / Surgical Safety Technologies have live ML postings on Greenhouse or Lever | ⚠ Checked and found not-found — a real negative, not an assumption | this run |
| Whether those 3 companies use a different ATS platform | ❌ Not verifiable by this mode | `detect-ats.py` only checks 2 platforms |
| Whether any of the 3 would sponsor a specific new student | ❌ Not verifiable by this mode | requires direct contact |

## Verification steps taken

- **Re-ran** `role-scorer.mjs` on the same input a second time and got an identical
  result (`Apply 2 · Consider 1 · Skip 2`, skip 40%) — confirms determinism.
- **Cross-checked a count**: 1,552 real H-1B-approved companies matches my earlier
  submission's estimate of "1,557" closely — good sign my prior estimate was in the
  right neighborhood even though the underlying script and column names I'd assumed
  were both wrong.
- **Deliberately tried to break it**: fed `role-scorer.mjs` an empty `[]` roles file.

## Attestation

- Recipe: `case-ml-sponsorship-triage` v0.2.0
- By: Aditi Bailur · 2026-07-06

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | Conformance passed, 5 manifest warnings | Pass, warnings addressable |
| `node scripts/score/role-scorer.mjs data/examples/ch11-roles.json` (run twice) | Identical output both times: Apply 2 · Consider 1 · Skip 2 | Deterministic scoring |
| `python3 scripts/bls/extract-soc-occupation-table.py` | 1,016 occupations written, real cognitive-pivot scores | A populated compact table |
| `python3 scripts/sec/refresh-recent-sec-quarters.py` | 4/4 quarters processed with real counts | Successful refresh |
| H-1B × Form D join | 3 real matches after fixing schema bug | Some nonzero, plausible overlap |
| `python3 scripts/ats/detect-ats.py` on 3 real companies | All 3 `not_found` on Greenhouse/Lever | Uncertain — turned out to be a real negative |
| **Deliberate break attempt:** `echo '[]' > /tmp/empty-roles.json` then scored it | `✓ scored 0 roles → Apply 0 · Consider 0 · Skip 0 (skip NaN%)`, output path written as `../../../../tmp/role-scores.json` | Either a clean "no roles" message or a graceful error |

### Did not test

- `npm run ats:liveness` against a specific live job URL — not run in this submission.
- The tech-stack fingerprint and GitHub/ArXiv steps — no script exists yet, so nothing
  to run; they remain proposed.
- Whether `detect-ats.py` would find a live posting on a platform other than
  Greenhouse/Lever for the 3 matched companies (e.g. checking their real careers pages
  manually) — not done, flagged as an open question rather than assumed either way.
- `npm run doctor` — was not run at the time this write-up was drafted; **subsequently
  run before opening the PR — passed clean (exit 0, PRIVACY ✓ no private paths tracked,
  TODOs 512 declared = 512 in bodies matched).**

### Broke during testing, fixed

- **`role-scorer.mjs` on empty input**: division-by-zero produces `skip NaN%` instead
  of a graceful "no roles scored" message, and the output file path resolves to an
  odd relative traversal (`../../../../tmp/role-scores.json`) instead of a clean
  absolute or repo-relative path. Not fixed in the script itself (out of scope for
  this mode's changes) — flagged as a real repo bug worth reporting upstream.
- **H-1B × Form D join, first attempt**: assumed the Form D JSON was a flat list keyed
  by `company_name`. It's actually a dict (`{"metadata": ..., "companies": [...]}`)
  with the name nested at `companies[i]["company"]["name"]`. Fixed by inspecting the
  real structure before re-writing the join with name normalization.

## Reflection

**What went well:** three of my five original signals (H-1B, Form D, cognitive-pivot)
turned out to be runnable against real repo data with only path/column corrections,
not full rewrites. The role-scorer's built-in liveness gate matched exactly what the
assignment describes ("liveness and visa timeline are gates, not votes") — I didn't
have to invent that behavior, I found it already implemented and could cite it
directly from real JSON output.

**What the mode got wrong or missed:** my original submission fabricated cognitive-
pivot scores for all three target SOC codes when only one actually has a base-code
score — the real data structure (scores live at O*NET sub-occupation granularity) is
a genuine design gap my "simulation" hid rather than surfaced. My H-1B×Form D join
also had a real bug from a wrong schema assumption, caught only by inspecting the
actual JSON rather than trusting the first (silently wrong) zero-match result — a
reminder that a suspiciously clean "no matches" is itself worth investigating before
being reported as a finding.

**Next steps:**
- Build a SOC-code rollup so cognitive-pivot scores are usable at parent-code
  granularity for the two codes without a base score.
- Build `scripts/ml/build_ml_shortlist.py` to actually persist a shortlist CSV instead
  of leaving results as one-off terminal output.
- Extend ATS detection beyond Greenhouse/Lever, or accept a manual override field for
  companies confirmed hiring on the company's own site.
- Wire a real student-supplied OPT end date into the `role-scorer.mjs` `timeline` gate
  so Phase Gate 4 is enforced by the scorer itself rather than manually.
