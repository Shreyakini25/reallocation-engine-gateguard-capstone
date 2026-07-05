# Domain Justification — h1b-sponsorship-audit

## Who Uses This Mode and When

An MS Computer Software Engineering graduate (a US university,
May 2026) who began employment June 1, 2026 at an IT consulting firm as a
SAP Technical Consultant on post-completion OPT expiring July 2027.
STEM OPT extension eligibility pushes the window to approximately
July 2029, but H-1B lottery selection must occur before that deadline.

Every active mode in the engine addresses the pre-offer phase. Once
the offer is accepted, the engine has nothing for you. This mode fills
that gap — the visa problem does not end with the offer letter, it
restarts on a new clock with higher stakes.

## What Information Asymmetry This Mode Addresses

Knowing a company "sponsors H-1B" is not the same as knowing they win
petitions reliably, at the right wage level, for your specific SOC code.
Four things remain invisible after you accept an offer:

1. **Approval_Rate.** Consulting firms file high volumes but face higher
   denial rates than direct-hire product companies, especially for SOC
   15-1252. Publicly circulated sponsor lists show Total Approvals counts
   — not denial rates.

2. **Wage level risk.** Petitions at Level I or II face greater USCIS
   scrutiny. Consulting firms placing contractors often certify at lower
   levels. This distribution is buried in DOL LCA Excel files most
   students never open.

3. **SOC code mismatch.** The employer picks the SOC code for the
   petition. It may not match the student's actual work. The student
   typically does not see the LCA until shortly before filing.

4. **Backup option decay.** Once employed, job scanning stops. If a
   sponsorship problem surfaces 12–18 months later, the backup list
   is stale.

## Connection to the Three Engine Layers

**80 Days to Stay** — `SEC_DOL_H1b_data_mapped.csv` is the primary
source for employer H-1B presence (`Total Approvals`, `Approval_Rate`,
`median_salary_offered`) and for building a backup employer list.
The `-audit.md` confirms H-1B data covers only ~5.1% of companies —
a known gap the mode states explicitly.

**Job-Ops** — `detect_ats.py` and `npm run ats:liveness` are
repurposed from active application tracking to passive monthly
monitoring of 10–15 backup employers. The student is not applying —
they are maintaining situational awareness.

**Cognitive Pivot** — `soc_occupation_compact.csv` (1,016 occupations,
OEWS 2024) provides `cognitive_pivot_score` for target SOC codes.
A consulting firm places you where client demand dictates. The score
tells you whether your placement is building AI-resilient skills
(architecture, integration design, scores 7–9) or substitution-
vulnerable ones (configuration, ticket resolution, scores 3–5).

## Failure Modes

**Failure 1 — Missing record misread as a clean signal.**
If an IT consulting firm does not appear in the mapped CSV, a student
may panic or wrongly conclude no sponsorship problem exists. The
audit confirms only 5.1% coverage. Absence means missing data, not
missing sponsorship. Hardest to catch for students new to the dataset
who treat a null grep result as a negative result.

**Failure 2 — Wage level suppression invisible until filing.**
Without `SCRIPTS/lca/fetch_lca_employer_summary.py` (not yet
implemented), the student must manually download a 40MB DOL Excel
file to see that a large share of filings are at Level I/II. If they
skip this step, they will not know their petition is at RFE risk until
it is already in process. Worst for students in their first H-1B cycle
with no prior experience.
