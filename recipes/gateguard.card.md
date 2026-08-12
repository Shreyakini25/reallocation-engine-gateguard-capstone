---
status: RUNNABLE-SAMPLE
todos_open: 0
last_gate: "sample-run, 2026-08-11, logs/RUN_LOG.md#2026-08-11"
attestation: null
recipe_version: 0.1.0
---

# GateGuard — Human Maintainer Card

## Purpose

GateGuard is a regression-verification harness for the Reallocation Engine's
Bayesian Role Scorer.

Its specific job is to verify that liveness and timeline conditions classified
by the scorer as closed behave as hard stops.

A closed required gate must produce a final decision composite of exactly zero
and must not be rescued by stronger sponsorship, fit, or other non-gating
votes.

This card is written for a human maintainer.

The corresponding AI execution recipe is:

    recipes/gateguard.md

The recipe and this card must remain synchronized.

## What GateGuard Verifies

GateGuard can verify:

- local role-scorer behavior under controlled fictional inputs;
- exact-zero behavior for registered closed liveness gates;
- exact-zero behavior for registered closed timeline gates;
- behavior immediately below, at, and above the configured gate boundary;
- whether strong non-gating votes can rescue a closed gate;
- whether the previously identified hard-stop regression has returned;
- whether scorer arithmetic remains visible in the generated trace;
- whether the tested scorer can be tied to a Git commit and SHA-256 hash.

## What GateGuard Does Not Verify

GateGuard does not independently determine:

- whether a real job posting is currently live;
- whether a real candidate can legally start employment by a particular date;
- whether a candidate actually requires sponsorship;
- whether a company sponsors a particular immigration category;
- whether gate_zero = 0.05 is the correct business-policy threshold;
- whether the overall Bayesian weighting model is normatively correct;
- what policy should apply to missing, null, malformed, negative, or
  out-of-range gate factors.

A passing GateGuard run demonstrates software conformance to the registered
test contract.

It does not establish the truth of real-world gate inputs.

## Dependencies

### Contract and domain files

- recipes/_shared.md
- SNICKERDOODLE.md
- DOMAIN.md
- DATA_CONTRACT.md
- chapters/11-the-bayesian-role-scorer.md

### Production implementation

- scripts/score/role-scorer.mjs

### Verification implementation

- scripts/score/gateguard-harness.mjs

### Registered fixtures

- scripts/score/fixtures/gateguard-roles.json
- scripts/score/fixtures/gateguard-boundary.json

### Investigation evidence

- docs/gateguard/PREDICTION_LOCK.md
- docs/gateguard/FORENSIC_INSPECTION.md
- docs/gateguard/BASELINE_FINDING.md
- docs/gateguard/BOUNDARY_FINDING.md
- docs/gateguard/ROBUSTNESS_FINDING.md
- docs/gateguard/CORRECTED_FINDING.md
- docs/gateguard/MUTATION_FINDING.md
- docs/gateguard/PROGRESS_LOG.md

## How to Run

### 1. Confirm repository state

Run:

    git branch --show-current
    git status

Why:

This confirms which branch is under review and exposes unrelated working-tree
changes that could contaminate the verification run.

Expected contribution branch:

    contrib/shreya-gate-behavior-harness

Do not continue if unexpected changes are present.

### 2. Check executable syntax

Run:

    node --check scripts/score/role-scorer.mjs
    node --check scripts/score/gateguard-harness.mjs
    git diff --check

Why:

Syntax or malformed-diff failures are implementation problems and must be
resolved before behavioral evidence is interpreted.

### 3. Run the registered baseline suite

Run:

    node scripts/score/gateguard-harness.mjs --fixtures scripts/score/fixtures/gateguard-roles.json --label recipe-baseline

Review:

- healthy open-gate control;
- exact-zero closed gates;
- configured closed-gate boundary;
- weaker-vote closed-gate case;
- maximum-vote closed liveness case;
- maximum-vote closed timeline case;
- PASS, FAIL, and ERROR summary.

