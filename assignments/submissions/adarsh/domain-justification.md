# Domain Justification — opt-clock-backend-triage

## Who Uses This Mode and In What Exact Situation

An F-1 international student graduating in August 2026, with OPT starting September 2026. Targeting backend SWE roles (SOC 15-1252) at product-based companies. Requires H-1B sponsorship. Has 90 unemployment days before OPT is invalidated, with a personal buffer target of 80 days.

## What Information Asymmetry It Addresses

A standard job search scores roles by fit and sponsorship history. What it cannot easily show: whether a company's hiring pipeline is fast enough to produce an offer before the OPT unemployment clock runs out.

Without this mode, an F-1 student cannot easily see:
- Which companies have hiring pipelines shorter than their remaining unemployment budget
- Whether a high-fit role at a slow-hiring company is actually a bad first application given the clock
- Which roles to apply to first vs. which to defer based on timeline risk

## How It Connects to the Engine Layers

80 Days to Stay: sponsorship gate — companies with no H-1B history are skipped regardless of fit or timeline.

Job-Ops: liveness gate — dead postings are skipped before any scoring runs.

Cognitive Pivot: SOC 15-1252 skill alignment — backend SWE roles scored against BLS cognitive demand data to identify roles resilient to AI substitution.

## Failure Modes

Failure mode 1: estimated_days_to_offer is a human judgment, not a data-derived field. The mode cannot verify pipeline speed from any existing dataset — it relies on the student's own research. A student who enters optimistic pipeline times will get Apply recommendations for roles they cannot realistically close in time. This failure is hardest to catch for a student who has never gone through a full interview process and has no baseline for how long pipelines actually take.

Failure mode 2: AnonymousStartup with sponsorship p=0.0 scored Consider (0.251) instead of Skip in the worked run. The sponsorship hard gate only fires when the profile flag requires_sponsorship is explicitly passed to the scorer. Without that flag, the scorer treats sponsorship as a weighted vote rather than a gate. A student who runs the scorer without a profile file will get misleading Consider recommendations for companies that cannot legally hire them.
