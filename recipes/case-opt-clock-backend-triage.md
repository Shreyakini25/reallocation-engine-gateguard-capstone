---
status: RUNNABLE-SAMPLE
todos_open: 4
last_gate: P3-sample-run-2026-07-06
attestation: Adarsh Akhouri · 2026-07-06
recipe_version: 0.1.0
---

# case-opt-clock-backend-triage.md

## Purpose

Score backend SWE job applications by OPT unemployment day budget and visa timeline risk, not just fit.

Use this mode when you are an F-1 student with OPT starting within 90 days and need to prioritize which applications to submit first based on which companies can realistically make an offer before your unemployment ceiling is hit.

## Who This Is For

F-1 backend software engineer graduating August 2026, OPT starting September 2026, 90-day unemployment ceiling, STEM extension eligible. Targeting backend SWE roles (SOC 15-1252) at product-based companies. Requires H-1B sponsorship.

## Source Inventory

- data/80-days-to-stay/ — H-1B sponsorship history and SEC Form D funding signals
- data/BLS/compact/soc_occupation_compact.csv — SOC 15-1252 skill requirements
- scripts/score/role-scorer.mjs — Bayesian role scorer; run via npm run score
- scripts/ats/scan.mjs — ATS provider detection and liveness check
- data/examples/opt-clock-roles.json — sample roles input file for this mode

## Proposed Additions

[TODO] scripts/score/opt-clock-filter.mjs — pre-filter that removes roles where estimated_days_to_offer exceeds remaining unemployment budget before passing to scorer.

[TODO] data/examples/opt-clock-pipeline-times.json — estimated days-to-offer by company and ATS provider from Glassdoor and levels.fyi data.

[TODO] scripts/ats/response-time.mjs — ATS response time patterns to estimate days-to-first-response by provider.

## Phase Gates

Gate 1 — Sponsorship gate (hard stop): company must have verified H-1B sponsorship history in data/80-days-to-stay/. No sponsorship history means skip-regardless.

Gate 2 — Liveness gate (hard stop): posting must be live. Run npm run ats:liveness -- <job-url> to verify.

Gate 3 — Timeline gate (hard stop): estimated_days_to_offer must be less than remaining unemployment budget. [TODO] opt-clock-filter.mjs enforces this.

Gate 4 — Fit vote: after gates 1-3 clear, Bayesian scorer runs with sponsorship weight 0.35, fit weight 0.30.

## What It Can and Cannot Verify

Can verify:
- H-1B sponsorship history (80-days-to-stay dataset)
- Posting liveness (ats:liveness script)
- Composite score given the input evidence record (role-scorer.mjs)

Cannot verify:
- Actual days-to-offer — estimated_days_to_offer is a human judgment until opt-clock-pipeline-times.json exists
- Whether company will sponsor this specific SOC code
- STEM OPT extension approval

## Output Contract

Agent log: data/examples/role-scores.json
Human report: data/examples/role-scores.md

## Stop Conditions

Stop and do not score if:
- unemployment_days_used is not provided
- sponsorship_history field is missing for any role
- Posting URL returns non-200 or redirects to careers homepage

## Log Template
