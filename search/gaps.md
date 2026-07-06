# search/gaps.md — Delta: Attested Record vs. Target Role Requirements
# AGENT DRAFT — two required edits before submitting:
#   1. Kill one wrong row (write one sentence explaining why it was wrong)
#   2. Rewrite one row in your own words

## How to read this table
- **Evidence column**: cites a posting, O*NET requirement, or pattern across ≥3 postings.
  If there is no citation, the gap is a feeling — move it to private-notes.md.
- **Plan column**: describes an *output* (shipped project, published piece, credential),
  not an activity ("take a course" is not a closing condition).
- A gap row is deleted when new evidence closes it and resume.json is updated.

---

| Gap | Evidence the target demands it | What I have | Plan to close it |
|-----|-------------------------------|-------------|-----------------|
| System design fluency (distributed systems at scale) | O*NET 15-1252 (Software Developers) lists "design and develop software systems" as core task; entry-level SWE postings at mid-stage startups (e.g., Stripe, Rippling, Plaid 2024–2025 new grad JDs) consistently list system design interview readiness as a gate. | Kafka/Zookeeper usage at Stellar, REST API design across multiple projects — but no evidence of having designed a system from scratch under constraints (CAP theorem, sharding, load balancing). | Complete one public system design write-up (e.g., design a URL shortener or rate limiter) posted on GitHub or personal blog. Closing condition: link exists, is readable by a recruiter, and accurately describes tradeoffs — not just a solution. |
| Demonstrated testing discipline | Fintech and SaaS SWE postings (surveyed: Carta, Brex, Figma 2025 new grad roles) list "writes tests, cares about quality" as a differentiator; Jest is listed in skills but no resume bullet describes a testing outcome (coverage %, caught regression, etc.). | Jest and Postman listed in skills section. No bullet quantifies test coverage or describes a testing workflow. | Add one project (PawConnect or TripSync) with a visible test suite — unit + integration. Closing condition: GitHub repo shows test files, CI pipeline runs them, and a README note describes the coverage approach. |
| Backend/full-stack and cloud depth isn't independently demonstrable outside of employer context | Fintech SWE and AI Engineer postings ask for AWS, LLMs, and data pipeline experience as independently verifiable skills — not just co-op bullets (observed across multiple fintech/AI startup JDs) | Built serverless pipelines, used Lambda, S3, OpenSearch, and LangChain at Aiera — but always within existing infrastructure. No public project shows I can set this up from scratch independently. | Ship one end-to-end backend project publicly — a data pipeline or LLM-powered API — deployed on AWS from scratch, with the repo and architecture visible on GitHub. Closing condition: a stranger can clone it, read the README, and see the infrastructure decisions I made. |

| Open-source or public contribution record | GitHub is listed on resume but no public repo is linked or described. Hiring managers at developer-tools companies (Aiera's sector) frequently check GitHub activity as a proxy for genuine interest and code quality. | Projects exist (PawConnect, TripSync) but their public/private status is unknown from this resume. | Make at least one project repo public with a clean README, working demo link or screenshots, and commit history that reflects real work (not a single squashed commit). Closing condition: GitHub profile shows ≥2 pinned repos with activity visible to a stranger. |

---

## Agent notes — read before submitting

**Row killed:** Cloud infrastructure ownership — The agent drafted this gap before my Aiera backend work was added — my co-op work includes Lambda tuning, OpenSearch indexing, and S3 lifecycle management, which is infrastructure I owned, not just integrated against.

**Row rewritten:** Backend/full-stack and cloud depth — rewritten in my own words to reflect that my target is backend/full-stack and AI Engineer roles, not frontend. The agent's original framing assumed I was undecided between frontend and full-stack. I am not — I want to build backend systems and pipelines. The gap is that my independent, public evidence of this doesn't exist yet outside of Aiera.

---

## Closed gaps (move entries here when resume.json is updated with closing evidence)
_None yet._
