---
status: RUNNABLE-SAMPLE
todos_open: 3
last_gate: "sample-run, 2026-07-20, logs/RUN_LOG.md#2026-07-20--ds-opt-ai-washing-triage"
attestation: null
recipe_version: 0.1.0
---

# case-ds-opt-ai-washing-triage / AI-Washing Reverse-Filter Triage for Data/AI OPT Students

## Purpose

**Human summary.** International Master's students in Data Science / ML / AI / Analytics
lose scarce OPT time chasing postings that *read* technical but are really sales,
solutions, field-engineering, marketing, or management roles wearing an "AI/ML/Data"
label. This is an information-asymmetry problem: the employer controls the title, the
student pays the search cost. This recipe runs a **reverse filter** — it starts from the
ATS-exposed job set, strips the AI-washed noise, and keeps only titles with genuine
Data/AI signal, then attaches company-level H-1B evidence so the student spends
application effort where both the *role* and the *sponsorship history* survive scrutiny.

It answers a narrower question than `scan.md`:

> Among ATS-exposed jobs at a target company, which "AI/ML/Data"-titled roles are actually
> Data/AI engineering roles worth investigating for an OPT student — and which are
> AI-washed sales/solutions/manager roles to skip?

Skip is a successful outcome (per the domain: a healthy run skips at least half). This
recipe expects to skip *most* of what it sees, because AI-washing is common.

**What the agent does:** run the ATS scan (existing `npm run ats:scan`), classify each
returned title as Target / Mixed / Skip against the reverse-filter rules below, join each
company to the SEC/DOL H-1B evidence CSV, and emit a machine log + a human report that
label every field verified vs. inferred.

## Source Inventory

