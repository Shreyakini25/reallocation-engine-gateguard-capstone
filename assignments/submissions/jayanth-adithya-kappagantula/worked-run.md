# Worked Run — Early-Career PM Sponsorship & Runway Triage

**Mode:** `recipes/case-early-pm-sponsorship-triage.md` v0.1.0
**By:** Jayanth Adithya Kappagantula · 2026-07-06
**Lifecycle stage reached:** RUNNABLE-SAMPLE (real logged runs; human adequacy gate still open)

This worked run has two parts: **(A) a run on real companies** pulled from the repo's mapped
SEC+DOL/H-1B dataset — the primary evidence — and **(B) a synthetic path-coverage fixture**
that exercises decision paths the real sample didn't hit (a dead posting, an E-Verify override,
a timeline-gate demotion), clearly labeled as synthetic.

---

## PART A — Real-company run (primary)

### A.1 Inputs

`data/examples/pm-roles-healthcare-real.json` — **7 real companies** selected from
`data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv`, filtered to the
healthcare industry. Each role's `sponsorship` term is grounded in that company's real record
(`Total Approvals`, `Approval_Rate`, `top_job_titles_sponsored`, `latest_funding_stage`), cited
in the row's `_source` field.

**The record → probability rule (my documented mapping — this is the `your-input`/judgment half):**
- Lists "Product Manager" in sponsored titles + high approvals → `record`, tier Proven, p ≈ 0.75–0.9.
- Heavy approvals but **no** PM title → `model-judgment` (SOC-scatter), tier Likely, p ≈ 0.6.
- Few approvals, scientific-only titles → `model-judgment`, tier Possible, p ≈ 0.3.
- Zero approvals on record → `record`, tier None, p ≈ 0.05.

**Honest limits of this run, stated up front:**
- **Liveness is UNVERIFIED** — I have no live posting URLs, so `liveness.factor = 1.0` is
  labeled `UNVERIFIED — no live posting checked`. These are **pre-liveness** scores; a real run
  would clear the liveness gate with `npm run ats:liveness` and could gate some out.
- **Selection bias** — I picked from the sponsor pool to show the decision paths, so the run
  skews toward Apply. A full board scan would skip far more.

### A.2 Command run (verbatim) and real output

```
$ npm run score --silent -- data/examples/pm-roles-healthcare-real.json \
    --out-dir assignments/submissions/jayanth-adithya-kappagantula/run-healthcare-real
✓ scored 7 roles → Apply 3 · Consider 1 · Skip 3 (skip 43%)
```

Human report (`run-healthcare-real/role-scores.md`, pasted verbatim):

```markdown
# Role Scorer report — 2026-07-07

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 7 roles → Apply 3 · Consider 1 · Skip 3. **Skip rate 43%** (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| TELADOC HEALTH INC — Associate Product Manager (entry) — telehealth | 0.446 | **Apply** | composite 0.446 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [record]; fit 0.7·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked (ats:liveness not run)]×timeline 0.85[your-input] |
| MODERN CLINICS INC — Product Manager (early-stage health) | 0.389 | **Apply** | composite 0.389 ≥ 0.3, gates healthy | sponsorship 0.75·0.35 [record]; fit 0.65·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| AMGEN INC — Product Manager I (biotech) | 0.357 | **Consider** | above threshold (0.357) but one soft spot: sponsorship tier "Likely" | sponsorship 0.6·0.35 [model-judgment]; fit 0.7·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| THERMO FISHER SCIENTIFIC INC — Product Manager (life-sciences instruments) | 0.355 | **Apply** | composite 0.355 ≥ 0.3, gates healthy | sponsorship 0.85·0.35 [record]; fit 0.4·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| ACER THERAPEUTICS INC — Product Manager (biotech, pre-seed) | 0.191 | **Skip** | composite 0.191 < 0.2 — time is better spent elsewhere | sponsorship 0.3·0.35 [model-judgment]; fit 0.4·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| 1910 GENETICS INC — APM (AI-driven drug discovery) | 0.168 | **Skip** | composite 0.168 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.6·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |
| 1859 INC — Product Manager (biotech) | 0.142 | **Skip** | composite 0.142 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.5·0.3 [model-judgment] × liveness 1[UNVERIFIED — no live posting checked]×timeline 0.85[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
```

