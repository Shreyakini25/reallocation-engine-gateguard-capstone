# Worked Run — case-de-da-live-skill-gap

**Mode:** `case-de-da-live-skill-gap` v0.1.0
**Author:** Komal Khairnar
**Date:** July 6, 2026

---

## Inputs

- `my_targets.txt` — 15 company names (anonymized subset of personal target list)
- `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` — 30,369 companies
- `data/examples/my-de-da-roles.json` — 5 roles built from live run output for scorer

**my_targets.txt contents:**
```
Airbnb
Stripe
Figma
Notion
Airtable
Squarespace
Hashicorp
Amplitude
Mixpanel
dbt Labs
Fivetran
Astronomer
Monte Carlo
Brex
Ramp
```

---

## Commands and Real Terminal Output

### Command 1 — Dry Run (setup verification, no API calls)

```
(.venv) PS C:\the-reallocation-engine-main> python scripts/skill-demand/skill-gap-master.py --dry-run

case-de-da-live-skill-gap | 2026-07-06T18:01:16.469938+00:00
============================================================

[1/3] Loading 80-days CSV ...
      Loaded 30,369 companies
      Loaded 15 companies from my_targets.txt

[2/3] Scanning (DRY RUN — no API calls)...
  Calling jd-skill-extractor for live JD extraction ...
  [1/15] Airbnb (airbnb) ... DRY RUN
  [2/15] Stripe (stripe) ... DRY RUN
  [3/15] Figma (figma) ... DRY RUN
  [4/15] Notion (notion) ... DRY RUN
  [5/15] Airtable (airtable) ... DRY RUN
  [6/15] Squarespace (squarespace) ... DRY RUN
  [7/15] Hashicorp (hashicorp) ... DRY RUN
  [8/15] Amplitude (amplitude) ... DRY RUN
  [9/15] Mixpanel (mixpanel) ... DRY RUN
  [10/15] dbt Labs (dbtlabs) ... DRY RUN
  [11/15] Fivetran (fivetran) ... DRY RUN
  [12/15] Astronomer (astronomer) ... DRY RUN
  [13/15] Monte Carlo (montecarlo) ... DRY RUN
  [14/15] Brex (brex) ... DRY RUN
  [15/15] Ramp (ramp) ... DRY RUN

[3/3] Building Excel report ...

Excel report saved to: C:\the-reallocation-engine-main\data\skill-demand\skill_gap_report.xlsx

DRY RUN complete — 15 companies would be scanned
Output would be written to: C:\the-reallocation-engine-main\data\skill-demand\skill_gap_report.xlsx

Done.
```

### Command 2 — Live Run (real API calls to Greenhouse and Lever)

```
(.venv) PS C:\the-reallocation-engine-main> python scripts/skill-demand/skill-gap-master.py

case-de-da-live-skill-gap | 2026-07-06T18:01:37.285115+00:00
============================================================

[1/3] Loading 80-days CSV ...
      Loaded 30,369 companies
      Loaded 15 companies from my_targets.txt

[2/3] Scanning (LIVE)...
  Calling jd-skill-extractor for live JD extraction ...
  [1/15] Airbnb (airbnb) ... Greenhouse — 19 DE/DA jobs — 11 skills
  [2/15] Stripe (stripe) ... Greenhouse — 15 DE/DA jobs — 15 skills
  [3/15] Figma (figma) ... Greenhouse — 2 DE/DA jobs — 7 skills
  [4/15] Notion (notion) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [5/15] Airtable (airtable) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [6/15] Squarespace (squarespace) ... Greenhouse — 1 DE/DA jobs — 4 skills
  [7/15] Hashicorp (hashicorp) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [8/15] Amplitude (amplitude) ... Greenhouse — 2 DE/DA jobs — 7 skills
  [9/15] Mixpanel (mixpanel) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [10/15] dbt Labs (dbtlabs) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [11/15] Fivetran (fivetran) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [12/15] Astronomer (astronomer) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [13/15] Monte Carlo (montecarlo) ... not found (Workday/iCIMS/Taleo likely) [TODO]
  [14/15] Brex (brex) ... Greenhouse — 10 DE/DA jobs — 11 skills
  [15/15] Ramp (ramp) ... not found (Workday/iCIMS/Taleo likely) [TODO]

[3/3] Building Excel report ...

Excel report saved to: C:\the-reallocation-engine-main\data\skill-demand\skill_gap_report.xlsx

--- Top 10 Skills (preview) ---
   1. SQL           35 appearances   5 companies  [MED]
   2. Python        30 appearances   6 companies  [HIGH]
   3. Scala         27 appearances   5 companies  [HIGH]
   4. Airflow       14 appearances   3 companies  [HIGH]
   5. Tableau       11 appearances   4 companies  [LOW]
   6. dbt           11 appearances   4 companies  [HIGH]
   7. Spark         10 appearances   2 companies  [HIGH]
   8. Looker        10 appearances   4 companies  [MED]
   9. AWS            9 appearances   4 companies  [HIGH]
  10. Snowflake      9 appearances   2 companies  [MED]

Done.
```

