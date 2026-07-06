# Domain Justification
**Mode:** case-mle-opt-aug2026-h1b-runway  
**Author:** [Your Name]  
**Date:** July 2026

---

## Who Uses This Mode and When

An international master's student in ML Engineering or a related CS program, graduating in August 2026, beginning STEM OPT in September 2026 with a 36-month authorization window ending approximately September 2029. They are targeting roles with titles like ML Engineer, MLOps Engineer, or ML Platform Engineer — primarily at tech companies, AI startups, and enterprise software firms. They have a functional portfolio, are actively interviewing, and need to allocate finite application effort across a large field of postings.

The mode is run during the first 12 weeks of OPT, when the student needs to decide which companies are worth a full application cycle versus a quick pass. Time spent on a company that doesn't sponsor — or one whose funding has dried up — is time that cannot be recovered.

---

## Information Asymmetry Addressed

Without this mode, the student faces four overlapping blind spots:

1. **Sponsorship opacity.** There is no public "we sponsor H-1B" checkbox on job postings. Companies that have sponsored in the past are not required to advertise it. The student has to either cold-ask a recruiter (revealing vulnerability early) or apply and find out at the offer stage — when it is too late to recover the time.

2. **Posting staleness.** Job boards frequently list roles that are already filled, paused, or withdrawn. An ATS liveness check reveals this in seconds; without it, a student may spend days tailoring a cover letter for a role that closed three weeks ago.

3. **Funding viability.** A startup's funding state is not visible from its careers page. SEC Form D filings are public but scattered. A company that raised a seed round two years ago and has not refiled may be in distress or in quiet mode — both are signals worth knowing before investing application effort.

4. **AI substitution risk in MLOps.** Not all ML Engineering roles are equally durable. Roles concentrated in model monitoring dashboarding, report generation, or routine pipeline maintenance are increasingly in the substitution zone. The BLS/O*NET cognitive-pivot score surfaces this risk at the SOC level, giving the student a basis to prefer roles with higher system-judgment and verification components.

This mode connects to all three engine layers: **80 Days** (sponsorship history), **Job-Ops** (liveness), and **Cognitive Pivot** (role resilience scoring).

---

## Engine Layer Connections

| Layer | How This Mode Uses It |
|---|---|
| 80 Days to Stay | H-1B petition history from `h1b_disclosure_data.csv` and company map from `companies.json` — the primary sponsorship signal |
| Job-Ops | `ats:liveness` as a hard gate on every URL; `ats:scan` to detect ATS maturity as a proxy for structured hiring processes |
| Cognitive Pivot | `npm run score` on SOC 15-2051 and 15-1252 to surface roles likely to retain a labor premium against AI substitution |

---

## Failure Modes

### Failure Mode 1 — SOC Code Mismatch (Silent Wrong Answer)

MLOps is a relatively new job function. A company may post a role titled "ML Platform Engineer" and classify it internally under SOC 15-1252 (Software Developers) rather than 15-2051 (Data Scientists and Mathematical Science Occupations). The mode uses SOC codes to pull H-1B petition history and to run the cognitive-pivot scorer. If the wrong SOC is used, both outputs are subtly wrong: the H-1B petition count understates the company's actual ML-specific sponsorship activity, and the cognitive-pivot score reflects a software-generalist task profile rather than an MLOps one.

**Who struggles most to catch it:** A student who is not familiar with the SOC taxonomy and trusts the output because the numbers look plausible. The error does not produce an obvious failure — it produces a quietly confident wrong answer. A student who has verified H-1B filings by hand would catch it; one relying entirely on the mode would not.

### Failure Mode 2 — Stale H-1B Data Producing False Confidence

The H-1B disclosure data in the repo reflects past fiscal years. A company that sponsored actively in 2022–2023 but has since frozen hiring or changed policy will still appear as a confirmed sponsor. The mode outputs `h1b_sponsor: true` and the student applies with confidence — only to be told the company is not sponsoring new roles this cycle.

**Who struggles most to catch it:** An international student who has less access to informal networks (alumni, referrals, LinkedIn connections inside the company) that would surface this policy change before the application stage. A domestic student in the same situation would likely hear through a peer or recruiter. The international student is more isolated from that signal and more dependent on the data being current.

---

*One page.*
