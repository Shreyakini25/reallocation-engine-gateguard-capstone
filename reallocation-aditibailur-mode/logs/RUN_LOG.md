## case-ml-sponsorship-triage — 2026-07-06

**By:** Aditi Bailur

**Inputs:**
- `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` (30,369 rows)
- SEC Form D quarters: 2025q2, 2025q3, 2025q4, 2026q1 (regenerated via
  `refresh-recent-sec-quarters.py`)
- `data/bls/compact/soc_occupation_compact.csv` (1,016 occupations, regenerated via
  `extract-soc-occupation-table.py`)
- `data/examples/ch11-roles.json` (repo sample, 5 roles)

**Steps completed:**
- [x] `npm run verify` — passed, 5 manifest warnings reviewed (1 real gap fixed:
      `resume.json` added to `.gitignore`)
- [x] `node scripts/score/role-scorer.mjs data/examples/ch11-roles.json` — run twice,
      deterministic (Apply 2 · Consider 1 · Skip 2, skip 40%)
- [x] H-1B filter — 1,552 companies with approvals; 150 with ML/DS-titled sponsorship
      history
- [x] SEC Form D refresh — 4/4 quarters processed (13,325 / 14,138 / 14,885 / 15,981
      companies respectively)
- [x] BLS SOC lookup for 15-1252, 15-2051, 15-1299 — cognitive-pivot score present
      only for 15-1252 at base code (3.834); gap documented for the other two
- [x] H-1B × Form D join — 3 matches (Fiddler Labs, Imperative Care, Surgical Safety
      Technologies) after fixing a real JSON-schema bug
- [x] ATS detection run on the 3 matches — 0/3 found on Greenhouse/Lever (real
      negative result)
- [ ] Liveness check on a specific job URL — not run this submission
- [ ] Tech stack extraction — proposed only, script does not exist
- [ ] GitHub/ArXiv intelligence — proposed only, script does not exist

**Output:** two Output-Contract artifacts produced for this run (P5 — machine + human):
`logs/case-ml-sponsorship-triage-2026-07-06.json` (agent log) and
`reports/generated/case-ml-sponsorship-triage-2026-07-06.md` (human report), written
manually from real run numbers. No persisted shortlist CSV yet — [TODO: DEV]
`scripts/ml/build_ml_shortlist.py`. Recommendation this run: Apply 0 · Skip 3 (all three
finalists fail the liveness gate).

**Verified signals:** H-1B approval + ML title match, Form D quarterly recency,
role-scorer liveness/timeline gating behavior, ATS non-detection (real negative)

**Inferred / proposed signals:** tech stack fingerprint, GitHub/ArXiv project
intelligence — both remain design-only, no script exists

**Gaps hit:**
- Cognitive-pivot score missing at base SOC code for 2 of 3 target codes (only
  detailed O*NET sub-occupations are scored)
- Form D JSON schema is a dict with nested company records, not a flat list — initial
  join silently returned 0 matches until investigated and fixed
- `detect-ats.py` only checks Greenhouse and Lever with a guessed slug; cannot
  distinguish "not hiring" from "uses a different platform"

**What to do next:**
- [ ] Build `scripts/ml/build_ml_shortlist.py` to persist shortlist output
- [ ] Build a SOC-code rollup for sub-occupation cognitive-pivot scores
- [ ] Extend ATS detection or add a manual-override field
- [ ] Wire a student-supplied OPT end date into `role-scorer.mjs`'s timeline gate
- [ ] Run `npm run doctor` before opening the PR