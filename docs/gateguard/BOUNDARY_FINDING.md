# GateGuard Boundary Sweep Finding

## Status

CONFIRMED.

The expanded boundary sweep was executed against the unmodified
Reallocation Engine role scorer.

## Question

Does the configured closed-gate interval behave consistently as a hard stop?

The scorer defines a liveness or timeline factor at or below `0.05` as a
closed gate.

## Test range

Both liveness and timeline were tested independently at:

- 0
- 0.0001
- 0.01
- 0.0499
- 0.05
- 0.0501
- 0.10
- 1.0

All other controlled vote inputs were held constant.

## Result

GateGuard executed 16 registered boundary cases.

Observed:

- PASS: 8
- FAIL: 8
- ERROR: 0
- TOTAL: 16

## Observed behavior

For both liveness and timeline:

### Exact zero

`factor = 0`

Observed composite: `0`

The hard-stop behavior works.

### Positive factor inside the closed-gate interval

For every tested value where:

`0 < factor <= 0.05`

the scorer classified the gate as closed but returned a positive composite.

Examples:

- factor `0.0001` -> composite `0.0001`
- factor `0.01` -> composite `0.0059`
- factor `0.0499` -> composite `0.0292`
- factor `0.05` -> composite `0.0292`

These cases failed the registered hard-stop assertion.

### Immediately above the boundary

`factor = 0.0501`

Observed composite: `0.0293`

The case was not classified as a closed gate.

Result: PASS.

### Fully open controls

Factors `0.10` and `1.0` remained positive and were not classified as
closed gates.

Result: PASS.

## Finding

The defect is not limited to the exact `0.05` boundary.

The observed inconsistency exists throughout the tested positive closed-gate
interval:

`0 < factor <= 0.05`

Within that interval, the scorer uses two conflicting semantics:

1. classification semantics: the gate is closed and the role is gated;
2. numeric semantics: the closed gate remains a positive multiplier.

This leaves a residual composite score for a role that the implementation
simultaneously describes as hard-gated.

## Suggested name

Closed-Gate Residual Score Defect

## Scope limitation

This experiment does not claim that every weak gate should be zero.

The finding applies only to factors that the current implementation itself
classifies as closed.

The `0.0501` control demonstrates that GateGuard distinguishes a closed gate
from a weak but still open gate.

## Evidence boundary

All role and factor values are fictional controlled fixtures.

Composite values and recommendations come from the unmodified role scorer.

PASS/FAIL results come from deterministic assertions in the committed
GateGuard harness.
