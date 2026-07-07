# Domain Justification — case-de-da-live-skill-gap

**Mode:** `case-de-da-live-skill-gap`
**Author:** Komal Khairnar
**Date:** July 2026

---

## Who Uses This Mode and When

An MS Information Systems student at Northeastern University on F-1 OPT with a 3-year STEM
extension window. She is targeting Data Engineer (SOC 15-1242) and Data Analyst (SOC 15-2041)
roles across the US and has 8 weeks before her OPT start date.

The exact trigger: she has a list of skills she could invest time learning before job searching
begins in earnest — dbt, Airflow, Spark, Kafka, Scala — and no reliable way to know which one
unlocks the most real opportunities at companies that will actually sponsor her H-1B. Generic
advice says "learn Python and SQL." That advice does not tell her which skills appear in live
job descriptions at companies with verified sponsorship history right now.

---

## What Information Asymmetry This Mode Addresses

The job-search advice market is saturated with skill recommendations based on surveys, blog posts,
and aggregated job boards. None of those sources answer the specific question this student faces:

> "Which skill should I learn in the next 8 weeks to maximize my qualified applications at
> companies that have verified H-1B sponsorship history for DE/DA roles and are actively hiring
> right now?"

Without this mode, she cannot easily see:

- Which of her 30K+ potential target companies have verified H-1B approval history specifically
  for Data Engineer or Data Analyst titles — not just any title
- Which of those companies have live DE/DA postings open today — not last month, not aggregated
  from a stale job board
- Which skills appear most frequently across those live postings — extracted from actual job
  descriptions, not inferred from surveys
- Whether those skills are cognitively demanding (automation-resistant) or execution-heavy work
  that AI tools are already replacing

The asymmetry is not that the data does not exist — it is that it lives in four separate places
(DOL disclosure data, SEC Form D filings, ATS public APIs, BLS O*NET tables) that no single
tool combines. This mode combines all four in one run.

---

## How It Connects to the Engine Layers

**80 Days to Stay layer:**
The mode begins by filtering the 30K+ company dataset to verified H-1B sponsors with 50 or more
approvals and a Data Engineer or Data Analyst title in their sponsorship history. This immediately
removes companies that sponsor broadly but not for her specific target roles. The same dataset
provides H-1B approval rate, latest funding stage, funding date, and median salary per company —
so the student can see both sponsorship reliability and company financial health in one place.

**Job-Ops layer:**
For each verified sponsor, the mode hits the Greenhouse and Lever public APIs to fetch live job
listings. This is a liveness check at the company level — not just whether a specific URL is
alive, but whether the company is actively hiring for DE/DA roles today. Companies that return
no results are logged in Sheet 4 (Not Found) and excluded from the skill count rather than
silently treated as zero-demand employers. The script also fetches full job description text
from the Greenhouse detail endpoint and Lever's `descriptionPlain` field, so skills mentioned
in the body — not just the title — are captured.

**Cognitive Pivot layer:**
Every skill extracted from live job descriptions is assigned a cognitive demand tier based on
BLS O*NET skill elements for SOC 15-1242. HIGH tier means the skill is associated with systems
design, causal reasoning, and architectural judgment — work AI cannot yet reliably replace.
LOW tier means execution-oriented work with high automation substitution risk. This filter
prevents the student from investing 4 weeks learning Tableau (LOW, 11 appearances) when dbt
(HIGH, 11 appearances) unlocks the same number of roles but in work that will be more valuable
in 3 years.

---

## Failure Modes

**Failure Mode 1 — Silent Workday gap**

Many large DE employers use Workday exclusively — Databricks, CVS Health, Experian, Snowflake,
Google, JPMorgan. Workday has no public JSON API. The mode correctly logs these companies in
Sheet 4 (Not Found), but a student reading only Sheet 1 (Skill Rankings) could draw the wrong
conclusion: that the skill ranking represents all strong H-1B sponsors, when in fact it
represents only those on Greenhouse or Lever.

In the live run for this submission, 9 of 15 target companies (60%) returned not found —
including every original target company (Databricks, CVS Health, Experian, Cotiviti, Moda
Health, Snowflake, Coursera). The skill ranking was produced entirely from Airbnb, Stripe,
Figma, Squarespace, Amplitude, and Brex.

This is hardest to catch for students targeting large enterprise employers or healthcare
systems, who would not recognize that their most-wanted companies are entirely absent from
the ranking. The fix is Workday scraper support, marked [TODO] in the mode file.
