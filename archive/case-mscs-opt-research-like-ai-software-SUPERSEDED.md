---
status: RUNNABLE-SAMPLE
todos_open: 9
last_gate: "sample-run, 2026-07-06, logs/RUN_LOG.md#2026-07-06"
attestation: null
recipe_version: 0.2.0
---

# case-mscs-opt-research-like-ai-software — Research-Like Software Roles for an AI-Era F-1 Student

## Purpose

Score and rank job postings for an **F-1 MSCS/MSIS student, pre-OPT**, who is
targeting research-like software roles — Applied AI Engineer, Full-Stack /
Software Engineer on a prototyping team, XR/HCI prototype developer, Research
Engineer — where the day-to-day work is exploration, prototyping, benchmarking,
evaluation, and AI-assisted discovery rather than ticket-closing maintenance.


This mode is not for formal PhD research-scientist roles (publications,
tenure track) or senior/staff-only leadership roles.

## Source Inventory

| Source Node | Node Type | Source URL or Path | Human Check |
|---|---|---|---|
| This recipe | Markdown recipe | `recipes/case-mscs-opt-research-like-ai-software.md` | Confirm current + approved before a run. |
| **Bayesian Role Scorer (RUNS TODAY)** | Node script | `scripts/score/role-scorer.mjs` → `npm run score <roles.json> [--profile p.json] [--out-dir dir] [--md report.md]` | The combiner that produces Apply/Consider/Skip. Real, tested, wired. |
| Role-evidence input (this run) | JSON | `data/examples/research-like-roles.json` | 8 illustrative research-like roles in the scorer's input contract. Anonymized — no personal data. |
| Student profile (this run) | JSON | `data/examples/research-like-profile.json` | F-1 pre-OPT persona → `needs_sponsorship = true`. |
| Sponsorship / funding evidence | CSV | `data/80-days-to-stay/` (H-1B history), `data/sec/form-d/` (funding) | Upstream feed for the `sponsorship` vote. Read-only; do not rewrite. |
| Role-quality evidence | CSV | `data/bls/compact/soc_occupation_compact.csv` | Upstream feed for the `role_quality` vote (SOC 15-1252 / 15-1221). |
| Posting liveness | Node script | `npm run ats:liveness -- <job-url>` and `npm run ats:scan -- --dry-run` | Real ATS provider/liveness surface (the liveness GATE). |

### The core mapping (why this mode runs today)

The mode does not need six new `.py` scripts to produce a decision. The engine's
Ch.11 scorer already combines the exact five components this mode cares about.
Each mode concept maps to an existing scorer field:

| Mode concept | Scorer field | Weight / role | Source label |
|---|---|---|---|
| Research-like **software fit** (prototyping / evaluation / AI-assisted discovery signal) | `fit.p` | vote, 0.30 | `model-judgment` |
| Sponsorship feasibility | `sponsorship.p` + `.tier` | vote, 0.35 (→0 if profile needs no sponsorship) | `record` (80-days / DOL) |
| Role-quality (AI-resilience, BLS/O*NET) | `role_quality.p` | vote, **weight 0.0 today** — see "cannot verify" | `record` (BLS) |
| Posting liveness | `liveness.factor` | **GATE** (multiplier) | `record` (ATS) |
| Visa timeline vs OPT EAD | `timeline.factor` | **GATE** (multiplier) | `your-input` |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| roles | JSON array of role-evidence records | `data/examples/research-like-roles.json` (or your own batch in the same shape) | Yes |
| profile | JSON | `data/examples/research-like-profile.json` | Optional (defaults to "needs sponsorship" = true) |

Each role record: `role_id`, `company`, `title`, `sponsorship {p,tier,source}`,
`fit {p,source}`, `role_quality {p,source}`, `liveness {factor,source}`,
`timeline {factor,source}`, optional `override {decision,reason}`.

## Phase Gates