Do not substitute historical results for the current run.

### 4. Run the registered boundary suite

Run:

    node scripts/score/gateguard-harness.mjs --fixtures scripts/score/fixtures/gateguard-boundary.json --label recipe-boundary

Review both liveness and timeline at:

- exact zero;
- positive values inside the closed interval;
- immediately below the boundary;
- exactly at the boundary;
- immediately above the boundary;
- weak but open values;
- fully open controls.

The 0.0501 controls are important because they protect against an over-broad
fix that simply zeros every weak factor.

### 5. Inspect generated evidence

Run:

    cat reports/generated/gateguard-recipe-baseline.md
    cat reports/generated/gateguard-recipe-boundary.md

Review:

- scorer path;
- scorer SHA-256;
- Git commit;
- fixture path;
- machine-produced test summary;
- per-case composite;
- recommendation;
- arithmetic trace.

A closed-gate trace should preserve the raw multiplication while making the
final hard-stop transition explicit.

## What Success Looks Like

A successful current GateGuard verification run has:

- zero ERROR results;
- zero FAIL results;
- registered closed gates returning exact composite zero;
- open controls remaining positive;
- scorer provenance recorded;
- fixture provenance recorded;
- machine-readable JSON output;
- human-readable Markdown output;
- arithmetic traces available for review.

Success must come from the current execution.

Do not copy a historical PASS count into a new report and describe it as a
current result.

## Evidence Model

GateGuard deliberately separates different evidence classes.

Fixture sponsorship and fit values:
- fictional controlled input.

Fixture liveness and timeline factors:
- fictional controlled input.

Composite:
- role-scorer output.

Recommendation:
- role-scorer output.

Arithmetic trace:
- role-scorer output.

PASS, FAIL, and ERROR:
- GateGuard harness output.

Git commit:
- local repository evidence.

Scorer SHA-256:
- local file evidence.

Interpretation that behavior constitutes a defect:
- human judgment based on contract and execution evidence.

Policy for malformed gate values:
- unresolved maintainer or product decision unless explicitly documented.

## Historical Evidence

Preserved investigation evidence exists under:

    reports/gateguard/

This includes evidence from:

- the original defect;
- the boundary investigation;
- the corrected scorer;
- the deliberate mutation experiment.

Historical evidence is useful for comparison.

It must not be represented as evidence from the current checkout unless its Git
commit and scorer hash match the code being discussed.

## Named Failure Modes

### 1. Contract Violation — Closed Gate Retains Residual Composite

Symptom:

The scorer classifies a required gate as closed, or states that the gate zeroes
the composite, while the numerical composite remains greater than zero.

Why it matters:

The explanation and numerical decision state disagree.

Detection:

Registered GateGuard closed-gate assertions fail.

Recovery:

Preserve the failing audit before changing implementation code.

Do not edit the generated report to conceal the failure.

### 2. Drift — AI Recipe and Human Card Disagree

Symptom:

recipes/gateguard.md and recipes/gateguard.card.md disagree about commands,
fixtures, paths, stop conditions, expected outputs, or verification logic.

Why it matters:

The executing agent may perform a workflow different from the workflow the
human maintainer believes is being performed.

Detection:

Review both files whenever either file changes.

Recovery:

Update the recipe and card together in the same commit.

### 3. Fixture Drift — Registered Tests No Longer Match the Contract

Symptom:

The scorer contract or configured boundary changes but GateGuard fixtures still
encode an older expectation.

Why it matters:

A test failure may reflect stale test assumptions instead of a production
regression.

Detection:

Compare:

- role-scorer configuration;
- Chapter 11;
- fixture expectations;
- GateGuard recipe;
- human card.

Recovery:

Do not silently rewrite fixture expectations.

Document the contract change and then update the tests through an explicit,
reviewable commit.

### 4. Wrong-Target Execution

Symptom:

The harness executes a stale scorer, temporary copy, mutant, different branch,
or unexpected path while the reviewer believes production was tested.

