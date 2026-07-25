# GIGO Gate Audit - `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`

Audited 2026-07-20 for the reallocation-audit tool (`scripts/reallocate/allocate.mjs`). All numbers below are computed directly from the CSV (script inline, reproducible - see commands at bottom); none are estimated.

## Hidden assumptions this dataset makes (that are not true)

1. **"H-1B title history predicts current hiring."** `top_job_titles_sponsored` reflects titles the company sponsored historically - the petition record can be 2-3 years stale. A company's *current* team composition is not observable from this field (see Component 4 - the Roblox case).
2. **"Approval_Rate is a stable statistic at any N."** It is not. A company with `Total Approvals=2, Total Denials=0` reads `Approval_Rate: 100.0%` - indistinguishable in the raw field from a company with 200 approvals and the same rate, even though the first is statistical noise.
3. **"Absence from this dataset means the company doesn't sponsor."** It means the company has no *matched* SEC Form D + DOL H-1B record in this specific join - a large public company (e.g. AMD, tested below) can be a real, active sponsor and simply not appear, because Form D covers private securities offerings, not public companies.
4. **"The measurement protocol is uniform."** `top_job_titles_sponsored` is unstructured free text sourced from DOL LCA/H-1B filings across companies and years - title wording is not standardized (e.g. "ML Engineer" vs. "Machine Learning Engineer II" vs. "MLE").

## The checkable quality gate implemented

A company is **scoreable** only if, from the raw row:
```
Total Approvals >= 5   AND   top_job_titles_sponsored is non-null/non-empty
```
A human can check both clauses by opening the CSV row directly - no model judgment required.

## What fails the gate, and what the tool does

Run against the full dataset (all H1B-bearing rows, i.e. rows with any approvals or denials recorded):

| Check | Result |
|---|---|
| Total rows in CSV | 30,369 |
| Rows with any H1B signal (approvals or denials present) | 1,557 (5.1% of all rows) |
| Of those, pass the gate (`Total Approvals >= 5`) | 1,023 (65.7%) |
| Rejected by the gate (`Total Approvals < 5`) | 534 (34.3%) - **over a third of all H1B-bearing companies would be statistical noise if scored on raw Approval_Rate alone** |

**Gate pass rate by funding stage** (this is also the input to the Component 3 bias audit - the same gate that protects against N=2 noise also has a funding-stage skew):

| Stage | n (H1B rows) | Pass gate | Pass rate | Avg approvals |
|---|---|---|---|---|
| Series D+ | 249 | 219 | 88.0% | 208.3 |
| Series C | 265 | 208 | 78.5% | 93.3 |
| Series B | 364 | 237 | 65.1% | 85.8 |
| Series A | 332 | 188 | 56.6% | 21.5 |
| Seed | 189 | 95 | 50.3% | 20.3 |
| Pre-Seed | 138 | 66 | 47.8% | 32.3 |
| Unknown/None | 20 | 10 | 50.0% | 163.9 |

**On the 11-company sample run** (`data/raw/reallocation-audit/candidates.json`):
- 2 of 11 rejected: `AMD` (no H1B row found - not in this dataset's join), `ZOOM VIDEO COMMUNICATIONS INC` (Total Approvals=2, below the floor of 5).
- Both rejections are documented in `data/raw/reallocation-audit/reallocation-plan.json` → `gate_log`, with the exact reason and (for Zoom) the raw approvals/denials/rate that triggered it.

## Reproduce this audit
```bash
python3 -c "
import csv
rows = list(csv.DictReader(open('data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv')))
h1b = [r for r in rows if (r.get('Total Approvals') or '0') not in ('','0') or (r.get('Total Denials') or '0') not in ('','0')]
passed = [r for r in h1b if float(r.get('Total Approvals') or 0) >= 5]
print(len(rows), len(h1b), len(passed))
"
node scripts/reallocate/allocate.mjs data/raw/reallocation-audit/candidates.json
```
