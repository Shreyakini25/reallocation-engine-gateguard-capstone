---
status: RUNNABLE-SAMPLE
todos_open: 2
last_gate: score-run-confirmed
attestation: Shreya Kini 2026-06-26
recipe_version: 0.2.0
---

# case-sap-h1b-sponsorship-audit

## Purpose

Use this mode when you are an international MS graduate on OPT who has
received or is evaluating a job offer from an SAP ecosystem employer and
needs to verify the employer H-1B sponsorship record and role resilience
before accepting. This mode is post-offer, not pre-search.

## Who Uses This

MS graduate on post-completion OPT, STEM OPT extension eligible, employed
at or evaluating an offer from an IT consulting firm or direct-hire SAP
product company. Needs to distinguish they file H-1B from they file H-1B
for this SOC code at a wage level USCIS will approve.

## Source Inventory

- data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv: Total Approvals, Denials, Approval_Rate, median_salary_offered
- data/BLS/compact/soc_occupation_compact.csv: SOC cognitive demand scores, median wage
- npm run score: Composite sponsorship and fit score with arithmetic trace

Scripts to run in order:

    grep 15-1252 data/BLS/compact/soc_occupation_compact.csv
    grep -i EMPLOYER data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
    npm run score -- private/sap-roles.json --profile private/sap-profile.json --md private/report.md
    npm run verify
    npm run doctor

Input schema confirmed working 2026-06-26: scorer reads .p only, not .value or .score.
Found in source scripts/score/role-scorer.mjs line 77.

## Proposed Additions

[TODO] scripts/lca/fetch_lca_employer_summary.py
Rationale: DOL LCA quarterly disclosure files contain wage level distribution
per employer per SOC. Manual lookup takes 20-30 minutes and produces estimates.

[TODO] scripts/h1b/fetch_employer_approval_rate.py
Rationale: USCIS employer-level approval/denial data. Mapped dataset covers
approximately 5 percent of employers only.

## Phase Gates

- EMPLOYER-IN-DATASET: grep employer against CSV. Record FOUND or NOT FOUND or AMBIGUOUS.
- SOC-CONFIRMED: Confirm SOC in soc_occupation_compact.csv before scoring.
- LIVENESS-CHECK: Run npm run ats:liveness for new postings.
- WAGE-LEVEL-HUMAN-CHECK: Manually verify LCA wage level at dol.gov before signing.

## What This Mode Can and Cannot Verify

| Claim | Source type |
|---|---|
| Employer appears in H-1B dataset | record |
| Total Approvals / Denials / Approval_Rate | record |
| Composite score with arithmetic trace | record + model-judgment |
| Role resilience cognitive demand score | record |
| Wage level distribution Level I-IV | NOT VERIFIED — TODO script missing |
| USCIS denial rate for employer+SOC | NOT VERIFIED — TODO script missing |
| Whether employer will file before OPT expires | NOT VERIFIED — HR conversation required |

## Output Contract

Agent log JSON: private/sponsorship-audit-YYYY-MM-DD.json
Human report Markdown: private/sponsorship-audit-YYYY-MM-DD.md
One artifact cannot serve both readers.

## Stop Conditions

Refuse to score when: employer ambiguous in dataset, SOC not confirmed,
fit.p not provided, OPT end date not provided. Output the gap. Do not guess.

## Log Template for logs/RUN_LOG.md

    Date: YYYY-MM-DD

    * Mode: case-sap-h1b-sponsorship-audit v0.2.0
    * Inputs: employer name, SOC code, OPT end date, roles JSON
    * Commands run:
        grep employer data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
        grep soc data/BLS/compact/soc_occupation_compact.csv
        npm run score -- private/sap-roles.json --profile private/sap-profile.json --md private/report.md
    * Outputs: private/sponsorship-audit-YYYY-MM-DD.json, private/sponsorship-audit-YYYY-MM-DD.md
    * Result: Apply blank, Consider blank, Skip blank
    * Open issues: LCA wage level TODO. USCIS approval rate TODO.
