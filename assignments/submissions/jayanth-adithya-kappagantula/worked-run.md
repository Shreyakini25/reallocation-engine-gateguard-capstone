# Worked Run — Early-Career PM Sponsorship & Runway Triage

**Mode:** `recipes/case-early-pm-sponsorship-triage.md` v0.1.0
**By:** Jayanth Adithya Kappagantula · 2026-07-06
**Lifecycle stage reached:** RUNNABLE-SAMPLE (real logged runs; human adequacy gate still open)

This worked run has two parts: **(A) a run on real companies** pulled from the repo's mapped
SEC+DOL/H-1B dataset, including **two rows whose liveness gate was checked with a real
`ats:liveness` call — one `active`, one `expired`** — the primary evidence — and **(B) a
synthetic path-coverage fixture** for the paths the real sample didn't hit, clearly labeled.

---

## PART A — Real-company run (primary)

### A.1 Inputs

`data/examples/pm-roles-healthcare-real.json` — **9 roles**: 7 real healthcare companies from
`data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` (filtered to
healthcare industry), plus **Sailor Health** (a real health-tech startup, live Ashby posting)
and **Philips** (a real medical-device firm, Workday posting). Each `sponsorship` term is
grounded in the company's real record, or explicitly a `model-judgment` when the company is
absent from the dataset — cited in each row's `_source`.

**The record → probability rule (my documented mapping — the `your-input`/judgment half):**
- Lists "Product Manager" + high approvals → `record`, tier Proven, p ≈ 0.75–0.9.
- Heavy approvals but **no** PM title → `model-judgment` (SOC-scatter), tier Likely, p ≈ 0.6.
- Few approvals, scientific-only titles → `model-judgment`, tier Possible, p ≈ 0.3.
- Zero approvals on record → `record`, tier None, p ≈ 0.05.
- **Company absent from the dataset** → sponsorship is a `model-judgment` (Source gate), not a record.

### A.2 Commands run (verbatim) and real output

**Step 1 — clear the liveness gate on real postings** (`ats:liveness`, Playwright browser check).
A live posting and a dead one, to show the gate both ways:

```
$ npm run ats:liveness -- "https://jobs.ashbyhq.com/sailorhealth/08f8ea5b-...-application?..."
✅ active     https://jobs.ashbyhq.com/sailorhealth/08f8ea5b-...
Results: 1 active  0 expired  0 uncertain

$ npm run ats:liveness -- "https://philips.wd3.myworkdayjobs.com/.../Associate-Global-Product-Manager_569412-1/?source=LinkedIn"
❌ expired    https://philips.wd3.myworkdayjobs.com/.../Associate-Global-Product-Manager_569412-1/
           insufficient content — likely nav/footer only
Results: 0 active  1 expired  0 uncertain
```

Those real results are recorded as each row's `liveness.source`. (Philips carries a caveat: Workday
is a JS SPA, so "insufficient content" may be an under-render — a human clears this gate before a
final Skip. That is *why* liveness is a gate, not an automated verdict.)

**Step 2 — score the 9 roles:**

```
$ npm run score --silent -- data/examples/pm-roles-healthcare-real.json \
    --out-dir assignments/submissions/jayanth-adithya-kappagantula/run-healthcare-real
✓ scored 9 roles → Apply 3 · Consider 1 · Skip 5 (skip 56%)
```

Human report (`run-healthcare-real/role-scores.md`, pasted verbatim):

```markdown
# Role Scorer report — 2026-07-07

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 9 roles → Apply 3 · Consider 1 · Skip 5. **Skip rate 56%** (healthy — a good run skips at least half).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| TELADOC HEALTH INC — Associate Product Manager (entry) — telehealth | 0.446 | **Apply** | composite 0.446 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [record]; fit 0.7·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked (ats:liveness not run)]×timeline 0.85[your-input] |
| MODERN CLINICS INC — Product Manager (early-stage health) | 0.389 | **Apply** | composite 0.389 ≥ 0.3, gates healthy | sponsorship 0.75·0.35 [record]; fit 0.65·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| AMGEN INC — Product Manager I (biotech) | 0.357 | **Consider** | above threshold (0.357) but one soft spot: sponsorship tier "Likely" | sponsorship 0.6·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| THERMO FISHER SCIENTIFIC INC — Product Manager (life-sciences instruments) | 0.355 | **Apply** | composite 0.355 ≥ 0.3, gates healthy | sponsorship 0.85·0.35 [record]; fit 0.4·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| ACER THERAPEUTICS INC — Product Manager (biotech, pre-seed) | 0.191 | **Skip** | composite 0.191 < 0.2 — time is better spent elsewhere | sponsorship 0.3·0.35 [model-judgment]; fit 0.4·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| SAILOR HEALTH (sailorhealth, Ashby) — Product Manager (health-tech startup) | 0.181 | **Skip** | composite 0.181 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [model-judgment]; fit 0.65·0.3 [model-judgment] × liveness 1[record — ats:liveness 2026-07-06: active]×timeline 0.85[your-input] |
| 1910 GENETICS INC — APM (AI-driven drug discovery) | 0.168 | **Skip** | composite 0.168 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.6·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| 1859 INC — Product Manager (biotech) | 0.142 | **Skip** | composite 0.142 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.5·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| PHILIPS (Workday) — Associate Global Product Manager (medical devices, Murrysville PA) | 0.000 | **Skip** | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.5·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 0[record — ats:liveness 2026-07-06: expired (insufficient content; Workday SPA — human to confirm)]×timeline 0.85[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
```

