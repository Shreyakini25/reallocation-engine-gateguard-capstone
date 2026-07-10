---
status: RUNNABLE-SAMPLE
todos_open: 8
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# case-de-platform-cogpivot: DE Platform Sponsor + Cognitive Pivot Ranker

## Purpose

For an **F-1 OPT Data Engineer or Data Architect job-seeker** (primary SOC **15-1243**) who wants **platform and data-infrastructure work**, not generic pipeline execution: rank employers and postings by **(1) H-1B sponsorship history filtered to data-engineering job titles** and **(2) BLS cognitive-pivot scores** that separate **system-design / platform judgment** (automation-resistant) from **pipeline execution** (automation-vulnerable).

**Use when:** you have a company name (and optionally a job URL) and need to decide whether scarce OPT application time is worth spending, before tailoring a resume or reaching out.

**Do not use when:** you need immigration legal advice, a guarantee of future sponsorship, or a posting-level platform/pipeline label without reading the JD (until the classifier in [TODO: DEV] exists).

## Source Inventory

| Source Node | Node Type | Path or command | Human check |
|---|---|---|---|
| H-1B + funding mapped dataset | CSV (record) | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | Confirm row exists for target company; read `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md` before trusting counts |
| BLS/O*NET compact + cognitive pivot | CSV (record) | `data/bls/compact/soc_occupation_compact.csv` (columns: `bls_soc_code`, `title`, `cognitive_pivot_score`, `skill_systems_analysis_lv`, `skill_programming_lv`) | Confirm SOC **15-1243** rows present |
| O*NET reported titles for DE | Text (record) | `data/BLS/db-30-2-text/Sample of Reported Titles.txt` (SOC 15-1243.00 titles) | Use to build title keyword list for H-1B filter |
| Search profile (visa + SOC gate) | YAML (your-input) | `search/profile.yml` | Student attests OPT dates and `primary_soc: "15-1243"` |
| Composite role scorer | Script (record) | `npm run score <roles.json> -- --profile <profile.json>` (`scripts/score/role-scorer.mjs`) | Profile must be JSON for scorer today; YAML profile is read manually |
| ATS liveness (GATE) | Script (record) | `npm run ats:liveness -- <job-url>` (`scripts/ats/check-liveness.mjs`) | Requires Playwright (`npx playwright install chromium`) |
| Conformance / privacy | Script | `npm run verify` · `npm run doctor` | Run before PR; no `private/` or personal tracker in submission |

## Proposed additions

| Item | Type | Justification |
|---|---|---|
| `[TODO: DEV] scripts/de/filter-h1b-de-titles.py` | Script | Keyword filter on `top_job_titles_sponsored` alone false-positives on SWE-dominated sponsors; script should match O*NET alternate titles and emit title-level evidence |
| `[TODO: DEV] scripts/de/platform-pipeline-classifier.py` | Script | SOC 15-1243 spans platform (15-1243.00) and pipeline-leaning (15-1243.01); posting text needed to split within-SOC variation |
| `[TODO: DEFINE] role_quality weight in scorer config` | Authorial | Default `role_quality: 0.0` in `role-scorer.mjs` means cognitive pivot contributes nothing to composite until weight is pinned and weights renormalized |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| Company shortlist | CSV or plain text (one company per line) | Human / generated from H-1B DE filter | Yes |
| `search/profile.yml` | YAML | `search/profile.yml` | Yes (timeline and sponsorship gate) |
| Job posting URL(s) | URL | Public careers pages only | Optional but required before Apply on a specific posting |
| `roles.json` | JSON | Built from verified H-1B rows + BLS pivot + bounded fit judgment | Yes for `npm run score` |

## Phase Gates

1. **Source gate:** H-1B mapped CSV and BLS compact CSV exist and parse.  
   **Test:** `test -f data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv && test -f data/bls/compact/soc_occupation_compact.csv`  
   **Human:** Confirm audit files read; stop if counts are cited without opening the CSV.

2. **DE sponsorship gate:** Company row has `Total Approvals` populated **and** `top_job_titles_sponsored` matches DE keyword list (see Step 2).  
   **Test:** Manual grep or `[TODO: DEV]` filter script returns at least one DE-relevant title for the company.  
   **Human:** If titles are SWE-dominated with one incidental DE string, downgrade sponsorship tier. Do not treat as DE-primary sponsor.

3. **Liveness gate** (posting-level, **multiplier not vote**): Before Apply on a URL, `npm run ats:liveness` returns `active`.  
   **Test:** `npm run ats:liveness -- <url>`; stdout contains `active`.  
   **Human:** Expired/uncertain means Skip that posting regardless of sponsorship score.

4. **Timeline gate** (multiplier): OPT/unemployment window from profile applied as `timeline.factor` in `roles.json`.  
   **Test:** Dates in `search/profile.yml` are attested; factor ≤ 1.0 documented in score audit.  
   **Human:** Do not apply if `offer_needed_by` is impossible without guessing.

5. **Report gate:** Agent JSON log + human Markdown report written; verified vs inferred columns present.  
   **Test:** `logs/case-de-platform-cogpivot-[DATE].json` and `reports/generated/case-de-platform-cogpivot-[DATE].md` exist.

## Steps

1. **Verify provenance:** Read `SEC_DOL_H1b_data_mapped-audit.md` and `data/bls/bls-audit.md` (if present). Record SHA/count claims only from those audits or fresh commands.

