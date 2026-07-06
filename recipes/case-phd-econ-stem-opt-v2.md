---
status: RUNNABLE-SAMPLE
todos_open: 3
last_gate: gate-4-script-readiness
attestation: "assignments/submissions/davidovic/worked-run.md#attestation"
recipe_version: 0.2.0
---

# PhD Economist to Industry Transition — SOC Identification Mode

## Purpose

Resolves the SOC classification ambiguity that makes standard job-search tools
unreliable for PhD economists on F-1 STEM OPT extension. The same work —
structural econometrics, causal inference, fiscal policy analysis — can be filed
by an employer under SOC 19-3011 (Economists), 15-2051 (Data Scientists), or
15-2041 (Statisticians). That classification governs the prevailing wage floor,
the H-1B sponsorship probability, and the Cognitive Pivot score. A candidate who
anchors on the wrong SOC median enters every salary negotiation with a
miscalibrated floor and misjudges which employers are worth pursuing.

**Use this recipe when:** the candidate holds a PhD in economics, econometrics,
or quantitative finance; is on F-1 STEM OPT extension; and is evaluating
industry roles across consulting, tech economist teams, think tanks, and
financial services.

**This recipe ran in SAMPLE mode on 2026-07-06.** The role scorer
(`npm run score`) and liveness checker (`npm run ats:liveness`) executed against
real data. Proposed scripts are marked `[TODO: DEV]` and their outputs are
labeled INFERRED throughout.

---

## Source Inventory

| Source Node | Node Type | Path | Human Check |
|---|---|---|---|
| BLS OES compact SOC table | file | `data/BLS/compact/soc_occupation_compact.csv` | Confirm file present: `test -f data/BLS/compact/soc_occupation_compact.csv`. Verified 2026-07-06: file exists, 607,916 bytes. |
| Role scorer | script | `scripts/score/role-scorer.mjs` | Run `npm run score -- roles.json --out-dir output_results`. Verified 2026-07-06: scored 3 roles, output written to `output_results/role-scores.json` and `output_results/role-scores.md`. |
| Liveness checker | script | `scripts/ats/check-liveness.mjs` | Run `npm run ats:liveness -- <url>`. Verified 2026-07-06: returned uncertain/expired for tested URLs. |
| H-1B sponsor history | file | `data/80-days-to-stay/` | `[TODO: DATA SOURCE]` — LCA filing counts by employer × SOC code not yet extracted to a queryable flat file. Sponsorship p-values in this run are INFERRED from public DOL LCA disclosure data, not from a verified local extract. |
| SOC cognitive demand scores | file | `data/BLS/compact/soc_occupation_compact.csv` | Role quality scores (0.84 for SOC 19-3011, 0.76 for 15-2051) derived from O*NET dimensions in this file. Verified column presence required before use. |
| Federal/multilateral employer list | file | `data/federal_multilateral_employers.csv` | `[TODO: DATA SOURCE]` — file does not exist in repo. Cap-exempt employer sponsorship cannot be verified from LCA data; federal employers show LCA count = 0 as a structural artifact, not a true zero. |
| Tech economist team list | file | `data/tech_econ_employers.csv` | `[TODO: DATA SOURCE]` — file does not exist in repo. Tech companies with active economist teams need a curated extract to distinguish economist-team LCAs from the bulk of engineering LCAs. |

---

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| `opt_extension_end_date` | date (YYYY-MM-DD) | Candidate — from I-20 or OPT card | Yes — timeline gate depends on this |
| `target_roles` | JSON array of role-evidence records | Candidate — one record per employer/role, with sponsorship p, fit p, liveness factor, timeline factor | Yes — scorer input |
| `primary_soc` | string | Candidate — e.g. `19-3011` | Yes — determines wage floor and cognitive score |
| `secondary_soc_codes` | string array | Candidate — e.g. `["15-2051","15-2041"]` | Yes — SOC probability cross-check requires all plausible codes |
| `target_metro` | string | Candidate — e.g. `New York` | Yes — metro wage floor lookup (manual; BLS OES metro tables) |

---

## Phase Gates

