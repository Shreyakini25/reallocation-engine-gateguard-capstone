---
status: DRAFT
todos_open: 12
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# Research-Like Job Hunting Mode for AI-Era Software Roles

## Purpose

Checks whether traditional software jobs contain meaningful research-like work that fits an AI-era CS student job-search strategy. This recipe helps identify roles where a student can use software engineering, AI-assisted development, prototyping, technical exploration, evaluation, documentation, and independent project ownership.

This mode is designed for software developer, full-stack developer, applied AI, HCI, VR, simulation, and prototype-building roles that contain research-like responsibilities. It is not designed to target formal PhD-level research scientist roles, tenure-track academic jobs, or senior-only technical leadership roles.

The recipe gives the student and a human reviewer enough evidence to decide which job postings should be prioritized, which require manual verification, and which should stop before more application time or OPT runway is spent.

## Source Inventory



## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| job_url | URL | Student run envelope or collected job list. Exact field: `job_url`. | Yes |
| data/80-days-to-stay/ | text |large job position dataset. Exact field: `dataset`. | Yes |

## Phase Gates

1. Source gate: All required source paths are present or explicitly marked with a typed TODO. Test: `test -f "recipes/case-research-like-job-hunting.md" && rg -n "|" "recipes/case-research-like-job-hunting.md" || true`. Human capacity: [TO].

2. Scope gate: The run declares `sample` mode or an approved live mode before ingest begins. Test: `python3 -m json.tool data/raw/research-like-job-hunting/run-envelope.json`. Human capacity: [PF].

3. Data-shape gate: Every raw and verified JSON output parses before downstream scripts run. Test: `find data/raw/research-like-job-hunting data/verified/research-like-job-hunting -name "*.json" -print -exec python3 -m json.tool {} \;`. Human capacity: [PA].

4. Script-readiness gate: Every step script exists or is represented by a typed development TODO. Test: `test -f scripts/ingest/research-like-job-hunting-ingest-inputs.py || rg --fixed-strings "[TODO: DEV]" "recipes/case-research-like-job-hunting.md"`. Human capacity: [IJ].

5. Approval gate: Live network calls, external writes, credentials, production databases, emails, dashboards, publishing, recruiter contact, immigration/legal conclusions, or model calls with sensitive data require an approval record. Test: `test -f logs/gate-decisions/research-like-job-hunting-approval.json || rg --fixed-strings "[TODO: APPROVE]" "recipes/case-research-like-job-hunting.md"`. Human capacity: [EI].

6. Evidence gate: Every final score must cite job-posting evidence for research-like work, software fit, entry-level feasibility, and visa/compliance risk when available. Test: `test -f data/verified/research-like-job-hunting/evidence-map.json && python3 -m json.tool data/verified/research-like-job-hunting/evidence-map.json`. Human capacity: [PF].

7. Report gate: Agent log and human report are written with the required fields and sections. Test: `test -f logs/research-like-job-hunting-[DATE].json && test -f reports/generated/research-like-job-hunting-[DATE].md`. Human capacity: [TO].

## Steps


1. Step name: Ingest declared inputs. Labor: AI with Human gate.  
   Script called: `scripts/ingest/research-like-job-hunting-ingest-inputs.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
   Input: job URL list, job posting text, company name, job title, student target role, and student visa context.  
   Output: records, source_name, source_type, fetched_at, sample_mode, rejects.  
   Where output goes: `data/raw/research-like-job-hunting/`



2. Step name: Run posting liveness check. Labor: AI with Human gate.  
   Script called: `scripts/jobops/research-like-job-hunting-check-liveness.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
   Input: job_url, company_name, ats_platform, and approval gate decision.  
   Output: job_url, live_status, checked_at, evidence_url, redirect_chain, error_state.  
   Where output goes: `data/verified/research-like-job-hunting/`


3. Step name: Evaluate software role fit. Labor: AI with Human gate.  
   Script called: `scripts/modes/research-like-job-hunting-evaluate-software-fit.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
   Input: job_title, job_description_text, O*NET / BLS role references, and software skill pattern rules.  
   Output: software_fit_score, role_family, matched_technical_skills, evidence_quotes, rejection_flags.  
   Where output goes: `data/verified/research-like-job-hunting/`

4. Step name: Evaluate entry-level feasibility. Labor: AI with Human gate.  
   Script called: `scripts/modes/research-like-job-hunting-evaluate-entry-level.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
   Input: job_title, job_description_text, required_years, education requirements, and entry-level feasibility rules.  
   Output: entry_level_score, required_years_detected, degree_requirement, seniority_flags, evidence_quotes.  
   Where output goes: `data/verified/research-like-job-hunting/`

