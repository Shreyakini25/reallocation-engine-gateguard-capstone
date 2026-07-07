# Worked Run — Early-Career PM Sponsorship & Runway Triage

**Mode:** `recipes/case-early-pm-sponsorship-triage.md` v0.1.0
**By:** Jayanth Adithya Kappagantula · 2026-07-06
**Lifecycle stage reached:** RUNNABLE-SAMPLE (one real sample run, logged; human adequacy
gate still open)

## 1. Inputs

Fixture: `data/examples/pm-roles.json` — 7 anonymized/fictional entry-level PM postings, one
per decision path. Every company name is fictional; no personal data. Each role carries
`sponsorship`, `fit`, `liveness`, `timeline` (and, for the runway case, an `override`), with
every term labeled `record` / `model-judgment` / `your-input`. The visa-timeline factors
encode my real OPT filing status as of 2026-07-06 (I-20 requested 2026-07-01, not yet filed
with USCIS, EAD realistically ~Oct–Nov 2026).

## 2. Commands run (verbatim) and real output

```
$ npm run score --silent -- data/examples/pm-roles.json \
    --out-dir assignments/submissions/jayanth-adithya-kappagantula/run
✓ scored 7 roles → Apply 1 · Consider 3 · Skip 3 (skip 43%)
  assignments/submissions/jayanth-adithya-kappagantula/run/role-scores.json  +  assignments/submissions/jayanth-adithya-kappagantula/run/role-scores.md
```

Human report produced (`run/role-scores.md`, pasted verbatim):

```markdown
# Role Scorer report — 2026-07-07

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 7 roles → Apply 1 · Consider 3 · Skip 3. **Skip rate 43%** (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| NovaLedger (Series B fintech, fictional) — Associate Product Manager (New Grad) | 0.446 | **Apply** | composite 0.446 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [record]; fit 0.7·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Corvus Analytics (established, fictional) — Product Manager I | 0.395 | **Consider** | above threshold (0.395) but one soft spot: sponsorship tier "Likely" | sponsorship 0.6·0.35 [model-judgment]; fit 0.85·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Atlas Freight Systems (fictional) — Product Manager I | 0.322 | **Consider** | above threshold (0.322) but one soft spot: timeline 0.550 | sponsorship 0.9·0.35 [record]; fit 0.9·0.3 [model-judgment] × liveness 1[record]×timeline 0.55[your-input] |
| BrightWave Health (E-Verify, no H-1B history, fictional) — APM, Rotational Program | 0.155 | **Consider ⟵ override** | composite 0.155 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.55·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Meridian Retail Group (fictional) — Associate Product Manager | 0.153 | **Skip** | composite 0.153 < 0.2 — time is better spent elsewhere | sponsorship 0·0.35 [record]; fit 0.6·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Stonebridge Mutual (fictional) — Product Owner (entry) | 0.102 | **Skip** | composite 0.102 < 0.2 — time is better spent elsewhere | sponsorship 0·0.35 [record]; fit 0.4·0.3 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Peak Robotics (fictional) — Product Manager (New Grad) | 0.000 | **Skip** | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.9·0.35 [record]; fit 0.8·0.3 [model-judgment] × liveness 0[record]×timeline 0.85[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
```

## 3. Verified vs. inferred (line by line)

The scorer labels every term, so the split is not my assertion — it is in the output.

| Role | Decision | Verified (`record`) | Inferred (`model-judgment` / `your-input`) |
|---|---|---|---|
| NovaLedger | **Apply** | sponsorship 0.9 (H-1B history + PM title on record); liveness 1.0 | fit 0.7 (model); timeline 0.85 (my input) |
| Corvus | **Consider** | liveness 1.0 | sponsorship 0.6 **(model-judgment — SOC-scatter: has H-1B history but no "Product Manager" title, so NOT a record)**; fit 0.85; timeline 0.85 |
| Atlas | **Consider** | sponsorship 0.9; liveness 1.0 | fit 0.9; **timeline 0.55 (my input — reduced because my OPT isn't filed; this is what demoted Apply→Consider)** |
| BrightWave | **Consider ⟵ override** | sponsorship 0.05 (no H-1B history on record); liveness 1.0 | fit 0.55; timeline 0.85; **the Runway rescue is a documented override — my judgment, labeled, not a record** |
| Meridian | **Skip** | sponsorship 0.0; liveness 1.0 | fit 0.6 |
| Stonebridge | **Skip** | sponsorship 0.0; liveness 1.0 | fit 0.4 |
| Peak Robotics | **Skip (gated)** | **liveness 0.0 (dead posting) — the gate that zeroed it** | fit 0.8 (irrelevant once gated) |

Two decisions are worth calling out: **Atlas** is only a Consider because my *own* timeline
(0.55, `your-input`) pulled it down — the sponsorship and fit are strong. **BrightWave** is a
Skip by the math (0.155) that I consciously overrode to Consider/Runway because it is
E-Verify enrolled — and I documented why. The contrast with **Meridian** is the whole point:
Meridian has *higher* fit (0.6 vs 0.55) yet stays Skip, because it has no E-Verify path. The
rescue is the E-Verify status, not the fit.

## 4. Verification

1. **Determinism** — re-ran into a scratch dir and diffed the JSON (ignoring the date line):
   `IDENTICAL`. Same input → same output.
2. **JSON parses** — `python3 -m json.tool run/role-scores.json` → valid. Recommendation
   counter: `{'Apply': 1, 'Consider': 3, 'Skip': 3}`; the only row where final ≠ machine
   recommendation is `runway-everify-pivot` (Skip → Consider via override), exactly as designed.
3. **Count cross-checked against the source** — the mode claims PM sponsorship is scarce in
   the record. Parsed `mapped_student_employment_targets_v3.csv`: **30,369 companies**, of
   which only **107** list "Product Manager" in `top_job_titles_sponsored` (0.35%). The
   asymmetry the mode is built around is real and measured, not asserted.
4. **Deliberate break attempts:**
   - **Missing `sponsorship` field** → the scorer does **not** refuse. It silently drops the
     sponsorship vote and scores on `fit` alone → composite 0.1785, Skip. `votes counted: ['fit']`.
   - **Non-numeric probability** (`"p":"high"`) → same silent drop → 0.1785, Skip.
   - **Malformed JSON** → hard crash (uncaught `JSON.parse` exception, Node stack trace).

   The malformed-JSON crash is loud and acceptable. The two silent drops are **not** — a data
   gap produces a confident-looking Skip. This violates the mode's stated stop condition
   ("refuse to score when sponsorship evidence is absent"), so I filed **[TODO: DEV] #4** (a
   pre-flight validator) rather than pretend the current script enforces it.

