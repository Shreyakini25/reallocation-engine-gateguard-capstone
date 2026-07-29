# Application Effort Reallocation Engine
**INFO 7375 — Computational Skepticism for AI · Wenhan Cheng · 2026-07-28**

Reallocates weekly application-effort hours across companies in the H-1B
sponsorship dataset, using three verified signals: H-1B approval history,
SEC Form D funding recency, and BLS cognitive-pivot scores.

## How to Run

### Requirements
```bash
pip3 install pandas numpy scikit-learn shap matplotlib seaborn --break-system-packages
```

### Step 1 — Run the engine
```bash
python3 engine.py \
  --data data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv \
  --bls  data/BLS/compact/soc_occupation_compact.csv \
  --effort-budget 40 \
  --top-n 10 \
  --out  output/reallocation_report.md
```

When prompted, type `APPROVE` to accept the reallocation.

### Step 2 — Run validation
```bash
python3 validate.py \
  --data data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv \
  --bls  data/BLS/compact/soc_occupation_compact.csv \
  --log  output/reallocation_log.json \
  --out  output/validation_report.md
```

## Outputs
- `output/reallocation_report.md` — human-readable recommendations
- `output/reallocation_log.json` — machine-readable agent log
- `output/validation_report.md` — seven skeptical checks
- `output/shap_summary.png` — SHAP feature importance plot

## Hard-Stop Gate
The engine RECOMMENDS only. It never submits applications or commits
any resource without explicit human approval at the terminal prompt.

## Key Findings
1. 94.9% of companies have null H-1B history — engine only scores 1,226/30,369
2. Top-10 includes non-ML companies (Pacific Life Insurance) — no domain filter
3. Uncertainty estimates are currently uninformative (Wilson interval collapses
   for high-count companies) — known limitation, documented in report
4. Engine reallocates on correlation, not causation — explicitly stated
