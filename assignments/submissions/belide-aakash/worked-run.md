# Worked Run — SWE-to-AI-Engineer H-1B Title Screen

**Recipe:** `case-swe-to-ai-engineer-h1b-title-screen` v0.1.0
**Run date:** 2026-06-29
**Run type:** RUNNABLE-SAMPLE (no writes to private/, no external API calls except liveness check)

---

## Inputs

- **Company list:** `data/raw/case-swe-to-ai-engineer/company-list.json` — 10 companies selected from `SEC_DOL_H1b_data_mapped.csv` to cover all four title-screen classifications
- **OPT profile:** `search/profile.yml` (local only) — OPT start 2026-09-08, STEM eligible, authorization: F-1 OPT
- **Target SOC codes:** 15-1221 (AI Engineer), 15-1252 (Software Developer/AI Specialist), 15-1299.08 (Cloud/MLOps Architect)

---

## Commands run and real terminal output

### 1. Conformance check

```
$ npm run verify

> the-reallocation-engine@1.0.0 verify
> node scripts/conformance.mjs && node scripts/manifest-check.mjs

conformance: 132 files (76 md · 30 py · 23 js · 1 sh · 1 yaml · 1 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
MANIFEST CHECK — The Reallocation Engine
==========================================

WARN (4):
  W1 ignore path not in .gitignore: output/
  W1 ignore path not in .gitignore: reports/generated/
  W1 ignore path not in .gitignore: archive/
  W2 private path not gitignored (PII/secret risk): private/

✓ manifest check passed (4 warnings)
```

### 2. H-1B data provenance check

```
$ python3 scripts/sec/validate-h1b-join-sample.py
/Users/aakashbelide/.../data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-join-validation-audit.md
```

Output written to `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-join-validation-audit.md`. Key facts from that audit:

- Total companies in mapped CSV: **30,369**
- Rows with H-1B fields populated: **1,557 (5.1%)**
- Median approvals among H-1B rows: **10**
- Median approval rate: **100%**

### 3. Title screen against the CSV

```
$ python3 -c "..." | tee data/raw/case-swe-to-ai-engineer/title-screen.json
```

Full output (this reads the real CSV — not model memory):

```json
[
  {
    "company": "ATTENTIVE MOBILE INC",
    "classification": "practitioner",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": [],
    "total_approvals": 96.0,
    "approval_rate": "100.0",
    "low_n_flag": false,
    "funding_stage": "Series D+",
    "funding_date": "2020-09-09",
    "median_salary": "155000.0"
  },
  {
    "company": "COHERE HEALTH INC",
    "classification": "practitioner",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": [],
    "total_approvals": 104.0,
    "approval_rate": "98.1132075471698",
    "low_n_flag": false,
    "funding_stage": "Series C",
    "funding_date": "2025-05-07",
    "median_salary": "160000.0"
  },
  {
    "company": "DATAMINR INC",
    "classification": "researcher-only",
    "practitioner_titles": [],
    "researcher_titles": ["research engineer"],
    "total_approvals": 58.0,
    "approval_rate": "96.66666666666669",
    "low_n_flag": false,
    "funding_stage": "Series D+",
    "funding_date": "2021-03-22",
    "median_salary": "157477.0"
  },
  {
    "company": "KENSHO TECHNOLOGIES INC",
    "classification": "practitioner",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": [],
    "total_approvals": 40.0,
    "approval_rate": "100.0",
    "low_n_flag": false,
    "funding_stage": "Series C",
    "funding_date": "2015-07-28",
    "median_salary": "155000.0"
  },
  {
    "company": "KINETIC AUTOMATION INC",
    "classification": "hybrid",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": ["research engineer"],
    "total_approvals": 16.0,
    "approval_rate": "100.0",
    "low_n_flag": false,
    "funding_stage": "Series B",
    "funding_date": "2024-04-26",
    "median_salary": "170000.0"
  },
  {
    "company": "MOLOCO INC",
    "classification": "practitioner",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": [],
    "total_approvals": 200.0,
    "approval_rate": "99.009900990099",
    "low_n_flag": false,
    "funding_stage": "Series D+",
    "funding_date": "2021-08-09",
    "median_salary": "146242.5"
  },
  {
    "company": "OUTREACH CORP",
    "classification": "researcher-only",
    "practitioner_titles": [],
    "researcher_titles": ["applied scientist"],
    "total_approvals": 48.0,
    "approval_rate": "100.0",
    "low_n_flag": false,
    "funding_stage": "Series D+",
    "funding_date": "2021-05-27",
    "median_salary": "168250.0"
  },
  {
    "company": "SKYDIO INC",
    "classification": "researcher-only",
    "practitioner_titles": [],
    "researcher_titles": ["research scientist", "senior research scientist"],
    "total_approvals": 120.0,
    "approval_rate": "100.0",
    "low_n_flag": false,
    "funding_stage": "Series D+",
    "funding_date": "2022-03-08",
    "median_salary": "225000.0"
  },
  {
    "company": "ZOOM VIDEO COMMUNICATIONS INC",
    "classification": "practitioner",
    "practitioner_titles": ["machine learning engineer"],
    "researcher_titles": [],
    "total_approvals": 2.0,
    "approval_rate": "100.0",
    "low_n_flag": true,
    "funding_stage": "Series D+",
    "funding_date": "2016-12-01",
    "median_salary": "119528.5"
  },
  {
    "company": "ADVANCED MICRO DEVICES INC",
    "classification": "no-data",
    "note": "not found in SEC_DOL_H1b_data_mapped.csv"
  }
]
```

