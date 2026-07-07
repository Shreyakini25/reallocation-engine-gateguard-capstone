# Worked Run — opt-clock-backend-triage

## Inputs

Profile: F-1 OPT start 2026-09-01, unemployment_days_used 0, buffer_target 80, requires_sponsorship true
Input file: data/examples/opt-clock-roles.json (5 backend SWE roles: Stripe, Airbnb, AnonymousStartup, Meta, Rippling)

## Commands Run

npm run score data/examples/opt-clock-roles.json

## Real Terminal Output

scored 5 roles → Apply 2 · Consider 3 · Skip 0 (skip 0%)

| Role | Composite | Rec |
|----|----|----|
| Stripe — Backend Software Engineer | 0.521 | Apply |
| Airbnb — Software Engineer Backend | 0.378 | Apply |
| Rippling — Software Engineer Backend | 0.452 | Consider |
| Meta — Software Engineer Backend Infrastructure | 0.271 | Consider |
| AnonymousStartup — Backend Engineer | 0.251 | Consider |

## Verified vs Inferred

Verified: sponsorship scores from record, composite scores from role-scorer.mjs
Inferred: all fit scores are model-judgment, all timeline factors are your-input

## Reflection

What went well: scorer ran cleanly, audit trace fully sourced.
What the mode got wrong: AnonymousStartup scored Consider instead of Skip — sponsorship hard gate only fires with explicit profile file.
What the mode missed: timeline gate does not exist yet as a script — Meta 75-day pipeline would exceed buffer but scorer cannot enforce this.
Next steps: build opt-clock-filter.mjs, verify liveness via ats:liveness, source fit scores from BLS SOC data.

## Attestation

Recipe: case-opt-clock-backend-triage.md v0.1.0
By: Adarsh Akhouri · 2026-07-06

Tested: npm run score ran cleanly, output matches role-scores.json
Did not test: ats:liveness, opt-clock-filter.mjs does not exist yet
Broke during testing: first roles.json used wrong format, reformatted to match ch11-roles.json schema
