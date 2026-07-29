# Reallocation Engine — Application Effort Report
**Generated:** 2026-07-28 23:27
**Effort budget:** 40 hours/week

## ⚠️ HARD-STOP GATE
> This report is a **RECOMMENDATION ONLY**. No application has been submitted, no resource committed. A human must review and explicitly approve each company before any application effort is spent. Liveness must be verified with `npm run ats:liveness` before applying.

## Data Validation (GIGO)
- Total companies in dataset: 30,369
- Gate passed (approvals≥3, rate≥60%): 10 shown (top-N)
- Gate failed / skipped: 29,143

**Hidden assumptions in this dataset:**
- ASSUMPTION 1: Approval_Rate is computed over all petitions ever filed, not just recent ones. A company with 100% rate on 2 petitions in 2015 looks identical to one with 99% on 1,000 petitions in 2025.
- ASSUMPTION 2: latest_funding_date reflects the most recent SEC Form D filing, which may lag actual funding by 15 days to 6 months.
- ASSUMPTION 3: The dataset does not distinguish H-1B cap-subject petitions from cap-exempt ones (universities, nonprofits). Cap-exempt sponsors are not useful to an OPT student needing a cap-subject petition.
- ASSUMPTION 4: company_name matching is exact-string. 'DATABRICKS INC' and 'Databricks' are treated as different companies.

**Warnings:**
- 28812 rows (94.9%) have null Total Approvals — treated as 0, not as 'no sponsorship history'.
- 2495 rows (8.2%) have no funding date — funding score will be 0 for these companies.

## Reallocation Recommendations

| Rank | Company | H-1B Score | Funding Score | Composite | Uncertainty | Effort (hrs) | Action |
|---|---|---|---|---|---|---|---|
| 1 | DATABRICKS INC | 0.87 | 1.00 | 0.89 | ±0.00 | 4.5 | PURSUE |
| 2 | INTEL CORP | 1.00 | 0.64 | 0.85 | ±0.00 | 4.3 | PURSUE |
| 3 | GRAMMARLY INC | 0.72 | 0.97 | 0.81 | ±0.00 | 4.1 | PURSUE |
| 4 | PACIFIC LIFE INSURANCE CO | 0.67 | 1.00 | 0.79 | ±0.00 | 4.0 | PURSUE |
| 5 | SPANIO INC | 0.66 | 1.00 | 0.79 | ±0.00 | 4.0 | PURSUE |
| 6 | MATI THERAPEUTICS INC | 0.61 | 1.00 | 0.77 | ±0.00 | 3.9 | PURSUE |
| 7 | ICON TECHNOLOGY INC | 0.89 | 0.51 | 0.76 | ±0.00 | 3.8 | PURSUE |
| 8 | VROOM INC | 0.59 | 1.00 | 0.75 | ±0.00 | 3.8 | PURSUE |
| 9 | TREELINE BIOSCIENCES INC | 0.59 | 1.00 | 0.75 | ±0.00 | 3.8 | PURSUE |
| 10 | AIERA INC | 0.69 | 0.80 | 0.75 | ±0.00 | 3.8 | PURSUE |

## What This Engine Cannot Verify
- **Current sponsorship intent.** Approval history is past behavior.
- **Liveness.** Run `npm run ats:liveness <url>` before applying.
- **Cap-subject vs cap-exempt.** Universities appear as strong sponsors but cannot file cap-subject H-1B petitions for OPT students.
- **Causal validity.** The composite score optimizes a correlation (past approval rate × funding recency × role resilience). It does NOT establish that applying to these companies *causes* better sponsorship outcomes. Company size is a confounder that cannot be controlled for with this dataset alone.

## Objective Statement
**This engine optimizes:** Expected sponsorship signal strength × funding health × role resilience, weighted by the student's OPT timeline constraints.
**What this objective leaves out:** actual hiring intent, current headcount freeze, role-title match, interview pipeline speed, and geographic constraints.