### Command 3 — Break Test (deliberate bad input)

```
(.venv) PS C:\the-reallocation-engine-main> python scripts/skill-demand/skill-gap-master.py --targets nonexistent.txt

case-de-da-live-skill-gap | 2026-07-06T18:04:59.149092+00:00
============================================================

[1/3] Loading 80-days CSV ...
      Loaded 30,369 companies

ERROR: Targets file not found: nonexistent.txt
Create my_targets.txt in the repo root with one company name per line.

Example:
  Databricks
  CVS Health
  Experian
```

### Command 4 — Liveness Check (existing repo script)

```
(.venv) PS C:\the-reallocation-engine-main> npm run ats:liveness -- https://careers.airbnb.com/positions/7988010?gh_jid=7988010

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs https://careers.airbnb.com/positions/7988010?gh_jid=7988010

Checking 1 URL(s)...

✅ active     https://careers.airbnb.com/positions/7988010?gh_jid=7988010

Results: 1 active  0 expired  0 uncertain
```

### Command 5 — Role Scorer (existing repo script, Cognitive Pivot layer)

```
(.venv) PS C:\the-reallocation-engine-main> npm run score -- data/examples/my-de-da-roles.json

> the-reallocation-engine@1.0.0 score
> node scripts/score/role-scorer.mjs data/examples/my-de-da-roles.json

✓ scored 5 roles → Apply 3 · Consider 1 · Skip 1 (skip 20%)
  data\examples\role-scores.json  +  data\examples\role-scores.md
```

**role-scores.md output:**

```
# Role Scorer report — 2026-07-06

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality
weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 5 roles → Apply 3 · Consider 1 · Skip 1. **Skip rate 20%** (below the ~50% a
healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| Airbnb — Senior Data Engineer, People Analytics | 0.528 | **Apply** | composite 0.528 ≥ 0.3, gates healthy | sponsorship 0.99·0.35 [record]; fit 0.8·0.3 [model-judgment] × liveness 1[record]×timeline 0.9[your-input] |
| Stripe — Staff Data Analyst | 0.511 | **Apply** | composite 0.511 ≥ 0.3, gates healthy | sponsorship 0.98·0.35 [record]; fit 0.75·0.3 [model-judgment] × liveness 1[record]×timeline 0.9[your-input] |
| Figma — Data Engineer | 0.508 | **Apply** | composite 0.508 ≥ 0.3, gates healthy | sponsorship 0.98·0.35 [record]; fit 0.85·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Brex — Data Analyst II | 0.216 | **Consider** | composite 0.216 in the Consider band [0.2, 0.3) | sponsorship 0·0.35 [record]; fit 0.8·0.3 [model-judgment] × liveness 1[record]×timeline 0.9[your-input] |
| Notion — Data Analyst | 0.000 | **Skip** | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0·0.35 [record]; fit 0.7·0.3 [model-judgment] × liveness 0[record]×timeline 0.85[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the
recommendation before your confusion (Ch.11).*
```

---

## Verified vs Inferred

