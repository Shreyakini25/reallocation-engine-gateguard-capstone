# GateGuard Baseline Finding

## Status

CONFIRMED under the registered controlled fixtures.

The unmodified Reallocation Engine scorer was executed after the prediction
lock, forensic inspection, fixtures, and verification harness had already
been committed.

No corrective change to `scripts/score/role-scorer.mjs` had been made before
this run.

## Registered question

Does every gate that the scorer itself classifies as closed behave as a true
hard stop by returning an exact zero composite?

## Baseline result

GateGuard executed 10 registered fictional test cases.

Observed result:

- PASS: 5
- FAIL: 5
- ERROR: 0
- TOTAL: 10

## Passing controls

### GG-001 — Healthy control

Both gates were open.

Observed composite: `0.585`

Result: PASS.

### GG-002 — Liveness exactly zero

Observed composite: `0`

Result: PASS.

### GG-003 — Timeline exactly zero

Observed composite: `0`

Result: PASS.

### GG-004 — Both gates exactly zero

Observed composite: `0`

Result: PASS.

### GG-007 — Immediately above the closed-gate boundary

Liveness was `0.0501`, immediately above the configured `gate_zero` value of
`0.05`.

Observed composite: `0.0293`.

The case was not classified as a closed gate.

Result: PASS.

## Failing closed-gate cases

### GG-005 — Liveness at the closed-gate boundary

Liveness: `0.05`

Observed composite: `0.0292`

Expected composite under the registered hard-stop contract: `0`

Result: FAIL.

### GG-006 — Timeline at the closed-gate boundary

Timeline: `0.05`

Observed composite: `0.0292`

Expected: `0`

Result: FAIL.

### GG-008 — Closed liveness gate with weaker votes

Liveness: `0.05`

Observed composite: `0.0065`

Expected: `0`

Result: FAIL.

### GG-009 — Closed liveness gate with maximum votes

Liveness: `0.05`

Observed composite: `0.0325`

Expected: `0`

Result: FAIL.

### GG-010 — Closed timeline gate with maximum votes

Timeline: `0.05`

Observed composite: `0.0325`

Expected: `0`

Result: FAIL.

## Interpretation

The baseline confirms a contract/implementation disagreement for nonzero gate
factors that fall inside the scorer's configured closed-gate range.

The scorer defines a gate factor at or below `0.05` as closed and returns a
machine recommendation of `Skip`.

However, when the closed gate factor is greater than zero, the numerical
composite retains the multiplication result instead of being replaced by
zero.

Therefore the implementation currently has two different semantics for the
same gate:

1. classification semantics: the gate is closed and the role is gated;
2. numeric semantics: the closed gate remains a small multiplier.

This produces a state in which the explanation can say that a closed gate
zeroes the composite while the returned composite is greater than zero.

## Important scope limitation

This finding does NOT establish that every low liveness or timeline value
should be zero in general.

The finding is narrower:

A factor that the implementation itself classifies as a CLOSED gate should
behave consistently with the implementation's own hard-stop explanation.

The boundary control at `0.0501` is intentionally included to distinguish a
closed gate from a merely weak but still open multiplier.

## Evidence boundary

All candidate, company, role, sponsorship, fit, liveness, and timeline values
used by GateGuard are fictional controlled fixtures.

The composite values and machine recommendations listed above came from the
unmodified scorer's generated output.

PASS/FAIL values came from deterministic assertions in the committed
GateGuard harness.

No claim is made that these fictional values represent a real candidate,
employer, job posting, or visa situation.
