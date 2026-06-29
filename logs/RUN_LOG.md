## 2026-06-29 — case-swe-to-ai-engineer-h1b-title-screen v0.1.0 (RUNNABLE-SAMPLE)

- **Mode:** `case-swe-to-ai-engineer-h1b-title-screen`
- **Run type:** sample — no writes to `private/`, no external API calls beyond `npm run ats:liveness`
- **Inputs:** 10 companies from `data/raw/case-swe-to-ai-engineer/company-list.json`; OPT start 2026-09-08; target SOCs 15-1221, 15-1252, 15-1299.08
- **Data provenance:** `python3 scripts/sec/validate-h1b-join-sample.py` — 30,369 total companies, 1,557 with H-1B data (5.1%), audit written to `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-join-validation-audit.md`
- **Title screen:** 5 practitioner, 3 researcher-only (stopped — not scored), 1 hybrid (flagged for manual review), 1 no-data (AMD — public company, no Form D)
- **Liveness:** Cohere Health Staff MLE (`job-boards.greenhouse.io/coherehealth/jobs/7617095003`) → active; Moloco MLE Intern (`job-boards.greenhouse.io/moloco/jobs/7635045003`) → active (removed from scoring — intern role, persona mismatch); AMD posting → expired
- **Scores:** Apply 1 (COHERE HEALTH INC, composite 0.492), Consider 0, Skip 0
- **Break test:** liveness.factor=0 → Skip, reason "gated: liveness ≈ 0.000" — gate behavior confirmed
- **Artifacts:** `logs/case-swe-to-ai-engineer-2026-06-29.json` (agent log), `data/raw/case-swe-to-ai-engineer/title-screen.json`, `data/raw/case-swe-to-ai-engineer/role-scores.json`, `reports/generated/case-swe-to-ai-engineer-2026-06-29.md`
- **Open issues:** `filter-by-title-pattern.py` not yet implemented `[TODO: DEV]`; LCA data not acquired `[TODO: DATA SOURCE]`; only 1 role scored (one confirmed live posting); Workday-based portals not checkable with current liveness script; Roblox classified as practitioner in data but PhD-only on current job board — validates Failure Mode 1

---

## 2026-06-23 — Assignment 4: Search's Personal Layer

- **What was built:** `search/resume.json` (attested 2026-06-23), `search/profile.yml`, `search/gaps.md`; `.gitignore` updated with `!/search/resume.json` exception to prevent blanket `resume.json` rule from silently excluding the assignment artifact.

- **Three attestation errors caught in resume.json:**
  1. **Neo4j absent from skills** — Neo4j is explicitly named in the Granite NL2SQL pipeline bullet but was completely missing from the Backend & Databases skills section in the original import. Added Neo4j to skills.
  2. **Education start dates both null** — The import extracted degree names and end dates but failed to extract start dates for both degrees. Corrected to Northeastern University Sep 2024 and VIT Jul 2018.
  3. **Salesforce listed in skills with no supporting work context** — Salesforce was in the skills list but no work bullet explained how or where it was used. At Granite it was used to understand Salesforce object relationships and build base/derived variables for the franchisee data completeness project. Added Salesforce with context to the Granite bullet.

- **Top gap from gaps.md:** Public open-source AI/LLM portfolio — all high-signal work (NL2SQL pipeline at Granite, 10B-edge graph deduplication at Bajaj) is proprietary with no public URL, and the only public GitHub project is a 2021 NLTK chatbot. This gap is the most consequential because large-company AI Engineer evaluations (Stripe, Databricks) use GitHub profile as part of the technical screen.

- **Row killed from gaps.md:** "DSA / algorithmic coding interview preparation" — the agent inferred a gap from the absence of LeetCode or competitive programming evidence on the resume, but it made a category error: DSA is an interview-assessed skill, not a resume-listed one; a LeetCode profile exists with decent problems solved, and from direct experience with HRs and hiring managers, LeetCode profiles are rarely checked during screening — the skill is evaluated live in the interview round, not screened from a public profile.

- **Field corrected in profile.yml:** `stem_eligible` — agent drafted `"uncertain"` because STEM eligibility had not been confirmed in writing at draft time. Corrected to `true` after confirming STEM-eligible status with DSO (MS Information Systems, Northeastern University, CIP 11.0401).

### Verification check

**resume.json:** Every job entry is traceable to verifiable sources: Granite Telecommunications (current CPT internship — offer letter), Bajaj Finserv (LinkedIn profile, 2+ year full-time role), Hello Tripper and Landryt (confirmed concurrent internships during undergrad). The $59.7M and $1.19M savings figures are internal Bajaj estimates, not published; they can be corroborated by a reference but not independently verified. The 60% hallucination reduction metric is defensible — measured via golden Q&A set with semantic similarity scoring and LLM-as-judge (two independent signals).

**profile.yml:** Visa dates (OPT 2026-09-08 to 2027-09-07) must be confirmed against the actual EAD card when it is issued — OPT has not started yet (currently on F-1 CPT). STEM eligibility confirmed with DSO. Unemployment days: 0 (period not yet started). Buffer target of 80 days below 90-day ceiling is set per book recommendation.

**gaps.md:** All four evidence cells cite a specific, openable URL — two Stripe job postings, the Databricks AI Engineer interview guide, O*NET 15-2051.00 in-demand skills page, KDnuggets LLM engineer roadmap, MirrorCV 2026 AI Engineer guide, and Taggd.in AI Engineer JD guide. No evidence cell uses "roles in this sector typically require" language without a source.

- **Artifacts:** `search/resume.json`, `search/profile.yml`, `search/gaps.md`, `search/ai-use-disclosure.md`
- **Open issues:** OPT dates (2026-09-08 to 2027-09-07) must be re-verified against the physical EAD card once issued — OPT period has not started as of submission date.
