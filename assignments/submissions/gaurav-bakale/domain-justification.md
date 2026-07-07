# Domain Justification — `freelance-gig-triage`

**By:** Gaurav Bakale · **Mode:** `recipes/freelance-gig-triage.md` · 2026-06-25

## Who uses this, and in exactly what situation

An international MS/OPT student (or early-career developer) who can **ship small AI-assisted builds**
— landing pages, slide decks, Postgres schemas, scrapers/automation, LLM-agent glue — and wants to
earn on the side, but has **~10 hours a week** to spend and a limited number of proposals before it
becomes a full-time job in itself. Not "a freelancer": someone whose scarce resource is *bidding
bandwidth*, deciding each week which handful of postings out of dozens are worth a proposal.

## The information asymmetry it addresses

On a gig board, the four things that decide whether a proposal pays off are exactly the four things
you **cannot see from the listing**:

1. **Can AI actually finish this well?** The title says "build a landing page"; whether it's a
   two-hour Tailwind job or a three-week bespoke CMS is buried in prose.
2. **Will the client actually pay?** Payment-verified status, spend history, and reviews exist, but
   you have to hunt for them per gig — and on many boards they aren't shown at all.
3. **Is the posting even still live, or already flooded?** A gig with 50 proposals is effectively
   closed; the board still shows it as open.
4. **Is the deadline feasible for me?** Stated in prose, easy to misjudge under time pressure.

You bid **blind** on all four, so effort flows to the loudest listing, not the winnable one. The mode
makes each signal explicit and lets two of them (liveness, time_fit) act as **hard gates**.

## How it connects to the engine's layers

- **liveness** ← **Job-Ops** (ATS posting-liveness): "is this real right now?" reused as "open & not flooded."
- **client_trust** ← **80 Days to Stay** (H-1B sponsorship history = a *proven-payer* pattern): a client's
  spend/reviews are the freelance analog of "this employer has actually done it before."
- **ai_fit** ← **The Cognitive Pivot** (BLS/O\*NET labor-premium thesis): inverted — instead of "which
  work resists AI," ask "which work *is* AI-commoditizable enough that I can finish it well."
- **pay / time_fit** ← the budget signal and the visa-timeline gate, reused as budget-floor and deadline-feasibility.

## Failure modes specific to this domain (and who would miss them)

1. **The confident false-positive.** `ai_fit` is a keyword/category heuristic, so it rates
   non-build roles as high-fit when the text trips a trigger word — in the real run it marked
   *Head of Sales*, *QA Rater*, and *Freelance Writer* as **Apply**. **Hardest to catch for the exact
   user this is built for:** a new freelancer, eager to bid, who trusts a green "Apply" from a tool
   that *looks* rigorous. The fluency of the recommendation hides that the core vote is a guess.

2. **The silent false gate.** The deadline parser reads "immediately" / "today" in marketing
   boilerplate as a **0-day deadline** and Skips legitimate gigs (it wrongly gated three real "Data
   Analyst" postings). **Hardest to catch because a Skip is invisible** — you never see the gig you
   were talked out of, so the error leaves no trace unless you audit the skipped rows on purpose.
