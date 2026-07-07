---
status: RUNNABLE-SAMPLE
todos_open: 4
last_gate: "sample-run, 2026-07-06, logs/RUN_LOG.md#2026-07-06-early-pm-sponsorship-triage"
attestation: null
recipe_version: 0.1.0
---

# case / Early-Career PM Sponsorship & Runway Triage

## Purpose

Triages entry-level / new-grad **Product Manager** roles for an international early-career
candidate on F-1 → OPT, producing an auditable Apply / Consider / Skip decision per role
with every term traced to its source. It is **two-track** by design:

- **Sponsor-now** — the company has H-1B approval history for PM-adjacent work → long-term
  viable.
- **Runway-then-pivot** — the company is **E-Verify** enrolled but has little/no H-1B
  history → still viable, because E-Verify enrollment is a prerequisite for the 24-month
  **STEM OPT extension**; take the role to build full-time PM experience, then pivot to a
  sponsoring employer.
- **Skip** — neither H-1B nor E-Verify (cannot even support the STEM OPT extension), or a
  dead/ghost posting, or an impossible start date given the candidate's OPT filing status.

**Use it when** you have a shortlist of PM postings and scarce application effort, and you
need to decide — defensibly — which to pursue now, which to treat as runway, and which to
drop. It is built for the specific case where **PM sponsorship is hard to read**: PM H-1B
filings scatter across SOC codes (11-3013 Product Managers, but also 13-1111 Management
Analysts, 15-1299, 11-2021), so a real sponsor can look like a non-sponsor.

## Source Inventory

| Source | Type | Exact path / command | Human check |
|---|---|---|---|
| Mapped SEC + DOL/H-1B company data | file (CSV) | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | Confirm the target company is present; read `Approval_Rate`, `top_job_titles_sponsored`, `latest_funding_stage/date`, `median_salary_offered`. 30,369 companies as of this run. |
| SEC Form D (funding recency for startups) | dir | `data/sec/form-d/` (`raw/`, `extracted/`, `processed/`) | Confirm a recent Form D filing for early-stage targets (viability, not ghost employer). |
| Bayesian Role Scorer (Ch.11) | command | `npm run score -- <roles.json> --out-dir <dir>` (`scripts/score/role-scorer.mjs`) | The decision core. Combines votes × gates; emits `role-scores.json` + `role-scores.md`. |
| Real-company scorer input (primary) | file (JSON) | `data/examples/pm-roles-healthcare-real.json` | 7 **real** healthcare companies drawn from the mapped CSV; each `sponsorship` term cites its record in a `_source` field. This is the run of record. |
| Synthetic path-coverage fixture | file (JSON) | `data/examples/pm-roles.json` | **Fictional** companies used only to exercise gate/override/timeline paths the real sample doesn't hit — never a claim about a real employer. |
| Posting liveness (optional, Job-Ops) | command | `npm run ats:liveness -- <job-url>` | Confirms a posting is still live before effort is spent. A GATE, not a vote. |

## Proposed Additions

Each is marked with a typed TODO and is **proposed, not run** — its output must be labeled
*proposed* until the TODO is closed with the evidence the lifecycle requires.

1. **[TODO: DEV]** `scripts/score/pm-sponsor-lookup.mjs` — read the mapped CSV for a target
   company and emit a scorer-ready `sponsorship {p, tier, source}`. It must (a) match the
   company, (b) inspect `top_job_titles_sponsored` for PM-adjacent titles across the scatter
   SOC family, and (c) set `source:"record"` only when a PM-adjacent title is actually
   present, else `source:"model-judgment"` with a note. *Belongs because* today the
   `sponsorship.p` is hand-entered; this closes the gap between the raw record and the
   scorer input and makes the SOC-scatter judgment explicit and repeatable.
2. **[TODO: DATA SOURCE]** the public **USCIS E-Verify employer list** → `data/e-verify/`.
   *Belongs because* the runway track depends on E-Verify status, which the repo has no data
   for today (grep confirms E-Verify is mentioned in prose but no dataset exists). Closure:
   file present at `data/e-verify/` + one-line provenance (USCIS origin, download date).
