# Failure Statistics

## Cases per lens
| Lens | Chapter | Cases |
|---|---|---|
| C — Robustness | 4 | 1 (C-1) |
| D — Explainability | 5 | 1 (D-1) |
| G — Agentic false-success | 8 | 1 (G-1) |
| **Total** | | **3** |

## Cases per supervisory capacity
| Capacity | Cases |
|---|---|
| [TO] Tool Orchestration | 1 (G-1) |
| [PA] Plausibility Auditing | 1 (D-1) |
| [IJ] Interpretive Judgment | 1 (C-1) |
| [PF] Problem Formulation | 0 |
| [EI] Executive Integration | 0 |

## Fundamental vs. contingent
| Case | Verdict | Why |
|---|---|---|
| G-1 | Contingent | A pipe corrupted `$?`; fixable by checking the command's own exit code. |
| D-1 | Contingent | A regex that doesn't tolerate `\r`; a one-line parser fix. |
| C-1 | Contingent | A missing optional dependency / unpinned environment. |

**All three specific cases are contingent — none needs a redesign.** But they are three instances
of one **fundamental** pattern: an LLM agent observes *tool outputs*, not the world, and will report
success from the artifact unless a world-state check is forced. That pattern is architectural; the
individual breaks are not.
