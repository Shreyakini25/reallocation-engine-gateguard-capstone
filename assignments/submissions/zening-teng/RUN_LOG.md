# RUN_LOG entry — `opt-research-like-job`

> Append this block to `logs/RUN_LOG.md`. No secrets or private data.

## 2026-07-06 -- opt-research-like-job (sample run, 80-days join)

- Recipe: `opt-research-like-job` — F-1 MSCS/MSIS student, pre-OPT; research-like AI-era software roles. Mode: sample. Status: RUNNABLE-SAMPLE.
- Commands (two stages, stored scripts):
  1. `npm run mode:sponsorship -- data/examples/research-like-roles-input.json --out data/examples/research-like-roles-enriched.json`
  2. `npm run score -- data/examples/research-like-roles-enriched.json --profile data/examples/research-like-profile.json --out-dir reports/generated`
- Inputs: `research-like-roles-input.json` (8 roles) + `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` (30k companies) + `research-like-profile.json`. Anonymized, no personal data.
- Sponsorship now from RECORDS: 6/8 companies matched a real H-1B approval record (Addepar 150 appr / 100%, Aeva 120, 23andMe 52, Acorns 42, 6sense 62, ACV 22); 2 fictional companies → tier Unknown.
- Result: 8 roles → Apply 4 · Consider 2 · Skip 2 (skip 25%). 2 gated to 0 (ghost posting, early start date).
- Gates: all automatable gates pass; human adequacy gate pending attestation.
- Open issues: skip-rate 25% (fixture is stacked with proven sponsors, not a live board); `role_quality` weight 0 drops the O*NET signal (repo gap #3); `fit`/`liveness`/`timeline` still hand-set (fit = model-judgment; liveness = one real ats:liveness check; timeline = your-input); research-like `fit` extractor remains [TODO: DEV].