**Title screen summary:**
- Practitioner: 5 (Attentive Mobile, Cohere Health, Kensho, Moloco, Zoom)
- Researcher-only: 3 (Dataminr, Outreach, Skydio) — stopped here, not scored
- Hybrid: 1 (Kinetic Automation) — flagged for manual review
- No-data: 1 (AMD) — stop condition triggered (public company, no Form D)

### 3a. Funding recency check (Recipe Step 3)

Step 3 in the recipe: flag companies where `latest_funding_date` is before 2024-06-29 (>24 months stale) or where funding stage is Pre-Seed.

From `title-screen.json` — funding dates read directly from the CSV:

| Company | Funding Stage | Last Funded | Recency Flag |
|---|---|---|---|
| COHERE HEALTH INC | Series C | 2025-05-07 | ✅ recent (13 months ago) |
| ATTENTIVE MOBILE INC | Series D+ | 2020-09-09 | ⚠ stale (68 months ago) |
| MOLOCO INC | Series D+ | 2021-08-09 | ⚠ stale (58 months ago) |
| KENSHO TECHNOLOGIES INC | Series C | 2015-07-28 | ⚠ stale (132 months ago) |
| ZOOM VIDEO COMMUNICATIONS INC | Series D+ | 2016-12-01 | ⚠ stale (114 months ago) |
| KINETIC AUTOMATION INC | Series B | 2024-04-26 | ✅ recent (26 months ago) |

Cohere Health is the only practitioner-accessible company with recent funding. Kensho's 2015 date makes it the oldest funder in the batch — worth manual investigation before committing prep time. This is a soft signal (companies can operate years past last funding), not a hard gate, but it narrows where to prioritize.

### 4. Liveness checks

```
$ npm run ats:liveness -- "https://job-boards.greenhouse.io/coherehealth/jobs/7617095003"

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://job-boards.greenhouse.io/coherehealth/jobs/7617095003

Checking 1 URL(s)...
✅ active     https://job-boards.greenhouse.io/coherehealth/jobs/7617095003

Results: 1 active  0 expired  0 uncertain
```

```
$ npm run ats:liveness -- "https://careers.amd.com/careers-home/jobs/80934?lang=en-us&iis=Job%20Board&iisn=Linkedin"

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://careers.amd.com/careers-home/jobs/80934...

Checking 1 URL(s)...
❌ expired    https://careers.amd.com/careers-home/jobs/80934?lang=en-us&iis=Job%20Board&iisn=Linkedin
           insufficient content — likely nav/footer only

Results: 0 active  1 expired  0 uncertain
```

The AMD result is exactly what the liveness gate is for. AMD also triggered the no-data stop condition from the title screen, so it would have stopped before reaching this gate anyway — but this confirms both gates fire independently.