1. **Source gate** — required paths present or typed-TODO. Test: `test -f scripts/score/role-scorer.mjs && test -f data/examples/research-like-roles.json`. Human capacity: confirm inputs are current.
2. **Scope gate** — run declares `sample` (no live network, no external writes). This mode's real run is sample: the scorer only reads local JSON and writes reports. Test: profile + roles are local files. Human capacity: approve mode.
3. **Data-shape gate** — roles + profile JSON parse before scoring. Test: `node -e "JSON.parse(require('fs').readFileSync('data/examples/research-like-roles.json'))"`. Human capacity: confirm parse.
4. **Script-readiness gate** — the decision script exists. Test: `npm run score -- data/examples/research-like-roles.json --out-dir <tmp>` exits 0. **PASSES today** (proposed `.py` enrichment scripts remain typed `[TODO: DEV]`, not required for the decision). Human capacity: accept scope.
5. **Approval gate** — live network / external writes / model calls with sensitive data require a logged approval. This sample run makes **none**, so the gate is n/a. Test: `rg --fixed-strings "[TODO: APPROVE]"` — none open for sample mode. Human capacity: block live execution.
6. **Liveness GATE (hard stop, not a vote)** — a role whose `liveness.factor ≤ 0.05` is Skipped regardless of votes. Confirm liveness with `npm run ats:liveness -- <job-url>` before setting the factor. Human capacity: clear each live posting.
7. **Visa-timeline GATE (hard stop, not a vote)** — a role whose start date precedes the student's OPT EAD gets `timeline.factor → 0` and is Skipped. Human capacity: clear each timeline. *(This is a scheduling/eligibility judgment, never an immigration-legal conclusion.)*
8. **Report gate** — agent log + human report written with required fields/sections. Test: `test -f logs/case-mscs-opt-research-like-ai-software-[DATE].json && test -f reports/generated/case-mscs-opt-research-like-ai-software-[DATE].md`.

## Steps

1. **Assemble role-evidence records.** Labor: human + AI. For each candidate posting, fill the record fields. `fit.p` is an explicit **model-judgment** (label it as such); `sponsorship.p/.tier` come from 80-days/DOL **records**; `liveness.factor` from the ATS check; `timeline.factor` from your OPT EAD vs the posting's start date. Output → `data/examples/research-like-roles.json` (or your batch). *(An automated `fit` extractor is proposed — see `[TODO: DEV]` below — but is not required: the human/AME judgment path runs today.)*
2. **Confirm liveness (GATE).** Labor: AI + human clearance. `npm run ats:liveness -- <job-url>` per posting; set `liveness.factor` (1.0 live, 0.0 dead/ghost). Dead ⇒ Skip.
3. **Confirm timeline (GATE).** Labor: human. Compare start date to OPT EAD; set `timeline.factor`. Impossible start ⇒ Skip.
4. **Score & rank.** Labor: AI (stored script). `npm run score -- data/examples/research-like-roles.json --profile data/examples/research-like-profile.json --out-dir reports/generated --md reports/generated/case-mscs-opt-research-like-ai-software-[DATE].md`. Emits per-role composite, Apply/Consider/Skip, and a full audit trace.
5. **Produce human report + agent log.** Labor: AI + human read. The scorer's Markdown is the human report; write the agent log JSON (Output Contract below). Human reads the verified-vs-inferred split before acting.

### Proposed additions 

