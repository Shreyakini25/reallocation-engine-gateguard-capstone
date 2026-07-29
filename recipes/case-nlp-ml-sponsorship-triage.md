---
status: RUNNABLE-SAMPLE
todos_open: 4
last_gate: gate-4-script-readiness
attestation: "Wenhan Cheng · 2026-07-04 · RUNNABLE-SAMPLE"
recipe_version: 0.2.0
---

# Case: NLP/ML Sponsorship Triage
## `case-nlp-ml-sponsorship-triage`

**Who this is for:** International CS graduate student (Northeastern University,
F-1 OPT, STEM extension eligible, program end 2026-08-19) targeting
Software Engineer (AI Platform / Backend) roles that require H-1B sponsorship.

**When to use it:** Before spending application effort on any company in the
NLP/ML hiring space. Run this recipe first; run `oferta.md` only on companies
that clear the triage gates here.

---

## Purpose

Separates NLP/ML employers worth full application effort from ghost, stale,
or unverifiable employers. Uses three verified data layers in order:

1. **80 Days to Stay** — H-1B sponsorship history + SEC Form D funding,
   filtered to ML-adjacent SOC codes (15-2051, 15-1252, 15-1211)
2. **Job-Ops** — ATS provider detection + posting liveness (a hard gate,
   not a vote)
3. **Cognitive Pivot** — BLS/O*NET cognitive-pivot score to identify roles
   resilient to AI substitution

Prime directive: verified local data first. LLM judgment only after data
has been checked.

---

## Source Inventory

| Source | Path | Verified present? | Human check |
|---|---|---|---|
| H-1B + funding mapped data | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | ✅ 30,370 rows confirmed | Confirm audit file is current before filtering |
| H-1B audit report | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md` | ✅ present | Read before running — flags known coverage gaps |
| BLS/O*NET compact | `data/BLS/compact/soc_occupation_compact.csv` | ✅ present | Confirm `cognitive_pivot_score` column is populated for target SOCs |
| ATS portal config | `data/ats/portals.yml` | ✅ present (copied from example) | Add target companies before live scan |
| DOL LCA job-title data | `data/lca-disclosure/lca-disclosure-YYYY.csv` | ❌ does not exist | [TODO: DATA SOURCE] Download from dol.gov/agencies/eta/foreign-labor/performance before using LCA filter step |

---

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| Company shortlist | CSV or text list | Student-assembled from job board; verified against `SEC_DOL_H1b_data_mapped.csv` | Yes |
| Target SOC codes | text | 15-2051, 15-1252, 15-1211 (confirm with O*NET before filtering) | Yes |
| Job posting URLs | URL list | From ATS scan output or manual search | Yes for liveness gate |
| OPT timeline | dates | From student's EAD card and I-20 | Yes — visa gate |

---

## Phase Gates

All gates are hard stops. A SKIP decision here means do not apply,
regardless of role fit.

**Gate 1 — Sponsorship history present**
Condition: `Total Approvals` >= 5 AND `Approval_Rate` >= 0.70 for at least
one of SOC 15-2051, 15-1252, or 15-1211 in `SEC_DOL_H1b_data_mapped.csv`.
Test: `grep -i "<company>" data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`
Fail action: mark company SKIP. Do not infer sponsorship from company size or reputation.

**Gate 2 — Funding recency**
Condition: `latest_funding_date` within 24 months of today OR company is public.
Test: check `latest_funding_date` field in CSV row.
Fail action: flag as STALE-FUNDING. Escalate to manual check before applying.

**Gate 3 — Liveness (hard gate)**
Condition: `npm run ats:liveness -- <url>` returns `active`, not `expired` or `uncertain`.
Fail action: SKIP this specific posting. Do not apply to uncertain or expired URLs.
Note: `uncertain` means no apply control was found — treat as expired until
manually confirmed.

**Gate 4 — OPT timeline compatibility**
Condition: Student has >= 80 unemployment days remaining AND OPT expiry
gives enough runway for H-1B cap lottery cycle (typically needs 12+ months).
Fail action: flag timeline risk. Do not apply without DSO confirmation.

**Gate 5 — Cognitive resilience**
Condition: `cognitive_pivot_score` >= 3.88 for target SOC in
`data/BLS/compact/soc_occupation_compact.csv`.
Fail action: flag for review — role may be automation-vulnerable.

---

## Steps

### Step 1 — Build verified shortlist from H-1B data

```bash
grep -i "<company_name>" data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
```

Filter for:
- `Total Approvals` >= 5 (for ML SOC codes)
- `Approval_Rate` >= 0.70
- `latest_funding_date` within 24 months

Save output to `data/ats/nlp-ml-shortlist-YYYY-MM-DD.csv`.

Do NOT add companies based on reputation alone. If a company is not in the
dataset, mark it `sponsorship: Unknown` and handle in Step 5.

**Verified example (Databricks, from real data):**
- Total Approvals: 1,640
- Approval Rate: 99.51%
- Latest funding: $1.07B Series D+, 2025-09-08
- Top titles: Software Engineer, Senior Software Engineer, Solutions Architect

### Step 2 — Score role resilience (BLS/O*NET)

```bash
grep -i "15-2051\|15-1252\|15-1211" data/BLS/compact/soc_occupation_compact.csv \
  | cut -d',' -f1,3,32
