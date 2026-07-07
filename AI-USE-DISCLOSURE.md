# AI Use Disclosure — Setup Exercise: Your Search's Personal Layer

**Course:** INFO 7375 — Computational Skepticism for AI
**Student:** Gaurav Bakale
**Date:** 2026-06-25

> Confirm the "What the AI could not do" instance below is true for you before submitting. If the
> course provides an official disclosure template / Canvas form, mirror these answers into it.

## Tools used
- **Claude Code** (Anthropic), model Claude Opus 4.8 — read my résumé data and drafted the `search/` layer.

## What the AI did (execution — extract / draft / format)
- Extracted `search/resume.json` from my structured résumé data (`~/Documents/resumes/master/`), as fields not prose.
- Drafted `search/profile.yml` (freelance-framed) and `search/gaps.md` (gap table with evidence) from my skills + my own scraped gig postings.
- Reconciled the repo's privacy guard so `search/resume.json` is committable while `private/` protections stay intact.

## What I did (judgment — attest / correct / sign)
- Ran the attestation pass on `resume.json`: corrected 3 over-statements (an inflated summary, three undefendable skills, an unverifiable project claim) and signed `attested: true`.
- Reviewed `profile.yml`; `weekly_availability_hours` and `budget_floor_usd` are mine to set/confirm.
- Killed one gap row (a market observation masquerading as a personal gap) and rewrote the top row in my own words in `gaps.md`.
- Answered the Step-4 verification questions honestly (see `logs/RUN_LOG.md`).

## What the AI could NOT do (the specific instance I had to catch)
The agent listed **RLHF fine-tuning, Computer Vision, and Multimodal AI** as my skills because they
appear in my master skills file. It had no way to know whether I can actually defend them in a
technical interview — I can't: my real work is LLM/agent orchestration, RAG, demand forecasting
(LSTMs), and a diffusion-based art bot, but I've never built an RLHF or CV system. Catching this
needed my knowledge of what I've *shipped*, not the agent's extraction of what I'd *listed*. (Same
limit on my employment months and the %/$ metrics — the agent can copy them but only I can vouch
that I can source them.)

## How I verified
- `node scripts/conformance.mjs search/resume.json search/profile.yml` → conforms (machine check).
- `npm run doctor` → no PII committed.
- Evidence in `gaps.md` traces to real Remotive posting URLs and to `scripts/score/gig-scorer.mjs`; anything I couldn't ground, I killed or moved to `private-notes.md`.
