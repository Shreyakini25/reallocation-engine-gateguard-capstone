# UPWORK-DOMAIN — The Reallocation Engine, adapted for AI-doable gigs

> Branch `freelance-gigs`. This is a **new domain** built on the same Snickerdoodle
> constitution (`SNICKERDOODLE.md`, unchanged) as the F-1/OPT job-search domain. It does NOT
> replace `DOMAIN.md` yet — it is the domain map for the gig-finder work. Read `SNICKERDOODLE.md`
> first; this file states what is specific to the gig domain.

## What this domain does

Reallocates your scarce bidding effort toward freelance gigs you can **finish well with AI**
(demo pages, interactive presentations, full websites, database schemas, scrapers/automation,
data-viz…), starting with **Upwork**. It scores each gig and returns **Apply / Maybe / Skip** so
you don't burn proposals on gigs that were never worth it. Skip is a successful outcome; a healthy
run skips at least half.

## Evidence components (mapped from the five job-search signals)

| Gig signal | Type | Maps from | Where computed |
|---|---|---|---|
| **ai_fit** — can I finish this well with AI? | vote (core) | NEW | `scripts/upwork/ingest.mjs` (v0 heuristic; real version asks Claude) |
| **pay** — budget vs effort | vote | BLS/O*NET role quality | ingest [record] |
| **client_trust** — payment-verified, $ spent, reviews | vote | H-1B sponsorship history | ingest [record] |
| **liveness** — still open & not flooded with proposals | **GATE** | ATS liveness | ingest [record] |
| **time_fit** — deliverable within the deadline | **GATE** | visa timeline | ingest [your-input] |

Gates are multipliers, not votes: a closed/flooded posting or an impossible deadline zeroes the
composite no matter how strong the votes.

## Layout (current)

| Path | What it is |
|---|---|
| `data/upwork/` | gig data layer — **private by default** (see its `.gitignore`); `gigs.sample.json` is the only safe fixture |
| `scripts/upwork/ingest.mjs` | discovery + evidence derivation (raw gigs → labeled evidence records) |
| `scripts/score/gig-scorer.mjs` | the decision core — votes × gates → Apply/Maybe/Skip + audit |
| `recipes/gig-scan.md`, `recipes/gig-score.md` | the two operating recipes (DRAFT) |

## Runnable today (sample mode, zero credentials, zero tokens)

```bash
npm run gig:ingest -- --sample                          # derive evidence from the sample fixture
npm run gig:score -- data/upwork/gigs.sample.evidence.json   # → Apply/Maybe/Skip + audit report
```

Verified sample run (2026-06-25): 8 gigs → Apply 2 · Maybe 2 · Skip 4 (50% skip); the
"URGENT 12h" gig gated by time_fit, the closed posting gated by liveness. Output:
`data/upwork/gig-scores.{json,md}`.

## Not built yet (honest list)

1. **Live Upwork pull.** `ingest.mjs` reads a fixture only; the Upwork API fetch (OAuth 2.0, ToS
   + rate limits) is a marked `TODO[live]`. No network calls happen today.
2. **Real ai_fit judgment.** Currently a category/keyword heuristic labeled `model-judgment`; the
   real version asks Claude to read the description and judge feasibility — it slots into the same
   labeled slot without a schema change.
3. **time_fit effort model.** Uses `deadline_days` only; doesn't yet weigh per-category effort
   against your working speed.
4. **Weights/thresholds are v0 defaults** — not yet tuned against real outcomes; recipes are DRAFT
   (no attestation).
5. **Other gig sites** (Freelancer, Contra, etc.) — out of scope until the Upwork path is verified.

## Privacy

`data/upwork/` reveals your real gig-hunting activity — gigs scanned, bid on, won. It is private
by default (everything ignored except the policy file, README, and `gigs.sample.json`). Review
before any commit. Same rule as `data/ats/`.
