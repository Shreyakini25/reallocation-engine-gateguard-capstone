## 2026-07-04 — NLP/ML sponsorship triage · RUNNABLE-SAMPLE run

- **Mode:** case-nlp-ml-sponsorship-triage v0.2.0
- **Status reached:** RUNNABLE-SAMPLE
- **Inputs:**
  - `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` (30,370 rows)
  - `data/BLS/compact/soc_occupation_compact.csv`
  - `data/ats/portals.yml` (copied from portals.example.yml)
  - Target company: Databricks
  - Liveness URL: `https://www.databricks.com/company/careers/open-positions`
- **Commands run:**
  - `npm run verify` — passed (4 warnings, 0 errors)
  - `npm run ats:scan -- --dry-run` — 50 Databricks offers found
  - `npm run ats:liveness -- <url>` — uncertain (general careers page)
  - `grep -i "databricks" SEC_DOL_H1b_data_mapped.csv` — 1,640 approvals, 99.51%
  - `grep "15-2051|15-1252|15-1211" soc_occupation_compact.csv` — scores retrieved
- **Outputs:**
  - `reports/generated/nlp-ml-triage-2026-07-04.md` (proposed — not yet written by script)
  - This log entry
- **Result:**
  - Databricks: 1,640 H-1B approvals (99.51%), $1.07B Series D+ (2025-09),
    50 active postings in dry run, liveness uncertain on index page
  - 15-1252 cognitive score: 3.88 ✅
  - 15-2051 cognitive score: missing ⚠️
- **Open issues:**
  1. Liveness tested on careers index page — need role-specific URL for
     `active` result. Re-run required.
  2. 15-2051 (Data Scientists) cognitive_pivot_score is empty in BLS extract.
     Cannot score role resilience for this SOC without investigation.
  3. LCA job-title data (`data/lca-disclosure/`) does not exist.
     NLP/LLM-specific sponsorship verification blocked until data is downloaded.
  4. `portals.yml` only contains example config (Databricks).
     Add target companies before live scan.
