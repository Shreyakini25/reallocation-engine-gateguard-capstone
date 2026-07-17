# search/gaps.md

Delta between attested `resume.json` and the target role in `profile.yml`
(Software Engineer / Developer, SOC 15-1252.00, F-1 OPT, sponsorship required).

| # | Gap | Evidence the target demands it | What I have | Plan to close it (verifiable output) |
|---|-----|-------------------------------|-------------|--------------------------------------|
| G1 | **Automated testing + CI/CD in a codebase** | O*NET 15-1252.00 lists "Develop testing routines or procedures" as a core task; its In-Demand skills include program-testing tools (JUnit, Selenium, SonarQube). 2026 new-grad postings (Built In Colorado Spring Boot role, Glassdoor Baltimore/NY) repeatedly list "CI/CD," "integration testing," "code reviews," "test-driven development." | Three solo projects, no tests, no CI pipeline, no code review in any repo. | Add a JUnit/pytest suite to the Spring backend or Transformer repo and wire a GitHub Actions workflow that runs it on push, with a visible green badge. Closes when passing CI is public; add a new `skills` entry. |
| G2 | **Production / team engineering experience** | O*NET Job Zone for 15-1252.00 notes "considerable" work experience is typically expected; Amazon SDE I postings ask for "1+ years of CS-fundamentals experience." | One 4-month role; everything else solo. | Land one verifiable team contribution: a merged OSS PR on a real project where a maintainer can confirm scope. Closes when an external party can attest to the contribution. |
| G3 | **System design / scalable, distributed systems** | 2026 postings list "system design," "scalability," "microservices," "distributed software" (Glassdoor NY, Built In Colorado backend role). | Single-machine/solo projects; the AWS work was deploy/config, not scaled-system architecture. | Ship one small multi-service system (e.g. split the shopping backend into 2 services + a queue on AWS) with a written design doc in the repo. Closes when the design doc + running deployment are linkable. |
| G4 | **Coding-interview readiness (DS&A under pressure)** | 2026 entry-level SWE loops gate first on a live coding round (DS&A, LeetCode/HackerRank patterns) before any offer. | No public signal; not on the resume. | I'll run 8 weeks of structured prep and prove it the way an interviewer would: at least 6 recorded mock interviews on interviewing.io / Pramp with written reviewer feedback I keep. Closes when the recorded feedback exists - not when I "finish a course," since adjacent activity isn't evidence. |

---



**Killed row:G4 Coding-interview readiness (DS&A under pressure)** I think this was wrong because everyone who is job hunting in tech industry will do leetcode or such stuff. So am I.

**Rewrote row: G4** (above) - New G4 will be “The real gap for me isn't years; it's that I've never worked inside an industry development pipeline at all, because every project I've done has been solo or small-team. So I rewrote the row， this looks similar to G2, but G2 represents team collaboration, while new G4 represent technical skills”