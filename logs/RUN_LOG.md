# RUN_LOG.md

---

## Setup Exercise — Your Search's Personal Layer

**Date:** 2026-06-25
**Operator:** Neha Dharanu

---

### What Was Built

Three files created in `search/` folder of forked Reallocation Engine repo:

- `search/resume.json` — structured, attested record extracted from resume PDF
- `search/profile.yml` — target role, visa constraints, geography, sponsorship gate
- `search/gaps.md` — delta between attested resume and SOC 15-1252 target role requirements

---

### Three Attestation Errors Caught in resume.json

1. **Kubernetes scope overclaimed** — agent listed Kubernetes as a peer skill alongside Docker and AWS, implying cluster ownership. Reality: used a managed Kubernetes cluster at Mercedes-Benz for dev/staging deployments — did not author cluster configs or Helm charts. Corrected by removing Kubernetes from the skills list and adding a `kubernetes_note` field with accurate scope.

2. **Hibernate/JPA omitted from skills** — agent extracted skills only from the skills section of the resume and missed Hibernate/JPA, which was used hands-on at Mercedes-Benz for query updates during the DB2-to-PostgreSQL migration. Corrected by adding Hibernate/JPA to the frameworks skills list.

3. **Capgemini contribution scope overstated** — agent wrote "owning design through production deployment" implying solo ownership. Reality: team of 4–6 engineers. Corrected bullet to "contributed... as part of a team of 4–6 engineers, participating from design through production deployment."

---

### Top Gap from gaps.md

**System design interview fluency** — I have real design work (Mercedes rules engine processing millions of automotive config rules, zero-downtime DB2→PostgreSQL migration, SentinelPay three-layer fraud detection architecture) but have not practiced articulating these designs under timed interview conditions at a target company. Gap closes when three written design docs are published on GitHub and reviewed by a practicing senior engineer, or a system design screen is passed at a target company.

---

### Killed Row and Why

**Killed:** Organizational leadership — mentoring junior engineers and driving alignment across teams

**Reason:** Agent generated this gap because mentoring activity does not appear explicitly in my resume. In reality, I informally mentored 1–2 junior engineers at Mercedes-Benz on task-level design and code reviews. The agent could not know this from the resume text alone — this is exactly the kind of domain knowledge about my own situation that required my correction. The gap is overstated; what I lack is formal team leadership, not all organizational influence.

---

### Field Corrected in profile.yml from Agent's First Draft

Agent wrote three fields incorrectly in its first draft:

- `hard_exclusions` — agent added Defense and Gambling as exclusions; I have no hard industry exclusions. Removed.
- `company_size` — agent excluded Series A entirely; I would consider Series A if H-1B sponsorship history is documented. Corrected.
- `work_arrangement` — agent wrote "not fully remote only" implying a geographic constraint. Reality: I am open to fully remote, hybrid, or in-office anywhere in the USA. Corrected.

---

### Verification Check Answers

**resume.json:** Every job entry is defensible. "Zero downtime migration" and "70% performance improvement" at Mercedes-Benz are both figures I measured and owned directly — confirmed yes.

**profile.yml:** Visa section reflects actual documents. OPT start date of October 2026 is based on expected EAD timeline confirmed with DSO. STEM OPT eligibility confirmed with DSO — marked as confirmed, not uncertain.

**gaps.md:** Censys job posting (8245190002) cited in evidence column is no longer live as of 2026-06-25 — verified by checking job-boards.greenhouse.io/censys which returned an error for that specific role. However, the Censys board shows active "Distributed Systems Engineer" and "Senior Backend Engineer" roles confirming the demand pattern is real and not invented. O\*NET 15-1252 verified live at onetonline.org/link/summary/15-1252.00 and confirms distributed systems and design requirements for the occupation. One evidence citation is stale; the demand signal still holds.

---

_No contents from search/private-notes.md are included in this log._

---

## Mode Run — case-ms-swe-stem-opt-h1b

**Date:** 2026-07-03
**Operator:** Neha Dharanu
**Recipe version:** 0.1.0
**Status reached:** RUNNABLE-SAMPLE