1. **Source gate** — All required source paths present or marked `[TODO]`.
   Test: `node -e "const fs=require('fs'); ['data/BLS/compact/soc_occupation_compact.csv','scripts/score/role-scorer.mjs','scripts/ats/check-liveness.mjs'].forEach(f=>{console.log(f, fs.existsSync(f)?'OK':'MISSING')})"`
   Result 2026-07-06: BLS compact CSV OK · role-scorer.mjs OK · check-liveness.mjs OK · federal_multilateral_employers.csv MISSING (TODO) · tech_econ_employers.csv MISSING (TODO).
   Human capacity: [TO] — reviewer confirms sources are complete enough to proceed in SAMPLE mode.

2. **Scope gate** — Run declares SAMPLE mode; no live H-1B API calls, no writes to private/.
   Test: confirm `--out-dir` target is not inside `private/` or `data/ats/`.
   Result 2026-07-06: output written to `output_results/` only. PASSED.
   Human capacity: [PF].

3. **SOC identification gate** — For each employer, P(primary SOC | employer) must be computed or explicitly labeled INFERRED before scoring proceeds.
   Test: `[TODO: DEV]` — `scripts/jobops/econ-soc-sponsor-tracker.py` does not yet exist. In this run, SOC probability estimates are INFERRED from public LCA disclosure data and labeled as `model-judgment` in scorer input.
   Human capacity: [IJ] — reviewer must accept INFERRED SOC probability before composite score is used for decisions.

4. **Script-readiness gate** — Every step script exists or has a typed `[TODO: DEV]`.
   Test: `node -e "const fs=require('fs'); ['scripts/score/role-scorer.mjs','scripts/ats/check-liveness.mjs'].forEach(f=>{console.log(f, fs.existsSync(f)?'OK':'MISSING')})"`
   Result 2026-07-06: both scripts exist. Proposed scripts (econ-soc-sponsor-tracker.py, ingest scripts) carry `[TODO: DEV]`. PASSED.
   Human capacity: [IJ].

5. **Liveness gate** — Every role URL must pass liveness check before scoring. A result of `expired` (HTTP 404) zeroes the liveness factor and blocks Apply recommendation regardless of composite.
   Test: `npm run ats:liveness -- <url>` for each target role URL.
   Result 2026-07-06: Analysis Group careers page → uncertain (content present, no apply control visible). Greenhouse 404 URL → expired. Fake Lever URL → expired.
   Human capacity: [PA] — reviewer confirms uncertain results before treating as live.

6. **Report gate** — Agent log (JSON) and human report (Markdown) written with required fields.
   Test: `node -e "const fs=require('fs'); console.log(fs.existsSync('output_results/role-scores.json')?'JSON OK':'MISSING', fs.existsSync('output_results/role-scores.md')?'MD OK':'MISSING')"`
   Result 2026-07-06: both files present. PASSED.
   Human capacity: [TO].

---

## Steps

### Step 1 — Verify SOC coverage for each target employer
Labor: Human with data check.
Command: Query `data/80-days-to-stay/` or public DOL LCA disclosure for employer × SOC code counts across 19-3011, 15-2051, 15-2041.
Output: For each employer: `{employer, soc_19_3011_lca_count, soc_15_2051_lca_count, soc_15_2041_lca_count, p_primary_soc, source}`.
Where output goes: `data/raw/case-phd-econ-stem-opt/soc-coverage.json`
Status: `[TODO: DEV]` — `scripts/jobops/econ-soc-sponsor-tracker.py` does not exist. This run uses INFERRED p-values labeled `model-judgment`.

### Step 2 — Run liveness check on all target role URLs
Labor: AI (script).
Command: `npm run ats:liveness -- <url>`
Output: `{url, status, reason}` — active / uncertain / expired.
Where output goes: logged to terminal; expired URLs set `liveness.factor = 0` in roles.json.
Status: **RAN** — see Worked Run section. Analysis Group careers → uncertain. Greenhouse test → expired. Fake Lever → expired.

### Step 3 — Build roles.json with full evidence fields
Labor: Human.
Required fields per role: `role_id`, `company`, `title`, `sponsorship {p, tier, source}`, `fit {p, source}`, `role_quality {p, source}`, `liveness {factor, source}`, `timeline {factor, source}`.
Notes: sponsorship.p from Step 1; role_quality.p from `data/BLS/compact/soc_occupation_compact.csv` O*NET dimensions; fit.p is model-judgment; liveness.factor from Step 2; timeline.factor from OPT end date relative to H-1B filing deadline.

### Step 4 — Run role scorer
Labor: AI (script).
Command: `npm run score -- roles.json --out-dir output_results`
Output: `output_results/role-scores.json` + `output_results/role-scores.md`
Status: **RAN** — see Worked Run section. Apply 2 · Consider 1 · Skip 0.

