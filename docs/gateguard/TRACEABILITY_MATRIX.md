# GateGuard Numeric Traceability Matrix

## Purpose

This matrix makes the verified-data boundary explicit using the capstone rubric's
classification vocabulary. It supplements the signed human attestation without
changing the frozen scorer, harness, recipe, or human card.

| Reported value / claim | Classification | Produced by / source | Preserved evidence |
|---|---|---|---|
| Baseline `10 PASS · 0 FAIL · 0 ERROR · 10 TOTAL` | script-output | `scripts/score/gateguard-harness.mjs` using `gateguard-roles.json` | `reports/gateguard/honest-run/production-baseline.json` and `production-baseline-terminal.txt` |
| Boundary `16 PASS · 0 FAIL · 0 ERROR · 16 TOTAL` | script-output | `scripts/score/gateguard-harness.mjs` using `gateguard-boundary.json` | `reports/gateguard/honest-run/production-boundary.json` and `production-boundary-terminal.txt` |
| Production baseline exit code `0` | local-evidence | local shell execution of GateGuard harness | `reports/gateguard/honest-run/production-baseline-terminal.txt` |
| Production boundary exit code `0` | local-evidence | local shell execution of GateGuard harness | `reports/gateguard/honest-run/production-boundary-terminal.txt` |
| Mutant baseline `5 PASS · 5 FAIL · 0 ERROR · 10 TOTAL` | script-output | GateGuard harness against isolated temporary mutant | `reports/gateguard/honest-run/mutant-baseline.json` and `mutant-baseline-terminal.txt` |
| Mutant boundary `8 PASS · 8 FAIL · 0 ERROR · 16 TOTAL` | script-output | GateGuard harness against isolated temporary mutant | `reports/gateguard/honest-run/mutant-boundary.json` and `mutant-boundary-terminal.txt` |
| Mutant baseline exit code `1` | local-evidence | local shell execution against isolated temporary mutant | `reports/gateguard/honest-run/mutant-baseline-terminal.txt` |
| Mutant boundary exit code `1` | local-evidence | local shell execution against isolated temporary mutant | `reports/gateguard/honest-run/mutant-boundary-terminal.txt` |
| Gate value `0.05` | your-input | controlled fictional boundary fixture | `scripts/score/fixtures/gateguard-boundary.json` |
| Gate value `0.0501` | your-input | controlled fictional boundary fixture | `scripts/score/fixtures/gateguard-boundary.json` |
| Composite `0` at closed boundary | script-output | `scripts/score/role-scorer.mjs` | `reports/gateguard/honest-run/production-boundary.json` |
| Composite `0.0293` immediately above boundary | script-output | `scripts/score/role-scorer.mjs` | `reports/gateguard/honest-run/production-boundary.json` |
| `26 / 26` registered production checks passed | local-evidence | arithmetic summary of 10 baseline + 16 boundary registered checks | the two production Honest Run reports above |
| Frozen Git commit `b31616d5f1302dcbdcb68eff7af298e6a028d5eb` | local-evidence | `git rev-parse HEAD` at freeze | `docs/gateguard/ATTESTATION.md` |
| Frozen SHA-256 identities | local-evidence | local `shasum -a 256` execution | `docs/gateguard/ATTESTATION.md` |
| Residual-score behavior is a hard-stop contract defect | your-input | human interpretation of repository semantics plus run evidence | `docs/gateguard/HONEST_RUN.md` and `docs/gateguard/ATTESTATION.md` |
| Real posting liveness | missing | not established by GateGuard | explicitly listed under `Did not test` |
| Real employer sponsorship truth | missing | not established by GateGuard | explicitly listed under `Did not test` |
| Real immigration/work-authorization feasibility | missing | not established by GateGuard | explicitly listed under `Did not test` |
| Correctness of `gate_zero = 0.05` as policy | missing | not established by GateGuard | explicitly listed under `Did not test` |

## Classification notes

- `script-output` means the value was emitted by committed executable code.
- `local-evidence` means the value came from the local shell, Git, or file-identity evidence.
- `your-input` means a controlled test input or explicitly identified human judgment.
- `missing` means GateGuard does not possess evidence sufficient to establish the claim.
- GateGuard does not report any external-source or model-inference value as verified fact in these runs.