### A.3 Verified vs. inferred (line by line)

| Company | Decision | Verified (`record`, from the CSV) | Inferred (`model-judgment` / `your-input`) |
|---|---|---|---|
| Teladoc | **Apply** | 510 approvals / 96.96% / lists "Product Manager" → sponsorship 0.9 | fit 0.7; timeline 0.85; **liveness UNVERIFIED** |
| Modern Clinics | **Apply** | 10 approvals / 100% / lists "Senior Product Manager", Series B → sponsorship 0.75 | fit 0.65; timeline 0.85; liveness UNVERIFIED |
| Amgen | **Consider** | 1,882 approvals / 99.47% — but **no PM title** → sponsorship is `model-judgment` 0.6, NOT record | the SOC-scatter call itself; fit 0.7; liveness UNVERIFIED |
| Thermo Fisher | **Apply** ⚠ | 1,096 approvals / 98.03% / "Director, Product Management" → sponsorship 0.85 | **fit 0.4 (my flag that the PM role is Director-level, not new-grad)**; liveness UNVERIFIED |
| Acer Therapeutics | **Skip** | 4 approvals / 66.7% / pre-seed / scientist-only titles | sponsorship downgraded to model-judgment 0.3; fit 0.4 |
| 1910 Genetics | **Skip** | 0 approvals, Series B biotech → sponsorship 0.05 | fit 0.6; **runway? E-Verify UNKNOWN → not tagged (stop condition)** |
| 1859 Inc | **Skip** | 0 approvals, Series B biotech → sponsorship 0.05 | fit 0.5; liveness UNVERIFIED |

**Two decisions that make the mode's point on real data:**
- **Amgen** — the *largest* sponsor in the set (1,882 approvals) landed at **Consider, not Apply**,
  purely because it lists no "Product Manager" title, so its sponsorship term is honestly a
  `model-judgment`, not a `record`. That is the SOC-scatter asymmetry (FM1) caught in the act.
- **Thermo Fisher** — scored **Apply** (0.355), but its only PM title on record is *Director,
  Product Management*: senior, not new-grad (FM3). The scorer has **no fit-based demotion**, so a
  strong sponsor carried a too-senior role over the line. My `fit: 0.4` label is the *only* guard
  — and it did not auto-stop it. Fluency is the first sign of trouble; the human owns this call.

### A.4 Verification

1. **Determinism** — re-ran into a scratch dir, diffed the JSON (minus the date line): IDENTICAL.
2. **JSON parses** — `python3 -m json.tool run-healthcare-real/role-scores.json` → valid;
   counter `{'Apply': 3, 'Consider': 1, 'Skip': 3}`.
3. **Counts cross-checked against the source CSV** — 30,369 companies total; **4,745**
   healthcare-industry; of those only **3** list "Product Manager" (0.06%). The three I could find
   (Teladoc, Modern Clinics, Sirona) are exactly the healthcare PM sponsors I could score as
   `record`; everyone else required a judgment. The scarcity the mode is built around is measured.
4. **Deliberate break attempts** (against the scorer itself):
   - Missing `sponsorship` field → does **not** refuse; silently drops the vote, scores on fit
     alone → Skip 0.1785. `votes counted: ['fit']`.
   - Non-numeric `"p":"high"` → same silent drop → Skip 0.1785.
   - Malformed JSON → hard crash (uncaught `JSON.parse`, Node stack trace).

   The crash is loud and acceptable. The silent drops are not — a data gap becomes a confident
   Skip, which is exactly the danger in healthcare where sponsorship data is mostly missing. Filed
   as **[TODO: DEV] #4** (pre-flight validator) rather than pretend the script enforces it.

