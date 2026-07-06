# Domain Justification — case-ms-swe-stem-opt-h1b

**Author:** Neha Dharanu · **Date:** 2026-07-03 · **Recipe version:** 0.1.0
**Status reached:** RUNNABLE-SAMPLE

## Who uses this mode and when

An MS graduate in Information Systems (SOC 15-1252 target: Full-Stack /
Backend Software Engineer) whose F-1 OPT has not yet activated, with a
confirmed STEM OPT extension through 2029 and an H-1B FY2028 lottery
target. The mode activates between OPT start (October 2026) and the latest
viable offer date under standard H-1B processing (December 2026) — a
ten-week window where every application against a non-sponsor or a dead
posting consumes unemployment days that cannot be recovered.

This is not a general international-student job search mode. It is
specifically designed for the pre-OPT-activation to first-H1B-lottery gap,
where the cost of a wasted application is measured in visa buffer days,
not just time.

## Information asymmetry addressed

Without this mode, the student cannot easily see:

1. Which companies have actually filed LCAs under SWE-family titles
   specifically — not just any H-1B filing. Of the 30,369 companies in
   `SEC_DOL_H1b_data_mapped.csv`, only 1,552 (5.1%) have any sponsorship
   data at all. Of those, 493 have SWE-family titles in
   `top_job_titles_sponsored`. After geography filter for CA/WA: 338
   viable candidates. A company that sponsors data scientists but has never
   filed for a software engineer is not a reliable sponsor for this search.
   The 80-days-to-stay dataset makes this visible; a manual search of the
   DOL disclosure portal does not.

2. Whether a posting is still live before applying. Greenhouse and Lever
   boards frequently show filled roles for weeks after closure. The liveness
   gate (`npm run ats:liveness`) catches these before an application is
   submitted and an unemployment day is potentially consumed. In testing,
   a real Stripe posting returned uncertain — meaning the page loaded but
   no apply button was detected, a state a student under time pressure
   might misread as live. Additionally, my.greenhouse.io URLs consistently
   return uncertain regardless of posting status — an ATS subdomain
   limitation discovered during testing that affects a significant portion
   of the target company universe.

3. Whether a role at a target company is cognitively resilient — whether
   the work is the kind AI cannot yet reliably do. For a student entering
   a market where AI coding tools are compressing entry-level SWE demand,
   the BLS cognitive demand score for SOC 15-1252 is a signal worth
   checking before investing in a company's pipeline.

## Engine layer connections

- **80 Days to Stay**: H-1B LCA filing history and SEC Form D funding
  signals — sponsorship gate and company viability check. Verified:
  493 SWE-title sponsors identified from 30,369 companies in CSV.
  Databricks most recently funded Sept 2025 — strongest recency signal
  in the sample.
- **Job-Ops**: ATS liveness gate — hard stop before application submission.
  Verified: liveness checks ran against real URLs for all five target
  companies. Databricks, Snowflake, Anyscale returned active. Stripe
  returned uncertain. Four additional my.greenhouse.io URLs returned
  uncertain systematically — ATS subdomain limitation documented.
- **Cognitive Pivot**: BLS/O*NET role-quality score for SOC 15-1252 —
  filters for roles resilient to AI substitution.

## Failure modes

**Failure mode 1 — Stale sponsorship signal treated as current intent.**
The H-1B dataset shows historical LCA filings. A company that filed for
SWE roles three years ago and has since frozen engineering hiring will
still appear as a proven sponsor. The mode passes the sponsorship gate
on a company that will not actually sponsor. This error is hardest to
catch for students who do not know how to read DOL LCA disclosure data
directly — the filing count looks like a green light when it is actually
a historical artifact. A student with an insider contact or access to
immigration forums like Blind would hear about policy changes; a student
fresh out of a graduate program with no US professional network has
neither channel and will trust the historical record at face value.

**Failure mode 2 — Liveness uncertainty misread as liveness confirmation.**
The liveness checker returns three states: active, expired, and uncertain.
A student who sees "uncertain — content present but no visible apply
control found" may interpret this as a live posting and apply. In testing,
a real Stripe posting returned uncertain — meaning the page loaded but
no apply button was detected. Additionally, all my.greenhouse.io URLs
tested returned uncertain systematically regardless of actual posting
status — a Playwright subdomain limitation, not a posting-specific result.
The mode's liveness gate treats uncertain as CONSIDER-with-manual-check,
not as PASS. This error is hardest to catch for students under OPT time
pressure, who are most likely to skip the manual check and apply
immediately. For a student with unemployment days already consumed against
an 80-day buffer, a wasted application on a filled role is not just time
lost — it is visa runway burned.

**Failure mode 3 — SWE title inflation passing the sponsorship filter.**
The `top_job_titles_sponsored` column is free text. A company that has
sponsored "AI Solutions Engineer", "Developer Advocate", or "QA Automation
Engineer" will match a keyword search for "engineer" and appear to be a
SWE sponsor. In reality those titles may not map to SOC 15-1252 Software
Developer roles at all. The mode passes the sponsorship gate on a company
whose actual SWE hiring history is thin or zero. This error is hardest
to catch for students who look only at the sponsorship tier in the scored
output — the score looks strong because the company has many approvals,
but the approvals are for adjacent technical roles, not the role the
student is applying for. A student with prior US industry experience
would recognize the title mismatch from the company's engineering culture;
a student on their first US job search may not.
