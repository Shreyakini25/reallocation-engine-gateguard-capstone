# search/gaps.md
# Agent-drafted 2026-06-25 against attested resume.json and profile.yml (target: SOC 15-1252, mid-level full-stack/backend SWE)
# Student edits complete:
#   (1) Killed row: Organizational leadership — reason documented below
#   (2) Rewritten row: System design interview fluency — restated in student's own words

---

## Gap Table

| Gap | Evidence the target demands it | What I have | Plan to close it |
|---|---|---|---|
| **Infrastructure ownership — IaC, observability stack ownership, incident response** | Pattern observed across Databricks, Stripe, Airbnb, and Censys backend postings reviewed on 2026-06-25, together with O*NET 15-1252 (onetonline.org/link/summary/15-1252.00): mid-senior SWE roles consistently require engineers to own observability (alerting, tracing, dashboards), IaC tooling, and production incident response — not just use CI/CD pipelines built by others. | CI/CD with GitHub Actions, Docker containerization, AWS EC2/RDS/S3 usage, CloudWatch + X-Ray tracing in SentinelPay (personal project). Kubernetes used in managed cluster at Mercedes — did not author cluster configs. No evidence of Terraform/IaC, cost optimization ownership, or on-call/incident response in a production org. | Build and publicly deploy a project using Terraform for infrastructure provisioning, with a documented runbook covering deploy, rollback, and incident response steps. Gap closes when: the Terraform config and runbook are in a public GitHub repo and the infrastructure has been used in a real deployment — not just a tutorial reproduction. |
| **Distributed systems depth at scale — fault tolerance, horizontal scaling, consensus** | Pattern observed across Databricks, Stripe, Airbnb, and Censys backend postings reviewed on 2026-06-25, together with O*NET 15-1252: distributed systems fundamentals including horizontally scalable and fault-tolerant systems appear consistently as requirements for mid-to-senior SWE roles at target companies. | Mercedes-Benz rules engine processed millions of rules with high throughput — demonstrates performance engineering at scale. PostgreSQL migration with zero downtime demonstrates production operational discipline. SentinelPay has a three-layer architecture with Redis behavioral profiling under 150ms. No evidence of consensus protocols, multi-region replication, or horizontal scaling under real user load beyond personal projects. | Extend SentinelPay or build a new project demonstrating horizontal scaling: add a load balancer, multiple service instances, and a documented failure scenario with recovery. Gap closes when: the architecture diagram, load test results, and failure recovery runbook are publicly documented on GitHub. |
| **System design interview fluency — whiteboard-style design of large-scale systems** | Pattern across Databricks, Stripe, Airbnb, and LinkedIn postings reviewed on 2026-06-25: system design screen is a standard hiring gate for mid-to-senior SWE roles regardless of prior experience level. Not an O*NET requirement but a verifiable hiring gate documented in company interview guides and consistently reported by candidates across target companies. | I have real design work — the Mercedes rules engine handling millions of automotive config rules, the zero-downtime DB2→PostgreSQL migration, and SentinelPay's three-layer fraud detection architecture. What I don't have is practiced articulation of these designs under timed interview conditions at a target company. | Do 10 timed system design sessions on Excalidraw, record verbal walkthroughs, and publish 3 written design docs on GitHub covering systems I've actually built. Gap closes when one write-up has been reviewed by a practicing senior engineer or I pass a system design screen at a target company. |

---

## Killed Row

**Gap killed:** Organizational leadership — mentoring junior engineers and driving alignment across teams

**Reason:** Agent generated this gap because mentoring activity does not appear explicitly in my resume. In reality, I informally mentored 1–2 junior engineers at Mercedes-Benz on task-level design and code reviews. The agent could not know this from the resume text alone — this is exactly the kind of domain knowledge about my own situation that required my correction. The gap is overstated; what I lack is formal team leadership, not all organizational influence.

---

## Closed Gaps
*Gaps move here when new evidence exists: a shipped project, published piece, or completed credential with an external issuer.*

*(none yet)*