## Attestation
- Recipe: case-early-pm-sponsorship-triage v0.1.0
- By: Jayanth Adithya Kappagantula · 2026-07-06

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run score -- data/examples/pm-roles-healthcare-real.json --out-dir run-healthcare-real` | Apply 3 · Consider 1 · Skip 3; json + md written | 7 real companies scored, each traceable to its CSV record |
| Re-run + diff (determinism) | IDENTICAL except date line | byte-identical scores |
| `python3 -m json.tool run-healthcare-real/role-scores.json` | valid JSON; counter {Apply:3, Consider:1, Skip:3} | parses |
| Cross-check counts vs CSV | 30,369 total; 4,745 healthcare; 3 list "Product Manager" (0.06%) | scarcity confirms FM1 |
| Amgen (biggest sponsor, no PM title) | Consider, not Apply, via model-judgment sponsorship | SOC-scatter demotes it |
| Thermo Fisher (Director-level PM) | **Apply** despite fit 0.4 | *hoped* fit would demote it; scorer has no fit demotion — surfaced as a real limitation (FM3) |
| **Break: role with missing `sponsorship`** | did NOT refuse — scored on fit → Skip 0.1785 | *hoped* it would refuse; silent drop (filed TODO #4) |
| **Break: `sponsorship.p = "high"`** | same silent drop → Skip 0.1785 | same |
| **Break: malformed JSON** | hard crash with stack trace | fail loudly (acceptable) |

### Did not test
- Live `ats:liveness` on a real posting URL — liveness in every real row is UNVERIFIED (pre-liveness scores).
- The four proposed scripts (TODO #1–#4) — proposed, not built; no output claimed as run.
- The USCIS E-Verify data source (TODO #2) — so 1910 Genetics could NOT be confirmed as a runway.
- `--profile` path (ran the default "needs sponsorship" profile).

### Broke during testing, fixed
- First run used the scorer's default out-dir, which writes `role-scores.json` and overwrote the
  **tracked Ch.11 example** `data/examples/role-scores.json`. Fixed with `git checkout` to restore
  it, then re-ran with an explicit `--out-dir` under my submission folder so nothing shared is clobbered.

### A.5 Reflection

**What went well.** Running on real companies made the thesis undeniable: Amgen, the single
biggest sponsor in the set, gets held at Consider because it never labels a PM — the exact
information asymmetry the engine exists to fix, reproduced on real data. The per-term source
labels gave the verified/inferred split for free.

**What it got wrong / missed.** (1) Thermo Fisher scored Apply on a Director-level role — the
scorer has no seniority/fit demotion, so my labeled `fit` is the only guard (FM3). (2) Every
liveness value is UNVERIFIED — I did not clear the liveness gate, so these are pre-liveness
scores. (3) The record→probability mapping is my rule, not the CSV's — the honest boundary
between `record` and `your-input`. (4) Selection bias skews the run toward Apply.

**Next steps.** Build TODO #4 (pre-flight validator) first — cheapest, closes a real correctness
gap. Then clear the liveness gate on one real posting with `ats:liveness`. Then TODO #1 (CSV →
sponsorship lookup) to replace my hand-mapping, and TODO #2 (USCIS E-Verify list) so runway
candidates like 1910 Genetics move from Skip to a verified Consider/Runway. After a mentor clears
the timeline gate, the mode can carry an attestation toward VERIFIED.

---

## PART B — Synthetic path-coverage fixture (secondary, clearly labeled)

`data/examples/pm-roles.json` is **synthetic** (fictional companies). It is not evidence about any
real employer; it exists to exercise the three decision paths the real sample above did not hit:

- a **dead posting** (liveness gate = 0 → Skip regardless of votes),
- an **E-Verify runway override** (Skip → Consider via a documented `override`),
- a **timeline-gate demotion** (Apply → Consider when the start date is impossible given OPT status).

Run and result:

```
$ npm run score -- data/examples/pm-roles.json --out-dir run
✓ scored 7 roles → Apply 1 · Consider 3 · Skip 3 (skip 43%)
```

The full output is at `run/role-scores.md`. Because these are fictional, they are used only to
prove the gates and the override behave as specified — never as a claim about a real company.