## Attestation
- Recipe: case-early-pm-sponsorship-triage v0.1.0
- By: Jayanth Adithya Kappagantula · 2026-07-06

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run score -- data/examples/pm-roles.json --out-dir run` | Apply 1 · Consider 3 · Skip 3 (skip 43%); role-scores.json + .md written | 7 roles scored, each landing on its designed path |
| Re-run + diff (determinism) | IDENTICAL except the date line | byte-identical scores |
| `python3 -m json.tool run/role-scores.json` | valid JSON; override flips only `runway-everify-pivot` | parses; exactly one machine≠final row |
| Cross-check count vs. CSV | 30,369 companies; 107 list "Product Manager" (0.35%) | scarcity confirms FM1 premise |
| **Break: role with missing `sponsorship`** | did NOT refuse — scored on fit alone → Skip 0.1785 | *hoped* it would refuse; it silently drops the vote (filed TODO #4) |
| **Break: `sponsorship.p = "high"` (string)** | same silent drop → Skip 0.1785 | same as above |
| **Break: malformed JSON** | hard crash with stack trace | fail loudly (acceptable) |

### Did not test
- Live `ats:liveness` against a real PM posting URL (used recorded liveness factors in the fixture).
- The four proposed scripts (TODO #1–#4) — they are proposed, not built; none of their output is claimed as run.
- The E-Verify data source (TODO #2) — E-Verify status in the fixture is asserted, not verified against a dataset.
- `--profile` path (ran with the default "needs sponsorship" profile).
- Any real/private company (fixture is entirely fictional).

### Broke during testing, fixed
- My first run used the scorer's default out-dir, which writes `role-scores.json` and
  overwrote the **tracked Ch.11 example** `data/examples/role-scores.json`. Fixed:
  `git checkout` to restore the shared example, then re-ran with an explicit `--out-dir`
  under my submission folder so nothing shared is clobbered.

## 5. Reflection

**What went well.** The scorer's per-term source labels gave me the verified-vs-inferred
split for free — I didn't have to argue it; it's in the output. The two-track logic landed
cleanly: the E-Verify runway rescue rides on the scorer's existing `override` feature (a
documented human judgment) instead of faking the sponsorship number, and the Meridian↔BrightWave
contrast shows the E-Verify *path*, not fit, is what rescues a role.

**What the mode got wrong / missed.** (1) The break test exposed that the scorer silently
drops missing/malformed votes rather than refusing — a data gap can masquerade as a confident
Skip, which is dangerous precisely for FM1. (2) Skip rate is 43%, below the ~50% a healthy
run skips; my fixture is deliberately balanced to exercise every path, so it under-skips
relative to a real board. (3) The biggest limitation is unbuilt: the `sponsorship.p` values
are still hand-entered, so the SOC-scatter judgment (TODO #1) and the E-Verify status (TODO #2)
aren't yet machine-verified — the mode is honest RUNNABLE-SAMPLE, not VERIFIED.

**Next steps.** Build TODO #4 (pre-flight validator) first — it's the cheapest and closes a
real correctness gap. Then TODO #1 (CSV → scorer sponsorship lookup) to replace hand entry,
then TODO #2 (USCIS E-Verify list) to move E-Verify from asserted to verified. After a live
run with a real posting URL through `ats:liveness` and a mentor clearing the timeline gate,
the mode can carry an attestation and move toward VERIFIED.
