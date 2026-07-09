---
status: RUNNABLE-SAMPLE
todos_open: 3
last_gate: "score-fixture-run, 2026-07-04, logs/RUN_LOG.md#2026-07-04"
attestation: null
recipe_version: 0.1.0
---

# TPM at AI/Cloud-Infra Employers — Title-Level Sponsorship Fit

## Purpose

Score AI and cloud-infrastructure companies for whether they realistically sponsor **Technical Product/Program Manager** roles for an F-1 OPT candidate — not just whether the company sponsors *someone*. A company can have strong H-1B history for Software Engineers and almost none for PM/TPM titles. Company-level sponsorship filters miss this. This mode filters `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` by string-matching the `top_job_titles_sponsored` field against management-flavored titles, then hands the survivors to `npm run score` for a Bayesian Apply/Consider/Skip decision with liveness and timeline as multiplicative gates.

Use it when: you are an F-1 OPT TPM/PM candidate targeting AI or cloud-infrastructure employers, and you want to spend OPT time on companies whose sponsorship history actually covers roles like yours.

## Who this is for

International F-1 student with post-completion OPT filed and starting 15 September 2026, ending 14 September 2027 (STEM OPT extension eligibility uncertain until employment at an E-Verify employer is secured). Targeting **Technical Product Manager, Program Manager, or Software Engineer** roles at **AI/LLM platforms, cloud infrastructure, or GPU/hardware computing companies**, primarily public but late-stage Series C acceptable. The candidate has approximately 12 months of standard OPT to secure a sponsoring employer before the April 2027 H-1B cap lottery (or, if STEM OPT extension is granted post-employment, up to 3 years total). Not designed for engineering-only candidates — SWE-focused sponsorship modes already exist (`case-fullstack-swe-sponsor-triage`, `case-nlp-ml-sponsorship-triage`).

Distinction from `case-tpm-pivot.md`: that mode classifies whether a TPM posting is *really* a TPM role (PM-adjacent vs infra-heavy). This mode asks whether the *employer's sponsorship history* covers TPM-family titles at all.

## Source Inventory

| Source | Path or command | Verified? |
|---|---|---|
| Master sponsorship + funding CSV | `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` | Verified. 30,369 companies, 20 columns; see `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-audit.md` (5.1% sponsorship-populated, 41.5% missing website, no SOC codes, no ATS columns). |
| Composite Bayesian scorer | `npm run score <roles.json>` (`scripts/score/role-scorer.mjs`) | Verified 2026-06-13; reproduces Ch.11 worked example (Cambridge biotech → Apply 0.446); JSON + Markdown audit output. |
| Posting liveness check | `npm run ats:liveness -- <job-url>` (`scripts/ats/check-liveness.mjs`) | Verified command target present (`npm run doctor`); a GATE, not a vote. |
| ATS provider detection | `npm run ats:scan -- --dry-run` (`scripts/ats/scan.mjs`) | Verified command target present. |
| Doctor / conformance | `npm run doctor` · `npm run verify` | Verified; doctor passes on this branch (`mode/saloni-tpm-ai-infra`). |
| Role fixture (worked-run input) | `data/examples/ch11-roles.json` | Verified — the scorer's canonical test input. |

## Proposed additions (typed TODOs)

- `[TODO DATA SOURCE]` — **SOC-code enrichment on the H-1B data.** The joined CSV has no SOC codes (audit confirms). A future enrichment step would attach SOC codes to the H-1B LCA rows so sponsorship history can be filtered by SOC 11-3021 (Computer & Information Systems Managers) or 13-1082 (Project Management Specialists) rather than by free-text title match. Would replace the title-string filter with a categorical one. Rationale: title strings drift and collide (see Failure Modes below); SOC codes don't.

- `[TODO DEV]` — **`scripts/tpm/filter-tpm-candidates.py`.** A script that reads `SEC_DOL_H1b_data_mapped.csv`, filters to rows where `top_job_titles_sponsored` matches a whitelisted set of management titles, optionally filters by `industry`, and emits a `roles.json` shaped for `npm run score`. Currently proposed; this mode demonstrates the workflow on a manually-constructed roles fixture (see Worked Run).

- `[TODO DEV]` — **`scripts/tpm/tpm-title-taxonomy.md`.** A curated taxonomy of management-family titles ("Technical Product Manager", "Product Manager", "Program Manager", "Sr Product Manager", "TPM", etc.) *and* known collisions to exclude ("Product Marketing Manager", "Account Manager", "Engineering Manager"). Rationale for a human-curated file rather than an LLM classifier: per P2, prefer a stored artifact over prompted judgment.