### Inputs

- Profile: search/profile.yml (OPT start: 2026-10-01, H-1B target: FY2028)
- Resume: search/resume.json (attested 2026-06-25)
- Roles evaluated: 5 real companies from SEC_DOL_H1b_data_mapped.csv
  (Stripe, Databricks, Snowflake, Anyscale, Accolade)
- URLs liveness-checked: 9 total (3 active, 1 uncertain on boards.greenhouse.io,
  4 uncertain systematic on my.greenhouse.io, 1 deliberate fake/expired)

### CSV filter evidence

- Total companies in dataset: 30,369
- After sponsorship filter: 1,552 (28,817 skipped — 94.9%)
- After SWE title filter: 493
- After CA/WA geography filter: 338
- PowerShell Select-String count for "Software Engineer": 441 rows

### Commands run

- npx playwright install chromium (required — browsers not installed)
- npm run score -- data/examples/ch11-roles.json (toolchain anchor)
- npm run score -- assignments/submissions/nehadharanu/neha-target-roles.json
- npm run ats:liveness -- Databricks URL → active
- npm run ats:liveness -- Snowflake URL → active
- npm run ats:liveness -- Anyscale URL → active
- npm run ats:liveness -- Stripe URL → uncertain
- npm run ats:liveness -- 4x my.greenhouse.io URLs → uncertain x4 (systematic)
- npm run ats:liveness -- fake URL → expired HTTP 404
- npm run score -- broken-roles.json (malformed JSON)
- npm run verify (partial — python3 not found on Windows)

### Gates

- Sponsorship gate: VERIFIED from CSV for all 5 companies
- SWE title gate: PASS for all 5 — Software/Backend Engineer confirmed in CSV
- Liveness gate: ACTIVE — Databricks, Snowflake, Anyscale
  UNCERTAIN — Stripe (boards.greenhouse.io subdomain)
  UNCERTAIN systematic — my.greenhouse.io subdomain (4 employers tested)
  EXPIRED — fake URL HTTP 404 (deliberate break attempt)
- OPT buffer gate: NOT AUTOMATED — TODO-2 does not exist; 0 days used

### Routing output (real target companies)

- Apply: 3 roles (Databricks, Snowflake, Anyscale)
- Consider: 1 role (Stripe — liveness uncertain)
- Skip: 1 role (Accolade — deliberate ghost posting, liveness=0)
- Skip rate: 20% (below healthy ~50%; sample biased toward proven sponsors)

### Break attempts

- Break 1: fake URL → ❌ expired HTTP 404 — liveness gate confirmed
  dead posting correctly blocked regardless of sponsorship strength
- Break 2: malformed JSON → SyntaxError at JSON.parse line 167 — scorer
  fails closed on invalid input. System correctly refuses malformed input —
  no Apply recommendation ever produced from bad data. Schema mistakes
  become Skip; parser-invalid input stops execution. Neither case guesses.

### Unexpected finding

- my.greenhouse.io URLs return uncertain systematically across all four
  additional employers tested — ATS subdomain limitation, not
  posting-specific. Playwright cannot detect apply button on this subdomain.
  Documented in mode stop conditions and cannot verify section.

### Open TODOs

- TODO-1: SOC 15-1252 H-1B sponsor filter script — not built
- TODO-2: OPT unemployment-days tracker — not built
- TODO-3: H-1B offer-deadline back-calculator — not built

### What went well

Real liveness on all five target companies. Three active confirmations
(Databricks, Snowflake, Anyscale). Ghost-posting demo correctly Skip
despite 100% approval rate. Both break attempts failed closed — scorer
refuses to guess on bad input in either form.

### What the mode missed

my.greenhouse.io subdomain limitation affects significant portion of
target universe. Skip rate 20% — below healthy target due to sample bias.
SWE title inflation not screened. Windows conformance failure documented.

### Next steps

Document my.greenhouse.io workaround (manual browser check always required).
Build TODO-1 with SWE title family validation.
Treat uncertain liveness as manual check required before applying.
