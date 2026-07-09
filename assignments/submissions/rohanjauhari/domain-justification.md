# Domain Justification — AI / Agentic PM, OPT Runway

**Who uses this mode and in what exact situation**

An international MS student graduating in August 2026, on F-1 OPT beginning
September 2026 (12-month window; STEM OPT extension confirmed, adding 24
months), targeting AI product manager or agentic product lead roles at
early-stage US startups (seed / Series A), with a hard requirement for H-1B
employer sponsorship. No existing US employer relationship. OPT unemployment
ceiling is 90 days; target buffer is 80 days.

**The information asymmetry this mode addresses**

The structural problem for this student: the roles with the highest ownership
scope and the best PM learning environment — first PM at seed / Series A AI
companies — are the same companies with the least H-1B sponsorship
infrastructure. Early-stage companies routinely hire for PM roles without
anticipating visa costs, have no prior LCA filings, and often haven't set up
the legal infrastructure needed to sponsor a cap-subject H-1B.

Without the engine, the student cannot easily see:
- Which early-stage AI companies have a documented LCA / H-1B filing history
  (available in `data/80-days-to-stay/`) versus which are flying blind on
  sponsorship
- Which postings are live versus ghost-posted (ATS liveness layer)
- Whether the PM role category itself (SOC 11-2021.00) has a strong enough
  cognitive-pivot score to be resilient as AI continues to absorb routine
  analytical work — or whether it is a role that will be commoditized before
  the H-1B window closes

The engine makes all three signals visible in one scored output per role,
with every term sourced to a record, a model judgment, or the student's own
verified input.

**Connection to engine layers**

- **80 Days to Stay:** Primary gate. Sponsorship tier is derived from the
  company's LCA history in `data/80-days-to-stay/`. A company with no record
  scores tier=None, which zeroes the composite through the scorer's gate.
- **Job-Ops:** Liveness gate. A closed posting cannot yield an Apply regardless
  of how good the sponsorship and fit signals look. `ats:liveness` would check
  this automatically; pending playwright installation, it is a manual gate.
- **Cognitive Pivot:** Role-quality context. SOC 11-2021.00 (the O*NET code
  covering product managers) scores 3.974 on the cognitive pivot index — above
  the 3.5 threshold that marks roles where AI substitution risk is low because
  the work is judgment- and strategy-heavy. This matters for a student choosing
  between PM and adjacent technical roles: the PM track is more resilient to
  AI commoditization than, say, data analyst or technical program manager.

**Failure modes specific to this domain**

1. **Absence-of-record interpreted as non-sponsor.** A seed-stage company that
   is genuinely willing to sponsor but has never filed an LCA before will have
   no record in the 80-days dataset. The scorer correctly gates it to Skip. The
   failure mode is that a student takes this as a definitive "no" and walks
   away from a company that would have sponsored on request. The student most
   likely to miss this is the one who treats the score as a final answer rather
   than a triage input. The fix is the sponsorship audit step (Step 5 in the
   recipe): if a company looks right in every other dimension but has no
   80-days record, the student's next action is to ask the hiring manager
   directly before skipping. An absence of record is evidence, not proof.

2. **Sponsorship tier assigned from model-judgment rather than record.** The
   student building the run envelope assigns a company a tier=Likely based on
   general knowledge ("they hire international people") without checking the
   actual CSV. The scorer runs, returns Consider, and the student applies. The
   application reaches offer, the company declines to sponsor, and three weeks
   of OPT time have been used. The student hardest to catch this: one who reads
   "Likely" as "verified" because the term sounds confident. The recipe's
   attestation table explicitly lists the source field for every sponsorship
   assignment — model-judgment must be labeled as such and the student must
   verify against the CSV before acting on Consider recommendations from a
   Likely-tier company.