5. Step name: Evaluate visa and compliance risk. Labor: AI with Human gate.  
   Script called: `scripts/modes/research-like-job-hunting-evaluate-visa-risk.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
   Input: job_description_text, visa_sponsorship_statement, student_visa_context, and visa risk rules.  
   Output: visa_risk_score, sponsorship_status, citizenship_flags, clearance_flags, OPT_CPT_H1B_flags, evidence_quotes.  
   Where output goes: `data/verified/research-like-job-hunting/`

6. Step name: Score and rank jobs. Labor: AI with Human gate.  
   Script called: `scripts/modes/research-like-job-hunting-score-rank.py` [TODO: DEV] Define input schema, output schema, scoring logic, threshold logic, and error handling for this script before implementation.  
   Input: liveness results, research-like signals, software fit score, entry-level score, visa risk score, and posting credibility evidence.  
   Output: total_score, score_breakdown, decision_label, priority_rank, hard_rejection_reason, uncertainty_notes.  
   Where output goes: `data/verified/research-like-job-hunting/`
7. Step name: Produce human report. Labor: AI with Human gate.  
    Script called: `scripts/tools/research-like-job-hunting-produce-human-report.py` [TODO: DEV] Define input schema, output schema, transformation logic, and error handling for this script before implementation.  
    Input: scored records, evidence map, gate decisions, stop conditions, and typed TODOs.  
    Output: summary, sources_checked, gate_results, findings, typed_todos, next_decision.  
    Where output goes: `reports/generated/`

## Output Contract

### Agent output

File: `logs/research-like-job-hunting-[DATE].json`

Fields: workflow, run_id, mode, steps_completed, records_seen, live_jobs_seen, dead_jobs_seen, rejects, duplicates, flags, stop_conditions, todo_items, source_files, gate_decisions, generated_at, raw_output_paths, verified_output_paths, report_path, score_version, pattern_library_version.

### Human report

File: `reports/generated/research-like-job-hunting-[DATE].md`

Reader: domain lead, instructor, or human reviewer responsible for accepting the `Research-Like Job Hunting Mode for AI-Era Software Roles` run.

Decision enabled: approve the run for the next phase, request source/schema fixes, request scoring-rule revision, manually verify uncertain jobs, or block live execution.

Sections: run summary, purpose, source inventory, inputs used, phase-gate results, steps completed, jobs seen, live jobs, dead jobs, rejected jobs, duplicate postings, research-like findings, software-fit findings, entry-level feasibility, visa and compliance risks, posting credibility, typed TODOs, human approvals, verified findings, inferred findings, decision recommendation.

### Ranked job output

File: `reports/generated/research-like-job-hunting-rankings-[DATE].csv`

Fields: rank, decision_label, total_score, job_title, company_name, job_url, live_status, research_like_score, software_fit_score, entry_level_score, visa_risk_score, posting_credibility_score, top_positive_signal, top_risk_signal, hard_rejection_reason, next_action.

## Scoring Contract

Total score: 100 points.

| Category | Weight | Description |
|---|---:|---|
| Research-like work | 30 | Measures whether the role includes exploration, prototyping, benchmarking, evaluation, ambiguous problem solving, technical writing, or discovery work. |
| Software role fit | 20 | Measures whether the role is genuinely a software / technical implementation role rather than a vague business, sales, support, or nontechnical role. |
| Entry-level feasibility | 20 | Measures whether the role is realistic for a student, new graduate, junior developer, or early-career applicant. |
| Visa and compliance feasibility | 15 | Measures whether the role avoids explicit blockers such as citizenship-only language, clearance requirements, or no-sponsorship statements. |
| Posting credibility | 15 | Measures whether the job is live, specific, traceable to the company, and not obviously fake or stale. |

Decision thresholds:

| Decision | Score Range | Meaning |
|---|---:|---|
| PRIORITIZE | 75-100 | Apply soon and customize the resume around research-like evidence. |
| POSSIBLE | 55-74 | Consider applying if the student has matching projects or can close a small gap quickly. |
| DEPRIORITIZE | 35-54 | Do not prioritize unless there is a referral, strong personal fit, or strategic reason. |
| REJECT | 0-34 | Reject because the role is unrealistic, nontechnical, stale, visa-infeasible, or unsupported by evidence. |

Hard rejection rules:

- Reject if the job requires U.S. citizenship or active security clearance and the student does not have it.
- Reject if the job requires a PhD and multiple publications for a formal research scientist role.
- Reject if the job is unpaid full-time work or asks the applicant to pay for training.
- Reject if the job link is dead and no company career page version can be verified.
- Reject if the role has no meaningful software development, technical implementation, prototyping, or engineering component.
- Reject if the posting is primarily sales, customer support, data entry, or generic training disguised as employment.

## Stop Conditions

- Stop if the job posting text is missing, because research-like and software-fit scoring would require guessing.
- Stop if the job URL is missing, because posting liveness and source traceability cannot be checked.
- Stop if the student profile is missing target role or visa context, because feasibility scoring would overstate certainty.
- Stop if live network calls are required but no approval record exists.
- Stop if a proposed script is needed for a score and the script does not exist, because that score must remain inferred or manual.
- Stop if the posting contains explicit U.S. citizen-only, green-card-only, clearance-only, or no-sponsorship language and the student is not eligible.
- Stop if local O*NET, BLS, ATS, or sponsorship evidence is missing and no [TODO: DATA SOURCE] fallback is documented.
- Stop if the job position doesn't allow use AI, because we are not searching for a real research position. Without AI, entry level software engineer has no chance to do discovery job, they have to put their attention into basic tasks.

## Snickerdoodle

### Run Commands

Full dialogic run:

`snickerdoodle run research-like-job-hunting --mode dialogic`

Sample mode, with no live network calls and no external writes:

`snickerdoodle run research-like-job-hunting --mode dialogic --sample`

Live mode, only after approval gate:

`snickerdoodle run research-like-job-hunting --mode dialogic --live --approval logs/gate-decisions/research-like-job-hunting-approval.json`

Batch ranking mode:

`snickerdoodle run research-like-job-hunting --mode dialogic --batch data/raw/research-like-job-hunting/job-postings.json --sample`

### Step Commands

| Step | CLI Command | Flags |
|---|---|---|

| Ingest declared inputs | `snickerdoodle run research-like-job-hunting --step ingest-inputs` | `--sample` |
| Run posting liveness check | `snickerdoodle run research-like-job-hunting --step check-liveness` | `--sample` `--no-write` |
| Evaluate entry-level feasibility | `snickerdoodle run research-like-job-hunting --step evaluate-entry-level` | `--sample` |
| Evaluate visa and compliance risk | `snickerdoodle run research-like-job-hunting --step evaluate-visa-risk` | `--sample` |
| Score and rank jobs | `snickerdoodle run research-like-job-hunting --step score-rank` | `--sample` |
| Produce human report | `snickerdoodle run research-like-job-hunting --step produce-human-report` | `--sample` `--no-write` |

### Gate Commands

| Gate | CLI Command |
|---|---|
| Gate 1 - Source gate | `snickerdoodle gate research-like-job-hunting --gate 1 --decision approve --note "Sources checked"` |
| Gate 2 - Scope gate | `snickerdoodle gate research-like-job-hunting --gate 2 --decision approve --note "Scope and mode approved"` |
| Gate 3 - Data-shape gate | `snickerdoodle gate research-like-job-hunting --gate 3 --decision approve --note "Outputs parse"` |
| Gate 4 - Script-readiness gate | `snickerdoodle gate research-like-job-hunting --gate 4 --decision approve --note "Scripts ready or TODO DEV accepted"` |
| Gate 5 - Approval gate | `snickerdoodle gate research-like-job-hunting --gate 5 --decision approve --note "Live or sensitive actions approved"` |
| Gate 6 - Evidence gate | `snickerdoodle gate research-like-job-hunting --gate 6 --decision approve --note "Evidence map supports scoring"` |
| Gate 7 - Report gate | `snickerdoodle gate research-like-job-hunting --gate 7 --decision approve --note "Report and log complete"` |

### Script Locations

| Step | Script Path | Layer |
|---|---|---|

| Ingest declared inputs | `scripts/ingest/research-like-job-hunting-ingest-inputs.py` | ingest |

| Run posting liveness check | `scripts/jobops/research-like-job-hunting-check-liveness.py` | jobops |

| Evaluate entry-level feasibility | `scripts/modes/research-like-job-hunting-evaluate-entry-level.py` | modes |
| Evaluate visa and compliance risk | `scripts/modes/research-like-job-hunting-evaluate-visa-risk.py` | modes |
| Score and rank jobs | `scripts/modes/research-like-job-hunting-score-rank.py` | modes |
| Produce human report | `scripts/tools/research-like-job-hunting-produce-human-report.py` | tools |

### Output Locations

| Output | Path | Format |
|---|---|---|
| Raw ingest | `data/raw/research-like-job-hunting/` | JSON |
| Verified data | `data/verified/research-like-job-hunting/` | JSON |
| Research-like evidence map | `data/verified/research-like-job-hunting/evidence-map.json` | JSON |
| Ranked jobs | `reports/generated/research-like-job-hunting-rankings-[DATE].csv` | CSV |
| Agent log | `logs/research-like-job-hunting-[DATE].json` | JSON |
| Human report | `reports/generated/research-like-job-hunting-[DATE].md` | Markdown |
| Gate decisions | `logs/gate-decisions/` | JSON |
| Pattern library | `data/modes/research-like-job-hunting/patterns.yml` | YAML |
| Entry-level rules | `data/modes/research-like-job-hunting/entry-level-rules.yml` | YAML |
| Visa risk rules | `data/modes/research-like-job-hunting/visa-risk-rules.yml` | YAML |


## Provenance

| Source | Verification command | Notes |
|---|---|---|
| `data/ats/applications.md` | `test -f "data/ats/applications.md"` | Referenced source/evidence path from prior recipe text. |
| `recipes/_shared.md` | `test -f "recipes/_shared.md"` | Referenced source/evidence path from prior recipe text. |


## Existing Recipe Notes Preserved For Implementation

### Known Evidence From Submission

- The student wants a mode for traditional software roles that contain research-like work.
- The mode is intended for CS / MSIS students adapting to the AI era.
- The key information asymmetry is that job titles may still say software developer, but the actual work may require independent investigation, prototyping, technical judgment, and AI-assisted project completion.
- The mode should separate research-like software roles from formal research scientist jobs that normally require a PhD, publications, or specialized senior credentials.
- The mode should help F-1 / OPT students avoid wasting time on roles with obvious visa, sponsorship, citizenship, or clearance blockers.

### Cannot Verify Without More Work

- Whether the employer actually allows AI-assisted development internally.
- Whether the team truly gives junior developers research-like autonomy.
- Whether the company will sponsor H-1B in the future.
- Whether a recruiter will interpret the student’s project background as sufficient for the role.
- Whether the job posting text accurately reflects daily work.
- Whether a vague innovation-oriented posting is genuine or merely inflated marketing language.

### Original Workflow Notes

- Verify the job URL is live before scoring.
- Extract evidence from the job description instead of relying only on title.
- Identify research-like signals such as prototype, evaluate, benchmark, investigate, explore, proof of concept, ambiguous requirements, technical discovery, and documentation.
- Confirm the role is still a software role by checking for coding, API, database, frontend, backend, cloud, testing, Git, CI/CD, Unreal, Unity, Python, Java, C#, JavaScript, or related technical implementation signals.
- Check whether the role is realistic for a student or new graduate.
- Flag roles requiring 5+ years, 8+ years, staff/principal level, PhD, active clearance, citizenship, or green card.
- Rank roles as PRIORITIZE, POSSIBLE, DEPRIORITIZE, or REJECT.
- Produce a human-readable explanation with evidence quotes and next action.

### Proposed Or Missing Tools

- `scripts/modes/research-like-job-hunting-extract-signals.py`
- `scripts/modes/research-like-job-hunting-evaluate-software-fit.py`
- `scripts/modes/research-like-job-hunting-evaluate-entry-level.py`
- `scripts/modes/research-like-job-hunting-evaluate-visa-risk.py`
- `scripts/modes/research-like-job-hunting-score-rank.py`
- `scripts/jobops/research-like-job-hunting-check-liveness.py`
- 
- `data/modes/research-like-job-hunting/entry-level-rules.yml`
- `data/modes/research-like-job-hunting/visa-risk-rules.yml`

## Log Template

### Agent Log Template

File: `logs/research-like-job-hunting-[DATE].json`

```json
{
  "workflow": "research-like-job-hunting",
  "run_id": "research-like-job-hunting-[DATE]-[RUN_ID]",
  "mode": "sample",
  "status": "draft",
  "generated_at": "[ISO-8601 timestamp]",
  "recipe_version": "0.1.0",
  "score_version": "0.1.0",
  "pattern_library_version": "0.1.0",
  "steps_completed": [
    "verify-provenance",
    "ingest-inputs",
    "validate-data-shape",
    "check-liveness",
    "extract-signals",
    "evaluate-software-fit",
    "evaluate-entry-level",
    "evaluate-visa-risk",
    "score-rank",
    "produce-human-report"
  ],
  "records_seen": 0,
  "live_jobs_seen": 0,
  "dead_jobs_seen": 0,
  "duplicates": 0,
  "rejects": [],
  "flags": [],
  "stop_conditions": [],
  "todo_items": [
    {
      "type": "TODO: DEV",
      "item": "Implement research-like signal extraction script.",
      "path": "scripts/modes/research-like-job-hunting-extract-signals.py"
    },
    {
      "type": "TODO: DATA SOURCE",
      "item": "Attach or generate ATS liveness evidence.",
      "path": "data/verified/research-like-job-hunting/ats-liveness.json"
    }
  ],
  "source_files": [
    "data/raw/research-like-job-hunting/run-envelope.json",
    "data/raw/research-like-job-hunting/job-postings.json",
    "data/modes/research-like-job-hunting/patterns.yml",
    "data/modes/research-like-job-hunting/entry-level-rules.yml",
    "data/modes/research-like-job-hunting/visa-risk-rules.yml"
  ],
  "gate_decisions": [
    {
      "gate": 1,
      "name": "Source gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 2,
      "name": "Scope gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 3,
      "name": "Data-shape gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 4,
      "name": "Script-readiness gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 5,
      "name": "Approval gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 6,
      "name": "Evidence gate",
      "decision": "pending",
      "note": null
    },
    {
      "gate": 7,
      "name": "Report gate",
      "decision": "pending",
      "note": null
    }
  ],
  "raw_output_paths": [
    "data/raw/research-like-job-hunting/"
  ],
  "verified_output_paths": [
    "data/verified/research-like-job-hunting/"
  ],
  "report_path": "reports/generated/research-like-job-hunting-[DATE].md",
  "ranking_path": "reports/generated/research-like-job-hunting-rankings-[DATE].csv"
}
##log entry
## 2026-07-06 — Research-Like Job Hunting Mode: first grounded run

