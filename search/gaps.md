# search/gaps.md
# Gap analysis: attested resume.json vs. target role requirements
# Target: Data Engineer / Analytics Engineer — SOC 15-1242 / 15-2041
# Last updated: 2026-06-25

---

## Gap Table

| Gap | Evidence the target demands it | What I have | Plan to close it |
|-----|-------------------------------|-------------|-----------------|
| **dbt (data build tool)** — proficiency in model writing, testing, documentation, and incremental materialization | Appears in 80%+ of DE/AE job postings reviewed (Cotiviti, Paylocity, Moda Health, Experian); O*NET 15-1242 lists ETL/transformation tooling as core; Analytics Engineer roles almost universally require dbt as primary skill | Listed on resume but no shipped project demonstrating dbt models, tests, or docs; only indirect exposure through pipeline work | Build and publish a standalone dbt project on GitHub: minimum 5 models, schema tests, documentation, and one incremental materialization. Gap closes when the repo is live and linkable on resume. |
| **A/B testing and statistical inference** — designing experiments, computing sample sizes, interpreting p-values and confidence intervals | Appears consistently in Data Analyst postings (Perpay, CVS/Aetna, Apple Finance analytics roles); O*NET 15-2041 lists statistical analysis as a core task; DA roles at product companies treat this as table stakes | No shipped project or work experience demonstrating A/B test design or statistical inference; weakest area across DA and BI target roles | Complete one end-to-end A/B test case study: define hypothesis, compute sample size, simulate or use real dataset, interpret results, publish writeup on GitHub or Medium. Gap closes when a concrete artifact exists that can be linked. |
| **SQL under interview conditions** — window functions, CTEs, performance optimization, query writing without IDE assistance | Every DE/DA/AE interview loop includes a live SQL screen; LeetCode Medium-Hard window function problems appear in reported interview questions for target companies | Strong conceptual SQL foundation; LeetCode Easy problems underway (Rising Temperature, self-JOIN, LAG); Medium-level window functions not yet consistently solved under time pressure | Continue structured 30-day LeetCode plan at 5 problems/day, progressing from Easy to Medium by week 3. Gap closes when 20+ Medium SQL problems solved consistently without hints, verified by LeetCode submission history. |
| **Databricks / Delta Lake production usage** — Unity Catalog, Delta Live Tables, production job scheduling | Databricks appears in 60%+ of DE postings at mid-large companies; O*NET 15-1242 lists distributed computing platforms as required; several target companies (Cotiviti, Experian) list it explicitly | Used Databricks in Food Safety Inspection Analytics project (Medallion architecture, 1M+ records); exposure is academic, not production-scale with Unity Catalog or Delta Live Tables | Extend Food Safety project or build a new pipeline using Delta Live Tables and Unity Catalog on Databricks Community Edition. Gap closes when a project demonstrating production-pattern Databricks usage (DLT, expectations, job scheduling) is published. |
| **Kafka / real-time streaming** | Shows up in most mid-level DE job postings I've been applying to, it's becoming a standard expectation for data engineering roles. Appears in DE postings at Experian, NYL, and Cotiviti reviewed in June 2026; O*NET 15-1242 lists real-time data processing under advanced skill set. | I have zero exposure, I don't know what it does, how it works, or how to use it in a project. | I am planning to start with the basics, understand what Kafka is and why it's used, then build a producer-consumer pipeline streaming a real dataset into Postgres or Snowflake. Gap closes when a working project with README is published on GitHub and linkable on my resume. |


---

## Required Edits Checklist

- [x] **Killed row — Cloud infrastructure as code (Terraform / CDK):** "I killed this row because the agent inferred it from cloud-specialist and senior-level DE postings; none of my actual mid-level DE/AE target postings list Terraform or CDK as a requirement — it appears only in Cloud Data Engineer or Staff-level roles outside my current target band."

- [x] **Rewrote one row in my own words:** Kafka / real-time streaming row rewritten in my own voice.


