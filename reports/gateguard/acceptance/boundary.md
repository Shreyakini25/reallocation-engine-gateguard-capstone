# GateGuard recipe-boundary audit

Generated: 2026-08-11T14:29:48.209Z
Git commit: `5451c9279a19128e73a6d4da5bb38e0b89d8a806`
Scorer: `scripts/score/role-scorer.mjs`
Scorer SHA-256: `3aab2b1936fb9c95d265b6f832d65bd06f22294a1c1e257d1bbfa526bb838775`
Fixtures: `scripts/score/fixtures/gateguard-boundary.json`

## Summary

- Total cases: 16
- PASS: 16
- FAIL: 0
- ERROR: 0

## Results

| Case | Status | Composite | Recommendation | Purpose |
|---|---|---:|---|---|
| GB-L-0000 | **PASS** | 0 | Skip | Liveness exact zero |
| GB-L-0001 | **PASS** | 0 | Skip | Positive liveness inside closed-gate range |
| GB-L-0100 | **PASS** | 0 | Skip | Liveness well inside closed-gate range |
| GB-L-0499 | **PASS** | 0 | Skip | Immediately below closed-gate boundary |
| GB-L-0500 | **PASS** | 0 | Skip | Exact configured closed-gate boundary |
| GB-L-0501 | **PASS** | 0.0293 | Skip | Immediately above closed-gate boundary |
| GB-L-1000 | **PASS** | 0.0585 | Skip | Weak but open liveness gate |
| GB-L-10000 | **PASS** | 0.585 | Apply | Fully open liveness control |
| GB-T-0000 | **PASS** | 0 | Skip | Timeline exact zero |
| GB-T-0001 | **PASS** | 0 | Skip | Positive timeline inside closed-gate range |
| GB-T-0100 | **PASS** | 0 | Skip | Timeline well inside closed-gate range |
| GB-T-0499 | **PASS** | 0 | Skip | Immediately below closed-gate boundary |
| GB-T-0500 | **PASS** | 0 | Skip | Exact configured timeline closed-gate boundary |
| GB-T-0501 | **PASS** | 0.0293 | Skip | Immediately above timeline closed-gate boundary |
| GB-T-1000 | **PASS** | 0.0585 | Skip | Weak but open timeline gate |
| GB-T-10000 | **PASS** | 0.585 | Apply | Fully open timeline control |

## Assertion detail

### GB-L-0000 — PASS

Liveness exact zero

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-L-0001 — PASS

Positive liveness inside closed-gate range

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-L-0100 — PASS

Liveness well inside closed-gate range

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.010 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.010 (a closed gate zeroes the composite regardless of votes)

### GB-L-0499 — PASS

Immediately below closed-gate boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-L-0500 — PASS

Exact configured closed-gate boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-L-0501 — PASS

Immediately above closed-gate boundary

- PASS — composite remains positive; expected: `> 0`; actual: `0.0293`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.029 < 0.2 — time is better spent elsewhere`
- Scorer reason: composite 0.029 < 0.2 — time is better spent elsewhere

### GB-L-1000 — PASS

Weak but open liveness gate

- PASS — composite remains positive; expected: `> 0`; actual: `0.0585`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.058 < 0.2 — time is better spent elsewhere`
- Scorer reason: composite 0.058 < 0.2 — time is better spent elsewhere

### GB-L-10000 — PASS

Fully open liveness control

- PASS — composite remains positive; expected: `> 0`; actual: `0.585`
- PASS — machine recommendation; expected: `Apply`; actual: `Apply`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.585 ≥ 0.3, gates healthy`
- Scorer reason: composite 0.585 ≥ 0.3, gates healthy

### GB-T-0000 — PASS

Timeline exact zero

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-T-0001 — PASS

Positive timeline inside closed-gate range

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-T-0100 — PASS

Timeline well inside closed-gate range

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.010 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.010 (a closed gate zeroes the composite regardless of votes)

### GB-T-0499 — PASS

Immediately below closed-gate boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-T-0500 — PASS

Exact configured timeline closed-gate boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-T-0501 — PASS

Immediately above timeline closed-gate boundary

- PASS — composite remains positive; expected: `> 0`; actual: `0.0293`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.029 < 0.2 — time is better spent elsewhere`
- Scorer reason: composite 0.029 < 0.2 — time is better spent elsewhere

### GB-T-1000 — PASS

Weak but open timeline gate

- PASS — composite remains positive; expected: `> 0`; actual: `0.0585`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.058 < 0.2 — time is better spent elsewhere`
- Scorer reason: composite 0.058 < 0.2 — time is better spent elsewhere

### GB-T-10000 — PASS

Fully open timeline control

- PASS — composite remains positive; expected: `> 0`; actual: `0.585`
- PASS — machine recommendation; expected: `Apply`; actual: `Apply`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.585 ≥ 0.3, gates healthy`
- Scorer reason: composite 0.585 ≥ 0.3, gates healthy

## Evidence boundary

- Fixture values are controlled fictional inputs created for this test.
- Composite values, recommendations, reasons, and traces come from the scorer output.
- PASS/FAIL is produced by deterministic assertions in this harness.
- This audit does not claim that fictional fixture values describe any real candidate, employer, or posting.

