# GateGuard Robustness Probe Finding

## Status

Exploratory robustness probe completed against the unmodified role scorer.

This investigation is separate from the confirmed Closed-Gate Residual Score
Defect.

## Cases executed

Eight controlled fictional cases were used:

1. missing liveness;
2. missing timeline;
3. null liveness factor;
4. string liveness factor;
5. negative liveness factor;
6. liveness factor greater than 1;
7. negative timeline factor;
8. timeline factor greater than 1.

## Observations

### Missing liveness

Observed:

- liveness became `1`
- composite: `0.585`
- recommendation: `Apply`

The scorer therefore treated an absent liveness value as a fully open gate.

### Missing timeline

Observed:

- timeline became `1`
- composite: `0.585`
- recommendation: `Apply`

The scorer therefore treated an absent timeline value as a fully open gate.

### Null liveness

Observed:

- null was replaced with `1`
- composite: `0.585`
- recommendation: `Apply`

### String liveness

Input:

`"0.01"`

Observed:

- the non-numeric value was replaced with `1`
- composite: `0.585`
- recommendation: `Apply`

The scorer did not coerce the string to `0.01` and did not reject it.

### Negative liveness

Input:

`-0.25`

Observed:

- composite: `-0.1462`
- recommendation: `Skip`
- reason identified liveness as a closed gate and stated that a closed gate
  zeroes the composite

The returned composite was not zero.

### Liveness greater than one

Input:

`1.25`

Observed:

- composite: `0.7312`
- recommendation: `Apply`

The factor increased the role score above the fully-open-gate control.

### Negative timeline

Input:

`-0.25`

Observed:

- composite: `-0.1462`
- recommendation: `Skip`
- reason identified timeline as a closed gate and stated that a closed gate
  zeroes the composite

The returned composite was not zero.

### Timeline greater than one

Input:

`1.25`

Observed:

- composite: `0.7312`
- recommendation: `Apply`

The factor increased the role score above the fully-open-gate control.

## Classification

### Confirmed output inconsistency

Negative gate values reproduce the same semantic inconsistency already found
in the hard-stop investigation: the scorer describes the role as closed-gated
and says the gate zeroes the composite, but returns a non-zero value.

### Fail-open robustness risks

Missing, null, and non-numeric gate values are replaced with `1`.

This means unavailable or malformed evidence can be interpreted as a fully
healthy gate.

This document labels that behavior a robustness risk rather than a confirmed
contract violation unless a repository requirement explicitly states how
missing gate evidence must be handled.

### Range-validation risks

Numeric factors greater than `1` are accepted and increase the composite.

This probe establishes that the scorer does not enforce an upper bound at this
input boundary.

Whether values greater than `1` violate the domain contract requires separate
contract evidence and is therefore not asserted here.

## Evidence boundary

All roles and values are fictional controlled inputs.

The observed composites, recommendations, traces, and reasons came directly
from the unmodified role scorer.

No real candidate, employer, posting, immigration record, or private data was
used.

## Design question surfaced

The scorer currently answers malformed or missing gate evidence by silently
continuing.

A maintainer should explicitly choose whether such cases should:

- fail closed;
- fail validation;
- remain unknown and require human review; or
- default to an open gate.

GateGuard does not make that policy decision on behalf of the maintainer.
