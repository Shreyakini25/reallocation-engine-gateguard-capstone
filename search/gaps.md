# search/gaps.md

**Target:** Data Engineer / data-platform & infrastructure roles
**SOC:** 15-1243 Database Architects (primary) · 15-1242 Database Administrators (secondary)
**Drafted:** 2026-06-23 — agent draft from `data/bls/compact/soc_occupation_compact.csv` + my attested `resume.json`. My required edits are recorded at the bottom.

The distance between what this target role demands (O*NET skill/ability levels for 15-1243, job zone 4, and its alternate titles) and what my attested record currently evidences.

| Gap | Evidence the target demands it | What I have | Plan to close it (verifiable output) |
|-----|-------------------------------|-------------|--------------------------------------|
| Owning a data platform's architecture end-to-end | 15-1243 description: "Design strategies for enterprise databases, data warehouse systems… Create and optimize data models for warehouse infrastructure." This is *design ownership*, not just implementation. | I built/ran pipelines at Tesla, IBM, Nielsen (implementation). My one schema-design project (E3) was a **5-person team** and my IPL project followed a tutorial — neither is solo architecture I owned. | Ship a **solo** end-to-end data platform repo (ingestion → warehouse → serving) with a written design doc (schema choices, trade-offs) and README, by 2026-08-31. |
| Modern data-stack / infrastructure-as-code | Alt titles for 15-1243 include "Cloud Infrastructure Architect" and "Big Data Engineer"; **VERIFY against 3 real Data Engineer postings** for dbt / Terraform / Snowflake frequency. | AWS certs + S3/Redshift use at Nielsen. Docker & CI/CD are **coursework only** (per resume.json), no IaC tooling on the record. | Add Terraform + dbt to the platform project above: provision the warehouse with Terraform, model it with dbt, commit the repo with a passing CI run. |
| Production software rigor (tests, containers, CI) | `skill_programming_lv` 4.12/7 and job_zone 4 (considerable preparation) for 15-1243 imply production-grade code, not scripts. | Strong Python across 3 roles, but testing/CI/Docker evidence is coursework, not shipped. | Add unit + data-quality tests and a GitHub Actions CI pipeline to the platform repo; badge passing in the README. |
| Resume vocabulary aligned to data-platform roles | Alt titles: "Data Architect", "Big Data Engineer", "Cloud Infrastructure Architect" — my titles read "Data Engineer **Intern**" and "Data Analyst". | Real platform-adjacent work (Kafka + Spark streaming, Airflow, Redshift) described in generic terms. | Rewrite 3 resume bullets in data-platform/infra language, each mapped to real work and **checked against 3 live Data Engineer postings**, by 2026-07-15. |

---

## Required edits I made

### Row I killed (and why)

**Killed row — "Database administration & security: backup/recovery, access control, performance tuning of production DBs."**

Why it's wrong for me: this demand comes from my **secondary** SOC, 15-1242 *Database Administrators* (the "keep the database running" role), not the **Data Engineer / Data Architect** role I actually want (15-1243), which is about *building* platforms, not administering them. I'm not searching for DBA jobs, so treating DBA upkeep as a gap I must close would send my effort in the wrong direction.

### Row I rewrote in my own words

The agent wrote the first row as *"Owning a data platform's architecture end-to-end."* In my own words:

> Until now, almost everything I built, I built inside a company's system that was already designed by someone else, or in a school team where four other people shared the design, or by following a tutorial step by step. I have never started from an empty page and decided by myself how the whole data platform should look — the schema, where the data flows, what breaks when it grows. That is the real gap. It is not a skill I can take a class for; it is something I only close by building one full platform alone and defending every decision I made.
