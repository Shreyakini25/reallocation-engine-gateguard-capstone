# GateGuard Progress Log

## 2026-08-08 — Hypothesis, harness, and baseline

### Completed

- Created the GateGuard contribution branch.
- Registered the hard-stop hypothesis before runtime testing.
- Performed read-only forensic inspection of the role scorer and Chapter 11 contract.
- Built a dependency-free black-box GateGuard verification harness.
- Registered 10 fictional controlled fixtures before executing the scorer.
- Executed the unmodified production scorer.
- Preserved baseline JSON and Markdown evidence.

### Observed result

Baseline suite:

- PASS: 5
- FAIL: 5
- ERROR: 0
- TOTAL: 10

The baseline reproduced a condition where a gate classified as closed retained
a non-zero composite score.

### Production scorer status

No corrective change made.

---

## 2026-08-09 — Boundary and robustness investigation

### Boundary sweep

Registered and executed 16 controlled liveness/timeline boundary cases.

Tested both gates at:

- 0
- 0.0001
- 0.01
- 0.0499
- 0.05
- 0.0501
- 0.10
- 1.0

Observed:

- PASS: 8
- FAIL: 8
- ERROR: 0
- TOTAL: 16

The failure region was isolated to tested positive values inside the scorer's
closed-gate range:

`0 < factor <= 0.05`

The finding is documented as the Closed-Gate Residual Score Defect.

### Robustness probe

Executed 8 additional exploratory cases covering:

- missing liveness;
- missing timeline;
- null gate value;
- string gate value;
- negative liveness;
- negative timeline;
- liveness greater than 1;
- timeline greater than 1.

Observed that missing/null/non-numeric gate values default to 1, negative
values can produce negative composites while being described as zeroing gates,
and values above 1 can amplify the composite.

These are documented as robustness risks unless an explicit repository
contract establishes stronger requirements.

### Evidence discipline

- All fixtures are fictional controlled inputs.
- Raw scorer outputs were preserved.
- Interpretation was documented separately from raw output.
- No real candidate, employer, posting, or private immigration data was used.
- The production role scorer remained unchanged throughout the investigation.

### Next

- implement the minimum hard-stop correction;
- rerun the exact registered baseline and boundary suites;
- verify healthy/open-gate behavior does not regress;
- deliberately reintroduce the target defect as a mutation;
- confirm GateGuard kills the mutation;
- record before/after evidence.
