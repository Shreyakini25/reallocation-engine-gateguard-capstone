# Domain Justification — Early-Career PM Sponsorship & Runway Triage

**Mode:** `recipes/case-early-pm-sponsorship-triage.md`
**By:** Jayanth Adithya Kappagantula · 2026-07-06

## Who uses this, and in what exact situation

An **international, early-career Product Manager** on F-1, targeting **entry-level / new-grad
Product roles** (Associate PM, APM, PM I, rotational programs), open to both startups and
established firms. Concretely, my own situation as of 2026-07-06: OPT I-20 requested from my
DSO on 2026-07-01 (approval pending, ~2026-07-11 to 07-16); I-765 not yet filed with USCIS;
requested OPT start 2026-09-01; realistic EAD arrival ~Oct–Nov 2026. I do **not** require
immediate H-1B sponsorship — I will take a role at an **E-Verify** employer to build
full-time PM experience during OPT/STEM OPT, then pivot to a sponsoring company. The mode is
built two-track around exactly that plan.

## The information asymmetry it addresses

For a software engineer, H-1B history reads cleanly: the sponsored title says "Software
Engineer." **For a PM it does not.** PM H-1B filings scatter across SOC codes — 11-3013
Product Managers, but also 13-1111 Management Analysts, 15-1299, 11-2021 — so a company that
genuinely sponsors PMs can appear in the data under a *non-PM* title. I can't easily see, from
a job board, (a) whether a company sponsors PM-type work at all, (b) whether a non-sponsor is
at least **E-Verify** enrolled (which makes it a viable runway, not a dead end), or (c)
whether a posting is even live. The mode makes those three signals explicit and auditable.

The scarcity is measurable in the repo's own data. The mapped SEC+DOL dataset
(`data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv`) holds **30,369
companies**, but only **107** list "Product Manager" in `top_job_titles_sponsored` — 0.35%.
PMs *are* sponsored far more often than that; the title just hides under other SOCs. That gap
between "sponsors PMs" and "shows 'Product Manager' in the record" **is** the asymmetry.

## Connection to the engine layers

- **80 Days to Stay** — H-1B approval history and `top_job_titles_sponsored` drive the
  `sponsorship` vote; SEC Form D recency separates viable early-stage firms from funding-dry
  ghost employers.
- **Job-Ops** — `ats:liveness` sets the liveness **gate**; the visa-timeline **gate** encodes
  my OPT filing status. Both are hard stops, not votes.
- **The Cognitive Pivot** — available as an extension: BLS/O*NET role-quality scoring on
  whether a given PM role leans toward the verification/judgment work AI can't yet do
  (weighted 0 in the base scorer today, an open authorial decision).

## Failure modes specific to this domain

**FM1 — SOC-scatter false Skip.** A company that files PMs under "Management Analyst"
(13-1111) shows no "Product Manager" in `top_job_titles_sponsored`, so a naive check reads it
as a non-sponsor and Skips a real sponsor. **Shape:** a false negative on sponsorship — the
most expensive error, because a skipped role is never revisited. **Hardest to catch for:** an
early-career PM who doesn't know PM maps to several SOCs; they will trust the empty title
field and never learn what they lost. (The mode counters it by requiring a company absent PM
titles to be scored `model-judgment`, not `record` — and proposes a lookup helper that
inspects the whole scatter family.)

**FM2 — Runway dead-end illusion.** Treating E-Verify enrollment as if it implied future H-1B
sponsorship. E-Verify only supports the STEM OPT extension; it is **not** a commitment to
file an H-1B. **Shape:** a strategic false positive — a candidate takes a "runway" role
expecting to convert, and the runway dead-ends when the cap-subject H-1B never comes.
**Hardest to catch for:** the optimistic candidate who reasons "I'll prove myself and they'll
sponsor" — the error only surfaces 2–3 years later when it is very costly to undo. (The mode
counters it by tagging Runway strictly as a labeled human judgment with a documented reason,
and drawing "cannot verify: whether a runway employer will *ever* sponsor" explicitly.)

## Healthcare specialization (where I'm actually aiming)

Narrowed to **healthcare / health-tech PM**, the asymmetry gets sharper, and the data proves
it. Of the 30,369 companies, **4,745 are healthcare-industry** (Biotechnology 1,911, Other
Health Care 2,173, Pharmaceuticals 520, Hospitals 122, Health Insurance 19). Of those 4,745,
exactly **3** list "Product Manager" in their sponsored titles — **0.06%** — even though the
same firms sponsor heavily under scientific, clinical, and engineering titles. So FM1 is at
its most severe here: a title-literal search tells a healthcare PM the sector is closed, when
it is not. It also adds **FM3** — a healthcare role titled "Product Manager" may be a
*clinical/scientific* role (MD/PhD expected), not a *software/digital-health* PM role;
scoring fit without reading the JD misclassifies it. And because biotech (1,911 firms) is
cash-intensive and Form D-driven, the SEC Form D funding gate carries more weight here than
economy-wide. See the mode's "Healthcare Specialization" section.
