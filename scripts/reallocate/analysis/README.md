# Reallocation-audit validation analyses

Reproducible scripts behind the validation report (`Belide_Aakash_ReallocationEngine.md`). Run from the repo root.

| Script | Report component | Deps | Run |
|---|---|---|---|
| `confound_and_gaming.py` | 5 (Rung-2 confound) + 6 (gamed input) | stdlib only | `python3 scripts/reallocate/analysis/confound_and_gaming.py` |
| `fairness_metrics.py` | 3 (bias audit) | fairlearn, pandas, scikit-learn | `uv run --with fairlearn --with pandas --with scikit-learn python3 scripts/reallocate/analysis/fairness_metrics.py` |
| `shap_explain.py` | 4 (explainability) | shap, numpy | `uv run --with shap --with numpy python3 scripts/reallocate/analysis/shap_explain.py` |

`fairness_metrics.py` and `shap_explain.py` depend on the tool's output (`data/raw/reallocation-audit/roles.json`), so run `node scripts/reallocate/allocate.mjs data/raw/reallocation-audit/candidates.json` first.

All figures these print are quoted verbatim in the report; none are estimated.
