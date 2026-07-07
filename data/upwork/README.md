# data/upwork/ — gig-finder data layer

Verified-data layer for the AI-gig-finder domain (see `UPWORK-DOMAIN.md`). Mirrors the
two-customer / verified-data rules of the job-search domain.

## Files

| File | What it is | Tracked? |
|---|---|---|
| `gigs.sample.json` | Hand-made sample of raw gig listings (no real client PII). Lets the pipeline run in **sample mode** with no Upwork credentials. | yes (safe fixture) |
| `gigs.json` | Your real ingested gigs (live Upwork pull). | no — **private** |
| `gigs.evidence.json` | Normalized evidence records emitted by `scripts/upwork/ingest.mjs` (scorer input). | no — **private** |
| `gig-scores.json` / `gig-scores.md` | Scorer output: Apply/Maybe/Skip + audit. | no — **private** |

## Provenance

- `gigs.sample.json` is synthetic — written by hand to exercise every code path (a clear Apply,
  a flooded gig, a closed gig, a low-pay gig, an impossible deadline). It contains no real
  client data.
- Live data would come from the **Upwork API** (OAuth 2.0; respect Upwork's Terms of Service and
  rate limits). The live fetch is a marked TODO seam in `scripts/upwork/ingest.mjs` — not built
  yet. Only ingest scripts touch the network (P2).

## Raw gig schema (`gigs.sample.json`)

```jsonc
{
  "gig_id": "uw-001",
  "title": "Build a small React demo landing page",
  "url": "https://www.upwork.com/jobs/~01example",
  "posted_at": "2026-06-24",
  "category": "web",                 // web | slides | database | data-ml | mobile | writing | design | other
  "budget": { "type": "fixed", "amount_usd": 450 },   // or { "type": "hourly", "rate_usd": 45 }
  "client": { "payment_verified": true, "total_spent_usd": 25000, "reviews": 4.9, "country": "United States" },
  "proposals": 6,
  "deadline_days": 7,                // days the client gives to deliver
  "open": true,                      // false = posting closed/expired
  "description": "..."
}
```