### A.3 Verified vs. inferred (line by line)

| Company | Decision | Verified (`record`) | Inferred (`model-judgment` / `your-input`) |
|---|---|---|---|
| Teladoc | **Apply** | 510 approvals / 96.96% / lists "Product Manager" → sponsorship 0.9 | fit 0.7; timeline 0.85; liveness UNVERIFIED |
| Modern Clinics | **Apply** | 10 approvals / 100% / lists "Senior Product Manager" → sponsorship 0.75 | fit 0.65; timeline 0.85; liveness UNVERIFIED |
| Amgen | **Consider** | 1,882 approvals / 99.47% — but **no PM title** → sponsorship `model-judgment` 0.6 | SOC-scatter call; fit 0.7; liveness UNVERIFIED |
| Thermo Fisher | **Apply** ⚠ | 1,096 approvals / 98.03% / "Director, Product Management" → sponsorship 0.85 | **fit 0.4 (my flag: Director-level, not new-grad)**; liveness UNVERIFIED |
| Acer Therapeutics | **Skip** | 4 approvals / 66.7% / pre-seed / scientist-only | sponsorship model-judgment 0.3; fit 0.4 |
| **Sailor Health** | **Skip** | **liveness = active (real `ats:liveness`, 2026-07-06)** | sponsorship 0.05 `model-judgment` (absent from dataset); fit 0.65; E-Verify unknown → not Runway |
| 1910 Genetics | **Skip** | 0 approvals, Series B biotech → sponsorship 0.05 | fit 0.6; runway? E-Verify UNKNOWN → not tagged |
| 1859 Inc | **Skip** | 0 approvals, Series B biotech → sponsorship 0.05 | fit 0.5; liveness UNVERIFIED |
| **Philips** | **Skip (gated)** | **liveness = expired (real `ats:liveness`, 2026-07-06) → gate zeroes it** | sponsorship 0.5 `model-judgment` (absent from dataset; not a record); fit 0.7; Workday render caveat |

**The decisions that make the mode's point on real data:**
- **Amgen** — the *largest* sponsor in the set (1,882 approvals) lands at **Consider, not Apply**,
  because it lists no "Product Manager" title, so its sponsorship is honestly a `model-judgment`.
  SOC-scatter (FM1), caught live.
- **Thermo Fisher** — scored **Apply** (0.355), but its only PM title on record is *Director,
  Product Management*: senior, not new-grad (FM3). The scorer has **no fit-based demotion**, so a
  strong sponsor carried a too-senior role over the line. My `fit: 0.4` label is the *only* guard.
- **Philips** — the liveness gate **firing on a real posting**: `ats:liveness` returned `expired`,
  which zeroed the composite (0.000 → Skip) no matter how good the votes. The real version of the
  synthetic ghost row.
