# GateGuard Mutation-Test Finding

## Status

MUTANT KILLED.

A deliberate regression was created in a temporary copy of the corrected role
scorer. The production scorer was not modified for this experiment.

## Mutation

Correct production behavior:

`const composite = closedGate ? 0 : multipliedComposite;`

Temporary mutant behavior:

`const composite = multipliedComposite;`

The mutation therefore bypassed the closed-gate hard stop and restored the
previous residual-score behavior.

The mutant existed only at:

`/tmp/gateguard-mutant.mjs`

## Production protection

Before executing the mutant, the production scorer was checked separately and
still contained the corrected hard-stop logic.

The temporary mutant contained the deliberately broken logic.

## Mutation baseline result

The original 10-case GateGuard suite was executed against the mutant.

Observed:

- PASS: 5
- FAIL: 5
- ERROR: 0
- TOTAL: 10
- process exit code: 1

The same closed-gate cases that exposed the original defect failed again.

## Mutation boundary result

The 16-case boundary suite was executed against the mutant.

Observed:

- PASS: 8
- FAIL: 8
- ERROR: 0
- TOTAL: 16
- process exit code: 1

Positive factors inside the configured closed-gate interval again retained
residual composite values.

Open-gate controls immediately above the threshold remained positive.

## Mutation result

One deliberate hard-stop mutant was introduced.

GateGuard detected that mutant in both registered verification suites.

Mutation result:

`1 / 1 targeted mutant killed`

This is a narrow targeted mutation result. It is not a claim of comprehensive
mutation coverage for the entire Reallocation Engine.

## Before / Fix / Mutation evidence

Original production:

- baseline: 5 PASS / 5 FAIL
- boundary: 8 PASS / 8 FAIL

Corrected production:

- baseline: 10 PASS / 0 FAIL
- boundary: 16 PASS / 0 FAIL

Deliberately mutated corrected scorer:

- baseline: 5 PASS / 5 FAIL
- boundary: 8 PASS / 8 FAIL

The harness therefore fails on the target defect, passes after the correction,
and fails again when the target defect is deliberately reintroduced.

## Evidence boundary

All test fixtures are fictional controlled inputs.

PASS/FAIL results were produced by the committed GateGuard harness.

The mutant was created only for this deliberate break attempt.

No real candidate, employer, job posting, immigration record, or private
personal data was used.