```

Verified scores from real data (2026-07-04):
- 15-1211.00 Computer Systems Analysts: 4.12
- 15-1252.00 Software Developers: 3.88
- 15-2051.00 Data Scientists: score field empty in current extract

If `cognitive_pivot_score` is empty for a SOC code, write:
`cognitive_pivot_score: missing — BLS extract incomplete for this SOC.`
Do not substitute an LLM estimate.

### Step 3 — ATS detection and scan

```bash
npm run ats:scan -- --dry-run
```

Removes `--dry-run` flag only after reviewing output. Live scan writes to
`data/ats/pipeline.md`.

### Step 4 — Liveness check (hard gate)

```bash
npm run ats:liveness -- <job-url>
```

Results:
- `active` → posting confirmed live, proceed
- `expired` → SKIP, do not apply
- `uncertain` → treat as expired; manually verify before applying

### Step 5 — Handle unverified companies

Companies not in `SEC_DOL_H1b_data_mapped.csv`:
- Mark `sponsorship: Unknown`
- Do not infer from company size, funding, or name
- Run liveness check as normal
- Escalate to `oferta.md` for full individual evaluation

### Step 6 — Assemble triage report

Save to `reports/generated/nlp-ml-triage-YYYY-MM-DD.md`.

Priority definitions:
- **Pursue**: Approvals >= 5, rate >= 0.70, funded < 24 months, liveness = active
- **Investigate**: One criterion missing or borderline
- **Skip**: No H-1B history for ML SOC, stale funding, liveness = expired/uncertain

---

## What This Recipe Can Verify

- H-1B approval count and rate for ML SOC codes — from `SEC_DOL_H1b_data_mapped.csv`
- SEC Form D funding recency and amount — from same file
- ATS provider presence — from `npm run ats:scan`
- Job posting liveness — from `npm run ats:liveness`
- O*NET cognitive-pivot score for target SOC codes — from BLS compact extract

## What This Recipe Cannot Verify

- Whether a company will sponsor YOUR specific visa situation. Approval history
  is past behavior, not a current commitment.
- Whether `uncertain` liveness means the posting is live. Some ATS platforms
  return 200 for expired postings with no apply button.
- LCA job-title-level sponsorship data (e.g., "NLP Engineer" specifically).
  [TODO: DATA SOURCE] Requires `data/lca-disclosure/` which does not yet exist.
- SOC cognitive score for 15-2051 — field is empty in current BLS extract.
  Do not substitute an estimate.
- Current HR policy at any company. A 99% approval rate in the dataset
  does not mean the company is currently sponsoring.

---

## Output Contract

### Agent log
File: `logs/case-nlp-ml-sponsorship-triage-YYYY-MM-DD.json`
Required fields: `workflow`, `run_id`, `mode`, `steps_completed`,
`records_seen`, `gate_results`, `stop_conditions`, `todo_items`,
`generated_at`, `verified_findings`, `inferred_findings`

### Human report
File: `reports/generated/nlp-ml-triage-YYYY-MM-DD.md`

```markdown
# NLP/ML Sponsorship Triage — YYYY-MM-DD

## Shortlist

| Company | H-1B Approvals (ML SOC) | Approval Rate | Funding Recency | ATS | Liveness | Cog. Score | Priority |
|---|---|---|---|---|---|---|---|
| Databricks | 1,640 | 99.51% | 2025-09 (Series D+) | Greenhouse | uncertain* | 3.88 (15-1252) | Investigate* |

*liveness returned uncertain on careers page — specific role URL required

## Unverified Companies

| Company | Reason | Next Action |
|---|---|---|

## Missing Data

-

## Next Actions

-
```

---

## Stop Conditions

- Stop if `SEC_DOL_H1b_data_mapped.csv` is not present or audit shows
  coverage gaps for target companies.
- Stop if OPT unemployment days remaining < 80 without DSO consultation.
- Stop if liveness returns `expired` — do not apply to this posting.
- Stop if `cognitive_pivot_score` is missing for target SOC — do not
  substitute an LLM estimate.
- Stop before any immigration or legal conclusion — this recipe produces
  evidence, not legal advice.

---

## Log Template

```markdown
## YYYY-MM-DD — NLP/ML sponsorship triage

- **Mode:** case-nlp-ml-sponsorship-triage
- **Status reached:** RUNNABLE-SAMPLE
- **Inputs:** SEC_DOL_H1b_data_mapped.csv, soc_occupation_compact.csv,
  portals.yml, [job URLs]
- **Commands run:** ats:scan --dry-run, ats:liveness, grep on H-1B CSV,
  grep on BLS compact
- **Outputs:** reports/generated/nlp-ml-triage-YYYY-MM-DD.md
- **Result:** N companies checked; M Pursue; K Investigate; J Skip
- **Open issues:** LCA data missing; 15-2051 cognitive score empty;
  liveness uncertain on careers pages (need role-specific URLs)
```

---

## Proposed Additions

### [TODO: DATA SOURCE] DOL LCA job-title disclosure data
Path: `data/lca-disclosure/lca-disclosure-YYYY.csv`
Source: dol.gov/agencies/eta/foreign-labor/performance (quarterly)
Rationale: Current H-1B data aggregates by company. LCA data contains
exact petition job titles ("NLP Engineer", "LLM Research Scientist"),
enabling verification that a company has specifically sponsored the
role type the student is targeting — not just broad SOC codes.
Data contract: Source Data Layer, same as `data/BLS/` and
`data/80-days-to-stay/`. Raw files untouched; processed extracts
to `data/lca-disclosure/processed/`.

### [TODO: DEV] LCA filter script
Path: `scripts/lca/extract-nlp-ml-roles.py`
Would filter LCA data by keywords ("NLP", "LLM", "language model",
"machine learning") and SOC codes 15-2051, 15-1252, 15-1211.
Does not exist yet — outputs from this step must be labeled PROPOSED
until the script is built and tested.
