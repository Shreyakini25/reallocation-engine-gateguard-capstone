# Domain Justification — Backend/AI-Infra Job-Ops Pipeline Integrity

## Who uses this, and in what exact situation

An international master's student on OPT, applying to backend and AI-infrastructure
roles at multiple companies simultaneously — small AI-infra startups (Fireworks AI,
Cartesia), mid-size product companies (Notion), and larger enterprises (Box) — at the
moment they are deciding whether a company is worth continuing to track, or whether a
stalled posting means the door is already closed. This is not a one-time check; it's
a recurring decision made across a dozen-plus companies during an active search, where
each wrong "keep waiting" costs OPT-clock time that cannot be recovered.

## What information asymmetry it addresses

The candidate cannot see what the company's recruiting team sees: whether a posting is
still being actively reviewed, whether it was ever a real requisition, or whether the
"Apply" button on a careers page even routes to a live pipeline. The company's public
careers page is marketing surface, not evidence — the actual state lives in ATS
metadata the candidate has no direct access to. This mode makes that gap partially
visible using each company's own ATS API (Greenhouse, Lever, Ashby), and — just as
important — makes visible where that visibility runs out.

## Connection to engine layers

This sits in the **Job-Ops** layer: ATS provider detection, posting liveness, and
pipeline tracking. It is deliberately narrow — it does not touch the 80 Days (Form
D/H-1B) or Cognitive Pivot (BLS/O*NET) layers. Those layers answer "is this company
and role worth pursuing at all"; this mode only answers "is the evidence pipeline for
this specific posting trustworthy right now."

## Failure modes specific to this domain

**1. Silent platform-coverage gap presenting as "not found."** `detect-ats.py` only
checks Greenhouse and Lever. When a company is actually on Ashby — common at
AI-infra and SaaS startups specifically, which is exactly the company profile this
student is targeting — the tool returns `not_found`, which looks identical to "this
company has no real hiring pipeline." Confirmed in this run: Notion and Cartesia
both returned `not_found` from `detect-ats.py`, but both are verifiably on Ashby
(`jobs.ashbyhq.com/notion`, `jobs.ashbyhq.com/cartesia`) and returned real postings
once manually configured. **Shape of the error:** a false negative disguised as a
definitive answer, not an "I don't know." **Hardest to catch by:** a student relying
on the tool exactly as documented, who has no independent reason to suspect a
platform the script doesn't even list as an option — the tool never signals that
Ashby exists and was skipped.

**2. Liveness false negatives on non-standard ATS structures.** The liveness checker
returned `expired` — with a specific stated reason, "insufficient content — likely
nav/footer only" — for a Box posting that was independently confirmed live via web
search moments earlier. Box's careers site is JS-rendered and run on a vendor
("Happydance") outside the three supported providers. **Shape of the error:** this is
worse than a missing answer, because the tool returns a confident, reasoned-sounding
verdict (`expired`, with evidence) that is simply wrong. **Hardest to catch by:** a
student under time pressure who treats "expired, insufficient content" as
self-evidently correct, since the message reads like a genuine content-based finding
rather than a platform-coverage limitation — there is nothing in the output that says
"this ATS is untested."

Both failure modes share a root cause: the tool's confidence in its own output does
not degrade at the edges of its coverage. This mode's phase gates exist specifically
to catch that.
