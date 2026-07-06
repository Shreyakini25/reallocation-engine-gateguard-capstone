---
status: RUNNABLE-SAMPLE
todos_open: 6
last_gate: liveness-check
attestation: null
recipe_version: 0.1.0
---

# case-mle-opt-aug2026-h1b-runway.md

**Mode:** ML Engineering / MLOps — F-1 OPT Countdown + H-1B Sponsorship Triage  
**Target User:** International master's student in ML Engineering graduating August 2026, OPT authorization beginning ~September 2026, 36-month STEM OPT window ending ~September 2029, targeting roles as ML Engineer, MLOps Engineer, or ML Platform Engineer (SOC 15-2051 / 15-1252)

---

## Purpose

This mode answers one question before any application is submitted:

> "Does this company have a realistic, evidenced path to H-1B sponsorship before my OPT expires — and is this role the kind of work AI is unlikely to commoditize?"

It is used during the **active application sprint** (weeks 1–12 of OPT), run once per target company batch (10–20 companies at a time). It does not predict hiring outcomes. It filters out ghost employers, funding-dry companies, and roles concentrated in AI-substitutable task profiles — before you spend time on them.

**When to use:**
- You have a list of 10–20 companies you're considering applying to
- You want to triage by sponsorship likelihood + role resilience before writing a single cover letter
- You are within 60 days of OPT start and need to prioritize by sponsorship timeline, not just brand name

**When NOT to use:**
- As a final answer on whether to apply — this mode raises or lowers confidence; it does not decide
- To evaluate a single role in isolation (minimum batch: 5 companies)
- After accepting an offer (use a different mode for offer evaluation)

---

## Source Inventory

All paths are relative to the repo root.

| Source | Path / Command | What it provides |
|---|---|---|
| Role quality scorer | `npm run score -- data/examples/ch11-roles.json` | Composite sponsorship + fit + liveness score per role |
| ATS liveness check | `npm run ats:liveness -- --url <individual-posting-url>` | Whether a single posting is still live (GATE) — must be a direct posting URL, not a board page |
| 80 Days company data | `data/80-days-to-stay/` | Company-level H-1B and funding signals (subdirectory structure — see day folders) |
| BLS O*NET data | `data/BLS/` | Wage and occupation data for SOC scoring |
| SEC Form D data | `data/sec/` | Recent funding filings |
| Example roles input | `data/examples/ch11-roles.json` | Working example for scorer — use as template for custom roles.json |

**Confirmed working commands (verified 2026-07-05):**
- `npm run verify` — conformance check (130/131 pass on Windows; 1 WSL failure is env-only)
- `npm run doctor` — environment and script presence check
- `npm run score -- data\examples\ch11-roles.json` — role scorer with example data
- `npm run ats:liveness -- --url <url>` — requires Playwright (`npx playwright install chromium` on Windows)

---

## Phase Gates

These are hard stops. Do not proceed to the next phase until the condition is met.

| Gate | Condition | What blocks you |
|---|---|---|
| **G1 — Liveness** | `npm run ats:liveness -- --url <individual-posting-url>` returns `active` | `expired` stops this company. `uncertain` stops this company until a valid per-posting URL is confirmed — board-level URLs (e.g. `boards.greenhouse.io/company`) will return `uncertain` by design; you need the URL of an individual role page |
| **G2 — Sponsorship signal** | Company appears in `data/80-days-to-stay/` day folders with H-1B signal, OR scorer returns composite ≥ 0.3 with sponsorship term > 0 | If sponsorship term = 0 in scorer output, classify as `UNVERIFIED-SPONSOR` |
| **G3 — Funding recency** | SEC Form D filing in `data/sec/` within 18 months, OR company is post-Series B with public revenue data | No recent funding signal → flag `FUNDING-STALE` |
| **G4 — Role resilience** | Scorer composite ≥ 0.3 with role_quality contributing positively | Note: role_quality weight is currently 0 in scorer (marked [VERIFY] in output) — this gate depends on [TODO-4] |

G1 is a gate, not a vote. `expired` or unresolvable `uncertain` ends the workflow for that company.

---

## What This Mode Can and Cannot Verify

### Can verify (script- or data-grounded, confirmed in this run)
- Whether a job posting URL is still live — `npm run ats:liveness` (requires individual posting URL)
- Composite sponsorship + fit + liveness score for a role — `npm run score`
- That a ghost posting scores 0.000 regardless of sponsorship history (liveness gate zeroes composite)
- Whether repo environment is runnable — `npm run doctor`
- Wage and occupation data for SOC 15-2051 / 15-1252 — `data/BLS/`

### Cannot verify (human judgment required)
- Whether the company will sponsor *you specifically* — past petitions are a signal, not a promise
- Whether a role listed under SOC 15-2051 actually involves the tasks in that O*NET profile
- Whether a Form D company has runway beyond the filing date
- Cap-exempt status (universities, nonprofits) — requires manual check
- Whether `uncertain` from liveness check means dead or just wrong URL type — human must supply correct URL

