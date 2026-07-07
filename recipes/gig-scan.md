---
status: DRAFT
todos_open: 2
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# gig-scan — Verified Upwork Gig Discovery + Evidence Derivation

## Purpose

Discover freelance gigs (Upwork first) and derive the per-gig evidence record the scorer
consumes. Agents use this to collect and normalize posting evidence; the human uses the summary
to confirm the scan is discovery only — not a proxy for "this gig is worth my time" (that is the
scorer's job, gated, and ultimately the human's call).

This recipe maps the job-search `scan` recipe onto the gig domain (see `UPWORK-DOMAIN.md`).

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| Raw gigs | JSON | `data/upwork/gigs.sample.json` (sample) or `data/upwork/gigs.json` (live) | Yes |
| Approval record | — | required before any **live** Upwork API call (network) | Yes for live mode |

## Phase Gates

1. **Source gate** — raw gig file present. Test: `test -f data/upwork/gigs.sample.json`.
2. **Scope gate** — run declares `--sample` or an approved live mode before any network call.
3. **Approval gate** — a live Upwork API pull (network) requires a logged approval. `[TODO: APPROVE]` — live fetch not built yet.
4. **Data-shape gate** — evidence output parses as JSON. Test: `node -e "JSON.parse(require('fs').readFileSync('data/upwork/gigs.sample.evidence.json'))"`.

## Steps

1. **Ingest + derive.** Labor: AI. Script: `scripts/upwork/ingest.mjs`.
   - Input: raw gigs JSON. Output: one evidence record per gig with labeled sources
     (record / model-judgment / your-input). Where: `data/upwork/*.evidence.json`.
   - `[TODO: DEV]` live Upwork API pull (OAuth 2.0, ToS + rate limits) — currently sample only.

## What this recipe CAN / CANNOT verify

**Can:** whether a gig posting exists, is open, how many proposals it has, its stated budget, and
a v0 heuristic for AI-fit. **Cannot:** whether you will actually win the bid, whether the client
is pleasant, or whether the gig is *worth your time* on its own — that is the scorer + your judgment.

## Run

```bash
npm run gig:ingest -- --sample                 # derive evidence from the sample fixture
npm run gig:ingest -- --in data/upwork/gigs.json --out data/upwork/gigs.evidence.json
```

## Provenance

Synthetic sample fixture (`data/upwork/gigs.sample.json`) — no real client data. Live data would
come from the Upwork API; only ingest scripts touch the network (P2). Log runs in `logs/RUN_LOG.md`.
