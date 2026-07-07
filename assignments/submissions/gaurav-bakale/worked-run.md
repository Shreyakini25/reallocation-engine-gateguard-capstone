# Worked Run — `freelance-gig-triage`

**By:** Gaurav Bakale · **Recipe:** `recipes/freelance-gig-triage.md` v0.1.0 · **Stage:** RUNNABLE-SAMPLE · 2026-06-25

## Inputs

10 **real** freelance/contract postings pulled live from Remotive (a public, key-free job board),
filtered to `contract,freelance`. Postings are public URLs (not personal data). Raw + derived
evidence live in `data/upwork/gigs.remotive.json` / `.evidence.json` (gitignored).

## Commands I ran (verbatim)

```bash
npm run gig:ingest -- --remotive --limit 20 --job-types contract,freelance
#   → data/upwork/gigs.remotive.json, data/upwork/gigs.remotive.evidence.json
npm run gig:score  -- data/upwork/gigs.remotive.evidence.json
#   → data/upwork/gig-scores.json (agent) + gig-scores.md (human)
```

### Terminal output, verbatim

```
> the-reallocation-engine@1.0.0 gig:score
> node scripts/score/gig-scorer.mjs data/upwork/gigs.remotive.evidence.json

✓ scored 10 gigs → Apply 7 · Maybe 0 · Skip 3 (skip 30%)
  data/upwork/gig-scores.json  +  data/upwork/gig-scores.md
```

The full per-gig report the scorer wrote (`gig-scores.md`) is reproduced below.

## Real output (pasted from `data/upwork/gig-scores.md`, not described)

> *Votes: ai_fit 0.45, pay 0.3, client_trust 0.25. Gates (multiplicative): liveness, time_fit. Apply ≥ 0.45; Maybe ≥ 0.3.*
>
> **Summary: 10 gigs → Apply 7 · Maybe 0 · Skip 3. Skip rate 30%** (below the ~50% a healthy run skips; check the inputs.)

| Gig | Composite | Rec | Why |
|---|---|---|---|
| Senior Independent AI Engineer / Architect | 0.787 | **Apply** | composite ≥ 0.45, gates healthy |
| Senior Independent Software Developer | 0.787 | **Apply** | composite ≥ 0.45, gates healthy |
| Freelance Writer | 0.630 | **Apply** | composite ≥ 0.45, gates healthy |
| Head of Sales | 0.623 | **Apply** | composite ≥ 0.45, gates healthy |
| Quality Assurance Rater – German | 0.593 | **Apply** | composite ≥ 0.45, gates healthy |
| Copywriter | 0.578 | **Apply** | composite ≥ 0.45, gates healthy |
| Data Labeling Specialists | 0.563 | **Apply** | composite ≥ 0.45, gates healthy |
| Online Data Analyst Canada (French) | 0.025 | **Skip** | gated: time_fit ≈ 0.04 ("impossible (0d)") zeroes the composite |
| Online Data Analyst US (Spanish) | 0.025 | **Skip** | gated: time_fit ≈ 0.04 ("impossible (0d)") |
| Online Data Analyst Canada | 0.025 | **Skip** | gated: time_fit ≈ 0.04 ("impossible (0d)") |

## Verified vs. inferred (line-by-line)

| Signal | On this run | Verified or inferred? |
|---|---|---|
| `pay` | from each posting's budget field | **verified (record)** |
| `client_trust` | Remotive gives no client stats → flat **0.45 default** | **inferred** (a default wearing a "record" label — a real gap) |
| `liveness` | Remotive gives no proposal count → flat **1.0** | **inferred** (not a real open/flooded check) |
| `ai_fit` | keyword/category heuristic | **inferred (model-judgment)** — and it carries the heaviest weight (0.45) |
| `time_fit` | parsed from deadline text | **inferred** — and wrong on 3 rows (below) |

## Verification (how I confirmed the output was real — Attestation)

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run gig:score` on the 10-gig evidence | 10 rows, summary "Apply 7 · Skip 3", skip 30% | a scored table |
| `node -e` parsed `gig-scores.json` | valid JSON, per-gig `trace` present | machine log parses |
| Cross-checked the 3 Skips against the source postings | the 3 "Data Analyst" gigs are **ongoing**, not 0-day | they should NOT be gated |
| **Break attempt:** traced why time_fit = 0.04 on those 3 | parser matched "immediately/today" in boilerplate → fake 0-day deadline | a real deadline |
| **Break attempt:** why "Head of Sales" scored Apply | `ai_fit` heuristic tripped on trigger words; no client/liveness signal to counter it | it should not be a build gig |

### Did not test
- Live Upwork pull (not built — `[TODO: DEV]`).
- Real `ai_fit` via a Claude read (still the heuristic).
- Whether any Apply would convert to a paid bid (no outcome feedback loop).
- `client_trust` / `liveness` on a source that actually provides them.

### Broke during testing (found, not yet fixed)
- **False gate:** loose deadline parser fires `time_fit ≈ 0.04` on generic "today/immediately" copy — wrongly Skipped 3 legitimate gigs. Fix: match only real deadline phrases.
- **Over-generous votes:** 7/10 Apply, 30% skip (< healthy 50%). `ai_fit` over-rates and Remotive supplies no `client_trust`/`liveness` to counterbalance, so scoring leans on `ai_fit` + `pay` alone.

## Reflection

**What went well:** the pipeline ran end-to-end on real data; the gates and the term-by-term audit
trace worked exactly as designed — every recommendation is explainable, which is what let me *catch*
the errors instead of trusting the green "Apply."

**What it got wrong / missed:** it over-applied and mis-gated — precisely the two failure modes named
in the justification, which is sobering: I predicted them and the tool still produced them. The deeper
lesson is that on a source without trust/liveness signals, the composite is really `ai_fit + pay`
dressed up as a five-signal score — the missing signals are defaults, not verifications.

**Next steps:** (1) tighten the deadline parser to real deadline phrases; (2) replace the `ai_fit`
heuristic with a Claude read of the description; (3) run against a source that actually exposes client
trust + proposal counts (Upwork) so `client_trust`/`liveness` stop being defaults; (4) only then tune
weights against real bid→win outcomes and consider promoting past RUNNABLE-SAMPLE.