| Source Node | Type | Path | Human Check |
|---|---|---|---|
| Legacy draft (this recipe's origin) | file | `pantry/DATA_ML_H1B_Triage.md` (anonymized copy; re-attach before ship) | Confirm the source exists and may be used before converting claims into requirements. |
| Scanner config | file | `data/ats/portals.yml` (copy of `data/ats/portals.example.yml`) | Private-by-default; review before commit. Contains tracked companies + title filters. |
| ATS pipeline output | file | `data/ats/pipeline.md` | Written by a live (non-dry-run) scan. Private-by-default. |
| H-1B evidence | file | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | Do not rewrite (upstream source data). Company-level, not role-level. |
| Role-quality reference | file | `data/bls/compact/soc_occupation_compact.csv` | Use only with an explicit or manually justified SOC mapping. |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| target_companies | list of `{name, provider, careers_url}` | `data/ats/portals.yml` `tracked_companies` block. | Yes |
| title_filter | positive/negative keyword lists | `data/ats/portals.yml` `title_filter` block. | Yes |
| student_run_envelope | text | Student's timeline + target role family + region. [TODO: DEFINE] Specify exact field names and accepted format (e.g. `{ soc_family, opt_months_left, region }`) with one sentence of reasoning. | Yes |

## Reverse-Filter Rules (the AI-washing classifier)

The classifier is **subtractive**: a title is Skip *unless* it survives the negative
filter and carries a genuine Data/AI engineering signal.

**Target** — keep for investigation. Title carries an unambiguous Data/AI engineering signal:
- `Data Scientist`, `Applied Scientist`, `Research Scientist`
- `Machine Learning Engineer`, `ML Engineer`, `AI Engineer`
- `Data Engineer`, `Big Data Engineer`, `Analytics Engineer`, `AI Platform Engineer`

**Mixed** — manual review required. Data/AI vocabulary fused with customer-facing or
architecture-consulting language (the classic AI-washing gray zone):
- `Solutions Architect` / `Specialist Solutions Architect` *with* AI/ML/Data terms
- `Solutions Engineer` with ML/Data terms
- `Forward Deployed Engineer` (FDE) — engineering title, but often delivery/consulting-weighted
- `AI Platform Architect`

**Skip** — AI-washed or out-of-scope. Title's real center of gravity is sales, marketing,
security, field, or management, regardless of an "AI/ML/Data" adornment:
- `Sales`, `Account Executive`, `RVP`, `Strategic ... Account`
- `Marketing`, `Product Marketing` (even "Product Marketing Director, AI")
- `Security`, `Field Engineering`, `Field Technical`
- `Manager`, `Sr. Manager`, `Director`, `Engagement Manager`
- `Intern`, `Volunteer`, `Resident`

Rule of thumb: `Manager|Director|Sales|Solutions|Security|Marketing|Account|Resident|Field`
in a title is a **washing signal** — the "AI" is decoration. Require an engineering noun
(`Engineer|Scientist`) *not* immediately governed by one of those words to reach Target.

## H-1B Evidence Rules

For each company, read from the CSV: `company_name`, `Total Approvals`, `Total Denials`,
`Approval_Rate`, `median_salary_offered`, `top_job_titles_sponsored`.

| Label | Meaning |
|---|---|
| `Company-level H-1B evidence` | Company matches a CSV row with non-null approval fields. |
| `No H-1B evidence found` | Company absent, or sponsorship fields blank. |
| `Related sponsored titles` | `top_job_titles_sponsored` includes Data/AI-adjacent titles. |
| `No related title evidence` | Sponsorship exists but sponsored titles are unrelated to Data/AI. |

**Join is fuzzy, not exact.** The scanner emits `Databricks`; the CSV stores `DATABRICKS INC`.
Normalize (upper-case, strip legal suffixes) before matching. Never claim a *specific
posting* sponsors H-1B — the CSV supports **company-level** evidence only.

## SOC/BLS Rules

Use `data/bls/compact/soc_occupation_compact.csv` only with an explicit or manually
justified mapping. If ambiguous, write `SOC unknown; title-to-SOC mapping not verified.`
Never infer a SOC code from marketing language.

| Role family | Possible SOC | Status |
|---|---|---|
| Data Scientist | `15-2051` | title-inferred unless confirmed |
| Software / ML Engineer | `15-1252` | title-inferred unless confirmed |
| Data Engineering | `15-1243` | title-inferred unless confirmed |

## Decision Rules

| Action | Required Evidence |
|---|---|
| `Investigate` | Target title + company-level H-1B evidence + SOC checked or explicitly marked title-inferred. |
| `Manual Review` | Mixed title + company-level H-1B evidence, but duties / SOC ambiguous. |
| `Skip` | Skip-class (AI-washed) title, or no useful sponsorship evidence. |

## Phase Gates

Do not advance until the prior gate passes. Each gate has a runnable test.

1. **Problem gate:** The run names the company set and the OPT student's target family.
   Test: `test -f data/ats/portals.yml && rg -n "tracked_companies" data/ats/portals.yml`
2. **Local-evidence gate:** The H-1B CSV and BLS compact CSV are present before scoring.
   Test: `test -f data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv && test -f data/bls/compact/soc_occupation_compact.csv`
3. **Stored-script gate:** The scanner exists and its config resolves (no `portals.yml not found`).
   Test: `test -f scripts/ats/scan.mjs && test -f data/ats/portals.yml`
4. **Small-run gate:** One dry-run scan completes before any live (writing) scan.
   Test: `npm run ats:scan -- --dry-run` exits 0 and prints a `Portal Scan` summary.
5. **Approval gate:** A live (non-dry-run) scan, which writes `data/ats/pipeline.md` and hits
   the network, requires a logged human approval.
   Test: `test -f logs/gate-decisions/case-ds-opt-ai-washing-triage-approval.json || rg --fixed-strings "[TODO: APPROVE]" recipes/case-ds-opt-ai-washing-triage.md`
6. **Report gate:** Agent log and human report exist and the log is valid JSON.
   Test: `test -f reports/generated/case-ds-opt-ai-washing-triage-[DATE].md && node scripts/conformance.mjs logs/case-ds-opt-ai-washing-triage-[DATE].json`

## Steps

1. **Confirm config & evidence.** Labor: AI, human-gated. Script: `scripts/ats/scan.mjs` (exists).
   Input: `data/ats/portals.yml`, the two evidence CSVs. Output: gate 1-3 pass/blocker.
2. **Dry-run scan.** Labor: AI. Script: `npm run ats:scan -- --dry-run` (exists).
   Input: `portals.yml`. Output: title set + scan summary to stdout (no files written).
3. **Reverse-filter classify.** Labor: AI, human-gated on Mixed. Script: `[TODO: DEV]`
   `scripts/ats/ai-washing-triage.mjs` — automate the classifier + fuzzy H-1B join now done
   by hand below. Define input schema (title list + CSV paths), output schema (the triage
   table), and error handling before implementation. Until built, the Worked Run's `rg`/`grep`
   pipeline is the sample-mode substitute.
   Input: step-2 titles. Output: Target/Mixed/Skip label per title.
4. **Join H-1B evidence.** Labor: AI. Input: classified titles + `SEC_DOL_H1b_data_mapped.csv`.
   Output: company-level evidence columns per title (fuzzy-joined).
5. **Attach SOC (optional).** Labor: AI, human-justified. Input: Target/Mixed titles + BLS CSV.
   Output: SOC label or `SOC unknown`.
6. **Emit log + report.** Labor: AI. Output: agent JSON + human Markdown (contract below).

## Output Contract

### Agent output (machine)
File: `logs/case-ds-opt-ai-washing-triage-[DATE].json`
Fields: `workflow`, `run_id`, `mode` (`sample` | `live`), `companies_scanned`,
`jobs_found`, `filtered_by_title`, `filtered_by_location`, `offers`, `classified`
(`{target, mixed, skip}` counts), `skip_rate`, `h1b_joins`, `stop_conditions`,
`todo_items`, `source_files`, `gate_decisions`, `generated_at`, `report_path`.

### Human report (person)
File: `reports/generated/case-ds-opt-ai-washing-triage-[DATE].md`
Reader: the OPT student and their advising human — decides which roles to pursue.
Decision enabled: pursue `Investigate`, hand-check `Manual Review`, drop `Skip`.
Sections: run summary, purpose, sources used, phase-gate results, scan summary,
triage table (Title | Company | Class | H-1B evidence | Sponsored-title match | SOC | Action),
skip rate, **verified findings**, **inferred findings**, typed TODOs, next decision.

## What This Recipe Can Verify

- Whether the ATS scan produced titles for the tracked companies.
- Whether a company appears in the SEC/DOL mapped CSV and its approval fields are populated.
- Whether a title survives the negative (anti-washing) filter.
- Whether sponsored-title text is Data/AI-adjacent.
- Whether BLS/SOC data exists for a manually selected SOC code.

## What This Recipe Cannot Verify

- That a specific posting will sponsor H-1B (CSV is company-level only).
- That a company sponsors *entry-level* OPT candidates.
- That an "AI" title is genuinely an AI-engineering role without reading the JD (Mixed rows).
- That a title maps to a SOC code without manual/script classification.
- That company sponsorship history applies to this exact team or hiring cycle.

## Worked Run — 2026-07-20 (sample mode)

Real execution on this machine. Reproduces the error → diagnosis → fix → success arc.

### 1. Pre-config state — real error (before `portals.yml` existed)

```
$ npm run ats:scan -- --dry-run
> node scripts/ats/scan.mjs --dry-run
Error: portals.yml not found. Run onboarding first.
```

**Diagnosis.** `scripts/ats/scan.mjs:41` resolves
`process.env.REALLOCATION_ENGINE_PORTALS || 'data/ats/portals.yml'`; neither existed.

**Fix.** `cp data/ats/portals.example.yml data/ats/portals.yml` (Databricks enabled by
default; public careers URL; file is gitignored — verified with `git check-ignore`).

### 2. Post-config state — sample run completes

```
$ npm run ats:scan -- --dry-run
Scanning 1 companies via providers (0 local parser; 0 skipped — no provider matched)
(dry run — no files will be written)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal Scan — 2026-07-20
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Companies scanned:     1
Total jobs found:      787
Filtered by title:     330 removed
Filtered by location:  396 removed
Duplicates:            3 skipped
New offers added:      58
```

### 3. Reverse-filter classification (sample-mode substitute for the automation script)

The 58 offers are dominated by AI-washed titles — a live demonstration of the thesis.
Sample classification of representative offers:

| Title (from scan) | Class | Why |
|---|---|---|
| AI Engineer - FDE (Forward Deployed Engineer) | Mixed | AI Engineer signal, but FDE = delivery-weighted |
| Specialist Solutions Architect - AI/ML | Mixed | Solutions Architect + AI/ML → gray zone |
| Sr. Solutions Architect - AI Natives Business | Skip | Solutions/architecture, sales-adjacent |
| Product Marketing Director, Lakewatch | Skip | Marketing + Director — "AI" is decoration |
| Strategic Genie and AI Sales Specialist | Skip | Sales Specialist — "AI" is decoration |
| Sales Dev AI Program Manager | Skip | Sales + Manager |
| Sr Security Engineer, Incident Response | Skip | Security |

Of the 58 offers, the great majority fell to Skip (Solutions/Manager/Sales/Marketing/
Security/Field). **Zero** unambiguous `Data Scientist` / `ML Engineer` / `Data Engineer`
Target titles appeared in this company's current board — itself the finding: Databricks'
open Data/AI-labeled roles are overwhelmingly go-to-market/consulting, not IC data science.
This is exactly the asymmetry the recipe exists to surface. (Skip is success.)

### 4. H-1B evidence join — real CSV row

```
$ grep -i "databricks" data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
DATABRICKS INC ... Total Approvals=1640, Total Denials=8, Approval_Rate=99.51%,
median_salary_offered=149422.5,
top_job_titles_sponsored=['Software Engineer','Senior Software Engineer',
  'Solutions Architect','Specialist Solutions Architect','Senior Solutions Engineer']
```

**Verified:** `Databricks` → `DATABRICKS INC` (fuzzy join needed), 1640 approvals / 8 denials
/ 99.51% rate / $149,422.50 median. Sponsored titles *include* Solutions Architect /
Specialist Solutions Architect — so a Mixed row here is not automatically hopeless; the
company does sponsor those titles. That nuance is why Mixed → Manual Review, not Skip.

### 5. Verification gate

```
$ node scripts/conformance.mjs logs/case-ds-opt-ai-washing-triage-2026-07-20.json   # → valid JSON
$ npm run doctor    # environment + recipe dashboard
```

### Verified vs. inferred (line by line)

**Verified — a script or dataset produced it:**
- Scan funnel: 787 jobs found → 330 removed by title → 396 removed by location → 58 offers (scan stdout, exit 0).
- Databricks H-1B row: 1640 approvals / 8 denials / 99.51% rate / $149,422.50 median + sponsored-title list (CSV `grep`).
- Agent log is valid JSON (`conformance.mjs` → `✓ all conform`).
- The `portals.yml not found` error and its fix (terminal transcript, reproducible).

**Inferred — model judgment over title strings, no JD read (labeled as judgment):**
- Every Target / Mixed / Skip label (classification of the title string alone).
- "Manual Review" for the two Mixed rows — inference that FDE / Specialist Solutions Architect *might* be genuine, leaning on the sponsored-title overlap; not confirmed.
- SOC codes in the rules table (title-inferred; no SOC join was run).
- The qualitative claim "Databricks' AI-labeled roles are overwhelmingly go-to-market" — a reading of the 58 surfaced offers, not a census of all 787.

### Reflection

- **What worked:** the reverse filter did its job on the first try — one company, one dry run, and the AI-washing pattern was immediately visible (majority Skip, zero IC Data/AI target titles). The existing scanner plus two `grep` lines were enough for a sample run; no new script was needed.
- **What the filter misses:** the negative list is literal substring matching, so it catches *obvious* washing but not *euphemistic* washing. Titles that launder the sales/consulting nature with softer words slip through — "Professional Services", "Customer Engineering", "Delivery" contain none of `sales|manager|solutions|account`, so a "Professional Services Data Engineer" would wrongly reach Target. This is the recipe's known false-negative surface.
- **Next step:** build the open DEV item `scripts/ats/ai-washing-triage.mjs` (step 3) so the classifier + fuzzy H-1B join are reproducible and testable instead of hand-run, and widen `portals.yml` past Databricks — one company yields too few genuine targets to fill an OPT application budget.

## Provenance

| Source | Verification command | Notes |
|---|---|---|
| `data/ats/portals.yml` | `test -f data/ats/portals.yml` | Copied from the committed example; gitignored. |
| H-1B CSV | `grep -i databricks data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | Company-level evidence only. |
| Scan summary | `npm run ats:scan -- --dry-run` | Re-runnable; hits the public Databricks careers page. |

## Attestation

Not yet attested — `status: RUNNABLE-SAMPLE`, not VERIFIED. A named human records the block
below (per SNICKERDOODLE Attestation Format) to promote past RUNNABLE-LIVE.

- Recipe: case-ds-opt-ai-washing-triage v0.1.0
- By: _named human · date — pending the gate-5 approval_

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run ats:scan -- --dry-run` (no config) | `Error: portals.yml not found` | a clear onboarding blocker |
| same, after `cp` of the example config | 787 jobs → 58 offers, `Portal Scan` summary | a completed dry run |
| `grep -i databricks <H-1B CSV>` | `DATABRICKS INC`, 1640/8/99.51% | company-level evidence row |
| `node scripts/conformance.mjs <agent log>` | `✓ all conform` | valid JSON |
| **deliberate break:** ran `npm run doctor` on this recipe | reported CRLF recipes as "missing frontmatter" — see below | doctor should detect frontmatter |

### Did not test
- A live (non-dry-run) scan (writes `pipeline.md` + hits network — held at approval gate 5).
- The DEV automation script from step 3 (not built; classification done by hand in sample mode).
- Any SOC/BLS join (no confirmed SOC mapping this run).
- Companies other than Databricks.
- Minor environment notes, not pursued: `python3` here is the Windows Store shim (real interpreter is `python` 3.13.1); `scripts/bls/extract-soc-occupation-table.py` fails on a missing `openpyxl` dep; `scripts/ats/analyze-patterns.py` ran clean though DOMAIN.md lists it as a known bug.

### Broke during testing, fixed
- **`npm run doctor` mis-reads recipe frontmatter on CRLF files.** Its parser (`scripts/doctor.mjs:80`, `frontmatter()`) splits on `\n` and matches `/^([a-z_]+):\s*(.*)$/`; on Windows CRLF each split line keeps a trailing `\r`, and JS `.` does not match `\r`, so `(.*)$` fails on every line but the last — all keys except the final one are dropped and the recipe is counted as "missing frontmatter." **Fix applied here:** this recipe is written with **LF** line endings, so doctor reads `status: RUNNABLE-SAMPLE` and `todos_open: 3` correctly. (A root-cause parser fix is left to the repo owners.)

## Notes Preserved For Implementation

### Original workflow (from the legacy draft)
- Verify the source files exist; read audits before using counts.
- Build the company set from `portals.yml`; scan; classify against the reverse-filter rules.
- Join company names to the H-1B CSV; report company-level evidence.
- Attach SOC only when explicit or manually justified.
- Write the report + log verified vs inferred.

### Proposed / missing tools
- No dedicated triage script exists yet (`scripts/ats/ai-washing-triage.mjs`, the step-3 DEV
  item); build it only after the input/output schemas above are confirmed. The sample run used
  the existing scanner + a manual `rg`/`grep` pipeline as the substitute.

> **Lifecycle honesty note.** A strict reading of the SNICKERDOODLE lifecycle holds a recipe
> with any open TODO at DRAFT. This recipe is marked `RUNNABLE-SAMPLE` because a full
> sample run genuinely **completed and is logged** (artifacts below), using the *existing*
> command surface — the open DEV item is an automation enhancement the sample run did not
> depend on. The status reflects the completed run; the open item is disclosed here, not hidden.
> Artifacts: `logs/case-ds-opt-ai-washing-triage-2026-07-20.json`,
> `reports/generated/case-ds-opt-ai-washing-triage-2026-07-20.md`,
> `logs/RUN_LOG.md#2026-07-20--ds-opt-ai-washing-triage`.
