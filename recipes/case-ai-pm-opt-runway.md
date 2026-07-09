---
status: RUNNABLE-SAMPLE
todos_open: 6
last_gate: "Gate 4 — Script-readiness. Scorer ran. ats:liveness blocked by missing playwright dependency. 2026-06-30"
attestation: "Rohan Jauhari · 2026-06-30 · npm run score confirmed; liveness dependency failure logged; see worked run in assignments/submissions/rohanjauhari/"
recipe_version: 0.1.0
---

# AI / Agentic PM — Early-Stage Startup, OPT Runway

## Purpose

For an international MS student targeting AI product manager roles at
early-stage (seed / Series A) startups, on F-1 OPT beginning September 2026
with a confirmed STEM OPT extension (total ~36-month work-authorization window)
and a hard requirement for employer H-1B sponsorship.

The mode surfaces the tension that makes this search structurally harder than
a senior SWE search: the companies where an agentic PM can own the most
(seed-stage, first PM, fast-moving) are exactly the companies least likely to
have H-1B sponsorship infrastructure. Early-stage companies skip the Apply
pile entirely if no sponsorship record exists. This mode makes that gate
visible before OPT time is spent.

Use this mode when:
- you are an international MS student in a technical/information-systems
  program, graduating within 6 months
- your target role is AI PM, Product Analyst, or agentic product lead
- you require H-1B sponsorship
- you are evaluating 3–10 early-stage AI companies and need to know which
  ones are worth pursuing before applying

Do not use this mode to evaluate:
- enterprise or public-company PM roles (use case-tpm-pivot.md instead)
- non-sponsorship-required searches
- roles outside the US

## Source Inventory

| Source Node | Node Type | Path or Command | Human Check |
|---|---|---|---|
| H-1B sponsorship history | file | `data/80-days-to-stay/80-days-csv/` | Verify CSV is present and dated; note that coverage is retrospective (DOL LCA filings lag actual decisions by months). Absence of a record is evidence, not proof, of non-sponsorship. |
| BLS/O*NET SOC compact | file | `data/BLS/compact/soc_occupation_compact.csv` | Confirm the file exists and that the target SOC code (11-2021.00 for Product Managers per O*NET) is present. The cognitive pivot score is the last field. |
| SEC Form D funding signals | file | `data/sec/form-d/processed/` | Verify quarterly data is present. Form D recency tells you whether a seed company just raised (still hiring) or is funding-dry. |
| Role scorer | script | `npm run score <input-json>` | Bayesian composite scorer (Ch.11). Read `scripts/score/role-scorer.mjs` to confirm weights before running. Profile must declare `sponsorship: required: true` or the sponsorship weight is zeroed. |
| ATS liveness check | script | `npm run ats:liveness -- <job-url>` | **[TODO: DEV]** — requires `playwright` package not currently installed. Run `npm install playwright` and confirm before using liveness as a gate. Until then, treat liveness as your-input only, checked manually via browser. |
| BLS extraction script | script | `python3 scripts/bls/extract-soc-occupation-table.py` | Produces the compact CSV from upstream BLS source. Run if the compact CSV is missing or stale. |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| `roles` | JSON array | Student-authored run envelope (one object per target company) | Yes |
| `roles[].sponsorship.p` | float 0–1 | Cross-referenced against `data/80-days-to-stay/` or marked model-judgment | Yes |
| `roles[].sponsorship.tier` | string | `Proven` / `Likely` / `None` — must match 80-days evidence or be labeled model-judgment | Yes |
| `roles[].fit.p` | float 0–1 | Student judgment against job description; label source as model-judgment | Yes |
| `roles[].liveness.factor` | float 0 or 1 | 0 if `ats:liveness` returns dead/404; 1 if confirmed live. Manual check until playwright is installed. | Yes |
| `roles[].timeline.factor` | float 0–1 | Derived from OPT end date, STEM eligibility, and H-1B lottery cycle (Oct 1 filing). Students with confirmed STEM OPT eligibility and ≥18 months remaining should use 0.90–0.95. | Yes |
| `opt_end_date` | date string | From your OPT card or program record — not estimated | Yes |
| `stem_eligible` | boolean | Must be confirmed with DSO, not self-asserted | Yes |

## Phase Gates

1. **Source gate:** `data/80-days-to-stay/80-days-csv/` and `data/BLS/compact/soc_occupation_compact.csv` are present and parse without errors.
   Test: `test -d data/80-days-to-stay/80-days-csv && python3 -m json.tool /dev/null < /dev/null && wc -l data/BLS/compact/soc_occupation_compact.csv`
   Human check: confirm sponsorship CSV is the correct quarter; confirm BLS compact file has 1016+ rows.