- `[TODO: DEV]` `scripts/modes/research-like-extract-fit.py` — parse a posting and emit a **proposed** `fit.p` from research-like keyword evidence (prototype, benchmark, evaluate, POC, ambiguous requirements) + software-stack signals. *Justification:* removes hand-scoring of `fit`; belongs because the mode's differentiator is the research-like signal. Until built, `fit.p` is a labeled model-judgment.
- `[TODO: DEV]` `scripts/modes/research-like-check-entry-level.py` — flag 5+/8+ yrs, staff/principal, PhD-required. *Justification:* entry-level feasibility is a distinct axis for a new grad; today it folds into `fit`.
- `[TODO: DEFINE]` give `role_quality` a non-zero weight and renormalize (repo defect #3) so the BLS/O*NET AI-resilience signal actually moves the composite — currently weight 0.0.
- `[TODO: DATA SOURCE]` batch H-1B lookup joining a company list to `data/80-days-to-stay/` to populate `sponsorship.p/.tier` automatically.
- `[TODO: DEV]` `scripts/modes/research-like-produce-report.py` — richer human report than the scorer's default table.
- `[TODO: DATA SOURCE]` `data/modes/research-like/patterns.yml` — versioned research-like/entry-level keyword rules for the fit extractor.

## Output Contract

### Agent output (machine)
File: `logs/case-mscs-opt-research-like-ai-software-[DATE].json`
Fields: `workflow, run_id, mode, command, steps_completed, records_seen, apply, consider, skip, gated_to_zero, skip_rate, stop_conditions, todo_items, source_files, gate_decisions, generated_at, recipe_version, score_version, verified_output_paths, report_path`.

### Human report (person)
File: `reports/generated/case-mscs-opt-research-like-ai-software-[DATE].md`
Reader: the student (and instructor/reviewer).
Decision enabled: which postings to apply to first, which to investigate, which to skip; and whether any score should be distrusted.
Sections: summary + skip-rate, per-role table with **composite, recommendation, why, and full audit trace** (term · value · weight · source), verified-vs-inferred split, gates fired, open TODOs.

*(P5: one artifact cannot serve both readers — the scorer emits `role-scores.json` for the agent and `role-scores.md` for the human.)*

## Scoring Contract

Composite = ( Σ vote·weight ) × liveness × timeline (Ch.11). Defaults today:
sponsorship 0.35, fit 0.30, role_quality **0.0** `[VERIFY]`; apply_threshold 0.30;
consider_floor 0.20; a gate ≤ 0.05 ⇒ Skip. Soft sponsorship tier
(Likely/Possible/Unknown) or timeline < 0.6 demotes Apply → Consider.

| Recommendation | Composite | Meaning |
|---|---:|---|
| Apply | ≥ 0.30, gates healthy | Apply soon; tailor résumé to research-like evidence. |
| Consider | 0.20–0.30, or ≥0.30 with one soft spot | Apply if you can close a small gap or have a referral. |
| Skip | < 0.20, or any closed gate | Time is better spent elsewhere. |

## Stop Conditions

- Stop if a posting's text/URL is missing — `fit` and liveness would be guesses.
- Stop if the student profile lacks visa context — feasibility would overstate certainty.
- Stop if a role needs a live network call but no approval record exists.
- Stop if the posting states US-citizen-only / clearance-only / no-sponsorship and the student is ineligible (hard reject).
- Stop before any **immigration-legal conclusion** — the timeline gate is a scheduling judgment, not legal advice.
- Refuse to emit a score for any term you cannot source; label every model-judgment as a judgment (never as a record).

## Snickerdoodle

### Run Commands (roadmap CLI — the runtime is `npm run score`; see DOMAIN.md)
`snickerdoodle run research-like --mode dialogic --sample`

### Real command (RUNS TODAY)
```
npm run score -- data/examples/research-like-roles.json \
  --profile data/examples/research-like-profile.json \
  --out-dir reports/generated \
  --md reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.md
```

## Provenance

| Source | Verification command | Notes |
|---|---|---|
| `scripts/score/role-scorer.mjs` | `test -f scripts/score/role-scorer.mjs` | The decision core (Ch.11), wired as `npm run score`. |
| `data/examples/research-like-roles.json` | `node -e "JSON.parse(require('fs').readFileSync('data/examples/research-like-roles.json'))"` | Input for this run; anonymized. |
| `data/80-days-to-stay/` | `test -d data/80-days-to-stay` | Sponsorship/H-1B upstream feed. |
| `data/bls/compact/soc_occupation_compact.csv` | `test -f data/bls/compact/soc_occupation_compact.csv` | Role-quality upstream feed. |

## Log Template

### Agent Log Template
File: `logs/case-mscs-opt-research-like-ai-software-[DATE].json`

```json
{
  "workflow": "case-mscs-opt-research-like-ai-software",
  "run_id": "case-mscs-opt-research-like-ai-software-[DATE]-[RUN_ID]",
  "mode": "sample",
  "command": "npm run score -- data/examples/research-like-roles.json --profile data/examples/research-like-profile.json --out-dir reports/generated",
  "steps_completed": ["assemble-records", "confirm-liveness", "confirm-timeline", "score-rank", "produce-report"],
  "records_seen": 0,
  "apply": 0,
  "consider": 0,
  "skip": 0,
  "gated_to_zero": 0,
  "skip_rate": "0%",
  "stop_conditions": [],
  "todo_items": [
    { "type": "TODO: DEV", "item": "Automated research-like fit extractor.", "path": "scripts/modes/research-like-extract-fit.py" },
    { "type": "TODO: DEFINE", "item": "Give role_quality a non-zero weight and renormalize (repo defect #3).", "path": "scripts/score/role-scorer.mjs" }
  ],
  "source_files": [
    "data/examples/research-like-roles.json",
    "data/examples/research-like-profile.json",
    "scripts/score/role-scorer.mjs"
  ],
  "gate_decisions": [
    { "gate": 1, "name": "Source gate", "decision": "pass" },
    { "gate": 2, "name": "Scope gate", "decision": "pass" },
    { "gate": 3, "name": "Data-shape gate", "decision": "pass" },
    { "gate": 4, "name": "Script-readiness gate", "decision": "pass" },
    { "gate": 5, "name": "Approval gate", "decision": "n/a" },
    { "gate": 6, "name": "Liveness gate", "decision": "pass" },
    { "gate": 7, "name": "Timeline gate", "decision": "pass" },
    { "gate": 8, "name": "Report gate", "decision": "pass" }
  ],
  "generated_at": "[ISO-8601 timestamp]",
  "recipe_version": "0.2.0",
  "score_version": "0.1.0",
  "verified_output_paths": ["reports/generated/"],
  "report_path": "reports/generated/case-mscs-opt-research-like-ai-software-[DATE].md"
}
```