| Claim | Source | Type |
|---|---|---|
| 30,369 companies in 80-days CSV | `mapped_student_employment_targets_v3.csv` row count | VERIFIED — local data |
| 15 companies loaded from my_targets.txt | dry run terminal output | VERIFIED — script output |
| Airbnb has 19 live DE/DA jobs | Greenhouse public API HTTP 200 response | VERIFIED — live API |
| Stripe has 15 live DE/DA jobs | Greenhouse public API HTTP 200 response | VERIFIED — live API |
| Brex has 10 live DE/DA jobs | Greenhouse public API HTTP 200 response | VERIFIED — live API |
| SQL appears in 35 live titles/descriptions | keyword match across fetched job data | VERIFIED — deterministic |
| Python appears in 30 live titles/descriptions | keyword match across fetched job data | VERIFIED — deterministic |
| Scala appears in 27 live titles/descriptions | keyword match across fetched job data | VERIFIED — deterministic |
| Airbnb Senior Data Engineer posting is active | `npm run ats:liveness` returned active | VERIFIED — repo script |
| Airbnb H-1B approval rate is 99% | 80-days CSV (1000 approvals, 10 denials) | VERIFIED — local data |
| Stripe H-1B approval rate is 98.3% | 80-days CSV (1250 approvals, 22 denials) | VERIFIED — local data |
| Python is HIGH cognitive tier | static BLS O*NET mapping for SOC 15-1242 | VERIFIED — human-curated |
| Tableau is LOW cognitive tier | static BLS O*NET mapping for SOC 15-1242 | VERIFIED — human-curated |
| Notion, dbt Labs, Fivetran use Workday | not found on Greenhouse or Lever | INFERRED — absence of evidence |
| fit probability values in roles.json | student judgment based on resume match | INFERRED — model-judgment |

---

## Attestation

- Recipe: case-de-da-live-skill-gap v0.1.0
- By: Komal Khairnar · July 6, 2026

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `python skill-gap-master.py --dry-run` | 15 companies loaded, no API calls, Excel written | Setup verified without network |
| `python skill-gap-master.py` | 49 jobs across 6 companies, 19 skills ranked, 9 not found | Live skill ranking from real ATS data |
| `python skill-gap-master.py --targets nonexistent.txt` | ERROR: Targets file not found — clean exit | Script fails gracefully with human-readable message |
| `npm run ats:liveness -- <airbnb-url>` | active — 1 active, 0 expired, 0 uncertain | Posting confirmed live, validates one job from our output |
| `npm run score -- data/examples/my-de-da-roles.json` | Apply 3, Consider 1, Skip 1 — Notion skipped (liveness 0) | Scorer output consistent with our script findings |

### Did not test

- Workday, iCIMS, Taleo API calls — no public JSON endpoint exists
- Running `--all-sponsors` flag against all 38 verified sponsors
- Concurrent runs writing to the same Excel file

### Broke during testing, fixed

- First live run used original targets (Databricks, CVS Health, Experian, Cotiviti, Moda Health, Snowflake, Coursera) — all 7 returned not found because all use Workday. Replaced with Greenhouse/Lever companies (Airbnb, Stripe, Figma etc.) and re-ran.

---

## Reflection

**What went well:**

The three-layer pipeline worked end to end. The 80-days CSV filtered correctly to verified H-1B sponsors, the Greenhouse API returned real job data with full descriptions, and the skill extraction produced a ranked list that is meaningfully different from generic advice. Scala appearing at rank 3 with 27 appearances across 5 companies is something no blog post or survey would surface — it comes directly from Airbnb and Stripe's actual open roles today.

The liveness check confirmed that one of the 49 jobs our script found is genuinely active, validating the pipeline is pulling real data. The scorer confirmed that our H-1B approval rates map correctly to the engine's sponsorship probability inputs.

**What the mode got wrong or missed:**