2. **Scope gate:** Run envelope JSON is present and declares `sample` mode or an explicit live-mode approval.
   Test: `python3 -m json.tool data/examples/ai-pm-opt-runway-roles.json`

3. **Data-shape gate:** Every role object in the input JSON has required fields; no `null` sponsorship or fit values.
   Test: `node -e "const r=require('./data/examples/ai-pm-opt-runway-roles.json');r.forEach((x,i)=>{if(x.sponsorship.p===undefined||x.fit.p===undefined)throw new Error('row '+i+' missing fields')});console.log('shape ok')"`

4. **Script-readiness gate:** `npm run score` exits 0 on the input file. `ats:liveness` is either installed or marked [TODO: DEV] with manual liveness noted in run envelope.
   Test: `npm run score data/examples/ai-pm-opt-runway-roles.json`

5. **Approval gate:** No live network calls in the scorer. `ats:liveness` requires playwright install and manual approval before live HTTP calls.
   **[TODO: APPROVE]** — Playwright installation and live liveness-checking require an explicit approval record before running in live mode.

6. **Report gate:** `data/examples/role-scores.md` and `data/examples/role-scores.json` exist after the scorer run.
   Test: `test -f data/examples/role-scores.md && test -f data/examples/role-scores.json`

## What This Mode Can Verify

| Claim | Evidence | Verification command |
|---|---|---|
| Composite score (sponsorship × fit × liveness × timeline) | `npm run score` output, traced term-by-term | `npm run score data/examples/ai-pm-opt-runway-roles.json` |
| SOC code for AI PM roles (11-2021.00) exists in BLS compact | `data/BLS/compact/soc_occupation_compact.csv` | `grep "11-2021" data/BLS/compact/soc_occupation_compact.csv` |
| Cognitive pivot score for 11-2021.00 (Product Managers) | BLS compact CSV, last field | Score = 3.974 — above the 3.5 cognitive-pivot threshold that marks roles resilient to AI substitution |
| Sponsorship tier from 80-days data | `data/80-days-to-stay/80-days-csv/` | Cross-check company name against 80-days CSV before assigning Proven/Likely |
| OPT runway arithmetic | Your-input (opt_end_date + stem_eligible flag) | Manual: confirmed OPT start 2026-09-01; STEM OPT eligibility confirmed with DSO |
| Liveness (posting is real and open) | **[TODO: DEV]** playwright dependency missing | Manual browser check until `npm install playwright` runs and `ats:liveness` exits 0 |

## What This Mode Cannot Verify

- Whether a company that has no 80-days LCA record has *ever* sponsored — absence is a signal, not a definitive record. DOL LCA filings lag actual immigration decisions by months.
- H-1B lottery outcome. The engine can verify sponsorship history; it cannot predict cap-subject lottery results.
- Whether a seed-stage company that just raised will have legal infrastructure for H-1B in time for the Oct 1 cycle.
- Fit score accuracy — fit is student-assigned model-judgment. The recipe does not parse the job description automatically.
- Any immigration or legal guidance — this mode surfaces data, not legal conclusions.

## Steps

1. **Verify provenance.** Confirm `data/80-days-to-stay/80-days-csv/` and BLS compact CSV exist and parse. Cross-check at least one company from your target list against the 80-days CSV manually before assigning sponsorship tiers.

2. **Build run envelope.** Write a JSON file at `data/examples/ai-pm-opt-runway-roles.json` following the schema in `data/examples/ch11-roles.json`. One object per target company. Label every `source` field accurately: `record` if the value came from the 80-days CSV; `model-judgment` if it is your estimate; `your-input` if it came from your own OPT documents.

3. **Check liveness.** For each role URL: if `playwright` is installed, run `npm run ats:liveness -- <url>`. If not installed (current state), check manually in a browser and record `liveness.factor: 1.0` or `0.0` with a note. A closed posting must be 0.0 — it zeroes the composite regardless of fit or sponsorship.

4. **Run scorer.** `npm run score data/examples/ai-pm-opt-runway-roles.json`. Capture terminal output. Read the markdown report at `data/examples/role-scores.md` line by line. For every Consider/Apply, verify that you can explain each term in the audit column before acting on the recommendation.

5. **Sponsorship audit.** For every role scored Likely or Proven, open `data/80-days-to-stay/80-days-csv/` and search for the company. If no record is found, downgrade sponsorship tier to None and re-run. If a record is found, note the most recent LCA year and the job family. LCA records for engineering roles do not automatically transfer to PM roles.

