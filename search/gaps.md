# search/gaps.md — the delta between my record and my freelance target

> Agent-drafted, then edited by me (INFO 7375 setup exercise). The gap is between what
> `resume.json` proves and what winning AI-doable freelance build gigs (`web · database · data-ml`)
> actually demand. Every gap cites checkable evidence — a real posting, a pattern across postings,
> or the gig-scorer's own logic. Feelings go in `private-notes.md`, not here.

| # | Gap | Evidence the target demands it | What I have | Plan to close it (a shippable output) |
|---|-----|--------------------------------|-------------|----------------------------------------|
| 1 | I have no freelance footprint a client can see | Every platform (and the scorer's `client_trust` weight, 0.25) ranks unknown freelancers below ones with reviews / a Job Success Score; the two real senior-independent postings I found ([remotive 1919266](https://remotive.com/remote-jobs/software-development/senior-independent-ai-engineer-architect-1919266), [1919265](https://remotive.com/remote-jobs/software-development/senior-independent-software-developer-1919265)) expect a track record I can point to | ~5 years of strong full-time engineering — but **nothing visible on a freelance profile**: no reviews, no public client work | Take 1–2 small fixed-price gigs at a low intro rate purely to earn my first 2–3 reviews, then raise rates → **closes when I have a rated, completed gig public on a platform** |
| 2 | No packaged public portfolio for web/build gigs | Build gigs ask for a live demo / portfolio link (pattern across web build gigs, e.g. the "React demo landing page" gig type in `gigs.sample.json`) | GuitarZero (live: guitarzero.vercel.app) + PulseFrame — not packaged for clients | Ship a one-page portfolio linking GuitarZero + 2 mini case studies → **a published portfolio URL** |
| 3 | Limited weekly availability vs fast-turnaround gigs | `time_fit` is a hard gate in the scorer; many build gigs want < 3-day delivery | ~10 hrs/week (full-time MS student + job search) | Pre-build reusable starters (landing-page template, Postgres-schema generator, RAG/agent boilerplate) → **a reusable template repo** that cuts delivery time |
| 4 | No freelance pricing / positioning history | Clients gauge rate by track record; `budget_floor_usd` in profile.yml needs justification | Full-time comp benchmark ($170–220k) but no freelance rate proof | Set an intro rate + collect 1 testimonial from a first delivered gig → **a rate card backed by 1 delivered gig** |

## Step 3 — my two required edits

**(a) Killed row.** I deleted the original "free-board data-ml demand is labeling/rating, not senior
LLM builds" row. **Why it was wrong:** that describes *which platforms I should search*, not a gap in
*my own evidence* — it's a channel-selection note, so it belongs in strategy/private-notes, not the
gap table. (Removing it also stops me pretending a market observation is a personal shortfall.)

**(b) Rewrote a row in my own words.** Row 1 above is my rewrite of the agent's "no freelance-platform
track record / client reviews" row — restated as my real situation: I'm not short on engineering
ability, I'm short on *visible proof on a freelance profile*, and the fix is to trade a couple of
cheap early gigs for reviews rather than to "learn a skill."

---
_Evidence is checkable: posting links are live Remotive URLs from my own scan; the scorer claims
(`client_trust` weight, `time_fit` gate) are in `scripts/score/gig-scorer.mjs`; the "demo/portfolio"
demand is a pattern across the web build-gig fixtures._
