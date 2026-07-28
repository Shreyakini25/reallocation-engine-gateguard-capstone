# AI-Washing Reverse-Filter Triage — Run Report (2026-07-20, sample mode)

**Recipe:** `recipes/case-ds-opt-ai-washing-triage.md` v0.1.0 · **Status:** RUNNABLE-SAMPLE
**Reader:** the OPT student + advising human · **Decides:** pursue / hand-check / drop each role.

## Run summary

A sample-mode run of the AI-washing reverse filter against the one tracked company in
`data/ats/portals.yml` (Databricks). The dry-run scan completed; classification and the
H-1B join were done by hand (the dedicated automation script is an open DEV TODO). The
headline finding: **Databricks' current "AI/ML/Data"-labeled openings are overwhelmingly
go-to-market / consulting / management roles, not IC data-science roles** — a textbook case
of the asymmetry this recipe targets.

## Purpose

Keep OPT students from spending scarce application time on postings that read technical but
are really sales, solutions, field, marketing, or management roles wearing an AI/ML/Data label.

## Sources used

| Source | Role | Verified? |
|---|---|---|
| `data/ats/portals.yml` | company + title filters | yes (copied from example) |
| `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | company-level H-1B evidence | yes |
| `scripts/ats/scan.mjs` (`npm run ats:scan`) | ATS scan | yes (dry-run, exit 0) |
| `data/bls/compact/soc_occupation_compact.csv` | SOC role quality | not exercised this run |

## Phase-gate results

| Gate | Result |
|---|---|
| 1 Problem | pass — company set + target family named |
| 2 Local evidence | pass — both CSVs present |
| 3 Stored script | pass — after `portals.yml` created (was blocking) |
| 4 Small run | pass — dry-run exit 0, 787 → 58 offers |
| 5 Approval | **blocked** — no live scan (held; `[TODO: APPROVE]`) |
| 6 Report | pass — this report + valid JSON log |

## Scan summary (verified)

| Metric | Value |
|---|---:|
| Companies scanned | 1 |
| Total jobs found | 787 |
| Removed by title filter | 330 |
| Removed by location filter | 396 |
| Duplicates skipped | 3 |
| New offers surfaced | 58 |

## Triage table (representative offers)

Labels are **model judgments over title strings**, not JD reads (see inferred findings).

| Title | Company | Class | H-1B evidence | Sponsored-title match | SOC | Action |
|---|---|---|---|---|---|---|
| AI Engineer - FDE | Databricks | Mixed | Company-level (1640/8) | Related titles present | title-inferred | Manual Review |
| Specialist Solutions Architect - AI/ML | Databricks | Mixed | Company-level | Solutions Architect sponsored | uncertain | Manual Review |
| Sr. Solutions Architect - AI Natives Business | Databricks | Skip | Company-level | — | not checked | Skip |
| Product Marketing Director, Lakewatch | Databricks | Skip | Company-level | — | not checked | Skip |
| Strategic Genie and AI Sales Specialist | Databricks | Skip | Company-level | — | not checked | Skip |
| Sales Dev AI Program Manager | Databricks | Skip | Company-level | — | not checked | Skip |
| Sr Security Engineer, Incident Response | Databricks | Skip | Company-level | — | not checked | Skip |

**Skip rate:** majority of surfaced offers → Skip. Zero unambiguous IC `Data Scientist` /
`ML Engineer` / `Data Engineer` titles appeared. Per the domain, a high skip rate is success.

## Verified findings

- Scan produced 787 jobs → 58 offers for Databricks (dry run, exit 0).
- `Databricks` → `DATABRICKS INC` in the H-1B CSV (fuzzy join): **1640 approvals / 8 denials /
  99.51% approval rate / $149,422.50 median**; sponsored titles include Software Engineer and
  (Specialist) Solutions Architect.

## Inferred findings (model judgment — labeled)

- Every Target/Mixed/Skip label is a bounded judgment over the title string. No JD was read.
- "AI Engineer - FDE" and "Specialist Solutions Architect - AI/ML" are **Mixed**, not Skip,
  *because* the H-1B row shows Databricks sponsors Solutions-titled roles — worth a hand-check.

## Typed TODOs (open)

- `[TODO: DEFINE]` exact `student_run_envelope` field schema.
- `[TODO: DEV]` `scripts/ats/ai-washing-triage.mjs` to automate classify + fuzzy H-1B join.
- `[TODO: APPROVE]` clearance for a live (writing) scan.

## Next decision

1. Approve a **live** scan (gate 5) to persist `pipeline.md` and widen beyond Databricks.
2. Hand-check the two **Manual Review** rows against their JDs.
3. Add more sponsor-heavy Data/AI companies to `portals.yml` and re-run — one company yields
   too few IC Target roles to fill an OPT application budget.
