# RUN_LOG.md
## Entry: Setup Exercise — Your Search's Personal Layer
**Date:** 2026-06-25
**Course:** INFO 7375 — Computational Skepticism for AI

---

### What Was Built

Three files added to the `search/` folder as the personal data layer for the Reallocation Engine:

- `search/resume.json` — structured, attested record of experience, projects, skills, and education extracted from my DE resume PDF
- `search/profile.yml` — target role, visa constraints, geography, industry preferences, and sponsorship requirement
- `search/gaps.md` — gap table comparing my attested resume against mid-level DE/AE role requirements, with evidence and closing plans for each gap

---

### Attestation Errors Caught in resume.json

**Error 1 — visa_status field:**
The agent wrote `"F-1, transitioning to STEM OPT (~October 2026)"` which implies I am actively mid-transition. I am still fully on F-1 status. OPT has not started. Corrected to `"F-1 student visa; EAD start date anticipated October 19, 2026"`.

**Error 2 — scale field invented across all projects:**
The agent extracted scale metrics from inside bullet points (e.g. "84GB automotive data", "1M+ inspection records") and created a separate top-level `scale` field that does not exist anywhere in my source resume. The information was already captured in the bullets. The field was entirely invented — and not all scales were even included, making it incomplete as well as fabricated. Removed from all project entries.

**Error 3 — type field invented for both experience entries:**
The agent added `"type": "co-op"` to the CREWASIS entry and `"type": "full-time"` to the Infosys entry. Neither field appears anywhere in my source resume. The agent inferred employment type from context and added it as a structured field without any basis in the source document. Removed from both entries.

---

### Top Gap

**Kafka / real-time streaming** — I have zero exposure to Kafka. I don't know what it does, how it works, or how to use it in a project. It shows up consistently in mid-level DE postings I've been applying to and is becoming a standard expectation. My plan is to start with the basics, understand what Kafka is and why it's used, then implement a small end-to-end project. Gap closes when I have a working project on GitHub I can talk about in an interview.

---

### Killed Row and Why

**Killed: Cloud infrastructure as code (Terraform / CDK)**

The agent included this gap based on DE postings at companies with mature data platforms, but it sourced this from cloud-specialist and senior-level DE postings. None of the actual mid-level DE/AE postings in my target list mention Terraform or CDK as a requirement. This gap appears only in Cloud Data Engineer or Staff-level roles which are outside my current target band. The agent did not distinguish between mid-level and senior-level posting requirements when generating the gap table.

---

### Fields Corrected in profile.yml

The agent's first draft had four issues that required correction:

**1. current_status:** The agent left this as a generic visa type label. Corrected to `"F1 — graduation August 29, 2026"` to reflect my actual current status with the specific graduation date that drives my OPT timeline.

**2. Geography:** The agent listed only a few specific cities (Boston, New York, Seattle, Austin, Chicago, SF Bay Area). This was wrong — I am open to relocating anywhere in the United States. Limiting to specific cities would have caused the engine to skip valid roles in other markets. Corrected to `"Anywhere in the United States"` with only one constraint: no international relocation.

**3. Active applications section:** The agent added an active applications list to the profile. This does not belong in a constraint profile — it belongs in a tracker. The profile is a decision-making framework, not a status log. Removed entirely.

**4. Company names in sponsorship section:** The agent listed specific company names under preferred sponsors and weak sponsors. This was wrong for two reasons: the list would go stale as the search progresses, and naming specific companies caused the engine to treat unlisted companies as skips by default — which is not my actual constraint. Replaced with sponsorship rules based on H1B LCA filing history and approval rate thresholds instead of named companies.

---

### Verification Check

**resume.json:** Every job entry is traceable to my actual resume PDF. The agent did not promote any titles — the single Infosys entry reflects a deliberate resume formatting choice to save space, not an error. The three errors I caught were all agent-invented structure or a wrong status field, not fabricated experience.

**profile.yml:** The visa section reflects my actual situation — F-1 status, EAD start date October 19, 2026, STEM eligibility confirmed with DSO, zero unemployment days used. Geography was corrected from the agent's assumed constraints to my actual openness to relocate anywhere in the US.

**gaps.md:** Every gap in the evidence column cites something checkable — job postings from my actual target companies or O*NET requirements for SOC 15-1242 and 15-2041. The Kafka row evidence is based on postings I have reviewed. The killed row (Terraform/IaC) was removed specifically because its evidence came from senior-level postings, not my actual target band.

---
2026-07-06 — case-de-da-live-skill-gap v0.1.0 — RUNNABLE-SAMPLE


Recipe: case-de-da-live-skill-gap v0.1.0
Runner: Komal Khairnar
Inputs: my_targets.txt (15 companies), data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv (30,369 companies), data/examples/my-de-da-roles.json (5 roles for scorer)
Commands run:

python scripts/skill-demand/skill-gap-master.py --dry-run — setup verified, 15 companies loaded, no API calls
python scripts/skill-demand/skill-gap-master.py — live run, Greenhouse + Lever APIs
python scripts/skill-demand/skill-gap-master.py --targets nonexistent.txt — break test, clean error
npm run ats:liveness -- https://careers.airbnb.com/positions/7988010?gh_jid=7988010 — active
npm run score -- data/examples/my-de-da-roles.json — Apply 3, Consider 1, Skip 1



Outputs: data/skill-demand/skill_gap_report.xlsx (4 sheets), data/skill-demand/skill_demand_log.json
Summary: 6 of 15 companies found on Greenhouse (Airbnb, Stripe, Figma, Squarespace, Amplitude, Brex). 49 live DE/DA jobs fetched. 19 skills ranked. Top 3: SQL (35), Python (30), Scala (27). 9 companies not found — all use Workday or another ATS without a public JSON API.
Result: RUNNABLE-SAMPLE — scripts execute end to end, real skill ranking produced from live data.
Open issues: Workday scraper not built — 9/15 companies (60%) returned not found including original targets (Databricks, CVS Health, Experian, Cotiviti, Moda Health, Snowflake, Coursera). JD body text for Greenhouse fetched via detail endpoint but Workday JDs entirely absent. TODOs open: 3 (Workday scraper, Ashby scraper, full --all-sponsors live run).