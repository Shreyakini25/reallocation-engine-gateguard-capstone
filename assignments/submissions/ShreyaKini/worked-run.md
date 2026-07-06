# Worked Run — case-sap-h1b-sponsorship-audit

## Scenario

MS Information Systems graduate, currently on post-completion OPT as an
SAP Technical Consultant at an IT consulting firm. OPT end: ~July 2027.
STEM OPT extension eligibility: ~July 2029. Evaluating three employers:
SAP America (direct-hire), Deloitte (consulting), and an unnamed startup.

**Goal:** Run the role scorer against these three employers using the
confirmed correct input schema, verify the arithmetic, and deliberately
break the liveness gate to confirm it zeroes the composite.

---

## Commands Run — Verbatim

### Step 1 — SOC code confirmation in dataset

```
$ grep "15-1252\|15-1299\|15-1211" data/BLS/compact/soc_occupation_compact.csv | head -5
```

**Real output:**
```
15-1211.00,15-1211,Computer Systems Analysts,...,2024,497800.0,111960.0,103790.0,53.83,49.9,0.9,...,4.024
15-1211.01,15-1211,Health Informatics Specialists,...,2024,497800.0,...,4.123
15-1252.00,15-1252,Software Developers,...,2024,1654440.0,144570.0,133080.0,69.5,63.98,0.7,...,3.834
15-1299.00,15-1299,"Computer Occupations, All Other",...,2024,439380.0,...
15-1299.01,15-1299,Web Administrators,...,2024,439380.0,...,3.697
```

**Finding:** SOC 15-1252 cognitive_pivot_score = 3.834 (last column).
SOC 15-1211 = 4.024. Both confirmed in dataset. Both above 3.5 —
HIGH resilience band.

---

### Step 2 — First scorer run (wrong schema — all Skip)

```
$ npm run score -- /tmp/sap_roles.json --profile /tmp/sap_profile.json --md /tmp/score_report.md
✓ scored 3 roles → Apply 0 · Consider 0 · Skip 3 (skip 100%)
```

**What went wrong:** Input used `"value"` and `"score"` field names.
The scorer reads `obj.p` only. Any other field name silently drops the
vote — votes array is empty, composite = 0, everything Skips.

**Fix:** Changed all vote fields to `.p`. This is a schema discovery
that the repo does not document in a README — it is embedded in the
scorer source at line 77 (`const p = num(obj?.p)`).

---

### Step 3 — Corrected scorer run (working)

```
$ npm run score -- /tmp/sap_roles.json --profile /tmp/sap_profile.json --md /tmp/score_report.md

> the-reallocation-engine@1.0.0 score
> node scripts/score/role-scorer.mjs /tmp/sap_roles.json --profile /tmp/sap_profile.json --md /tmp/score_report.md

✓ scored 3 roles → Apply 1 · Consider 2 · Skip 0 (skip 0%)
  ../../../tmp/role-scores.json  +  ../../../tmp/score_report.md
```

**Full JSON output (role-scores.json):**

```json
{
  "_scorer": "bayesian-role-scorer",
  "_chapter": 11,
  "generated": "2026-06-26",
  "config": {
    "weights": { "sponsorship": 0.35, "fit": 0.3, "role_quality": 0 },
    "apply_threshold": 0.3,
    "consider_floor": 0.2,
    "gate_zero": 0.05
  },
  "profile_needs_sponsorship": true,
  "roles": [
    {
      "role_id": "role-001",
      "company": "SAP America",
      "title": "SAP BTP Developer",
      "composite": 0.62,
      "recommendation": "Apply",
      "reason": "composite 0.620 ≥ 0.3, gates healthy",
      "trace": {
        "votes": [
          { "factor": "sponsorship", "value": 1, "weight": 0.35, "contribution": 0.35, "source": "record" },
          { "factor": "fit", "value": 0.9, "weight": 0.3, "contribution": 0.27, "source": "model-judgment" },
          { "factor": "role_quality", "value": 0.85, "weight": 0, "contribution": 0, "source": "record" }
        ],
        "arithmetic": "(1·0.35 + 0.9·0.3 + 0.85·0) × 1 × 1 = 0.620"
      }
    },
    {
      "role_id": "role-002",
      "company": "Deloitte",
      "title": "SAP Technical Consultant",
      "composite": 0.5025,
      "recommendation": "Consider",
      "reason": "above threshold (0.502) but one soft spot: sponsorship tier \"likely\"",
      "trace": {
        "arithmetic": "(0.75·0.35 + 0.8·0.3 + 0.75·0) × 1 × 1 = 0.502"
      }
    },
    {
      "role_id": "role-003",
      "company": "Unknown Startup",
      "title": "Software Engineer",
      "composite": 0.25,
      "recommendation": "Consider",
      "reason": "composite 0.250 in the Consider band [0.2, 0.3)",
      "trace": {
        "arithmetic": "(0.2·0.35 + 0.6·0.3 + 0.5·0) × 1 × 1 = 0.250"
      }
    }
  ]
}
```

