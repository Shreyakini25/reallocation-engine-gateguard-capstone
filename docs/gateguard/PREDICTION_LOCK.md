# GateGuard Prediction Lock

## Project
GateGuard: Hard-Stop Verification Harness for the Reallocation Engine

## Original Suspect Decision

Before implementing or running the GateGuard harness, I suspect that the
Reallocation Engine's hard-stop gates may be vulnerable to a "gate-as-vote"
failure.

The intended behavior is:

- posting liveness is a hard-stop condition;
- visa-timeline eligibility is a hard-stop condition;
- if either required gate is closed, the role must not remain numerically
  competitive merely because other factors are strong.

## Prediction

For any role in which a required hard-stop gate is closed:

1. the role should be rejected or skipped;
2. the composite decision score should be exactly zero;
3. increasing sponsorship, fit, role quality, or other weighted factors
   should not rescue the role;
4. the result should remain zero regardless of how favorable the non-gating
   factors are.

## Suspected Failure Mode

The suspected defect is that a hard-stop condition may behave like another
weighted factor or multiplier rather than an actual zeroing gate.

If this occurs, the system could return:

- a Skip/Gated recommendation,
- while still retaining a non-zero composite score.

That would create an internally inconsistent decision: the explanation would
treat the condition as binding while the numerical score would continue to
represent the role as partially viable.

## Falsification Condition

This suspicion is wrong if the existing implementation already guarantees
that every closed required gate produces an exact composite score of zero
across the registered test scenarios.

If the existing implementation passes those tests, GateGuard should report
that result rather than manufacture a defect.

## Evidence Rules

- No test result will be written before the test executes.
- No PASS/FAIL count will be invented.
- All reported numbers must come from executable tests or recorded inputs.
- Fictional fixtures may be used as controlled test inputs but will be labeled
  as such.
- Unexpected results will be preserved rather than rewritten to fit the
  original hypothesis.
- The original implementation will be tested before any corrective change is
  made.

## Scope

The initial registered target is limited to:

- posting-liveness gate behavior;
- visa-timeline gate behavior;
- interaction of those gates with the composite role score.

Additional defects discovered during testing will be reported separately and
will not silently redefine the original hypothesis.
