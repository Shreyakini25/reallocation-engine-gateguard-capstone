---
status: RUNNABLE-SAMPLE
todos_open: 0
last_gate: "sample-run, 2026-08-11, logs/RUN_LOG.md#2026-08-11"
attestation: null
recipe_version: 0.1.0
---

# GateGuard — Hard-Stop Verification Harness

## 1. Executive Summary

GateGuard verifies that the Reallocation Engine's liveness and visa-timeline
gates behave as hard stops in the Bayesian Role Scorer.

When the scorer itself classifies a required gate as closed, GateGuard requires
the final decision composite to be exactly zero regardless of sponsorship,
fit, or other non-gating vote strength.

GateGuard operates on committed fictional fixtures.

It verifies software conformance. It does not independently determine whether
a real job is live or whether a real candidate's immigration timeline is
legally feasible.

## 2. Required Reads

Before executing GateGuard, read these repository artifacts:

1. recipes/_shared.md
2. SNICKERDOODLE.md
3. DOMAIN.md
4. DATA_CONTRACT.md
5. chapters/11-the-bayesian-role-scorer.md
6. scripts/score/role-scorer.mjs
7. scripts/score/gateguard-harness.mjs
8. scripts/score/fixtures/gateguard-roles.json
9. scripts/score/fixtures/gateguard-boundary.json
10. docs/gateguard/PREDICTION_LOCK.md
11. docs/gateguard/FORENSIC_INSPECTION.md

Do not infer the gate contract from memory.

The repository artifacts above define the intended behavior for the run.

## 3. Phase Gates

Do not advance when a gate fails.

### Gate 1 — Repository state

Run:

    git branch --show-current
    git status --short

Pass only when the intended contribution branch is active and there are no
unexpected working-tree modifications.

### Gate 2 — Stored-tool readiness

Run:

    test -f scripts/score/role-scorer.mjs
    test -f scripts/score/gateguard-harness.mjs
    test -f scripts/score/fixtures/gateguard-roles.json
    test -f scripts/score/fixtures/gateguard-boundary.json
    node --check scripts/score/role-scorer.mjs
    node --check scripts/score/gateguard-harness.mjs

Pass only if every required artifact exists and both JavaScript files pass
syntax validation.

### Gate 3 — Baseline verification

Run:

    node scripts/score/gateguard-harness.mjs --fixtures scripts/score/fixtures/gateguard-roles.json --label recipe-baseline

Pass only when:

- every registered case reports PASS;
- FAIL count is zero;
- ERROR count is zero;
- healthy controls remain positive;
- closed registered gates return composite exactly zero.

### Gate 4 — Boundary verification

Run:

    node scripts/score/gateguard-harness.mjs --fixtures scripts/score/fixtures/gateguard-boundary.json --label recipe-boundary

Pass only when:

- every registered boundary case reports PASS;
- FAIL count is zero;
- ERROR count is zero;
- closed-gate values are hard-stopped;
- the 0.0501 controls remain positive and open.

### Gate 5 — Evidence inspection

Inspect:

    cat reports/generated/gateguard-recipe-baseline.md
    cat reports/generated/gateguard-recipe-boundary.md

Confirm that the reports preserve:

- fixture provenance;
- scorer-produced composites;
- harness-produced PASS/FAIL;
- trace arithmetic;
- scorer hash;
- Git commit.

### Gate 6 — Human adequacy

A named human reviews the outputs and decides whether the evidence is adequate.

The agent must not self-attest human adequacy.

## 4. Primary Stored Tools

Primary maintained executable artifacts:

- scripts/score/role-scorer.mjs
- scripts/score/gateguard-harness.mjs

Registered controlled fixtures:

- scripts/score/fixtures/gateguard-roles.json
- scripts/score/fixtures/gateguard-boundary.json

GateGuard requires no live network request.

GateGuard has no stored tool for determining whether fictional test values
describe real employers, postings, candidates, or immigration situations.
Those questions are outside this harness's scope.

Do not substitute LLM-generated facts for missing real-world evidence.

## 5. Workflow

### A. Confirm repository state

Execute Gate 1.

Stop on unexpected changes.

### B. Confirm executable readiness

Execute Gate 2.

Do not modify production code during a verification run.

### C. Execute registered baseline

Execute Gate 3.

Preserve any failure exactly as produced.

Do not edit a failing report to make it pass.

### D. Execute registered boundary suite

Execute Gate 4.

Distinguish closed gates from weak-but-open gates.

The 0.0501 controls must not be silently hard-zeroed.

### E. Inspect evidence

Execute Gate 5.

For representative closed-gate cases verify:

1. the scorer identifies the gate as closed;
2. the final composite is exactly zero;
3. the trace preserves the raw multiplication;
4. strong non-gating votes cannot rescue the gate.

### F. Human review

Present generated evidence to the human reviewer.

Do not claim VERIFIED lifecycle status until required human review is recorded.

## 6. Output Contract

Machine-readable outputs:

- reports/generated/gateguard-recipe-baseline.json
- reports/generated/gateguard-recipe-boundary.json

They must include:

- GateGuard run label;
- generated timestamp;
- Git commit;
- scorer path;
- scorer SHA-256;
- fixture path;
- fixture count;
- PASS count;
- FAIL count;
- ERROR count;
- per-case assertions;
- scorer traces.

Human-readable outputs:

- reports/generated/gateguard-recipe-baseline.md
- reports/generated/gateguard-recipe-boundary.md

Reports must distinguish:

- fictional controlled input;
- scorer output;
- GateGuard assertion output;
- human interpretation.

Generated reports must not be edited and represented as raw machine evidence.

## 7. Verification Checks

Before accepting a run, execute:

    node --check scripts/score/role-scorer.mjs
    node --check scripts/score/gateguard-harness.mjs
    git diff --check

Inspect both generated JSON summaries.

A valid current verification run requires:

- zero ERROR results;
- zero FAIL results;
- traceable fixture and scorer paths;
- scorer hash recorded;
- current Git commit recorded.

Also confirm that a temporary mutation or stale scorer copy was not
accidentally tested instead of the intended production scorer.

## 8. Logging Rules

Meaningful GateGuard runs must be recorded in:

    logs/RUN_LOG.md

Record:

- date;
- recipe name;
- exact inputs;
- commands executed;
- generated outputs;
- machine-produced result;
- Git commit;
- scorer hash;
- human-review status;
- open issues.

Never invent:

- a PASS or FAIL count;
- mutation result;
- scorer hash;
- timestamp;
- human approval.

Never commit:

- secrets;
- private application notes;
- personal contact information;
- private immigration documents.

## 9. Stop Conditions

Stop immediately when any of these conditions occurs:

1. A required repository artifact is missing.
2. The scorer or harness fails syntax checking.
3. Unexpected working-tree changes are present.
4. The wrong scorer or branch appears to be under test.
5. A registered closed gate returns a non-zero composite.
6. A registered open boundary control is incorrectly hard-zeroed.
7. GateGuard reports ERROR.
8. Generated evidence cannot be traced to its fixtures and scorer.
9. A required number would have to be invented.
10. The AI recipe and human card disagree.
11. Human adequacy would have to be inferred rather than supplied by a human.
12. Private or sensitive real-world data appears in the fixtures or reports.

When stopped, preserve the evidence and document the blocker.

Do not silently repair evidence and continue.

GateGuard verifies software behavior under controlled conditions.

It does not independently verify real posting liveness, legal immigration
eligibility, sponsorship truth, or whether gate_zero = 0.05 is the correct
product-policy threshold.
