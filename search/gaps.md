# search/gaps.md

Agent-drafted gap analysis. One row killed (with reason). One row rewritten in student's own words.

| Gap | Evidence the target demands it | What I have | Plan to close it |
|-----|-------------------------------|-------------|-----------------|
| System design interview readiness | Patterns across 10+ Backend SWE postings at product companies (Google, Meta, Stripe, Airbnb) require demonstrated ability to design distributed systems at scale, explicitly tested in interviews | Experience building microservices and APIs at TCS and Matson Money, but no published system design work or documented mock interview practice | Complete 20+ mock system design interviews on Interviewing.io or Exponent; publish 2 system design write-ups on GitHub as verifiable artifacts |
| No open source contributions | GitHub activity is a stated signal in backend SWE postings at product companies; O*NET 15-1252 lists developing open-source software as a common task for software developers | All GitHub repos are course or work projects with no public contributions to external OSS projects | Submit 3 merged PRs to active open source backend projects (e.g. Apache, CNCF ecosystem) by August 2026 |
| No demonstrated streaming experience | Product company backend postings frequently list Kafka, Flink, or Spark pipeline experience as preferred; pattern observed across 5+ Stripe, Robinhood, and Coinbase JDs | Kafka listed in skills but no project or job description demonstrates hands-on pipeline work | Build and publish a Kafka + Spark streaming pipeline project on GitHub with a README showing architecture and results |
| Weak observability portfolio | Backend SWE postings at product companies (Datadog, Stripe, AWS) list OpenTelemetry, distributed tracing, and SLO definition as required skills; BLS O*NET 15-1252 lists monitoring as a core task | ELK stack deployment at TCS mentioned but no public artifact or write-up demonstrating observability design decisions | Write a technical blog post or GitHub README documenting the ELK stack work at TCS with architecture diagram and lessons learned |
| No LeetCode or competitive programming signal | Product company backend SWE roles (Google, Meta, Amazon) gate on coding interviews; DSA proficiency is a hard requirement | Strong backend project experience but no visible competitive programming profile or documented DSA practice | Reach LeetCode 200+ problems solved with focus on graphs, DP, and trees; make profile public as verifiable signal |

## Killed Row

Removed gap: No cloud certifications (AWS/GCP/Azure)

Reason it was wrong: The agent assumed cloud certifications are a gap because they appear in some job postings. But for backend SWE roles at product-based companies, certifications are not a hiring gate. The actual signal these companies look for is demonstrated cloud project work, which I already have through the AWS project with Terraform, EC2, RDS, Lambda, Route 53, and CI/CD. The agent generated this gap from a generic inference about cloud skills, not from a pattern specific to backend SWE roles at product companies.

## Rewritten Row (in my own words)

Gap: System design interview readiness

Evidence: I have looked at job postings from companies like Stripe, Airbnb, and Google for backend roles. Every single one has a system design round. It is not a nice to have — it is a gate. If you cannot walk through designing a rate limiter or a distributed job queue on a whiteboard, you do not move forward regardless of your resume.

What I have: I have built real distributed systems including microservices at TCS and APIs at Matson Money. But building something at work and explaining design tradeoffs under interview pressure are different skills. I have not practiced the interview format specifically.

Plan: I need to do structured mock interviews, not just read about system design. Interviewing.io lets you do recorded mocks with real engineers. I will do 20+ sessions and publish 2 write-ups on GitHub showing my design process. When those exist, the gap is closed — not when I finish reading a book.
