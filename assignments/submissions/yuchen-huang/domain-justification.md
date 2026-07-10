# Domain Justification: case-de-platform-cogpivot

**Author:** Yu-Chen Huang  
**Mode:** `case-de-platform-cogpivot` v0.1.0  
**Status:** RUNNABLE-SAMPLE

## Who uses this mode, and when

I am an international student on F-1 OPT. I want to work as a Data Engineer or Data Architect, especially on data platform and infrastructure (SOC code **15-1243**). I am looking mainly in the **San Francisco Bay Area** and **Seattle**. I need H-1B sponsorship, and I hope to get an offer before my OPT starts in **September 2026**.

I already have some pipeline and coursework experience, but I have not designed a full data platform by myself yet. So when I apply, I care about two things at the same time: (1) can this company sponsor me, and (2) is the role more platform/design work or mostly pipeline execution that AI may replace faster.

I use this mode **before** I spend time tailoring my resume or cover letter. I give it a company name (and a job URL if I have one), and it helps me decide if the company is worth my limited OPT time.

## Information asymmetry addressed

From job boards alone, I cannot easily see these three things:

1. **Sponsorship history is at company level, not job title level.**  
   A posting says "Data Engineer," but the company's H-1B data may show mostly "Software Engineer" filings and only one Data Engineer title. Or the company may have **no** H-1B history at all (about 94.9% of companies in the mapped dataset have empty H-1B fields).

2. **"Data Engineer" can mean two different career paths.**  
   Platform work (system design, architecture, standards) has a higher **cognitive pivot** score than pipeline-only work (ETL, warehouse maintenance). But both can use SOC 15-1243 and similar job titles. I cannot tell which type a posting is without checking evidence.

3. **Dead postings look like live ones.**  
   A company may be a strong sponsor in history, but the job link can already be expired. I could waste weeks on a role that is not really open.

This mode pulls **DE-filtered H-1B history**, **BLS pivot scores for SOC 15-1243**, and **posting liveness** together before I invest effort in an application.

## Connection to engine layers

| Layer | How my mode uses it |
|---|---|
| **80 Days to Stay** | I read `SEC_DOL_H1b_data_mapped.csv` for approval count, approval rate, median salary, and `top_job_titles_sponsored`, filtered to data-engineering keywords |
| **Cognitive Pivot** | I read `soc_occupation_compact.csv` for `cognitive_pivot_score`: 15-1243.00 Database Architects (**3.933**, more platform) vs 15-1243.01 Data Warehousing Specialists (**3.626**, more pipeline) |
| **Job-Ops** | I run `npm run ats:liveness` as a **gate**. If the posting is expired, the score goes to zero. Liveness is not a bonus point. |

I also use `npm run score` (Chapter 11) to get Apply / Consider / Skip with a clear label for each field: record, model-judgment, or your-input.

## Failure modes (domain-specific)

**1. SWE-heavy company passes my DE keyword filter.**

*What goes wrong:* DataStax lists `Software Engineer`, `Escalations Engineer`, and `Software Engineer - Data Platform`. My grep sees "Data Platform" and puts the company on the DE list. But most sponsored titles may still be SWE, not DE. I might think it is a DE-first sponsor without reading the title list carefully.

*Who catches this hardest:* Me, when I am in a hurry and only look at the company rank, not the actual title strings in the CSV.

**2. SOC-level pivot score used for a specific job posting.**

*What goes wrong:* I assign a pivot score from the 15-1243 SOC row, but a "Data Engineer II" at a small hardware company may be pipeline work, while the same title at a data platform company may be architecture work. The mode may say the role is more "durable" than it really is.

*Who catches this hardest:* Me, if I trust the BLS number like it came from the job description. It looks official, so it is easy to skip reading the JD.

## Honest boundary

I **did run** this mode on real repo data and scripts: H-1B grep filter, BLS lookup, `npm run score`, and `npm run ats:liveness`.

I **did not run** the `[TODO: DEV]` scripts for better DE title filtering or platform vs pipeline JD classification.

Also, the default scorer has **`role_quality` weight = 0**, so the cognitive pivot is verified from BLS but it does **not** change the final composite score yet. I report the pivot separately until that weight is decided.
