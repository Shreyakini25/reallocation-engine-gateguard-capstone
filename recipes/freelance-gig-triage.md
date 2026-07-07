---
status: RUNNABLE-SAMPLE
todos_open: 5
last_gate: "sample + real-Remotive run, 2026-06-25, logs/RUN_LOG.md#2026-06-25"
attestation: null
recipe_version: 0.1.0
---

# freelance-gig-triage — Apply / Maybe / Skip for AI-doable freelance gigs

> **Situation this is for:** an international MS/OPT student (or early-career developer) who can
> ship small AI-assisted builds — landing pages, slide decks, Postgres schemas, scrapers/automation,
> data/ML + LLM-agent work — and has **limited weekly bidding bandwidth**. It reallocates that
> bandwidth toward gigs worth a proposal and talks you out of the rest.

## Purpose

Turn a feed of freelance postings into one **auditable Apply / Maybe / Skip** call per gig, so a
part-time freelancer doesn't burn scarce proposals on gigs that were never worth it. Use it after a
gig pull, before writing any proposal. **Skip is a successful outcome** — a healthy run skips ≥ half.

## Source Inventory

| Node | Type | Path / command | Use |
|---|---|---|---|
| Raw gigs | JSON | `data/upwork/gigs.*.json` (fixture, or `--remotive` / `--reddit` pull) | discovery input |
| Evidence derivation | script | `npm run gig:ingest -- <source>` → `scripts/upwork/ingest.mjs` | raw → labeled evidence |
| Evidence records | JSON | `data/upwork/*.evidence.json` | scorer input |
| Scorer (decision core) | script | `npm run gig:score -- <evidence.json>` → `scripts/score/gig-scorer.mjs` | votes × gates → decision + audit |
| Domain map | doc | `UPWORK-DOMAIN.md` | signal mapping, honest not-built list |
| My profile | YAML | `search/profile.yml` | target categories, budget floor, availability |

## Decision model

```
Composite = ( ai_fit·0.45 + pay·0.30 + client_trust·0.25 ) × liveness × time_fit
Apply ≥ 0.45 · Maybe ≥ 0.30 · else Skip
```

- **Votes** (0–1): `ai_fit` [model-judgment], `pay` [record], `client_trust` [record].
- **Gates** (multipliers, **not votes**): `liveness` (open & not flooded) and `time_fit` (deliverable
  in time). A closed gate (≤ 0.05) zeroes the composite → Skip regardless of votes; a soft gate
  (< 0.60) demotes Apply → Maybe.

## Proposed additions (not built — do not present as if they ran)

- `[TODO: DEV]` Live Upwork pull (OAuth 2.0, ToS + rate limits) in `ingest.mjs` — today it reads a
  fixture / open boards only.
- `[TODO: DEV]` Real `ai_fit` = a Claude read of the gig description ("can I finish this well with
  AI?"), replacing the keyword/category heuristic, in the same `model-judgment` slot.
- `[TODO: DEV]` A per-category effort model for `time_fit` (weigh deadline against my working speed),
  not just `deadline_days`.
- `[TODO: DEFINE]` Weights/thresholds are v0 defaults — tune against real bid→win outcomes.

## Phase gates (hard stops)

1. **Source gate** — the raw-gig source is a named fixture or an approved live pull; no guessing.
2. **Data-shape gate** — evidence JSON parses (`node scripts/conformance.mjs <evidence.json>`).
3. **Liveness gate** — posting open & not flooded (> ~20 proposals demotes, > 50 skips). *A gate, not a vote.*
4. **time_fit gate** — deadline feasible for my availability; impossible/same-day skips. *A gate, not a vote.*
5. **Report gate** — agent JSON + human report both written.
6. **Human gate** — I read the audit term-by-term and make the final call. `[TODO: APPROVE]` — a logged attestation promotes this past RUNNABLE-SAMPLE.

## What it CAN verify

- Whether a gig's **stated budget** clears my floor (record: `budget`).
- Whether a posting is **marked open** and its proposal count — *when the source provides them*.
- Whether the **stated deadline** leaves feasible time (derived from `deadline_days`).
- The **arithmetic**: it reproduces every Apply/Maybe/Skip term-by-term, deterministically.

## What it CANNOT verify (the boundary that matters)

- **Whether I can actually finish a gig well with AI** — `ai_fit` is a heuristic/model-judgment, not
  a record. The heaviest vote (0.45) is the least verifiable signal.
- **Whether the client will pay / is legit** beyond the platform's own stats — and on sources with no
  client stats (Remotive, Reddit), `client_trust` falls back to a neutral default, so it verifies nothing.
- **Whether "still open" is true right now** — liveness is only as fresh as the last pull; no real-time
  re-check unless `npm run ats:liveness` is run against the URL.
- **The real deadline when a posting states it in prose** — the parser guesses from text and can fire a
  false gate (see Failure Modes / the worked run).
- **Outcome** — no bid→win feedback loop yet, so the weights are unvalidated.

## Output Contract (two readers, P5)

- **Agent log (JSON):** `data/upwork/gig-scores.json` — config + per-gig `{composite, recommendation,
  machine_recommendation, trace}` (each term: value · weight · source).
- **Human report (Markdown):** `data/upwork/gig-scores.md` — summary, skip rate, one row per gig
  readable term-by-term. Reader: me, deciding which gigs to actually write a proposal for.

## Stop conditions (refuse to score rather than guess)

- Stop if the evidence JSON fails to parse (data-shape gate) — a bad score is worse than none.
- Stop / label `unknown` if `client_trust` and `liveness` are both source-absent — do not let a neutral
  default masquerade as a verified signal.
- Stop if `budget` is missing on every gig — the `pay` vote would be pure default.
- Never present a proposed step (live Upwork pull, real `ai_fit`) as if it ran.

## Run

```bash
npm run gig:ingest -- --remotive --limit 20 --job-types contract,freelance   # or --sample
npm run gig:score  -- data/upwork/gigs.remotive.evidence.json
# read data/upwork/gig-scores.md term-by-term; override with a documented reason only
```

## Log template — append to `logs/RUN_LOG.md`

```markdown
## <date> — freelance-gig-triage (<source>, <mode>)
- **Inputs:** <n gigs from source>
- **Command:** npm run gig:ingest -- <flags> ; npm run gig:score -- <evidence.json>
- **Result:** <n> gigs → Apply <a> · Maybe <m> · Skip <s> (skip <pct>%).
- **Gates fired:** <which liveness/time_fit gates, and whether any were false>.
- **Verified vs inferred:** <which signals were records vs defaults/heuristic>.
- **Open / not built:** <TODOs still open>. Not committed / private outputs gitignored.
```

## Provenance

Consolidates `recipes/gig-scan.md` + `recipes/gig-score.md`; scorer adapted from
`scripts/score/role-scorer.mjs` (book Ch.11). Governed by `SNICKERDOODLE.md`.