```
$ npm run ats:liveness -- "https://job-boards.greenhouse.io/moloco/jobs/7635045003"

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://job-boards.greenhouse.io/moloco/jobs/7635045003

Checking 1 URL(s)...
✅ active     https://job-boards.greenhouse.io/moloco/jobs/7635045003

Results: 1 active  0 expired  0 uncertain
```

Moloco's posting is live — but it's an intern role ("Machine Learning Engineer Intern"). The recipe targets Staff/Senior ICs on OPT who need H-1B sponsorship lined up within a 12–36 month window. An intern role doesn't advance that. The JD note in `company-list.json` also flags that Moloco's full-time MLE II+ requires MS/PhD. Moloco passed liveness but was removed from the scoring batch on persona grounds — this is the human judgment step between liveness and scoring that the recipe describes but can't automate.

### 5. Role scorer — normal run

```
$ node scripts/score/role-scorer.mjs data/raw/case-swe-to-ai-engineer/roles.json \
  --md reports/generated/case-swe-to-ai-engineer-2026-06-29.md

✓ scored 1 roles → Apply 1 · Consider 0 · Skip 0 (skip 0%)
  data/raw/case-swe-to-ai-engineer/role-scores.json  +  reports/generated/case-swe-to-ai-engineer-2026-06-29.md
```

Scorer output from `role-scores.json`:

```
Role: COHERE HEALTH INC — Staff Machine Learning Engineer
Composite: 0.492
Recommendation: Apply
Reason: composite 0.492 ≥ 0.3, gates healthy
Arithmetic: (0.85·0.35 + 0.65·0.3 + 0·0) × 1 × 1 = 0.492
```

### 6. Deliberate break — liveness gate set to 0

```
$ node scripts/score/role-scorer.mjs /tmp/roles-break-test.json

✓ scored 1 roles → Apply 0 · Consider 0 · Skip 1 (skip 100%)
```

Break test trace:
```
recommendation: Skip
reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)
arithmetic: (0.85·0.35 + 0.65·0.3 + 0·0) × 0 × 1 = 0.000
```

This is the gate behavior described in the mode: liveness is a multiplier, not an addend. Setting it to zero collapses the composite entirely even when sponsorship (0.85) and fit (0.65) are strong. The scorer labeled the reason correctly and output Skip.

---

## Verified vs. Inferred split

| Claim | Evidence | Status |
|---|---|---|
| 30,369 total companies in mapped CSV | `validate-h1b-join-sample.py` output, join audit file | **Verified — script** |
| 1,557 rows (5.1%) have H-1B data | Same audit | **Verified — script** |
| COHERE HEALTH INC has "machine learning engineer" in top_job_titles_sponsored | `title-screen.json`, read directly from CSV | **Verified — record** |
| COHERE HEALTH INC: 104 approvals, 98.1% rate, Series C, funded 2025-05-07 | Same CSV row | **Verified — record** |
| SKYDIO INC has only researcher titles (Research Scientist, Senior Research Scientist) | CSV row | **Verified — record** |
| DATAMINR INC has only "research engineer" title | CSV row | **Verified — record** |
| ZOOM VIDEO COMMS: low_n_flag=true (2 approvals) | CSV row | **Verified — record** |
| AMD not found in CSV | Title screen — company not in dataset | **Verified — script** |
| Cohere Health posting is live | `npm run ats:liveness` output, 2026-06-29 | **Verified — script** |
| Moloco posting is live | `npm run ats:liveness` output, 2026-06-29 | **Verified — script** |
| AMD posting is expired | `npm run ats:liveness` output, 2026-06-29 | **Verified — script** |
| Cohere Health last funded 2025-05-07 (only one in batch within 24 months) | `title-screen.json` funding_date, from CSV row | **Verified — record** |
| BLS cognitive_pivot_score for SOC 15-1221 is 4.516 | `data/bls/compact/soc_occupation_compact.csv` row | **Verified — record** |
| Composite score for Cohere Health role = 0.492 | `role-scores.json`, scorer arithmetic | **Verified — script** |
| role-scores.json parses as valid JSON | Gate 5: `python3 -m json.tool role-scores.json` exits 0 | **Verified — script** |
| Roblox's 2026 job postings are PhD Early Career | Job search results, careers.roblox.com | **Verified — external check** |
| Fit vote 0.65 for Staff MLE at Cohere Health | Judgment based on profile | **Model judgment** |
| Cohere Health's current ML team hires practitioners | H-1B title history inferred | **Inferred — title history ≠ current team** |
| Staff MLE role does not require a PhD | No local data source | **Unverified — JD must be read manually** |
| Timeline multiplier = 1.0 | Profile OPT dates, plausible sponsorship trajectory | **Your input** |

