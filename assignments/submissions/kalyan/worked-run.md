# Worked Run — case-supply-chain-planning-analyst-opt-dfw

## Inputs used

Three roles, hand-constructed to match the schema `scripts/score/role-scorer.mjs` expects (same shape as `data/examples/ch11-roles.json`), saved to `data/ats/your-roles.json`. Company names anonymized/illustrative rather than real target employers, since real target-company data would be application-tracker content and stays in `private/`/`data/ats/` per repo convention.

| role_id | Scenario | sponsorship | fit | liveness | timeline |
|---|---|---|---|---|---|
| sca-1 | Proven sponsor, live posting | 0.8 (proven) | 0.75 | 1 | 0.9 |
| sca-2 | Non-sponsor, live posting | 0 (none) | 0.7 | 1 | 0.85 |
| sca-3 | Likely sponsor, **dead posting (deliberate break test)** | 0.5 (likely) | 0.8 | **0** | 0.9 |

`role_quality` was set to 0 on all three, consistent with the mode's documented decision to leave that weight at the repo default rather than invent an unjustified number.

## Commands run, verbatim

```bash
mkdir -p data/ats
cat > data/ats/your-roles.json << 'EOF'
[ ... roles above ... ]
EOF

npm run score -- data/ats/your-roles.json --out-dir reports/generated/
```

## Real terminal output

```
> the-reallocation-engine@1.0.0 score
> node scripts/score/role-scorer.mjs data/ats/your-roles.json --out-dir reports/generated/
✓ scored 3 roles → Apply 1 · Consider 0 · Skip 2 (skip 67%)
  reports\generated\role-scores.json  +  reports\generated\role-scores.md
```

Full audit trace (from `reports/generated/role-scores.md`):

| Role | Composite | Rec | Why |
|---|---|---|---|
| sca-1 (proven sponsor) | 0.4545 | **Apply** | composite 0.454 ≥ 0.3, gates healthy |
| sca-2 (non-sponsor) | 0.1785 | **Skip** | composite 0.178 < 0.2 |
| sca-3 (dead posting) | 0.0000 | **Skip** | gated: liveness ≈ 0.000 — closed gate zeroes the composite regardless of votes |

## Verified vs. inferred

| Element | Status |
|---|---|
| Composite arithmetic | **Verified** — computed entirely by `role-scorer.mjs`, no manual math |
| Sponsorship value (0.8 / 0 / 0.5) | **Inferred/placeholder** for this run — in real use, verified against `mapped_student_employment_targets_v3.csv` |
| Fit score (0.75 / 0.7 / 0.8) | Always `model-judgment` by the scorer's own design — labeled, not hidden, as judgment |
| Liveness (1 / 1 / 0) | **Inferred/placeholder** here — sca-3's `0` was deliberately injected to test the gate, not from a real `ats:liveness` check against a live URL |
| role_quality = 0 | **Verified** as the real repo default; the decision to leave it there is logged, not silent |
| Gate behavior (liveness zeroing composite) | **Verified** — this is the real, tested mechanism in the script, not a claim about it |

## Attestation

- Recipe: case-supply-chain-planning-analyst-opt-dfw v0.1.0
- By: Kalyan Satwik · 2026-07-07

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run score -- data/ats/your-roles.json --out-dir reports/generated/` | 3 roles scored, 1 Apply / 0 Consider / 2 Skip, skip rate 67%, two real output files written | A working composite score per role with a full per-term audit trace |
| Deliberate break: set `liveness.factor: 0` on sca-3 despite a decent sponsorship vote (0.5) and the strongest fit vote of the three (0.8) | Composite forced to 0.000, recommendation Skip, reason correctly cites the closed liveness gate | Liveness should override vote strength entirely, regardless of how good the other votes look — confirmed |

### Did not test
- Real `npm run ats:liveness -- <job-url>` against an actual live posting — all liveness values in this run were manually set, not fetched
- Real sponsorship lookup against `mapped_student_employment_targets_v3.csv` — sponsorship values here are placeholders, not joined from the real CSV
- The proposed `inbox-sync.mjs` — does not exist yet, not testable
- DFW/remote location filtering — TODO still open, no location field confirmed in source data

### Broke during testing, fixed
- None. The scorer ran cleanly on the first attempt once the input JSON matched the schema in `data/examples/ch11-roles.json`.

## Reflection

**What went well:** The liveness-gate test (sca-3) is the clearest result of this run. A role with the strongest fit score of the three (0.8) and a reasonable sponsorship signal (0.5, "likely") still scored a hard 0.000 and Skip, purely because the posting was marked dead. That's the mode doing exactly what it's supposed to do — refusing to let a dead posting look attractive just because the underlying company looks good on paper. It's a structural guarantee, not something that depends on the scorer "remembering" to check liveness first.

**What the mode got wrong or missed:** The `role_quality = 0` decision is the most honest limitation in this run. The whole premise of connecting to the Cognitive Pivot layer (BLS/O*NET role-quality scoring) is undermined by the fact that, as configured, that signal currently contributes nothing to the composite. The mode documents this rather than hiding it, but it means this run cannot actually claim to have used BLS/O*NET evidence in a way that affected any real decision — it's present in the Source Inventory but inert in the math. Separately, every input in this run was hand-typed rather than pulled from the real sponsorship CSV or a real `ats:liveness` check, so the Apply/Skip verdicts here are a proof of the mechanism, not yet a proof of a real job-search decision.

**Next steps:** Before trusting this mode on a real batch of postings, three things need to happen: (1) resolve the location TODO by actually checking whether `mapped_student_employment_targets_v3.csv` or any SEC extract carries a location field usable for DFW filtering; (2) replace the hand-typed sponsorship/liveness values with a real join against the CSV and a real `npm run ats:liveness` call per posting; (3) make a deliberate decision on `role_quality`'s weight — either pin it to a nonzero value with a stated justification, or explicitly accept that this mode does not yet use the Cognitive Pivot signal in practice. Building `inbox-sync.mjs` is a real proposal but not a near-term priority compared to those three.
