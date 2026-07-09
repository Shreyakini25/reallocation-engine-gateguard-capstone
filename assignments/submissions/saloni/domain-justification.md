# Domain Justification — case-tpm-ai-infra-sponsor

**Author:** Saloni Angre · **Date:** 2026-07-04 · **Recipe version:** 0.1.0 · **Status reached:** RUNNABLE-SAMPLE

## Who uses this mode, in what exact situation

International F-1 graduate student with post-completion OPT filed and starting 15 September 2026, ending 14 September 2027 (STEM OPT extension eligibility contingent on employment at an E-Verify enrolled employer). Targeting **Technical Product Manager, Product Manager, or Program Manager** roles at **AI/LLM platforms, cloud infrastructure, or GPU/hardware computing companies**, primarily public but late-stage Series C acceptable. The user has approximately 12 months of standard OPT runway (Sept 2026 – Sept 2027) to secure a sponsoring employer whose H-1B petition can be filed in the April 2027 cap lottery.

This is not a mode for engineering-only candidates — the repo already has SWE-focused sponsorship modes (`case-fullstack-swe-sponsor-triage`, `case-nlp-ml-sponsorship-triage`, `case-data-ml-h1b-triage`). And it is distinct from `case-tpm-pivot.md`, which asks *"is this posting really a TPM role?"*; this mode asks the different question *"does this employer's sponsorship history cover TPM-family titles at all?"*

## The information asymmetry this mode addresses

H-1B sponsorship data at the company level hides a decision-relevant distinction: **companies sponsor per title, not per company.** A tech firm may have sponsored 400 Software Engineers over five years and never a single Product Manager. A company-level filter — "does this employer sponsor?" — returns green. The reality for a TPM candidate is that this company has never demonstrated it will sponsor someone in their role family.

Under the repo's own audit (`data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md`), the `SEC_DOL_H1b_data_mapped.csv` has a `top_job_titles_sponsored` free-text column that captures per-title history. That column exists in the data but is unused by any existing recipe — because every current recipe treats sponsorship as a company-level Boolean. This mode is the one that reads that column and filters by it.

Only 5.1% of the 30,369 companies in the CSV have any sponsorship data at all. That fact — 94.9% silent — is itself part of the asymmetry: the visible portion is small, and inside the visible portion the *title-level* distinction is invisible to any existing tooling.

## How it connects to the engine's three layers

- **80 Days to Stay (primary layer):** The mode is a workflow that reads `SEC_DOL_H1b_data_mapped.csv`. It uses the H-1B history for filtering and the SEC Form D funding recency (`latest_funding_date`) to prefer companies with fresh capital.
- **Job-Ops (via the liveness gate):** Every scored candidate must pass `npm run ats:liveness` on a specific posting URL before its composite score is trusted. A closed posting zeroes the composite regardless of sponsorship fit (demonstrated in the Ch.11 fixture's `ghost-posting` row).
- **The Cognitive Pivot (deliberately not used):** The mode currently sets `role_quality` weight to 0, matching the scorer's default. Role-quality scoring for TPM titles specifically is out of scope for this iteration; a future version could enrich this. Named as a limitation rather than pretended-away.

## Failure modes — specific to this domain

Two errors specific to the TPM/AI-infra situation, not generic ML-hallucination hand-waving.

### Failure mode 1: Title collision in `top_job_titles_sponsored`

**Shape of the error:** The CSV column is free text. A row that reads `"Product Marketing Manager, Software Engineer, Data Scientist"` would match a substring search for "Product Manager" and produce a false positive — a company recommended Apply for a TPM candidate whose only PM-title-family sponsorship was for marketing roles. The scorer trusts the `sponsorship: {p, tier, source: "record"}` field and has no way to know the underlying string was mismatched.

**Who would struggle most to catch this:** International candidates on their first US job search, who may not have internalized the distinction between Product Marketing Manager (a marketing role reporting into a CMO), Product Manager (a product-strategy role), and Technical Product Manager (a product role with engineering focus). Candidates with prior US industry exposure, or an insider referrer, would spot the distinction from the company name and job description; candidates coming out of graduate programs with no US industry experience may not. The mode's Failure Mode footnote and the `[TODO DEV]` title-taxonomy file exist specifically to make this collision visible rather than silent.

### Failure mode 2: Historical sponsorship survivorship — the recent-policy blindspot

**Shape of the error:** H-1B LCA filings are historical. A company that sponsored 12 TPMs between 2019 and 2022 has a "Proven" tier in the data. But if that company changed policy in 2024 to stop sponsoring PM roles (common under H-1B fee increases and OPT-restriction anxiety), the record continues to say "Proven" for 3–5 years while the reality is "no longer sponsors." The candidate applies based on a stale positive signal and burns interview cycles on a company that has silently exited.

**Who would struggle most to catch this:** Candidates without an insider contact at the company, or without access to the broader immigration-attorney community that tracks these policy shifts. Big-tech candidates often hear about sponsorship-policy changes through referrals or forums like Blind; a candidate from a graduate program with no prior US employment and no domestic professional network has neither channel. The mode's Stop Condition — "SKIP if sponsorship policy has changed since last LCA" — is currently unenforceable (no data source tracks this), so the mode names this in the "cannot verify" section rather than papering over it. This is the honest limit of the recipe.

## Why this mode is worth building even given its limits

The alternative to this mode, for the target user, is: (a) apply company-level sponsorship filters that miss the title mismatch and produce false positives, or (b) apply nothing and just guess. Either burns finite OPT weeks on the wrong companies. A mode that filters honestly — including refusing to score 94.9% of companies for lack of data — reallocates that time to the ~50 candidates who actually pass all gates. Even if half of those turn out to be Failure Mode 2 stale-positive, the candidate has narrowed a 30,369-company universe to a manually-triageable set with a documented reason for each exclusion.

Per the repo's own doctrine: *skip is a successful outcome; a healthy run skips at least half of evaluated roles.* This mode is designed to skip aggressively and defensibly.