2. **Filter H-1B sponsors to DE-relevant titles:**  
   ```bash
   grep -iE "data engineer|data architect|database architect|big data|data platform|data engineering" \
     data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
   ```  
   `[TODO: DEV]` Replace grep with `filter-h1b-de-titles.py` matched to O*NET alternate titles.  
   **Output:** Shortlist with `company_name`, `Total Approvals`, `Approval_Rate`, `median_salary_offered`, `top_job_titles_sponsored` (all **record**).

3. **Pull cognitive pivot for SOC 15-1243:**  
   ```bash
   grep "15-1243" data/bls/compact/soc_occupation_compact.csv
   ```  
   Map sub-SOC to platform vs pipeline default:  
   - **15-1243.00** Database Architects: platform-leaning (`cognitive_pivot_score` **3.933**)  
   - **15-1243.01** Data Warehousing Specialists: pipeline-leaning (**3.626**)  
   Normalize to `role_quality.p` as `cognitive_pivot_score / 5.0` (document formula; **record**).

4. **Build `roles.json`:** One object per company/posting. Required fields for scorer:  
   - `sponsorship`: `{ p, tier, source: "record" }` (derive tier from approval volume/rate: Proven / Likely / None)  
   - `role_quality`: `{ p, source: "record" }` (from step 3; note sub-SOC assumption if JD unread)  
   - `fit`: `{ p, source: "model-judgment" }` (**bounded** judgment only after steps 2-3)  
   - `liveness`: `{ factor, source: "record" }` (1.0 if unchecked; 0.0 if expired)  
   - `timeline`: `{ factor, source: "your-input" }` (from `search/profile.yml`)

5. **Run composite scorer:**  
   ```bash
   npm run score roles.json -- --profile profile-sponsor-required.json --out-dir reports/generated/
   ```  
   Note: scorer expects JSON profile today (`{"authorization": "F-1 OPT, sponsorship required"}`).

6. **Run liveness on each target URL** (gate):  
   ```bash
   npm run ats:liveness -- "<job-url>"
   ```

7. **Produce human report:** Markdown table with company, DE title evidence, pivot sub-SOC, composite, recommendation, **verified vs inferred** column, open `[TODO]` items.

8. **Log run:** Append to `logs/RUN_LOG.md` (template below).

## What it can verify

| Claim | Source |
|---|---|
| Company-level H-1B approval count, denial count, approval rate | `SEC_DOL_H1b_data_mapped.csv` |
| Whether aggregate sponsored titles mention DE-related strings | `top_job_titles_sponsored` column |
| SOC-level cognitive pivot score for 15-1243 sub-occupations | `soc_occupation_compact.csv` |
| Whether a specific posting URL is live | `npm run ats:liveness` |
| Composite Apply/Consider/Skip with per-term audit | `npm run score` |

## What it cannot verify

| Claim | Why |
|---|---|
| Employer will sponsor **you** for **this** posting | H-1B data is historical and company-aggregate |
| Posting is platform vs pipeline work | SOC spans both; same SOC covers legacy pipeline maintenance and greenfield architecture |
| DE filter is complete | Keyword grep misses alternate titles; SWE-dominated sponsors pass with one DE string |
| Entry-level / new-grad fit | Not in H-1B or BLS compact |
| Cognitive pivot in composite score | Default scorer `role_quality` weight = **0** until authorial decision |

## Output Contract

### Agent output (JSON)

**File:** `logs/case-de-platform-cogpivot-[DATE].json`

**Fields:** `workflow`, `run_id`, `mode` (`sample`|`live`), `companies_evaluated`, `de_filter_count`, `steps_completed`, `h1b_rows_used`, `bls_soc_rows_used`, `liveness_results`, `score_output_path`, `stop_conditions_triggered`, `todos_open`, `verified_fields`, `inferred_fields`, `generated_at`

### Human report (Markdown)

**File:** `reports/generated/case-de-platform-cogpivot-[DATE].md`

**Reader:** The job-seeker (F-1 OPT DE/platform candidate) and a human reviewer before live applications.

**Sections:** Run summary · Purpose · Companies evaluated · DE sponsorship evidence (record) · Cognitive pivot evidence (record) · Liveness gate results · Scorer composite table · Verified vs inferred · Stop conditions hit · Typed TODOs · Decision (Apply / Consider / Skip per row)

## Stop Conditions

- Stop if company not in H-1B mapped CSV. Do not infer sponsorship from website or LLM.
- Stop if `Total Approvals` is null (94.9% of companies in dataset have no H-1B fields; audit 2026-05-28).
- Stop if DE title filter matches but titles are SWE-majority. Mark **investigate**, not Apply, unless JD confirms DE/platform.
- Stop if posting URL provided and liveness is not `active` (gate closed).
- Stop if `roles.json` would require guessing `sponsorship.p` or `timeline.factor`. Fill from record or profile only.
- Stop if cognitive pivot is presented as posting-level fact without JD read or classifier. Label **inferred**.

## RUN_LOG template

```markdown
## [DATE] - case-de-platform-cogpivot (RUNNABLE-SAMPLE)

- **Recipe:** case-de-platform-cogpivot v0.1.0
- **Inputs:** [N companies from DE filter; profile.yml; optional URLs]
- **Commands:** grep DE filter · grep 15-1243 BLS · npm run score · npm run ats:liveness
- **Outputs:** logs/case-de-platform-cogpivot-[DATE].json · reports/generated/case-de-platform-cogpivot-[DATE].md
- **Result:** [Apply/Consider/Skip counts; skip rate; gates triggered]
- **Open issues:** [TODO: DEV items; role_quality weight unpinned]
```

## Snickerdoodle (roadmap, not runtime)

Per `DOMAIN.md`, `snickerdoodle run case-de-platform-cogpivot` does **not** execute today. Follow Steps 1-8 manually or via Claude Code/Cursor agent with gates.
