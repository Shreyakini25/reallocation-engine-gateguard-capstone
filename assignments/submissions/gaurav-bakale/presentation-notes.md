# 5-Minute Presentation — `freelance-gig-triage`

*Show-and-tell. No slides needed — have the mode file (`recipes/freelance-gig-triage.md`) and a
terminal (`npm run gig:score -- data/upwork/gigs.remotive.evidence.json`) open. Hit all four
rubric points: domain · asymmetry · one thing learned from running · one honest limitation.*

## 0:00 — The situation (who it's for)
- I built this for **me**: an OPT/MS student who can ship small AI-assisted builds (landing pages,
  Postgres schemas, LLM-agent glue) and wants freelance income — but has **~10 hrs/week and only so
  many proposals** before bidding becomes a second job.
- The scarce resource isn't skill, it's **bidding bandwidth**. The mode reallocates it.

## 1:00 — The information asymmetry
- Four things decide if a proposal pays off, and **none are visible on the listing**:
  can AI actually finish this? · will the client pay? · is it still open or already flooded? ·
  is the deadline feasible?
- So you bid **blind**, and effort flows to the loudest gig, not the winnable one. The mode makes
  each signal explicit; **liveness and deadline are hard gates, not votes.**

## 2:00 — Show it run (live terminal)
- `npm run gig:score -- data/upwork/gigs.remotive.evidence.json` → the Apply/Maybe/Skip table.
- Point at one row's **audit trace**: `ai_fit·0.45 + pay·0.30 + client_trust·0.25 × liveness × time_fit`.
  Every recommendation is explainable term-by-term — that's the whole point.

## 3:15 — One thing I learned from running it
- I ran it on **10 real Remotive gigs → Apply 7 · Skip 3**. In my justification I had *predicted*
  two failure modes — and the run produced **both**:
  - it **Applied** "Head of Sales" and "QA Rater" (the `ai_fit` heuristic false-positive), and
  - it **Skipped 3 legit Data Analyst gigs** on a **false 0-day deadline** (parser tripped on
    "immediately" in boilerplate).
- The lesson: **predicting a failure mode doesn't prevent it.** The audit trace is what let me
  *catch* it instead of trusting the green "Apply."

## 4:00 — One honest limitation (what it cannot verify)
- On a source like Remotive with no client stats, **`client_trust` and `liveness` are neutral
  defaults** — so a "five-signal" score is really `ai_fit + pay` in a trenchcoat.
- It **cannot verify the two things it most needs** — will they pay, is it still live — from that
  source, and `ai_fit` is a keyword heuristic, not a real read. Honest stage: **RUNNABLE-SAMPLE**;
  next it needs a source that exposes trust/liveness (Upwork) and a real Claude `ai_fit` judgment.

## 4:45 — Close
- The mode's value isn't a perfect score — it's that it makes the **verified/inferred boundary
  visible**, so I skip the fluent-but-wrong "Apply" instead of bidding on it.

_Timing check: ~15s buffer. If short on time, cut the 2:00 demo details, keep 3:15 + 4:00 (the
learned-thing and the limitation are where the points are)._
