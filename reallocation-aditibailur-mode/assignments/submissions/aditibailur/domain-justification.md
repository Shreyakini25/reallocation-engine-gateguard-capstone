# Domain Justification — ML Engineering Sponsorship Triage

## Who uses this mode and when

An international MS student in Computer Science or Data Science targeting ML
Engineering / Data Science roles, whose OPT authorization expires within 12 months.
The time pressure is the key variable: every application to a company with no real
sponsorship history or no live ML hiring is time that should have gone to a company
that actually hires international candidates in this role family.

## What information asymmetry it addresses

**Gap 1 — Sponsorship visibility at the title level, not just the company level.**
The 30,369-company master file has H-1B approval data for only 1,552 companies. Of
those, only 150 show ML/Data-Scientist/ML-Engineer titles in their sponsorship
history (confirmed directly from `top_job_titles_sponsored` — a real run, not an
estimate). A student cannot see this breakdown by browsing job boards; a company can
have sponsored H-1B workers for years without ever having sponsored a technical role
in the student's target family.

**Gap 2 — Funding recency vs. hiring reality.** Running the H-1B×Form D join for
real surfaced how rare the overlap actually is: of 150 ML-titled sponsors, only 3
also filed Form D funding in the most recent quarter (Fiddler Labs, Imperative Care,
Surgical Safety Technologies). This is a much smaller, and much more useful, signal
than either dataset alone — most H-1B sponsors are not recently funded, and most
recently-funded companies have no H-1B history yet.

**Gap 3 — Posting liveness is invisible without checking.** Running ATS detection on
the 3 real Form D/H-1B matches returned `not_found` on Greenhouse and Lever for all
three. A student cannot infer this from a company's funding or sponsorship history
alone — a strong sponsor with a recent funding round can still have zero discoverable
open roles through the two most common ATS platforms.

## Connection to the three engine layers

**80 Days to Stay:** Signals 1 and 2 (H-1B approval filter, Form D recency) run
directly against the engine's core company dataset and processed SEC quarters.

**Job-Ops:** Signal 5 (ATS detection) runs `detect-ats.py` against the shortlist to
confirm — or, as it did here, disconfirm — that a company has a discoverable live job
board through the platforms this script checks.

**The Cognitive Pivot:** Signal 3 pulls BLS/O*NET cognitive-pivot scores for the
target SOC codes. Running the real extraction script surfaced that the score is only
reliably available at the detailed O*NET sub-occupation level for two of the three
target codes — a genuine gap in how cleanly this layer maps onto SOC-code-level
filtering, not something visible from the earlier paper design.

## Failure modes

**Failure 1 — H-1B history is company-level in aggregate, but title-level filtering
still under-covers.** The `top_job_titles_sponsored` field is a snapshot of past
sponsored titles, not a guarantee of future sponsorship for a *new* title or a *new*
hire. A company that sponsored one "Senior Software Engineer" three years ago passes
the filter even if it has since stopped sponsoring technical roles entirely. This is
hardest to catch for a student with no network contact at the company — they have no
way to confirm the sponsorship pattern is still active, and the mode has no time-decay
weighting on `Total Approvals` to flag this.

**Failure 2 — ATS non-detection is ambiguous between "not hiring" and "uses a
different platform."** All three real test companies returned `not_found`, but the
script only checks Greenhouse and Lever with a guessed URL slug. A company could be
actively hiring through Ashby, Workday, or a custom careers page and still show as
`not_found` here. This failure is hardest to catch for a student relying on this mode
as a hard filter — a false negative here could eliminate a genuinely live, sponsoring
employer from the shortlist entirely, which is a more costly error than a false
positive would be.
