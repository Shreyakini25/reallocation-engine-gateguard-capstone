# GateGuard boundary audit

Generated: 2026-08-10T01:47:15.682Z
Git commit: `ec4681edb09a13ce0e1cde50bfac199619677aef`
Scorer: `scripts/score/role-scorer.mjs`
Scorer SHA-256: `8655e182c3c2256c176f530f1a467b0dfa9fc99f3b13c2311a4b63eeae3933d2`
Fixtures: `scripts/score/fixtures/gateguard-boundary.json`

## Summary

- Total cases: 16
- PASS: 8
- FAIL: 8
- ERROR: 0

## Results

| Case | Status | Composite | Recommendation | Purpose |
|---|---|---:|---|---|
| GB-L-0000 | **PASS** | 0 | Skip | Liveness exact zero |
| GB-L-0001 | **FAIL** | 0.0001 | Skip | Positive liveness inside closed-gate range |
| GB-L-0100 | **FAIL** | 0.0059 | Skip | Liveness well inside closed-gate range |
| GB-L-0499 | **FAIL** | 0.0292 | Skip | Immediately below closed-gate boundary |
| GB-L-0500 | **FAIL** | 0.0292 | Skip | Exact configured closed-gate boundary |
| GB-L-0501 | **PASS** | 0.0293 | Skip | Immediately above closed-gate boundary |
| GB-L-1000 | **PASS** | 0.0585 | Skip | Weak but open liveness gate |
| GB-L-10000 | **PASS** | 0.585 | Apply | Fully open liveness control |
| GB-T-0000 | **PASS** | 0 | Skip | Timeline exact zero |
| GB-T-0001 | **FAIL** | 0.0001 | Skip | Positive timeline inside closed-gate range |
| GB-T-0100 | **FAIL** | 0.0059 | Skip | Timeline well inside closed-gate range |
| GB-T-0499 | **FAIL** | 0.0292 | Skip | Immediately below closed-gate boundary |
| GB-T-0500 | **FAIL** | 0.0292 | Skip | Exact configured timeline closed-gate boundary |
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

### GB-L-0001 — FAIL

Positive liveness inside closed-gate range

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0001`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-L-0100 — FAIL

Liveness well inside closed-gate range

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0059`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.010 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.010 (a closed gate zeroes the composite regardless of votes)

### GB-L-0499 — FAIL

Immediately below closed-gate boundary

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0292`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-L-0500 — FAIL

Exact configured closed-gate boundary

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0292`
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

### GB-T-0001 — FAIL

Positive timeline inside closed-gate range

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0001`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GB-T-0100 — FAIL

Timeline well inside closed-gate range

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0059`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.010 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.010 (a closed gate zeroes the composite regardless of votes)

### GB-T-0499 — FAIL

Immediately below closed-gate boundary

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0292`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GB-T-0500 — FAIL

Exact configured timeline closed-gate boundary

- FAIL — closed gate forces exact zero composite; expected: `0`; actual: `0.0292`
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

