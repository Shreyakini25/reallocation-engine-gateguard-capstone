# Worked Run — opt-clock-backend-triage

## Inputs

Profile: F-1 OPT start 2026-09-01, unemployment_days_used 0, buffer_target 80, requires_sponsorship true
Input file: data/examples/opt-clock-roles.json (5 backend SWE roles: Stripe, Airbnb, AnonymousStartup, Meta, Rippling)

## Commands Run

npm run score data/examples/opt-clock-roles.json
npm run score data/examples/opt-clock-roles.json -- --profile data/examples/opt-clock-profile.json
REALLOCATION_ENGINE_PORTALS=data/ats/portals.example.yml npm run ats:scan -- --dry-run

## Real Terminal Output

scored 5 roles → Apply 2 · Consider 3 · Skip 0 (skip 0%)

| Role | Composite | Rec |
|----|----|----|
| Stripe — Backend Software Engineer | 0.521 | Apply |
| Airbnb — Software Engineer Backend | 0.378 | Apply |
| Rippling — Software Engineer Backend | 0.452 | Consider |
| Meta — Software Engineer Backend Infrastructure | 0.271 | Consider |
| AnonymousStartup — Backend Engineer | 0.251 | Consider |

Second run with profile file (requires_sponsorship: true): same result — Apply 2 · Consider 3 · Skip 0.

## ATS Scan Run (dry run)

Command: REALLOCATION_ENGINE_PORTALS=data/ats/portals.example.yml npm run ats:scan -- --dry-run

Output: Companies scanned 1, Total jobs found 789, Filtered by title 347, Filtered by location 389, New offers added 52 (Databricks postings). Confirms ATS scan script runs against real data. In the full mode workflow this would be run against each company in opt-clock-roles.json to verify liveness before scoring.

## Verified vs Inferred

Verified by scripts:
- All sponsorship scores sourced from record (80-days-to-stay dataset)
- AnonymousStartup sponsorship p=0.0 sourced from record
- Composite scores and recommendations produced by role-scorer.mjs
- Liveness factor 1.0 marked as record but not independently verified via ats:liveness in this run

Inferred/human judgment:
- All fit scores (0.82, 0.75, 0.88, 0.70, 0.78) sourced as model-judgment
- All timeline factors sourced as your-input — estimated_days_to_offer is a human judgment

## Reflection

What went well: scorer ran cleanly, audit trace fully sourced, every term traces to record/model-judgment/your-input.

What the mode got wrong: AnonymousStartup scored Consider (0.251) instead of Skip. Reading the scorer source (scripts/score/role-scorer.mjs), sponsorship is implemented as a weighted vote, not a hard gate. A role with sponsorship p=0.0 gets a low composite score but is never hard-skipped. The mode's Gate 1 (sponsorship hard stop) does not exist in the current scorer — it is a proposed pre-filter that needs opt-clock-filter.mjs to implement.

What the mode missed: The timeline gate also does not exist in the scorer. Meta's timeline factor of 0.5 reduces its score to Consider but does not enforce a hard stop based on days_remaining. Both Gate 1 and Gate 3 from the mode spec are proposed additions, not currently implemented.

What the skip rate means: Skip 0 (0%) is not a failure of the run — it reflects that all roles have liveness=1.0 and composite scores above 0.2. The scorer only produces Skip when composite < 0.2, which requires either a dead posting (liveness=0) or very low sponsorship + fit combination. The 0% skip rate is an honest finding that the current scorer is too permissive for an OPT-constrained job seeker.

Next steps: Build opt-clock-filter.mjs to enforce hard sponsorship and timeline gates before the scorer runs. Verify liveness for all 5 roles via ats:liveness. Source fit scores from BLS SOC 15-1252 skill alignment rather than model-judgment.

## Attestation

Recipe: case-opt-clock-backend-triage.md v0.1.0
By: Adarsh Akhouri · 2026-07-06

### Tested
| Ran | Saw | Expected |
|---|---|---|
| npm run score data/examples/opt-clock-roles.json | Apply 2 · Consider 3 · Skip 0 | Apply 2+ with Stripe highest |
| npm run score with --profile opt-clock-profile.json | Same result — Apply 2 · Consider 3 · Skip 0 | AnonymousStartup to Skip |
| Removed sponsorship field from one role | Consider 0.251 — no error thrown | Error or Skip |

### Did not test
- ats:liveness for each posting URL — network fetch not verified in this run
- opt-clock-filter.mjs timeline and sponsorship hard gates — script does not yet exist

### Broke during testing
- First roles.json used wrong format (flat fields) — reformatted to match ch11-roles.json nested schema
- Passing profile file with requires_sponsorship: true did not change AnonymousStartup from Consider to Skip — discovered scorer implements sponsorship as weighted vote, not hard gate