6. **Produce report.** Write output to `reports/generated/ai-pm-opt-runway-[DATE].md`. Use the output contract template below. Write back to `private/` any notes that include personal contact info, specific salary discussions, or recruiter names.

## Output Contract

### Agent log
File: `logs/ai-pm-opt-runway-[DATE].json`
Fields: `workflow`, `run_id`, `mode`, `roles_scored`, `apply_count`, `consider_count`, `skip_count`, `skip_rate`, `sponsorship_verifications`, `liveness_method`, `todos_open`, `gate_decisions`, `generated_at`, `scorer_output_path`.

### Human report
File: `reports/generated/ai-pm-opt-runway-[DATE].md`
Reader: the student and any advisor or coach reviewing the job-search triage.
Decision enabled: which roles to pursue this week, which to hold pending sponsorship verification, which to skip.

| Company | Role | Score | Rec | Sponsorship evidence | Liveness | Fit notes | Next action |
|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | record / model-judgment + note | confirmed / [TODO] | ... | Apply by [date] / Verify sponsor / Skip |

## Stop Conditions

- Stop if a role's `liveness.factor` is 0 — a dead posting cannot yield an Apply, regardless of any other score.
- Stop if `sponsorship.tier` is `None` and no `override` is present with a written reason — a company with no sponsorship history is Skip, always.
- Stop if `opt_end_date` is estimated rather than read from an OPT card or program record — scoring with an estimated date can produce false Apply recommendations.
- Stop before concluding any company "will" or "won't" sponsor — the engine surfaces historical evidence, not legal guarantees.
- Stop before publishing or sharing any output that contains personal application notes, recruiter contact details, or OPT card information.

## SOC Reference

| SOC Code | O*NET Title | Cognitive Pivot Score | Why it matters |
|---|---|---|---|
| 11-2021.00 | Marketing Managers (includes Product Managers per O*NET) | 3.974 | Above the 3.5 threshold marking roles resilient to AI substitution — the judgment-and-strategy work that defines PM is what this score measures |
| 15-1299.09 | IT Project Managers | 3.861 | Alternative SOC for TPM-track roles; lower cognitive pivot than pure PM |

## Log Template

```
## [DATE] — AI PM OPT Runway run

- Mode: case-ai-pm-opt-runway, RUNNABLE-SAMPLE
- Inputs: [N] roles, OPT start [DATE], STEM OPT confirmed/uncertain
- Commands: npm run score data/examples/ai-pm-opt-runway-roles.json
- Output: [N] roles → Apply [N] · Consider [N] · Skip [N] (skip rate [X]%)
- Sponsorship verifications: [list companies checked against 80-days CSV]
- Liveness method: [playwright / manual browser / mixed]
- Open issues: [playwright dependency; any unverified sponsorship tiers]
- Next: [scheduled re-run date or trigger]
```

## Snickerdoodle

### Run commands
Full dialogic run:
`snickerdoodle run case-ai-pm-opt-runway --mode dialogic`

Sample mode (no live network calls):
`snickerdoodle run case-ai-pm-opt-runway --mode dialogic --sample`

### Step commands

| Step | CLI Command | Flags |
|---|---|---|
| Verify provenance | `snickerdoodle run case-ai-pm-opt-runway --step verify-provenance` | `--sample` `--no-write` |
| Build run envelope | `snickerdoodle run case-ai-pm-opt-runway --step build-envelope` | `--sample` |
| Check liveness | `snickerdoodle run case-ai-pm-opt-runway --step check-liveness` | `--sample` `--no-write` |
| Run scorer | `snickerdoodle run case-ai-pm-opt-runway --step run-scorer` | `--sample` |
| Sponsorship audit | `snickerdoodle run case-ai-pm-opt-runway --step sponsorship-audit` | `--sample` `--no-write` |
| Produce report | `snickerdoodle run case-ai-pm-opt-runway --step produce-report` | `--sample` `--no-write` |

### Output locations

| Output | Path | Format |
|---|---|---|
| Run envelope (input) | `data/examples/ai-pm-opt-runway-roles.json` | JSON |
| Scorer output (JSON) | `data/examples/role-scores.json` | JSON |
| Scorer output (Markdown) | `data/examples/role-scores.md` | Markdown |
| Human report | `reports/generated/ai-pm-opt-runway-[DATE].md` | Markdown |
| Agent log | `logs/ai-pm-opt-runway-[DATE].json` | JSON |
