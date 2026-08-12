# GateGuard Final Human Attestation Record

## Attestation

- Recipe: `gateguard` v0.1.0
- Lifecycle at review: `RUNNABLE-SAMPLE`
- By: Shreya Kini · 2026-08-12
- Frozen evidence base commit: `b31616d5f1302dcbdcb68eff7af298e6a028d5eb`

This attestation records human review of the capstone's verified software and
test evidence. It does not promote GateGuard to lifecycle `VERIFIED`, because
no `RUNNABLE-LIVE` workflow with real-data gate clearances was performed.

### Frozen artifact identities

| Artifact | SHA-256 |
|---|---|
| `scripts/score/role-scorer.mjs` | `3aab2b1936fb9c95d265b6f832d65bd06f22294a1c1e257d1bbfa526bb838775` |
| `scripts/score/gateguard-harness.mjs` | `9c801ff5c32f334eebe4f951cdd6f57c6e4c04881cdf07ee96e3bc78fb087aea` |
| `recipes/gateguard.md` | `c32bf1ca3e050e020caf572a216d8fc3d32ac6491f6a08718441901f11c8ca44` |
| `recipes/gateguard.card.md` | `951d5ff29cfd8e5f905a8fd7abfe12d05a180e020f09bee0c892aa2d3843cb29` |

### Tested

| Ran / reviewed | Saw | Expected |
|---|---|---|
| `node --check scripts/score/role-scorer.mjs` | No syntax error | Production scorer parses |
| `node --check scripts/score/gateguard-harness.mjs` | No syntax error | GateGuard harness parses |
| Production baseline suite | 10 PASS · 0 FAIL · 0 ERROR · 10 TOTAL; exit 0 | All registered baseline checks pass |
| Production boundary suite | 16 PASS · 0 FAIL · 0 ERROR · 16 TOTAL; exit 0 | All registered boundary checks pass |
| Closed boundary `0.05` | Composite `0` | Scorer-classified closed gate is a hard stop |
| Open boundary control `0.0501` | Composite `0.0293` | Immediately-above-boundary control remains open |
| Maximum-vote closed-gate controls | Composite `0` | Votes cannot rescue a closed gate |
| Deliberate hard-stop mutation — baseline | 5 PASS · 5 FAIL · 0 ERROR · 10 TOTAL; exit 1 | GateGuard detects targeted regression |
| Deliberate hard-stop mutation — boundary | 8 PASS · 8 FAIL · 0 ERROR · 16 TOTAL; exit 1 | GateGuard detects closed-range residual-score regression |
| Mutant isolation | Mutation existed only under `/tmp`; production scorer remained unchanged | Break attempt does not contaminate committed scorer |
| Mutant cleanup | Temporary mutant deleted after testing | No deliberate defect remains |
| `npm run doctor` | Required environment runnable; no tracked private/PII paths; 44/44 lifecycle metadata present | Repository health/privacy gate passes |
| `npm run verify` | Conformance passed; manifest check passed with four disclosed warnings | Machine verification completes without hidden warnings |
| Honest Run evidence | `docs/gateguard/HONEST_RUN.md` and `reports/gateguard/honest-run/` reviewed | Reported claims match preserved evidence |

### Evidence boundary

| Claim or value | Classification |
|---|---|
| Fixture gate values | Controlled fictional input |
| Composite values | Role-scorer output |
| Recommendations and arithmetic traces | Role-scorer output |
| PASS / FAIL / ERROR counts | GateGuard harness output |
| Process exit codes | Local execution evidence |
| Git commit | Local repository evidence |
| SHA-256 values | Local file-identity evidence |
| Interpretation as a hard-stop contract defect | Human judgment grounded in repository semantics and run evidence |
| Real posting liveness | Not tested |
| Real employer sponsorship truth | Not tested |
| Real immigration/work-authorization feasibility | Not tested |
| Correctness of `gate_zero = 0.05` as policy | Not tested |
| Full Bayesian model calibration | Not tested |

### Did not test

- No live employer or job-posting data was used.
- No real candidate data was used.
- No private immigration or work-authorization information was used.
- No external network source was queried by GateGuard.
- This work does not establish that `gate_zero = 0.05` is the correct business or policy threshold.
- This work does not establish policy for missing, null, malformed, negative, string, or greater-than-one gate values.
- This work does not validate the full Bayesian scoring model.
- This work does not validate upstream ATS or visa-data ingestion.
- No `RUNNABLE-LIVE` workflow with real-data human gate clearances was performed.
- This work does not determine whether a maintainer should merge the contribution.

### Broke during testing, fixed

- The original scorer could classify a positive gate factor at or below the configured closed-gate boundary as closed while retaining a non-zero residual composite.
- GateGuard exposed the behavior using registered baseline and boundary fixtures.
- The production scorer was corrected so a scorer-classified closed liveness or timeline gate sets the final decision composite to exactly zero.
- The pre-hard-stop multiplication remains visible in the arithmetic trace for auditability.
- After correction, the baseline suite passed 10/10 and the boundary suite passed 16/16.
- A deliberate temporary mutation disabled the hard-stop behavior again.
- The mutant baseline produced 5 failures and exited 1.
- The mutant boundary produced 8 failures and exited 1.
- The temporary mutant was removed and never replaced the committed production scorer.

### Human adequacy review

Before completing the `By:` line, the human reviewer must personally confirm:

- the Honest Run evidence was reviewed;
- the production and mutant outputs match this record;
- no failing or error result was hidden;
- the four repository manifest warnings are disclosed rather than represented as resolved;
- the stated verified-versus-inferred boundary is accurate;
- the limitations under `Did not test` are accurate;
- the frozen artifact hashes above match the files reviewed;
- the distinction between software conformance and real-world truth is understood.