**Markdown report (score_report.md):**

```
# Role Scorer report — 2026-06-26

Summary: 3 roles → Apply 1 · Consider 2 · Skip 0. Skip rate 0%
(below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why |
|---|---|---|---|
| SAP America — SAP BTP Developer | 0.620 | Apply | composite 0.620 ≥ 0.3, gates healthy |
| Deloitte — SAP Technical Consultant | 0.502 | Consider | above threshold but soft spot: sponsorship tier "likely" |
| Unknown Startup — Software Engineer | 0.250 | Consider | composite 0.250 in the Consider band [0.2, 0.3) |
```

---

### Step 4 — Deliberate break: liveness gate = 0

```
$ npm run score -- /tmp/sap_roles_broken.json --profile /tmp/sap_profile.json

✓ scored 1 roles → Apply 0 · Consider 0 · Skip 1 (skip 100%)
```

**What happened:** SAP America with sponsorship.p=1.0 (proven, best
possible score) was forced to Skip because liveness.factor=0. The
composite zeroed regardless of votes — exactly as the constitution
requires. Liveness is a gate, not a vote.

---

## Verified vs. Inferred

| Claim | Status | Basis |
|---|---|---|
| SOC 15-1252 in BLS compact dataset | **VERIFIED** | grep output, line confirmed |
| SOC 15-1252 cognitive_pivot_score = 3.834 | **VERIFIED** | last column of grep output |
| Scorer reads `.p` field, not `.value` or `.score` | **VERIFIED** | source code line 77 + two runs showing zero vs. non-zero votes |
| SAP America composite = 0.620 → Apply | **VERIFIED** | JSON arithmetic trace: (1·0.35 + 0.9·0.3) × 1 × 1 = 0.620 |
| Deloitte composite = 0.502 → Consider (soft tier) | **VERIFIED** | JSON arithmetic trace + soft_sponsorship_tiers config |
| liveness=0 gates to Skip regardless of votes | **VERIFIED** | deliberate break run |
| SAP America "proven" sponsorship tier | **MODEL-JUDGMENT** | not pulled from H-1B dataset — assigned as input |
| Deloitte "likely" sponsorship tier | **MODEL-JUDGMENT** | not pulled from H-1B dataset — assigned as input |
| Wage level distribution for either employer | **NOT VERIFIED** | [TODO] script missing; manual lookup not run |
| USCIS approval rate for SAP America | **NOT VERIFIED** | not in SEC_DOL_H1b_data_mapped.csv at this coverage level |

---

## Reflection

**What went well:**
The scorer ran cleanly once the `.p` schema was correct. The arithmetic
trace in the JSON output is the best feature of this tool — every number
is traceable to its source and weight. The liveness gate worked exactly
as designed: a proven sponsor with a closed posting is correctly zeroed.
The markdown report is immediately readable for a human decision.

**What the mode got wrong or missed:**
The biggest gap is that `sponsorship.p` values were assigned as
model-judgment inputs, not pulled from the H-1B dataset. In a real run,
the user must first grep the employer against `SEC_DOL_H1b_data_mapped.csv`
and manually translate `Approval_Rate` into a `p` value before scoring.
The mode does not automate this translation — it requires a human to
read the CSV output and set the `.p` value. This is an honest limitation
but also a workflow gap that a future script could close.