## Phase Gates

Gates are hard stops per P4. Each has a testable condition.

1. **Data present gate.** The master CSV must exist and be readable before any filtering.
   *Test:* `test -f data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv && head -1 data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv | grep -q top_job_titles_sponsored`.

2. **Sponsorship-populated gate.** The candidate company must have `Total Approvals ≥ 1` (i.e., appear in the 5.1% of the dataset with any DOL history). Companies without sponsorship data must be SKIPped, not guessed at, per Verified-Data Rule 5.
   *Test:* CSV row's `Total Approvals` field is present and > 0 before the row proceeds to title matching.

3. **Title-match gate.** The candidate company's `top_job_titles_sponsored` must contain at least one whitelisted management-family title *and* no exclusion collision.
   *Test:* Case-insensitive substring match against the whitelist; deny-list check for excluded strings.

4. **Timeline gate (visa — hard stop, per P4).** Candidate's OPT authorization end date must exceed today + typical H-1B lag. For the profile this mode is designed for: post-completion OPT runs 15 Sep 2026 to 14 Sep 2027, giving ~12 months to secure a sponsoring employer by the April 2027 H-1B cap lottery. A candidate with < 6 months of OPT runway at time of application must be SKIPped regardless of sponsorship fit — the H-1B path from that OPT window is not viable. This is a legal gate, not a preference. In scorer terms: `timeline.factor` is 0 when the OPT clock is too short.
   *Test:* `authorization_end_date` in the candidate profile is at least 6 months after today.