Why it matters:

The audit can be internally correct while describing the wrong implementation.

Detection:

Inspect:

- scorer path;
- Git commit;
- scorer SHA-256.

Recovery:

Stop and rerun against the intended committed scorer.

### 5. Missing Evidence Fails Open

Symptom:

Missing, null, or non-numeric gate input is converted into an apparently open
gate.

Observed investigation behavior:

The robustness investigation found cases where unavailable or malformed gate
inputs defaulted to an open multiplier.

Why it matters:

Absence of evidence can become numerically similar to positive evidence.

Status:

Documented robustness risk.

GateGuard does not independently decide whether the correct policy is to fail
closed, reject validation, default open, or request human review.

### 6. Out-of-Range Gate Amplification

Symptom:

A gate factor greater than one increases the composite.

Why it matters:

A value intended to constrain a score may instead amplify it.

Status:

Documented robustness risk.

Whether the allowed gate domain must be restricted to the interval from zero
through one requires an explicit contract or maintainer decision.

### 7. Mutation Leakage

Symptom:

A deliberate break experiment modifies the committed production scorer instead
of an isolated temporary copy.

Why it matters:

The verification experiment itself can introduce a real production defect.

Prevention:

Use a temporary scorer outside the repository for deliberate mutation
experiments.

Verify the production scorer before and after the experiment.

### 8. Stale Generated Evidence

Symptom:

An old report is presented as though it came from the current scorer.

Why it matters:

The report's conclusion may no longer correspond to the current code.

Detection:

Compare the report's Git commit and scorer SHA-256 with the implementation
under review.

Recovery:

Regenerate evidence rather than manually editing an historical report.

## Stop Conditions

A human maintainer should stop the workflow when:

1. a required file is missing;
2. syntax validation fails;
3. the branch is unexpected;
4. unrelated working-tree changes are present;
5. the scorer path is not the intended target;
6. a registered closed gate has non-zero composite;
7. an expected open boundary control is hard-zeroed;
8. the harness reports ERROR;
9. evidence provenance cannot be established;
10. recipe/card drift is detected;
11. required values would need to be invented;
12. sensitive or private real-world data appears in committed fixtures;
13. human approval would need to be inferred rather than explicitly supplied.

Preserve evidence before investigating a failure.

Do not convert a failed run into a passing run by manually editing outputs.

## Human Review Checklist

Before accepting a GateGuard run:

- [ ] I confirmed the Git branch.
- [ ] I know which Git commit was tested.
- [ ] I confirmed the scorer path.
- [ ] I reviewed the scorer SHA-256 in the audit.
- [ ] I ran the baseline suite.
- [ ] I ran the boundary suite.
- [ ] I confirmed closed registered gates return exact zero.
- [ ] I confirmed above-boundary controls remain open.
- [ ] I confirmed no FAIL result was hidden.
- [ ] I confirmed no ERROR result was hidden.
- [ ] I confirmed numbers trace to scripts or controlled fixtures.
- [ ] I confirmed no private candidate data is used.
- [ ] I checked the AI recipe and human card for drift.
- [ ] I kept unresolved robustness behavior explicitly labeled.
- [ ] I personally reviewed the run rather than allowing the agent to self-attest.

## Logging

Meaningful verification runs should be recorded in:

    logs/RUN_LOG.md

The log should include:

- date;
- recipe name;
- exact commands;
- fixture names;
- generated outputs;
- observed machine result;
- Git commit;
- scorer SHA-256;
- unresolved issues;
- human-review status.

Do not invent the human-review status.

## Maintenance Rule

Whenever any of the following changes:

- GateGuard command;
- fixture;
- scorer interface;
- gate boundary;
- output path;
- assertion;
- stop condition;
- evidence requirement;

review both:

    recipes/gateguard.md
    recipes/gateguard.card.md

Update them together when required.

The human card is not proof that a run passed.

The current machine-generated audit is the run evidence.
