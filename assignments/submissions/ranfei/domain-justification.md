# Domain Justification — case-ds-faang-opt-runway-ranfei

## Who Uses This Mode and When

An international MS or PhD student in Data Science or ML who has activated F-1
OPT and has 12–18 months before the next H-1B cap-subject filing deadline. They
are targeting FAANG-tier companies (Google, Meta, Amazon, Apple, Microsoft and
comparable scale) because those companies have public reputations for
sponsoring international workers.

The moment of use: the student has 10–20 DS/ML postings from LinkedIn or
Levels.fyi and needs to triage before spending 8–12 hours per application.
The question is not "should I apply to tech?" It is: "of these specific roles,
which ones have the combination of real sponsorship history, a live posting, and
a realistic filing timeline given my OPT clock?"

## Information Asymmetry Addressed

**Asymmetry 1 — Company-level vs. role-level sponsorship.**
A student can see that Meta sponsors H-1B. What they cannot see is that Meta's
approval rate for SOC 15-2051 (Data Scientists) differs from its rate for
SOC 13-2031 (Business Analysts), and that some DS roles in non-engineering
business units are filed under the lower-tier code. The 80 Days sponsorship
dataset surfaces company-level history by SOC group; the recipe makes the
student set `sponsorship.tier` from that data rather than from the company's
general reputation.

**Asymmetry 2 — Year-1 H-1B filing policy.**
Large tech companies vary in whether they file an H-1B petition in the
employee's first year or wait until year two. For a student with 14 months of
OPT remaining, this difference determines whether they can make the April
lottery at all. This policy is never stated in job postings. The recipe
surfaces it via `timeline.factor` — and it honestly labels that field
`your-input` until `lca-filing-lag.py` is built, because the data gap is real
and should not be hidden.

## Connection to Engine Layers

- **80 Days to Stay:** `sponsorship.p` and `sponsorship.tier` come directly
  from `data/80-days-to-stay/h1b-sponsors.csv`. This is the primary data layer
  for triage.
- **Job-Ops:** `liveness.factor` comes from `npm run ats:liveness`. A closed
  gate (liveness = 0) zeroes the composite regardless of sponsorship strength.
  Apple's posting scored 0 in the worked run because of this gate — not because
  of weak sponsorship history.
- **Cognitive Pivot:** SOC cognitive-demand scores are recorded in
  `role_quality.p` from `data/BLS/occupational-employment-stats.csv`. The
  current scorer config sets `role_quality` weight to 0 (a documented [VERIFY]
  item), so this layer does not yet affect the composite. The recipe preserves
  the field for auditability and flags the gap.

## Failure Modes

**Failure Mode 1 — Stale sponsorship data produces a false GREEN for a frozen
company.**
The H-1B dataset lags 12–18 months. A company that sponsored 1,800 DS roles in
2022–2023 may have imposed a sponsorship or headcount freeze in 2025 that is
not in the data. The recipe would score that company's sponsorship as "proven"
and potentially recommend Apply. The error is hardest to catch for students
who are new to following a company's recent trajectory — they see the historical
counts and treat them as current policy. The liveness gate is a partial
mitigation (frozen reqs are a leading indicator of hiring pauses), but a live
posting does not confirm active sponsorship intent.

**Failure Mode 2 — Silent zero from malformed input overstates the skip
signal.**
The scorer does not validate input schema. If a student assembles `roles.json`
with flat fields (`"liveness": true`) instead of the required nested objects
(`"liveness": { "factor": 1.0, "source": "record" }`), the scorer returns
composite 0 and recommends Skip for every role — with no error or warning. A
student who does not read the source code would not know why all roles scored
zero, and might incorrectly conclude that none of the companies are worth
pursuing. This error is hardest to catch for students who are not comfortable
reading JavaScript source code. The fix is a pre-flight validation script, which
this recipe proposes but does not yet implement.
