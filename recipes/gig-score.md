---
status: DRAFT
todos_open: 1
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# gig-score — Apply / Maybe / Skip for freelance gigs

## Purpose

Combine the evidence records from `gig-scan` into one auditable recommendation per gig —
**Apply / Maybe / Skip** — and produce a human report. This is the gig-domain analog of the
Bayesian Role Scorer (book Ch.11); it COMBINES signals, it does not compute them.

## Decision model

```
Composite = ( ai_fit·0.45 + pay·0.30 + client_trust·0.25 ) × liveness × time_fit
```

- **Votes** (graduated 0–1): `ai_fit` [model-judgment], `pay` [record], `client_trust` [record].
- **Gates** (multipliers): `liveness` (open & not flooded) and `time_fit` (deliverable in time).
  A closed gate (≤ 0.05) zeroes the composite → Skip, regardless of votes. A soft gate
  (< 0.60: flooded post or tight deadline) demotes Apply → Maybe.
- **Bands:** Apply ≥ 0.45 · Maybe ≥ 0.30 · else Skip. Skip is a successful outcome; a healthy
  run skips at least half.

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| Evidence records | JSON | `data/upwork/*.evidence.json` (from `gig-scan`) | Yes |

## Phase Gates

1. **Data-shape gate** — evidence JSON parses.
2. **Report gate** — `gig-scores.json` (agent) + `gig-scores.md` (human) written.
3. **Human gate** — you read the audit and make the final call. `[TODO: APPROVE]` — attestation
   promotes this recipe past DRAFT.

## Steps

1. **Score + report.** Labor: AI with human gate. Script: `scripts/score/gig-scorer.mjs`.
   - Output: per-gig composite, recommendation, machine_recommendation, full per-term trace
     (value · weight · source) and the arithmetic. Markdown report for the human; JSON for the agent.

## Output Contract

- **Agent:** `data/upwork/gig-scores.json` — config, and per-gig `{composite, recommendation, trace}`.
- **Human:** `data/upwork/gig-scores.md` — summary + skip rate + a row per gig you can read
  term-by-term. Reader: you, deciding which gigs to actually write a proposal for.

## Run

```bash
npm run gig:score -- data/upwork/gigs.sample.evidence.json
```

## Override

You own the final call. Add `"override": {"decision": "Apply", "reason": "..."}` to a gig record;
an override **without** a documented reason is ignored (that is just ignoring the math).

## Provenance

Adapted from `scripts/score/role-scorer.mjs` (Ch.11). Weights/thresholds are v0 defaults — tune
them and re-run; log runs in `logs/RUN_LOG.md`.