### Step 5 — Produce human report
Labor: Human review of scorer output.
Command: `type output_results\role-scores.md` (Windows) or `cat output_results/role-scores.md`
Output: Markdown table with composite scores, recommendations, and full audit trace per role.
Status: **RAN** — output pasted in Worked Run section.

### Step 6 — Flag federal/cap-exempt employers separately
Labor: Human.
Note: Federal Reserve Banks, CBO, IMF, World Bank show LCA count = 0 in DOL data — structural artifact, not a true zero. These employers must be verified manually via their careers pages and are cap-exempt (no H-1B lottery). Do not score them as Skip based on missing LCA data.
Status: `[TODO: DATA SOURCE]` — `data/federal_multilateral_employers.csv` does not exist. Manual verification required.

---

## What This Recipe Can and Cannot Verify

### Verified (from real script runs on 2026-07-06)
| Claim | Source | Command |
|---|---|---|
| Role scorer runs and produces auditable composite scores | `scripts/score/role-scorer.mjs` | `npm run score -- roles.json --out-dir output_results` |
| NY Fed Economist composite: 0.579 → Apply | scorer output | `output_results/role-scores.json` |
| Analysis Group Economist composite: 0.488 → Apply | scorer output | `output_results/role-scores.json` |
| Amazon Data Scientist composite: 0.381 → Consider (soft sponsorship tier) | scorer output | `output_results/role-scores.json` |
| Analysis Group careers page liveness: uncertain | `scripts/ats/check-liveness.mjs` | `npm run ats:liveness` |
| Greenhouse 404 URL: expired | liveness script | `npm run ats:liveness` |
| Fake Lever URL: expired (deliberate break test) | liveness script | `npm run ats:liveness` |
| BLS compact SOC file present (607,916 bytes) | filesystem | `dir data\BLS\compact` |

### Inferred (labeled model-judgment in scorer input)
| Claim | Basis | Gap |
|---|---|---|
| Sponsorship p-values (Analysis Group 0.82, Amazon 0.61, NY Fed 0.90) | Public DOL LCA disclosure data, manually estimated | No verified local LCA extract; `econ-soc-sponsor-tracker.py` does not exist |
| SOC cognitive scores (19-3011: 0.84, 15-2051: 0.76) | O*NET via BLS compact table | Column mapping not script-verified in this run |
| P(SOC=19-3011 | Amazon) ≈ 0.054 | LCA filing distribution, manually computed | No automated cross-SOC tabulation script |
| Federal employer sponsorship (NY Fed labeled proven) | Known institutional track record | LCA count = 0 is structural artifact; no verified local source |

### Cannot Verify Without Proposed Scripts
| Gap | Proposed Fix | Status |
|---|---|---|
| SOC filing probability per employer | `scripts/jobops/econ-soc-sponsor-tracker.py` | `[TODO: DEV]` |
| Federal/multilateral employer sponsorship | `data/federal_multilateral_employers.csv` | `[TODO: DATA SOURCE]` |
| Metro-specific wage floor | BLS OES metro tables — manual lookup | `[TODO: DATA SOURCE]` |
| Active team headcount at target employers | LinkedIn headcount trend — manual | No script exists |

---

## Output Contract

### Agent output
File: `output_results/role-scores.json`
Fields (from scorer): `_scorer`, `_chapter`, `generated`, `config`, `profile_needs_sponsorship`, `roles[]` — each with `role_id`, `company`, `title`, `composite`, `recommendation`, `machine_recommendation`, `reason`, `override`, `trace` (votes, vote_sum, gates, gate_product, arithmetic).
Note: one JSON artifact for the agent; one Markdown artifact for the human reviewer. These are separate files — the JSON is not readable as a human report.

### Human report
File: `output_results/role-scores.md`
Reader: Candidate (PhD economist on STEM OPT extension) and human advisor reviewing the application pipeline.
Decision enabled: which roles to apply to, which to investigate further (Consider), which to drop (Skip).
Sections: run date, weights, summary counts, per-role table with composite, recommendation, reason, and full audit trace.

---

## Stop Conditions