- **Recipe:** `case-research-like-job-hunting.md`
- **Mode name:** Research-Like Job Hunting Mode for AI-Era Software Roles
- **Recipe version:** 0.1.0
- **Run type:** partial real execution
- **Goal:** Test the existing ATS workflow as the first grounded executable part of my proposed research-like job hunting mode.
- **Domain fit:** This mode is designed for CS / MSIS students looking for software roles that include research-like work such as prototyping, technical exploration, benchmarking, evaluation, documentation, and independent project ownership.

### Inputs

- `recipes/case-research-like-job-hunting.md`
- `data/ats/portals.example.yml`
- `data/ats/portals.yml`
- Existing npm scripts listed by `npm run`
- Existing ATS scanner: `scripts/ats/scan.mjs`
- Existing ATS liveness script: `scripts/ats/check-liveness.mjs`
- Real ATS portal configuration from the repo tutorial setup

### Prediction before running

I expected the repo to have executable scripts for ATS scanning and verification, but not a standalone command for directly running a Markdown recipe file. I expected the research-like job hunting mode to be only partially runnable because the repo already has job-source and ATS tools, but does not yet have a dedicated script for detecting research-like job language.

For the first scan, I expected:

- The scanner would read `data/ats/portals.yml`.
- The scanner would scan the enabled company or companies in that config.
- `--dry-run` would prevent writes to persistent output files.
- The output would show how many companies were scanned, how many jobs were found, and how many postings were filtered.
- The scan would verify job-source availability, but would not yet verify whether a job is truly research-like.

### Commands and actual output

#### 1. Listed available npm scripts

Command:

```powershell
npm run