3. **[TODO: DEV]** `scripts/score/two-track-relabel.mjs` — after scoring, re-tag a role the
   scorer would Skip as **Consider / Runway** when the employer is E-Verify enrolled, with a
   documented reason. *Belongs because* the base scorer treats `sponsorship.p` as H-1B
   viability only; the runway track is a profile-specific interpretation that must be
   layered and labeled, never faked into the sponsorship number. (Until built, use the
   scorer's existing `override` field with a documented reason — as this recipe's sample run
   does.)
4. **[TODO: DEV]** `scripts/score/preflight-validate.mjs` — a required-fields validator that
   **refuses to score** a role whose `sponsorship.p` or `timeline.factor` is missing or
   non-numeric, instead of silently dropping the vote. *Belongs because* the sample run's
   break test showed the scorer scores such a role on `fit` alone and returns a confident
   Skip — a data gap masquerading as a decision (see Stop Conditions and the worked run).

## Phase Gates

Hard stops. Liveness and visa-timeline are **gates, not votes** — a closed gate zeroes the
composite regardless of how strong the other evidence is.

1. **Source gate.** The target company is found in the mapped CSV, or its absence is
   recorded and its sponsorship term is marked `model-judgment` (never `record`).
   Test: `grep -i "<company>" data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv || echo "absent — mark model-judgment"`.
2. **Scope gate.** The run declares sample vs. live and uses only anonymized/fictional data
   in any tracked artifact. Test: `python3 -m json.tool data/examples/pm-roles.json`.
3. **Liveness gate (hard stop).** Every role's `liveness.factor` is set from a real check,
   not assumed. A dead posting (factor ≈ 0) is Skipped regardless of votes.
   Test: `npm run ats:liveness -- <job-url>` (or a recorded manual check).
4. **Visa-timeline gate (hard stop).** `timeline.factor` reflects the candidate's actual OPT
   **filing status**, not a generic countdown. For this candidate (as of 2026-07-06): OPT
   I-20 requested 2026-07-01 (DSO approval pending); USCIS I-765 not yet filed; requested
   start 2026-09-01; realistic EAD ~Oct–Nov 2026. Roles demanding immediate work
   authorization get a reduced factor; roles requiring authorization the candidate cannot
   yet hold are Skipped. Human clears this gate.
5. **Report gate.** Agent log (JSON) and human report (Markdown) are both written, and the
   verified-vs-inferred split is present. Test: `test -f <out-dir>/role-scores.json && test -f <out-dir>/role-scores.md`.

## What It Can and Cannot Verify