The scorer's warning ("skip rate 0% — below the ~50% a healthy run
skips") is worth noting. In a real sponsorship audit, you would expect
at least some employers to Skip. A 0% skip rate with these inputs
suggests the inputs are optimistic.

The `role_quality` weight is 0 in the current config (marked [VERIFY]
in the source). This means the BLS cognitive demand score — the Cognitive
Pivot layer — contributes nothing to the composite. The mode documents
this but cannot fix it without changing CONFIG, which is outside the
mode's scope.

**Next steps:**
1. Build `scripts/lca/fetch_lca_employer_summary.py` to pull DOL LCA
   wage level data — this is the most urgent gap.
2. Automate the translation from `Approval_Rate` in the CSV to
   `sponsorship.p` so users do not have to set it manually.
3. Re-run against employer name actually present in
   `SEC_DOL_H1b_data_mapped.csv` to get a fully record-sourced score.

---

## Attestation

- Recipe: case-sap-h1b-sponsorship-audit v0.2.0
- By: Shreya Kini · 2026-06-26

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | `✓ all conform` + 4 warnings | Pass |
| `npm run doctor` | `environment: ✓ runnable`, `PRIVACY: no private/PII paths are tracked`, 43/43 frontmatter | Pass |
| `npm run score` with wrong schema (`.value`) | `Apply 0 · Consider 0 · Skip 3` | Fail gracefully — votes silently dropped |
| `npm run score` with correct schema (`.p`) | `Apply 1 · Consider 2 · Skip 0` with full arithmetic trace | Pass |
| `grep "15-1252"` against BLS compact CSV | SOC confirmed, score 3.834 | Pass |
| Deliberate break: `liveness.factor = 0` on proven sponsor | `Skip 1 (gated)` — composite zeroed | Pass — gate behaves as multiplier not addend |

### Did not test

- `grep` against `SEC_DOL_H1b_data_mapped.csv` for actual employer names — dataset path confirmed but employer lookup not run in this session
- `npm run ats:liveness` — no live posting URL used in this run
 (files were in /tmp, not in repo)
- [TODO] LCA script — does not exist
- [TODO] USCIS approval rate script — does not exist

### Broke during testing, fixed

- First roles.json used `"value"` and `"score"` field names → scorer produced empty votes, all Skip.
  Fixed by reading scorer source (`obj?.p`) and rewriting all vote fields to `.p`.
  Discovery: the `.p` schema is not documented in any README — it is only visible in the source.

---

## RUN_LOG Entry

```
## 2026-06-26 — H-1B sponsorship audit (sample run)

* Mode: case-sap-h1b-sponsorship-audit v0.2.0
* Inputs: 3 anonymized SAP ecosystem roles (SAP America, Deloitte, unnamed startup),
  SOC codes 15-1252 and 15-1211, OPT end ~July 2027
* Commands:
    grep "15-1252\|15-1211" data/BLS/compact/soc_occupation_compact.csv
    npm run score -- /tmp/sap_roles.json --profile /tmp/sap_profile.json --md /tmp/score_report.md
    npm run score -- /tmp/sap_roles_broken.json --profile /tmp/sap_profile.json  [break test]
    npm run verify
* Outputs: /tmp/role-scores.json, /tmp/score_report.md
* Result: Apply 1 (SAP America) · Consider 2 (Deloitte, startup) · Skip 0
  Break test: liveness=0 → Skip 1 (gated) as expected
* Open issues:
    sponsorship.p values were model-judgment, not pulled from SEC_DOL_H1b_data_mapped.csv
    LCA wage level script [TODO] not implemented
    USCIS approval rate script [TODO] not implemented
    .p schema not documented in repo README — found in source only
```


## npm run doctor output (run 2026-07-05)

```
SUMMARY
  environment: ✓ runnable
  recipes: 43/43 carry lifecycle frontmatter — all tracked
  PRIVACY: no private/PII paths are tracked
  next: continue
```
