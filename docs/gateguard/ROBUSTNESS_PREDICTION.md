# GateGuard Robustness Prediction

## Status

Registered before executing the robustness probe.

## Purpose

This investigation is separate from the already-confirmed Closed-Gate
Residual Score Defect.

It asks how the role scorer behaves when liveness or timeline inputs are
missing, malformed, or outside the ordinary 0-to-1 factor range.

## Cases to probe

1. missing liveness
2. missing timeline
3. null liveness factor
4. string liveness factor
5. negative liveness factor
6. liveness factor greater than 1
7. negative timeline factor
8. timeline factor greater than 1

## Prediction

Because the current scorer accepts only finite numeric factors and supplies
defaults for values that do not parse as numbers, missing/null/string inputs
may be treated differently from explicit numeric values.

Negative and greater-than-one numeric factors may also pass through the
multiplication logic unless an explicit validation rule exists.

## Evidence discipline

This is an exploratory robustness probe.

An observed behavior will not automatically be labeled a defect.

A behavior will be called a contract violation only if the repository
documents a contradictory requirement. Otherwise it will be reported as a
robustness limitation or unresolved design decision.

No runtime results are recorded in this prediction.