5. **Liveness gate (per the assignment: "liveness is a gate, not a vote").** Any specific posting URL considered must be verified live via `npm run ats:liveness -- <job-url>` before scoring can produce a non-zero result. A closed posting zeroes the composite regardless of votes (as demonstrated in the Ch.11 fixture's `ghost-posting` row: sponsorship 0.9 × fit 0.8 × liveness 0 = 0.000 → Skip).
   *Test:* `npm run ats:liveness -- <url>` exit code 0 AND output includes `"live": true` or equivalent.

6. **Sparsity honesty gate (unique to this mode).** The mode must publish, in its human report, the count of companies dropped at each filter step, including the count SKIPped for lack of sponsorship data. This is not a runtime gate — it is a reporting requirement, per P3 (provenance) and Verified-Data Rule 6 (say what is missing).
   *Test:* Human report contains the funnel table (input count → after-sponsorship-filter → after-title-filter → after-industry-filter → scored).

## Steps

1. **Load master CSV.** Labor: script. Reads `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`. Output: DataFrame or CSV of 30,369 rows. Goes to memory. *Currently manual for the worked run; full automation is proposed under "Proposed additions" (filter script).*

2. **Sponsorship-populated filter.** Labor: script. Keeps rows where `Total Approvals > 0`. Expected drop: ~94.9% (28,812 rows) → ~1,557 remaining. Goes to memory.

3. **Title-match filter.** Labor: script. Keeps rows where `top_job_titles_sponsored` contains any whitelisted management-family title AND no exclusion string. Whitelist and deny-list live in the proposed taxonomy file (see "Proposed additions"). Goes to memory.

4. **Industry filter.** Labor: script. Keeps rows where `industry` matches AI/cloud-infra keywords (e.g. "Other Technology", "Computers", "Telecommunications"). This is a rough proxy for AI/infra — the CSV lacks a finer sector taxonomy. Goes to memory.

5. **Convert to roles.json.** Labor: script (proposed). Maps each surviving row to the schema `npm run score` expects:
   - `sponsorship.p` from `Approval_Rate` (0.0–1.0)
   - `sponsorship.tier` from thresholds ("Proven" ≥ 0.7, "Likely" 0.4–0.7, "Possible" < 0.4)
   - `sponsorship.source: "record"`
   - `fit.p` from a fixed 0.7 baseline (`source: "model-judgment"`) — the mode does not attempt per-role fit scoring; that is beyond scope
   - `liveness.factor: 1.0` (`source: "record"`) if a specific URL was live-checked in Step 6; otherwise omit the role or set to 0
   - `timeline.factor` from the candidate's own OPT runway (`source: "your-input"`)

6. **Liveness check.** Labor: script + human review. For each candidate role with a posting URL, run `npm run ats:liveness -- <url>` and record the result. Roles without a URL cannot pass this gate.

7. **Score.** Labor: script. Run `npm run score <roles.json>`. Emits `data/examples/role-scores.json` and `data/examples/role-scores.md` (or a `--out-dir` of choice).

8. **Human report.** Labor: script (proposed) + human review. Publishes the funnel counts, the scored table, and the honest sparsity statement.

## Output Contract (P5 — two customers, twice)

### Agent output (JSON)
File: `logs/case-tpm-ai-infra-sponsor-<DATE>.json`

Wraps the scorer's own JSON output plus a funnel manifest:
```json
{
  "workflow": "case-tpm-ai-infra-sponsor",
  "run_id": "<DATE>-<n>",
  "mode": "sample | live",
  "funnel": {
    "input_rows": 30369,
    "after_sponsorship_filter": 1557,
    "after_title_filter": "<n>",
    "after_industry_filter": "<n>",
    "scored": "<n>"
  },
  "scorer_output_path": "data/examples/role-scores.json",
  "gates_cleared": ["data-present", "sponsorship-populated", "title-match", "timeline", "liveness", "sparsity-reported"],
  "todos_open": ["scripts/tpm/filter-tpm-candidates.py", "scripts/tpm/tpm-title-taxonomy.md", "SOC enrichment"],
  "generated_at": "<ISO timestamp>"
}
```

### Human report (Markdown)
File: `reports/generated/case-tpm-ai-infra-sponsor-<DATE>.md`

Reader: TPM job-seeker on F-1 OPT (the mode's target user).

Decision enabled: which companies (from the surviving candidate set) to spend OPT time applying to, and which to skip.

Required sections:
- **Run summary** — one paragraph.
- **Funnel** — input count → after each filter → scored (per Phase Gate 6).
- **Scored table** — Apply / Consider / Skip, with the scorer's per-term audit trace preserved (sponsorship value + weight + source, fit value + weight + source, gates and their sources).
- **Verified vs. inferred** — line-by-line for at least the top 3 rows. Explicit call-out of which factors came from records vs. model-judgment vs. your-input.
- **Sparsity statement** — "N companies scored; M SKIPped for no sponsorship data (P3 discipline — the mode refuses to guess where the record is silent)."
- **Open TODOs and their impact** — what the mode couldn't verify and why.

## Stop Conditions

The mode must refuse to produce a recommendation, rather than guess, when any of the following are true:

- The master CSV is missing or unreadable (Gate 1 fail).
- A candidate company has no sponsorship data (`Total Approvals` null or 0). SKIP with reason: "no DOL H-1B history on record; per P3, sponsorship signal is silent."
- A candidate posting URL has not been live-checked. SKIP with reason: "liveness gate not cleared."
- The candidate's OPT authorization end date is less than 6 months out and the profile requires sponsorship. SKIP with reason: "timeline gate fails — insufficient runway for H-1B path from this OPT window."
- The title-match against `top_job_titles_sponsored` collides with an exclusion string (see Failure Mode 1 below). SKIP with reason: "title-family collision — sponsorship history is for a different role family."

## What this mode can and cannot verify

**Can verify (traces to record):**
- Whether a company has *any* H-1B sponsorship history (from `Total Approvals`).
- What titles the company has historically sponsored (from `top_job_titles_sponsored`).
- The company's most recent SEC Form D funding date (from `latest_funding_date`).
- Whether a specific job URL is currently live (via `ats:liveness`).
- The Bayesian composite score, term by term, from `npm run score`.

**Cannot verify (must remain inferred or refused):**
- Whether the *specific role* a candidate is applying to would be sponsored at the same rate as the company's historical average. (H-1B history is per-title, not per-role-instance.)
- Whether "Product Manager" in `top_job_titles_sponsored` refers to a technical PM, a product marketing manager, or a product analyst. (Title collisions — see Failure Mode 1.)
- Whether the company's sponsorship policy has changed since its last LCA filing.
- The company's *willingness* to sponsor a candidate with a PM background (as opposed to prior sponsorship existing at all).
- Fit — the mode uses a fixed 0.7 baseline as a placeholder; per-role fit scoring is out of scope.

## RUN_LOG template

```markdown
## YYYY-MM-DD — case-tpm-ai-infra-sponsor sample run

- **Recipe:** case-tpm-ai-infra-sponsor v0.1.0
- **Mode:** sample (no writes to source data)
- **Inputs:** data/examples/ch11-roles.json (canonical scorer fixture, used as a shape-check anchor for the worked run)
- **Outputs:** data/examples/role-scores.json, data/examples/role-scores.md
- **Result:** 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%)
- **Gates cleared:** data-present, sponsorship-populated (fixture), timeline (fixture), liveness (fixture), sparsity-reported
- **Open issues:** filter script and title taxonomy not yet built (proposed under "Proposed additions"); SOC-enrichment proposed; industry filter is a coarse proxy without a finer taxonomy.
```
