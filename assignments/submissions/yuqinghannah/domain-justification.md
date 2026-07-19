# Domain Justification — ux-designer-sponsor-triage

**Who uses this and when:** An F-1 international graduate student in UX/Product
Design on STEM OPT (36-month runway), with H-1B sponsorship as a hard,
non-negotiable filter, applying to Product Designer / UX Designer roles at
B2B SaaS, AI, fintech, and proptech companies. Used at the shortlisting stage,
before investing portfolio-tailoring time in any specific application.

**Information asymmetry addressed:** Companies do not publish H-1B sponsorship
willingness on job postings, and generic H-1B counts (e.g. "sponsors visas")
don't tell a designer whether the company has ever sponsored a *design-titled*
role specifically — a company can file dozens of H-1Bs for engineers and zero
for designers, which changes the real odds for this exact applicant. Separately,
design applications carry a heavier sunk cost than engineering ones (tailored
case studies, portfolio reordering), so a stale/dead posting wastes
disproportionately more effort. This mode makes both signals — designer-specific
sponsorship history and posting liveness — visible before that effort is spent.

**Engine layer connections:**
- **80 Days to Stay** — `SEC_DOL_H1b_data_mapped.csv`'s
  `top_job_titles_sponsored` field gives the designer-specific sponsorship
  signal, joined with funding recency/stage as a solvency check.
- **Job-Ops** — `ats:scan` / `ats:liveness` prevent wasted effort on dead
  postings.

**Failure modes specific to this domain:**
1. **Sponsorship history ≠ current policy.** A company that sponsored a
   "Product Designer" H-1B in 2019 may have quietly stopped after layoffs or
   a hiring freeze. The dataset shows history, not current intent. This is
   hardest to catch for a first-time applicant, because the absence of a
   recent-policy signal is invisible — the data looks equally "clean" whether
   the policy is current or five years stale.
2. **Blunt title matching produces false confidence.** The current search
   (substring match on "Designer") cannot distinguish "Product Designer" from
   "Product Design Manager" (a different, often non-sponsorable band) or catch
   title variants like "UX Lead" that don't contain the word "Designer" at
   all. A student relying on a raw match count (e.g. "68 companies") without
   auditing titles row-by-row could over- or under-estimate real
   sponsorship-eligible companies — and this error is easiest to miss
   precisely because the count itself looks authoritative.
