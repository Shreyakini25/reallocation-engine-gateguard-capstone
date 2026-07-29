# Domain Justification — case-nlp-ml-sponsorship-triage
**One page or less · Wenhan Cheng · 2026-07-04**

---

## Who Uses This Mode and When

An international CS graduate student at Northeastern University (San Jose),
F-1 OPT, STEM extension eligible, program ending 2026-08-19. Targeting
Software Engineer (AI Platform / Backend) roles requiring H-1B sponsorship.
The student has hands-on LLM integration experience (RAG pipelines, dual-LLM
classification, vector search) from a current internship but has not yet
started OPT. Every application hour spent on a company that does not sponsor
is an OPT unemployment day that cannot be recovered.

## Information Asymmetry Addressed

Two ML job postings look identical on the surface. One company (Databricks)
has 1,640 H-1B approvals at 99.51% for software engineering roles and
$1.07B in funding as of September 2025. Another company in the same search
results has zero H-1B history and funding that expired in 2021. The student
reading LinkedIn cannot distinguish these cases without the engine.

The asymmetry has three layers this mode addresses:

- **Sponsorship history** (80 Days layer): aggregate approval counts per
  company are not visible on any job board. The SEC/DOL mapped dataset
  makes them queryable in seconds.
- **Funding recency** (80 Days layer): a company's financial runway
  affects its ability to file H-1B petitions, which cost $5,000–$10,000
  each. Stale funding is a proxy for reduced sponsorship capacity.
- **Posting liveness** (Job-Ops layer): the ATS scan and liveness check
  confirm whether a specific URL still has an active apply control —
  eliminating ghost postings before application effort begins.

## Engine Layer Connections

**80 Days to Stay**: Primary data source. H-1B approval history filtered
to SOC codes 15-2051, 15-1252, and 15-1211 — the codes that ML and
AI platform engineering roles are typically filed under.

**Job-Ops**: ATS scan finds which companies are actively posting via
Greenhouse, Lever, or Ashby. Liveness check confirms specific postings
are still open. Both are gates, not votes — an `expired` or `uncertain`
result stops the workflow, not adjusts a score.

**Cognitive Pivot**: BLS cognitive-pivot scores filter for roles with
high verification and system-judgment demand — work the labor-market
literature identifies as more resilient to AI substitution. For a student
planning a 2–3 year career arc around an H-1B cap lottery, role durability
matters as much as immediate sponsorship viability.

## Failure Modes

**Failure 1 — Historical approval rate masks current hiring freeze.**
The H-1B dataset shows past behavior. A company with a 99% approval rate
may have frozen international hiring in 2024. The mode's triage table will
still mark this company Pursue based on its record. This failure is hardest
to catch for students new to the US job market who treat approval rates as
guarantees. The mode names this gap explicitly in "cannot verify" — but a
student under OPT deadline pressure may skip that section and apply anyway.

**Failure 2 — SOC misclassification produces silent undercount.**
Many ML engineering roles are filed under SOC 15-1252 (Software Developers)
rather than 15-2051 (Data Scientists) in H-1B petitions, even when the
actual work is NLP or LLM infrastructure. A student filtering only on
15-2051 will undercount sponsorship history for companies that are actually
strong ML sponsors. The triage table looks complete — it has numbers in
every cell — but those numbers reflect only one SOC slice. This error is
invisible without cross-checking both codes, which the mode requires but
cannot enforce if the student skips the step.
