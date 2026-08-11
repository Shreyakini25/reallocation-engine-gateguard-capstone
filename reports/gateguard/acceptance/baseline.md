# GateGuard recipe-baseline audit

Generated: 2026-08-11T14:29:41.717Z
Git commit: `5451c9279a19128e73a6d4da5bb38e0b89d8a806`
Scorer: `scripts/score/role-scorer.mjs`
Scorer SHA-256: `3aab2b1936fb9c95d265b6f832d65bd06f22294a1c1e257d1bbfa526bb838775`
Fixtures: `scripts/score/fixtures/gateguard-roles.json`

## Summary

- Total cases: 10
- PASS: 10
- FAIL: 0
- ERROR: 0

## Results

| Case | Status | Composite | Recommendation | Purpose |
|---|---|---:|---|---|
| GG-001 | **PASS** | 0.585 | Apply | Healthy control with both gates open |
| GG-002 | **PASS** | 0 | Skip | Exact-zero liveness hard stop |
| GG-003 | **PASS** | 0 | Skip | Exact-zero timeline hard stop |
| GG-004 | **PASS** | 0 | Skip | Both hard-stop gates closed |
| GG-005 | **PASS** | 0 | Skip | Liveness exactly at configured gate_zero boundary |
| GG-006 | **PASS** | 0 | Skip | Timeline exactly at configured gate_zero boundary |
| GG-007 | **PASS** | 0.0293 | Skip | Boundary control immediately above gate_zero |
| GG-008 | **PASS** | 0 | Skip | Closed gate must remain zero with weaker votes |
| GG-009 | **PASS** | 0 | Skip | Maximum votes must not rescue a closed liveness gate |
| GG-010 | **PASS** | 0 | Skip | Maximum votes must not rescue a closed timeline gate |

## Assertion detail

### GG-001 — PASS

Healthy control with both gates open

- PASS — composite remains positive; expected: `> 0`; actual: `0.585`
- PASS — machine recommendation; expected: `Apply`; actual: `Apply`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.585 ≥ 0.3, gates healthy`
- Scorer reason: composite 0.585 ≥ 0.3, gates healthy

### GG-002 — PASS

Exact-zero liveness hard stop

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GG-003 — PASS

Exact-zero timeline hard stop

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GG-004 — PASS

Both hard-stop gates closed

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes)

### GG-005 — PASS

Liveness exactly at configured gate_zero boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GG-006 — PASS

Timeline exactly at configured gate_zero boundary

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GG-007 — PASS

Boundary control immediately above gate_zero

- PASS — composite remains positive; expected: `> 0`; actual: `0.0293`
- PASS — case is not classified as a closed gate; expected: `reason not starting with "gated:"`; actual: `composite 0.029 < 0.2 — time is better spent elsewhere`
- Scorer reason: composite 0.029 < 0.2 — time is better spent elsewhere

### GG-008 — PASS

Closed gate must remain zero with weaker votes

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GG-009 — PASS

Maximum votes must not rescue a closed liveness gate

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: liveness`; actual: `gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: liveness ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

### GG-010 — PASS

Maximum votes must not rescue a closed timeline gate

- PASS — closed gate forces exact zero composite; expected: `0`; actual: `0`
- PASS — machine recommendation; expected: `Skip`; actual: `Skip`
- PASS — closed-gate reason identifies gate; expected: `gated: timeline`; actual: `gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)`
- Scorer reason: gated: timeline ≈ 0.050 (a closed gate zeroes the composite regardless of votes)

## Evidence boundary

- Fixture values are controlled fictional inputs created for this test.
- Composite values, recommendations, reasons, and traces come from the scorer output.
- PASS/FAIL is produced by deterministic assertions in this harness.
- This audit does not claim that fictional fixture values describe any real candidate, employer, or posting.