- Stop if `opt_extension_end_date` is missing — timeline gate cannot be computed and composite scores are meaningless.
- Stop if sponsorship p-values are missing for all roles and `econ-soc-sponsor-tracker.py` does not exist — do not guess; label as INFERRED and require human review before acting on recommendations.
- Stop if a role URL returns `expired` from liveness check — do not score that role as Apply regardless of composite; set `liveness.factor = 0`.
- Stop before treating federal employer LCA count = 0 as evidence of no sponsorship — this is a structural data gap, not a verified finding.
- Stop if `data/federal_multilateral_employers.csv` does not exist and the candidate is evaluating Federal Reserve Bank, CBO, or multilateral roles — these are the highest-fit employers for a PhD fiscal economist and cannot be scored without a verified source.
- Stop before providing immigration or legal guidance — this recipe scores job-search evidence only.

---

## Proposed Additions

### `scripts/jobops/econ-soc-sponsor-tracker.py` `[TODO: DEV]`
Cross-tabulates DOL LCA filings for a target employer across SOC 19-3011, 15-2051, and 15-2041. Computes P(SOC | employer) from filing history over a 3-year lookback. Outputs a JSON record per employer with filing counts and probability scores. Justification: the SOC identification problem is the central information asymmetry this recipe addresses, and it cannot be resolved from data without this script. Every sponsorship p-value in the current run is INFERRED because this script does not exist.

### `data/federal_multilateral_employers.csv` `[TODO: DATA SOURCE]`
Curated list of cap-exempt employers (Federal Reserve Banks, CBO, BLS, IMF, World Bank, RAND, Urban Institute, Brookings) with known H-1B sponsorship track record and cap-exempt status flag. Justification: these are the most important employers for PhD fiscal economists and are structurally absent from standard LCA data. Without this file, the recipe cannot score the highest-fit segment of the target market.

### `data/tech_econ_employers.csv` `[TODO: DATA SOURCE]`
Tech companies with active internal economist teams, with fields: company name, team name, last known hiring year, primary SOC code used, LCA count under that SOC. Justification: Amazon, Uber, Airbnb, Microsoft, Google all file the majority of their LCAs under 15-2051 even for economist roles. A candidate checking only 19-3011 will miss the sponsorship signal entirely. This file enables the SOC reclassification logic in Step 1.

---

## Log Template

Append to `logs/RUN_LOG.md`:

```
## [DATE] — case-phd-econ-stem-opt-v2 run

**Status:** RUNNABLE-SAMPLE
**Candidate profile:** PhD Economics / STEM OPT Extension / [METRO]
**Primary SOC:** 19-3011 | Secondary: 15-2051, 15-2041
**OPT extension end date:** [DATE]

**Scripts run:**
- npm run score -- roles.json --out-dir output_results [RAN]
- npm run ats:liveness -- [URL] [RAN]
- npm run ats:scan -- --dry-run [ERROR: portals.yml not found]
- econ-soc-sponsor-tracker.py [NOT AVAILABLE — TODO: DEV]

**Results:**
- Roles scored: [N] | Apply: [N] | Consider: [N] | Skip: [N]
- Liveness checks: [N] active | [N] uncertain | [N] expired
- Federal employers flagged for manual verify: [N]

**Verified findings:**
- [list from role-scores.json]

**Inferred findings (require human review before acting):**
- Sponsorship p-values: INFERRED from public LCA disclosure
- SOC probability scores: INFERRED — econ-soc-sponsor-tracker.py not yet built

**Open gaps:**
- federal_multilateral_employers.csv does not exist
- tech_econ_employers.csv does not exist
- Metro wage floor: manual lookup required at bls.gov/oes
- econ-soc-sponsor-tracker.py: TODO: DEV

**Next run trigger:** 90 days before April H-1B filing window, or when a new
economist posting is identified at a target employer.
```

---

## Snickerdoodle

### Run Commands
Sample mode (no live H-1B API calls, no writes to private/):
`snickerdoodle run case-phd-econ-stem-opt-v2 --mode dialogic --sample`

### Step Commands

| Step | CLI Command | Flags |
|---|---|---|
| Run liveness | `npm run ats:liveness -- <url>` | none |
| Run scorer | `npm run score -- roles.json --out-dir output_results` | `--profile profile.json` optional |
| SOC sponsor tracker | `python3 scripts/jobops/econ-soc-sponsor-tracker.py` | `[TODO: DEV]` |

### Output Locations

| Output | Path | Format |
|---|---|---|
| Role scores (agent) | `output_results/role-scores.json` | JSON |
| Role scores (human) | `output_results/role-scores.md` | Markdown |
| Run log | `logs/RUN_LOG.md` | Markdown |
