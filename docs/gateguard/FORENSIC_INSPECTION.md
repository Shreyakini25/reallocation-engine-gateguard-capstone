# GateGuard Forensic Inspection

## Status

Read-only inspection completed before executing the GateGuard test harness and
before modifying the role scorer.

## Files inspected

- `scripts/score/role-scorer.mjs`
- `chapters/11-the-bayesian-role-scorer.md`
- `DOMAIN.md`
- `SNICKERDOODLE.md`

## Documented contract

The repository describes liveness and timeline as gates rather than weighted
votes.

The scorer's own comments state that a ghost posting or impossible start date
zeroes the composite regardless of the strength of the weighted votes.

Chapter 11 likewise describes liveness and timeline as multiplicative gates
that cannot be rescued by sponsorship or fit when closed.

## Implementation observation

The scorer currently:

1. reads liveness and timeline factors;
2. multiplies them into `gateProduct`;
3. calculates:

   `composite = voteSum * gateProduct`

4. defines a gate as closed when its factor is at or below `gate_zero`;
5. sets `gate_zero` to `0.05`;
6. changes the machine recommendation to `Skip` when a closed gate is found;
7. emits a reason stating that the closed gate zeroes the composite.

However, the closed-gate classification branch does not visibly overwrite the
already-calculated composite with zero before that value is returned.

## Suspected inconsistency

For a positive vote sum and a gate factor greater than zero but at or below
the configured closed-gate threshold, the arithmetic appears capable of
producing:

- machine recommendation: `Skip`
- gate state: closed
- explanation: closed gate zeroes the composite
- composite: greater than zero

This is a static-code observation, not yet a confirmed runtime result.

## Registered runtime checks

The harness will test at minimum:

1. healthy gates as a control;
2. liveness factor `0`;
3. timeline factor `0`;
4. both gates `0`;
5. liveness exactly at the configured closed-gate boundary `0.05`;
6. timeline exactly at `0.05`;
7. a factor immediately above the boundary;
8. strong sponsorship/fit with a closed liveness gate;
9. strong sponsorship/fit with a closed timeline gate;
10. independence from non-gating vote strength.

## Confirmation condition

The suspected defect is confirmed only if the unmodified scorer actually
returns a non-zero composite for a condition that it simultaneously classifies
as a closed gate that should zero the composite.

## Falsification condition

If the unmodified scorer returns an exact zero composite for every registered
closed-gate case, the suspected defect is falsified.

## Evidence discipline

No runtime PASS/FAIL result is recorded in this document.

The original scorer will be executed unchanged first. Any corrective change
will occur only after the baseline result has been captured.
