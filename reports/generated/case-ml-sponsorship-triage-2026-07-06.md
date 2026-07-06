# ML Engineering Sponsorship Triage — Run Report

- **Mode:** `case-ml-sponsorship-triage` v0.2.0 (status: RUNNABLE-SAMPLE)
- **Date:** 2026-07-06
- **Reader:** the student (or a peer advisor) deciding which companies to apply to next
- **Agent log (machine twin):** `logs/case-ml-sponsorship-triage-2026-07-06.json`

## Run summary

Filtered the 30,369-company H-1B/sponsorship master file down to a candidate set, then
gated it on funding recency and posting liveness.

| Funnel stage | Count |
|---|---|
| Companies in master file | 30,369 |
| With H-1B approvals (`Total Approvals > 0`) | 1,552 |
| With ML/Data-Science titles in sponsorship history | 150 |
| Also filed Form D in most recent quarter (2026q1) | 3 |
| Passed the liveness gate (ATS-detected live posting) | 0 |
| **Recommended to Apply** | **0** |

Skip is a successful outcome. A healthy run of this engine skips most evaluated roles;
this run skipped all three finalists at the liveness gate — the correct behavior, not a
failure.

## Gate results

| Gate | Type | Result |
|---|---|---|
| Ingest | hard | ✅ Pass — CSV + Form D JSON parsed, non-empty filtered set |
| Cognitive-pivot | soft | ⚠ Pass with documented exception — base-code score present for only 1 of 3 target SOC codes |
| Liveness | **HARD** | ❌ Fail — 0/3 finalists ATS-detected on Greenhouse/Lever; none reach Apply |
| Visa timeline | **HARD** | ⏸ Not evaluated — no OPT end date supplied this run |
| Report | hard | ✅ Pass — this report + the JSON agent log both exist |

## Shortlist

All three finalists cleared sponsorship and funding but **failed the liveness gate**, so
each is **Skip / hold** until a live posting is confirmed on their own careers page.

| Company | H-1B approvals | Median salary | Form D | ATS liveness | Decision | Gate that decided |
|---|---|---|---|---|---|---|
| Fiddler Labs Inc | 20 | $168,750 | 2026q1 | not found | Skip / hold | liveness |
| Imperative Care Inc | 26 | $180,000 | 2026q1 | not found | Skip / hold | liveness |
| Surgical Safety Technologies Inc | 2 | $110,000 | 2026q1 | not found | Skip / hold | liveness |

## Verified vs. inferred

- **Verified (record-backed, this run):** H-1B approval history and ML-titled sponsorship,
  Form D quarterly recency, the 3-company overlap, ATS non-detection (a real negative).
- **Inferred / proposed (no script exists):** tech-stack fingerprint, GitHub/ArXiv project
  intelligence. Labeled proposed, never as if they ran.
- **Not verifiable by this mode:** whether any company uses a non-Greenhouse/Lever ATS;
  whether any company will sponsor a specific new student.

## Typed TODOs surfaced by this run

- `[TODO: DEV]` `scripts/lca/ml-soc-sponsorship-filter.py` — real SOC-level filter
- `[TODO: DEV]` extend ATS detection beyond Greenhouse/Lever (Ashby/Workday), or add a
  manual-override field for companies confirmed hiring on their own site
- `[TODO: DEV]` SOC rollup so cognitive-pivot scores are usable at parent-code granularity
- `[TODO: DEV]` wire a student-supplied OPT end date into the `role-scorer.mjs` timeline gate

## Next decision (for the reader)

Do **not** apply to the three finalists on the strength of sponsorship + funding alone.
Before spending application effort, manually confirm a live ML posting on each company's
own careers page (the ATS detector only checks two platforms). If a live posting is
confirmed, re-run with your OPT end date supplied so the timeline gate is enforced.