9 of 15 companies (60%) returned not found. This is the Workday gap documented as Failure Mode 1 in the mode file. The first run with the original target companies (Databricks, CVS Health, Experian) returned 0 live jobs because all use Workday exclusively. The skill ranking is therefore drawn from a biased sample — Airbnb, Stripe, Figma, Squarespace, Amplitude, and Brex are all consumer/fintech companies. Enterprise DE employers, healthcare systems, and large financial institutions are entirely absent.


**Next steps:**

1. Build Workday scraper using Playwright — this would unlock Databricks, Snowflake, CVS Health, Google, and JPMorgan
2. Expand target company list to 38 verified sponsors using `--all-sponsors` flag
3. Cross-check skill rankings against a second run in 2 weeks to test temporal stability

---

## Conformance and Privacy Checks

### npm run verify

```
komal@komal MINGW64 /c/Setup Exercise/the-reallocation-engine (mode/KomalKhairnar-de-da-live-skill-gap)
$ npm run verify
> the-reallocation-engine@1.0.0 verify
> node scripts/conformance.mjs && node scripts/manifest-check.mjs
conformance: 135 files (76 md · 33 py · 23 js · 1 sh · 1 yaml · 1 json)
x 1 file(s) FAILED conformance:
  * metadata.yaml - ModuleNotFoundError: No module named 'yaml'
```

Note: pre-existing repo issue on Windows — not caused by this submission. No new conformance failures introduced.

### npm run doctor

```
komal@komal MINGW64 /c/Setup Exercise/the-reallocation-engine (mode/KomalKhairnar-de-da-live-skill-gap)
$ npm run doctor
> the-reallocation-engine@1.0.0 doctor
> node scripts/doctor.mjs
RECIPE DOCTOR — The Reallocation Engine
==========================================
ENVIRONMENT (required)
  ok node       v24.11.1
  ok python3    Python 3.11.9
ENVIRONMENT (optional — features degrade without these)
  ok pandoc     pandoc 2.12
  — libreoffice not found (PDF fallback)
  ok playwright installed
RUNNABLE COMMANDS (npm script -> target file present?)
  ok verify         scripts/conformance.mjs
  ok manifest-check scripts/manifest-check.mjs
  ok eval:score     scripts/eval/score-run.mjs
  ok eval:report    scripts/eval/report.mjs
  ok doctor         scripts/doctor.mjs
  ok build-instructions scripts/build-instructions.mjs
  ok to-markdown    scripts/to-markdown.mjs
  ok score          scripts/score/role-scorer.mjs
  ok ats:dedup      scripts/ats/dedup-tracker.mjs
  ok ats:liveness   scripts/ats/check-liveness.mjs
  ok ats:merge      scripts/ats/merge-tracker.mjs
  ok ats:normalize  scripts/ats/normalize-statuses.mjs
  ok ats:scan       scripts/ats/scan.mjs
  ok ats:verify     scripts/ats/verify-pipeline.mjs
  ok resumes:pdf    scripts/resumes/generate-pdf.mjs
  ok svg-to-png     scripts/svg-to-png.mjs
  ok audit:layout   scripts/svg-layout-audit.mjs
  ok postsvg-to-png scripts/svg-layout-audit.mjs
DOMAIN DIRECTORIES
  ok data/sec
  ok data/bls
  ok data/ats
  ok data/80-days-to-stay
  ok scripts/sec
  ok scripts/bls
  ok scripts/ats
  ok scripts/resumes
PRIVACY (no personal data committed)
  ok no private/PII paths are tracked
RECIPES (43)
  with lifecycle frontmatter: 1   missing: 42
  by status: RUNNABLE-SAMPLE 1
  open TODOs: 2 declared (in frontmatter) · 519 [TODO markers in bodies
  ! missing frontmatter (42) — add: status / todos_open / last_gate / attestation / recipe_version
      apply.md
      auto-pipeline.md
      ... +40 more (professor's existing recipes — not this submission)
SUMMARY
  environment: ok runnable
  recipes: 1/43 carry lifecycle frontmatter — 42 need it (gap toward DRAFT->VERIFIED discipline)
  next: backfill recipe frontmatter
```

Note: 42 missing frontmatter warnings are for the professor's existing recipes — not caused by this submission. Privacy check passed cleanly.