---

## Workflow

```
BATCH INPUT: roles.json with company + posting URL per role
        │
        ▼
[G1] npm run score -- roles.json
        │ liveness = 0 → composite = 0.000 → SKIP (automatic)
        ▼ liveness confirmed
[G2] Review scorer output: sponsorship term > 0?
        │ sponsorship = 0 → UNVERIFIED-SPONSOR, flag for manual check
        ▼ sponsorship confirmed
[G3] Cross-reference data/sec/ for funding recency
        │ STALE → tag FUNDING-STALE
        ▼ RECENT or PUBLIC-CO
[G4] Composite ≥ 0.3 → APPLY
     Composite 0.2–0.3 → CONSIDER
     Composite < 0.2 → SKIP (unless human override with logged reason)
```

**How to build your roles.json:** Use `data/examples/ch11-roles.json` as the template. Add one object per role with at minimum: company name, posting URL, and known sponsorship tier (Proven / Likely / Unknown).

---

## Output Contract

Two artifacts are required. One artifact cannot serve both readers.

### Artifact A — Agent Log (JSON)
Written to `logs/mle-opt-run-<YYYY-MM-DD>.json`

```json
{
  "run_date": "2026-09-05",
  "mode": "case-mle-opt-aug2026-h1b-runway",
  "recipe_version": "0.1.0",
  "opt_start": "2026-09-01",
  "opt_end_stem": "2029-09-01",
  "soc_codes": ["15-2051", "15-1252"],
  "batch_size": 10,
  "scored": 10,
  "apply": 3,
  "consider": 2,
  "skip": 5,
  "ghost_postings_zeroed": 1,
  "unverified_sponsor": 1,
  "funding_stale": 0,
  "open_issues": ["role_quality weight unverified in scorer"]
}
```

### Artifact B — Human Report (Markdown)
Written to `private/mle-opt-report-<YYYY-MM-DD>.md` (gitignored)

| Company | Posting Live? | Sponsorship | Composite | Rec | Human Flags |
|---|---|---|---|---|---|
| Acme ML | ✓ active | Proven (0.9) | 0.446 | **APPLY** | — |
| Beta Cloud | ✓ active | Likely (0.6) | 0.418 | **CONSIDER** | Sponsorship tier not Proven |
| Ghost Co | expired | Proven (0.9) | 0.000 | **SKIP** | Ghost posting — liveness zeroed composite |
| Epsilon AI | uncertain | Unknown | — | **STOP** | [HUMAN] Uncertain URL — supply direct posting link |

---

## Stop Conditions

The mode must refuse to produce a verdict and emit `INSUFFICIENT-DATA` if:

- Liveness returns `uncertain` and cause is not resolved (wrong URL type vs. true network failure)
- Scorer output contains `[VERIFY]` on a term that is load-bearing for the verdict
- The roles.json input is missing the posting URL field
- The OPT end date is not set in the run profile

---

## Proposed Additions [TODO]

### [TODO-1] SOC-filtered H-1B query script
`npm run mle:h1b-filter -- --soc 15-2051 --min-petitions 3 --years 2`  
**Rationale:** The H-1B data exists in `data/80-days-to-stay/` but no script filters by SOC code. A company may sponsor H-1B for administrative roles but never for ML Engineers. Without SOC filtering, petition counts overstate sponsorship likelihood for this mode's target roles.

### [TODO-2] Cap-gap runway calculator
`npm run mle:runway -- --company <name> --opt-end 2029-09-01`  
**Rationale:** Computes whether H-1B cap lottery timing (April filing, October start) creates a gap against the user's OPT expiration. The engine has OPT and H-1B data but no script that performs this per-company, per-graduation-date calculation.

### [TODO-3] MLOps SOC mapping table
`data/mle/soc-mlops-map.json`  
**Rationale:** MLOps titles (ML Platform Engineer, Model Deployment Engineer) map inconsistently to SOC codes. Without a title→SOC lookup, the scorer may be run against the wrong SOC, producing a misleading composite.

### [TODO-4] role_quality weight verification
**Rationale:** The scorer currently sets `role_quality weight = 0` and marks it `[VERIFY]`. Gate G4 (role resilience) cannot be enforced until this weight is pinned to a documented value. Until resolved, G4 is advisory only.

---

## RUN_LOG Template

```markdown
## RUN_LOG Entry

- Date: <YYYY-MM-DD>
- Mode: case-mle-opt-aug2026-h1b-runway v0.1.0
- OPT Start: <date>
- Batch Size: <N>
- Commands Run:
  - npm run score -- <roles.json path>
  - npm run ats:liveness -- --url <url> (×N)
- Outputs:
  - logs/mle-opt-run-<date>.json
  - private/mle-opt-report-<date>.md (gitignored)
- Apply / Consider / Skip counts: <N> / <N> / <N>
- Ghost postings zeroed: <N>
- Open issues: <list>
- Notes: <honest reflection>
```
