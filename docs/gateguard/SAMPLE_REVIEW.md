# GateGuard Sample-Run Human Review Record

## Sample Review

- Recipe: gateguard v0.1.0
- By: Shreya Kini · 2026-08-11

> This record documents human adequacy review of the GateGuard sample
> acceptance run. It is not the lifecycle attestation used to promote the
> recipe to VERIFIED status. Final attestation is deferred until the recipe
> and its scripts are frozen.

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `node --check scripts/score/role-scorer.mjs` | No syntax error | Production scorer parses successfully |
| `node --check scripts/score/gateguard-harness.mjs` | No syntax error | GateGuard harness parses successfully |
| Registered baseline suite | 10 PASS · 0 FAIL · 0 ERROR · 10 TOTAL | Every registered baseline assertion passes |
| Registered boundary suite | 16 PASS · 0 FAIL · 0 ERROR · 16 TOTAL | Every registered boundary assertion passes |
| Boundary control immediately above `gate_zero` | `0.0501` remained positive with composite `0.0293` | Weak-but-open boundary control is not hard-zeroed |
| Closed liveness boundary | Composite `0` | Gate classified closed produces exact-zero decision composite |
| Closed timeline boundary | Composite `0` | Gate classified closed produces exact-zero decision composite |
| Maximum non-gating votes with closed liveness gate | Composite `0`, recommendation `Skip` | Votes cannot rescue a closed required gate |
| Maximum non-gating votes with closed timeline gate | Composite `0`, recommendation `Skip` | Votes cannot rescue a closed required gate |
| Corrected trace inspection | Raw multiplication remains visible before transition to `0.000` | Audit trace exposes arithmetic and hard-stop action separately |
| Deliberate hard-stop mutation | GateGuard reported failures and exited nonzero | Harness detects reintroduction of the target regression |
| Deliberate mutation boundary run | GateGuard reported boundary failures and exited nonzero | Boundary suite detects the reintroduced residual-score behavior |

### Evidence identity

Acceptance run Git commit:

`5451c9279a19128e73a6d4da5bb38e0b89d8a806`

Acceptance run scorer SHA-256:

`3aab2b1936fb9c95d265b6f832d65bd06f22294a1c1e257d1bbfa526bb838775`

Acceptance evidence:

- `reports/gateguard/acceptance/baseline.json`
- `reports/gateguard/acceptance/baseline.md`
- `reports/gateguard/acceptance/boundary.json`
- `reports/gateguard/acceptance/boundary.md`

Historical defect evidence:

- `reports/gateguard/baseline-audit.json`
- `reports/gateguard/baseline-audit.md`
- `reports/gateguard/boundary-audit.json`
- `reports/gateguard/boundary-audit.md`

Corrected evidence:

- `reports/gateguard/corrected/baseline.json`
- `reports/gateguard/corrected/baseline.md`
- `reports/gateguard/corrected/boundary.json`
- `reports/gateguard/corrected/boundary.md`

Mutation evidence:

- `reports/gateguard/mutation/baseline.json`
- `reports/gateguard/mutation/baseline.md`
- `reports/gateguard/mutation/boundary.json`
- `reports/gateguard/mutation/boundary.md`

### Evidence boundary

| Item | Classification |
|---|---|
| Fixture sponsorship values | Fictional controlled input |
| Fixture fit values | Fictional controlled input |
| Fixture liveness factors | Fictional controlled input |
| Fixture timeline factors | Fictional controlled input |
| Composite score | Role-scorer output |
| Recommendation | Role-scorer output |
| Arithmetic trace | Role-scorer output |
| PASS / FAIL / ERROR | GateGuard harness output |
| Git commit | Local repository evidence |
| Scorer SHA-256 | Local file evidence |
| Interpretation of the original behavior as a defect | Human judgment grounded in repository contract and run evidence |
| Real-world posting liveness | Not tested |
| Real-world immigration eligibility | Not tested |
| Real employer sponsorship truth | Not tested |
| Correctness of `gate_zero = 0.05` as product policy | Not tested |
| Correct policy for malformed or missing gate values | Not tested |

### Did not test

- No live employer or job-posting data was used.
- No real candidate data was used.
- No private immigration information was used.
- No external network source was queried by GateGuard.
- GateGuard did not test whether `gate_zero = 0.05` is the correct business-policy threshold.
- GateGuard did not determine the required policy for missing, null, malformed, negative, or greater-than-one gate factors.
- GateGuard did not validate the correctness of the full Bayesian weighting model.
- GateGuard did not test upstream ATS ingestion or visa-data ingestion.
- GateGuard did not perform a RUNNABLE-LIVE workflow with humans clearing real-data gates.

### Broke during testing, fixed

- Original production behavior classified positive gate factors at or below the configured closed-gate boundary as closed while retaining a non-zero residual composite.
- GateGuard exposed the defect in the registered baseline and boundary suites.
- The scorer was changed so that a scorer-classified closed gate sets the final decision composite to exactly zero.
- The raw pre-hard-stop multiplication remains available in the trace.
- After the correction, the baseline suite passed 10/10 and the boundary suite passed 16/16.
- A deliberate temporary mutation reintroduced the previous behavior and GateGuard detected the regression again.

### Human adequacy review

The human reviewer must personally confirm before completing the `By:` line:

- the generated acceptance reports were reviewed;
- the observed outputs are plausible for the controlled fixtures;
- the stated limitations are accurate;
- no failure or ERROR was hidden;
- the machine evidence matches the claims in this record;
- the distinction between software conformance and real-world truth is understood.

