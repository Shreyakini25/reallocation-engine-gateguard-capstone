# GateGuard Honest Run — 2026-08-12

## Purpose

This run tests whether GateGuard can distinguish a scorer that correctly enforces
hard-stop role gates from one in which the hard-stop behavior has been deliberately
disabled.

The run uses only fictional controlled fixtures. No real candidate, employer,
job-posting, immigration, sponsorship, or private personal data is used.

## Repository state

The run began from the contribution branch:

`contrib/shreya-gate-behavior-harness`

The production scorer contained the hard-stop implementation:

`const composite = closedGate ? 0 : multipliedComposite;`

The deliberate regression was created only in a temporary file under `/tmp`.
The committed production scorer was not modified.

## Plausibility audit

Before trusting the aggregate PASS counts, representative gate behavior was checked.

Observed production behavior:

- healthy open-gate control: composite `0.585`;
- exact-zero liveness gate: composite `0`;
- exact-zero timeline gate: composite `0`;
- configured closed-gate boundary `0.05`: composite `0`;
- immediately above the boundary `0.0501`: composite `0.0293`;
- maximum vote values did not rescue a scorer-classified closed gate.

These observations are consistent with the declared GateGuard contract:
a closed liveness or timeline gate is a hard stop, while a gate immediately above
the configured boundary remains open.

## Production run

### Baseline suite

Command used the committed GateGuard harness with:

`scripts/score/fixtures/gateguard-roles.json`

Observed result:

- PASS: 10
- FAIL: 0
- ERROR: 0
- TOTAL: 10
- process exit code: 0

Terminal evidence:

`reports/gateguard/honest-run/production-baseline-terminal.txt`

Machine-readable audit:

`reports/gateguard/honest-run/production-baseline.json`

Human-readable report:

`reports/gateguard/honest-run/production-baseline.md`

### Boundary suite

Command used:

`scripts/score/fixtures/gateguard-boundary.json`

Observed result:

- PASS: 16
- FAIL: 0
- ERROR: 0
- TOTAL: 16
- process exit code: 0

Terminal evidence:

`reports/gateguard/honest-run/production-boundary-terminal.txt`

Machine-readable audit:

`reports/gateguard/honest-run/production-boundary.json`

Human-readable report:

`reports/gateguard/honest-run/production-boundary.md`

## Deliberate break attempt

A temporary copy of the production scorer was created at:

`/tmp/gateguard-honest-mutant.mjs`

Only the temporary copy was changed from:

`const composite = closedGate ? 0 : multipliedComposite;`

to:

`const composite = multipliedComposite; // MUTATION: hard-stop disabled`

This deliberately removes the final hard-stop enforcement while leaving the
production source unchanged.

### Mutant baseline result

Observed result:

- PASS: 5
- FAIL: 5
- ERROR: 0
- TOTAL: 10
- process exit code: 1

Failures included:

- closed liveness at the configured boundary retaining residual composite;
- closed timeline at the configured boundary retaining residual composite;
- weaker-vote closed-gate case retaining residual composite;
- maximum votes appearing able to leave residual score behind a closed liveness gate;
- maximum votes appearing able to leave residual score behind a closed timeline gate.

Terminal evidence:

`reports/gateguard/honest-run/mutant-baseline-terminal.txt`

### Mutant boundary result

Observed result:

- PASS: 8
- FAIL: 8
- ERROR: 0
- TOTAL: 16
- process exit code: 1

For both liveness and timeline, positive gate factors inside the configured
closed range retained residual composites when the hard-stop line was disabled.

The immediately-above-boundary controls remained open, as expected.

Terminal evidence:

`reports/gateguard/honest-run/mutant-boundary-terminal.txt`

After testing, the temporary mutant was deleted. The production scorer remained
unchanged.

## Metric readout

Across the two registered production suites:

- 26 of 26 registered checks passed;
- both harness executions exited with code 0.

With the targeted hard-stop regression deliberately introduced:

- baseline changed from 10/10 passing to 5/10 passing;
- boundary changed from 16/16 passing to 8/16 passing;
- both mutant executions exited with code 1.

This is a targeted regression experiment. It does not claim comprehensive
mutation coverage across the repository.

The measurable result is therefore not a claim about model accuracy.
It is evidence that GateGuard detects this specific hard-stop regression.

## Repository and privacy checks

After the production and deliberate-break runs:

`npm run doctor`

reported:

- required Node and Python environment runnable;
- no tracked private/PII paths;
- 44/44 recipe artifacts carrying lifecycle frontmatter;
- zero missing lifecycle frontmatter.

`npm run verify`

reported:

- 137 files conformed;
- machine conformance passed;
- manifest check passed with four warnings.

The four warnings were preserved rather than hidden:

- `output/` is not listed in `.gitignore`;
- `reports/generated/` is not listed in `.gitignore`;
- `archive/` is not listed in `.gitignore`;
- `private/` is not gitignored.

These are warnings in the repository verification output, not GateGuard PASS
results, and they are not represented here as resolved.

Evidence:

- `reports/gateguard/honest-run/doctor-terminal.txt`
- `reports/gateguard/honest-run/verify-terminal.txt`

## Verified versus inferred boundary

### Verified by this run

The following are supported directly by committed scripts, controlled fixtures,
terminal output, and generated audit records:

- the production baseline suite passed 10/10;
- the production boundary suite passed 16/16;
- closed production gates returned composite zero in the registered fixtures;
- the `0.0501` boundary controls remained positive at composite `0.0293`;
- disabling the hard-stop caused 5 baseline failures;
- disabling the hard-stop caused 8 boundary failures;
- both deliberate-mutant harness runs exited non-zero;
- the temporary mutant was isolated from the production scorer;
- repository doctor reported no tracked private/PII paths;
- repository verification completed with four disclosed warnings.

### Human interpretation

The interpretation that the residual-score behavior constitutes a hard-stop
contract defect is a human conclusion grounded in the repository's stated gate
semantics and the observed run evidence.

## What the machine could not know

GateGuard verifies software behavior against controlled inputs. It does not establish
real-world truth.

This run cannot determine:

- whether `gate_zero = 0.05` is the correct product or policy threshold;
- whether a real job posting is currently live;
- whether a real employer will sponsor a candidate;
- whether a particular person's immigration or work-authorization timeline is feasible;
- what policy should apply to malformed, missing, negative, null, string, or
  greater-than-one gate values;
- whether the broader Bayesian scoring model is correctly calibrated;
- whether a maintainer should merge the contribution.

Those questions require external records, explicit policy, domain expertise,
or human judgment beyond this harness.

## Honest conclusion

The production scorer passed every registered GateGuard baseline and boundary
assertion in this run.

When the hard-stop enforcement was deliberately removed from an isolated temporary
copy, GateGuard failed the affected assertions and returned non-zero process exit
codes.

The evidence therefore supports a narrow claim:

**GateGuard detects the targeted closed-gate residual-score regression represented
by this deliberate mutation.**

It does not prove the correctness of every scorer rule or any real-world
employment, sponsorship, or immigration fact.