**Can verify (from records / tested scripts):**
- Whether a company has H-1B **approval history** and its approval rate (mapped CSV).
- Whether `top_job_titles_sponsored` lists a PM-adjacent title (mapped CSV).
- Recent **Form D funding** for early-stage targets (SEC data) — viable vs. funding-dry.
- **Median salary** offered on prior filings (mapped CSV) — a rough floor.
- **Posting liveness** (ats:liveness) — a gate.
- (once TODO #2 lands) **E-Verify enrollment** — the runway prerequisite.

**Cannot verify (must stay judgment or manual):**
- Whether the employer will sponsor **this specific candidate** for **this specific role**.
- The exact **future SOC code** a PM role will be filed under (no LCA yet).
- Whether a **runway** (E-Verify, non-sponsor) employer will *ever* sponsor after the
  candidate gains experience — the pivot can dead-end. E-Verify ≠ willingness to file H-1B.
- **Entry-level fit** without reading the job description — `fit` is a model judgment.

## Output Contract

Two artifacts, two readers (P5): one cannot serve both.

### Agent log (JSON)
File: `<out-dir>/role-scores.json`
Content: per-role `composite`, `recommendation`, `machine_recommendation`, `reason`,
`override`, and a full `trace` (votes with value·weight·source, gate multipliers,
arithmetic). Machine-checkable; drives any downstream automation.

### Human report (Markdown)
File: `<out-dir>/role-scores.md`
Reader: the candidate (and a mentor/reviewer clearing the timeline gate).
Decision enabled: apply now / treat as runway / skip — with the term-by-term audit visible.
Sections: weights + threshold, summary with skip rate, one row per role with the audit trace.

## Stop Conditions

The mode must **refuse to produce a `record`-backed score** (and say so) when:
- Sponsorship evidence is absent for a company — mark the term `model-judgment`, never
  fabricate a `record` value. (Note: the base scorer currently *silently drops* a missing
  `sponsorship.p` and scores on fit alone — TODO #4 exists to turn that into a refusal.)
- The candidate's OPT **filing status / timeline** is unknown — the timeline gate cannot be
  set, so no decision is issued.
- E-Verify status is unknown and the role is being considered as **runway** — do not tag
  Runway on an unverified E-Verify claim (TODO #2).
- A **proposed** script (TODO #1–#4) is needed for a value — that value stays inferred or
  manual and is labeled *proposed*, never presented as if it ran.

## Healthcare Specialization (optional profile narrowing)

For a candidate targeting **healthcare / health-tech PM** roles specifically (digital health,
EHR, payer/provider, medtech, biotech-adjacent product), narrow the source scan by the CSV
`industry` column (`Biotechnology`, `Pharmaceuticals`, `Other Health Care`, `Hospitals and
Physicians`, `Health Insurance`) before scoring. Verified against the data on this run:

- **4,745** of the 30,369 companies are healthcare-industry (Biotechnology 1,911 · Other
  Health Care 2,173 · Pharmaceuticals 520 · Hospitals 122 · Health Insurance 19).
- Of those 4,745, exactly **3** list "Product Manager" in `top_job_titles_sponsored`
  (**0.06%**) — yet the same firms sponsor heavily under scientific/clinical/engineering
  titles (Senior Scientist, Software Engineer, Business Analyst, Quality Analyst).

This makes the SOC-scatter asymmetry (FM1) **extreme** in healthcare: a title-literal search
returns almost nothing, so adjacent-title reasoning is mandatory, not optional. Two knock-on
effects for this profile:

- **Funding gate matters more.** Biotech (1,911 firms) is cash-intensive and Form D-driven; a
  stale/absent Form D is a stronger ghost-employer signal here than economy-wide. Lean on
  `data/sec/form-d/`.
- **New failure mode — FM3 (clinical vs. digital-health PM confusion).** A healthcare role
  titled "Product Manager" may be a *clinical/scientific* role expecting an MD/PhD, not a
  *software/digital-health* PM role. Scoring `fit` without reading the JD can misclassify
  either direction. Keep `fit` a labeled model-judgment and read the JD before trusting it.

The industry filter folds into proposed **TODO #1** (the DEV `pm-sponsor-lookup` helper):
accept an optional `--industry` argument that pre-filters the CSV before the PM-adjacent
title match. No new TODO — this is a documented extension of an existing one.

## RUN_LOG template

```markdown
### YYYY-MM-DD — case-early-pm-sponsorship-triage (sample|live)
- Inputs: data/examples/pm-roles.json (N roles), profile: needs-sponsorship
- Command: npm run score -- data/examples/pm-roles.json --out-dir <dir>
- Outputs: <dir>/role-scores.json, <dir>/role-scores.md
- Result: Apply A · Consider C · Skip S (skip R%)
- Gates: liveness [cleared/by], timeline [cleared/by]
- Open issues: <typed TODOs still open; anything unverified>
```

## Notes

Anchored on `npm run score`, which runs today; this recipe deliberately reaches
**RUNNABLE-SAMPLE** (one real sample run, logged) rather than claiming a status it has not
earned. Promotion to VERIFIED requires a named-human attestation bound to this version and
the closure of the four typed TODOs above.