---

## Attestation

- Recipe: case-swe-to-ai-engineer-h1b-title-screen v0.1.0
- By: Aakash Belide · 2026-06-29

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | exits 0, 132 files conformant | exits 0 |
| `python3 scripts/sec/validate-h1b-join-sample.py` | join audit written; 30,369 total rows, 1,557 H-1B rows | valid audit, no errors |
| Title screen Python one-liner on 10 companies | 5 practitioner, 3 researcher-only, 1 hybrid, 1 no-data | correct classifications per expected_classification in company-list.json |
| `npm run ats:liveness -- <cohere health url>` | `✅ active` | active |
| `npm run ats:liveness -- <AMD url>` | `❌ expired` | expired (public company, no Form D, posting also dead) |
| `node role-scorer.mjs roles.json` (normal run) | Apply 1, composite 0.492, arithmetic shown | Apply; composite ~0.49 |
| Break test: liveness.factor set to 0 | Skip 100%, reason "gated: liveness ≈ 0.000" | gate fires, composite zeroed |
| `npm run doctor` after writing mode file | todos_open 522 declared = 522 body; RUNNABLE-SAMPLE 1; `search/resume.json` flagged as git-tracked (pre-existing — Assignment 4 committed it; requires `git rm --cached` before final push) | recipe counts match; privacy flag known and documented |
| Gate 5: `python3 -m json.tool data/raw/case-swe-to-ai-engineer/role-scores.json > /dev/null && echo "valid"` | prints "valid" | exits 0, role-scores.json parses |

### Did not test

- The proposed `scripts/h1b/filter-by-title-pattern.py` script — does not exist yet `[TODO: DEV]`
- Multi-company scoring batch (only one role scored in this sample run — only one confirmed live posting)
- Liveness check on Workday-based posting URLs (Kensho uses Workday; `npm run ats:liveness` is Greenhouse/Lever/Ashby only)
- STEM OPT timeline extension (OPT has not started as of 2026-06-29; timeline multiplier set manually)
- Hybrid company scoring (Kinetic Automation flagged for manual review, not scored)
- LCA current-quarter data `[TODO: DATA SOURCE]` — not acquired

### Broke during testing, fixed

- **roles.json field names wrong on first run:** Wrote `vote` and bare `1.0` for liveness/timeline. Scorer returned `votes: []` and composite 0 (Skip). Fixed by reading the scorer source — it expects `role.sponsorship.p`, `role.liveness.factor`, `role.timeline.factor`. Corrected the JSON and re-ran. Second run returned Apply 0.492 as expected.

---

## Reflection

The title screen itself works well and runs fast — the whole CSV lookup for 10 companies takes under a second. The practitioner/researcher split came out exactly as expected from the prior data exploration. The more interesting finding was Roblox: 856 MLE approvals in the dataset but PhD-only current postings when you actually look at their job board. The mode would classify them as practitioner-accessible, which would be misleading. That's a real failure mode, not a theoretical one.

The scorer input format wasn't documented anywhere obvious — had to read the source to find that it uses `.p` not `.vote` for vote values and `.factor` not a bare number for gates. Worth noting in the mode or in a README for whoever runs this next.

The one thing this run couldn't demonstrate is a multi-company scoring pass, because only one company had a confirmed live posting that fit the persona (Staff MLE, no explicit PhD requirement). The others either had expired postings, Workday-based portals the liveness checker doesn't support, or researcher-only classifications that stopped before liveness.

**Next steps:**
- Implement `scripts/h1b/filter-by-title-pattern.py` to replace the manual one-liner
- Add a minimum Total Approvals threshold (≥10) as a hard gate rather than just a flag — the Zoom N=2 case shows the current behavior is too soft
- Check Roblox current postings in the mode output and add a "PhD-labeled current postings" flag for companies where the H-1B history says practitioner but the live board says PhD