- **Sailor Health** — a real **live** posting (`active`), yet still Skip: absent from the H-1B data
  (sponsorship is a model-judgment) and E-Verify unknown (can't tag Runway). A live posting is
  necessary, not sufficient.

### A.4 Verification

1. **Determinism** — re-ran into a scratch dir, diffed the JSON (minus the date line): IDENTICAL.
2. **JSON parses** — `python3 -m json.tool run-healthcare-real/role-scores.json` → valid;
   counter `{'Apply': 3, 'Consider': 1, 'Skip': 5}`.
3. **Liveness cross-checked live** — two real `ats:liveness` calls: Sailor Health `active`
   (1/0/0), Philips `expired` (0/1/0). Those results are what those two rows cite.
4. **Counts cross-checked against the source CSV** — 30,369 companies; **4,745** healthcare; of
   those only **3** list "Product Manager" (0.06%). Confirmed both Sailor Health and Philips are
   absent (0 company rows), which is why their sponsorship terms are model-judgments.
5. **Deliberate break attempts** (against the scorer):
   - Missing `sponsorship` field → does **not** refuse; silently drops the vote, scores on fit
     alone → Skip 0.1785 (`votes counted: ['fit']`).
   - Non-numeric `"p":"high"` → same silent drop → Skip 0.1785.
   - Malformed JSON → hard crash (uncaught `JSON.parse`, Node stack trace).

   The crash is loud and acceptable. The silent drops are not — a data gap becomes a confident
   Skip, exactly the danger in healthcare where sponsorship data is mostly missing. Filed as
   **[TODO: DEV] #4** (pre-flight validator).

## Attestation
- Recipe: case-early-pm-sponsorship-triage v0.1.0
- By: Jayanth Adithya Kappagantula · 2026-07-06

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run ats:liveness -- <Sailor Health Ashby URL>` | `✅ active` (1/0/0) | a cleared liveness gate on a live posting |
| `npm run ats:liveness -- <Philips Workday URL>` | `❌ expired` (0/1/0) — insufficient content | the gate firing on a dead/under-rendered posting |
| `npm run score -- data/examples/pm-roles-healthcare-real.json --out-dir run-healthcare-real` | Apply 3 · Consider 1 · Skip 5 (skip 56%) | 9 real companies scored, each traceable |
| Re-run + diff (determinism) | IDENTICAL except date line | byte-identical scores |
| `python3 -m json.tool run-healthcare-real/role-scores.json` | valid JSON; counter {Apply:3, Consider:1, Skip:5} | parses |
| Cross-check counts vs CSV | 30,369 total; 4,745 healthcare; 3 list "Product Manager"; Sailor & Philips absent | FM1 confirmed; absence forces model-judgment |
| Amgen (biggest sponsor, no PM title) | Consider, not Apply | SOC-scatter demotes it |
| Thermo Fisher (Director-level PM) | **Apply** despite fit 0.4 | *hoped* fit would demote it; no fit demotion (FM3) |
| Philips (expired posting) | Skip, gated at 0.000 | liveness gate zeroes it regardless of votes |
| **Break: role with missing `sponsorship`** | did NOT refuse — scored on fit → Skip 0.1785 | *hoped* refuse; silent drop (filed TODO #4) |
| **Break: `sponsorship.p = "high"`** | same silent drop → Skip 0.1785 | same |
| **Break: malformed JSON** | hard crash with stack trace | fail loudly (acceptable) |

### Did not test
- `ats:liveness` on the other 7 companies — only Sailor Health (active) and Philips (expired) are
  verified; the rest remain UNVERIFIED (pre-liveness scores).
- Whether Philips's `expired` is a true expiry or a Workday SPA under-render — flagged for the human gate.
- The four proposed scripts (TODO #1–#4) — proposed, not built; no output claimed as run.
- The USCIS E-Verify data source (TODO #2) — so Sailor Health / 1910 Genetics could NOT be confirmed as runway.
- `--profile` path (ran the default "needs sponsorship" profile).

### Broke during testing, fixed
- First run used the scorer's default out-dir, which writes `role-scores.json` and overwrote the
  **tracked Ch.11 example** `data/examples/role-scores.json`. Fixed with `git checkout`, then
  re-ran with an explicit `--out-dir` so nothing shared is clobbered.
- `ats:liveness` first failed: Playwright package present but the browser binary wasn't installed
  (`Executable doesn't exist`). Fixed with `npx playwright install chromium`; the checks then ran.

### A.5 Reflection

**What went well.** Real companies made the thesis undeniable: Amgen, the biggest sponsor in the
set, is held at Consider for listing no PM. Two real liveness checks then showed the gate both
ways — Sailor Health `active`, Philips `expired` (which zeroed Philips to a gated Skip) — and
pushed the skip rate to a healthy 56%. Per-term source labels gave the verified/inferred split for free.

**What it got wrong / missed.** (1) Thermo Fisher scored Apply on a Director-level role — the
scorer has no seniority/fit demotion, so my labeled `fit` is the only guard (FM3). (2) Philips's
`expired` may be a Workday SPA under-render, not a true expiry — a real false-positive risk, and
exactly why liveness is a human-clearable gate. (3) Seven of nine rows are still pre-liveness. (4)
The record→probability mapping is my rule, not the CSV's — the honest `record`/`your-input` boundary.

**Next steps.** Build TODO #4 (pre-flight validator) first — cheapest, closes a real correctness
gap. Have a human confirm Philips before a final Skip; run `ats:liveness` across the rest of the
shortlist. Then TODO #1 (CSV → sponsorship lookup) to replace my hand-mapping, and TODO #2 (USCIS
E-Verify list) so Sailor Health and 1910 Genetics can move from Skip to a verified Consider/Runway.
After a mentor clears the timeline gate, the mode can carry an attestation toward VERIFIED.

---

## PART B — Synthetic path-coverage fixture (secondary, clearly labeled)

`data/examples/pm-roles.json` is **synthetic** (fictional companies). It is not evidence about any
real employer; it exists to exercise decision paths the real sample didn't fully cover:

- an **E-Verify runway override** (Skip → Consider via a documented `override`),
- a **timeline-gate demotion** (Apply → Consider when the start date is impossible given OPT status).

(The dead-posting gate is now also demonstrated on **real** data by Philips above.)

Run and result:

```
$ npm run score -- data/examples/pm-roles.json --out-dir run
✓ scored 7 roles → Apply 1 · Consider 3 · Skip 3 (skip 43%)
```

The full output is at `run/role-scores.md`. Because these are fictional, they are used only to
prove the gates and the override behave as specified — never as a claim about a real company.
