# Failure Statistics

5 cases total. The three graded lenses are **C, D, G**; **G-2** and **J-1** are additional cases
found while running the probes.

## Cases per lens
| Lens | Chapter | Cases |
|---|---|---|
| C — Robustness | 4 | 1 (C-1) |
| D — Explainability | 5 | 1 (D-1) |
| G — Agentic false-success | 8 | 2 (G-1, G-2) |
| J — Uncertainty & verbs | 11 | 1 (J-1) |
| **Total** | | **5** |

## Cases per supervisory capacity
| Capacity | Cases |
|---|---|
| [PA] Plausibility Auditing | 2 (D-1, G-2) |
| [TO] Tool Orchestration | 1 (G-1) |
| [IJ] Interpretive Judgment | 1 (C-1) |
| [EI] Executive Integration | 1 (J-1) |
| [PF] Problem Formulation | 0 |

## Fundamental vs. contingent
| Case | Verdict | Why |
|---|---|---|
| C-1 | Contingent | Missing optional dependency / unpinned environment. |
| D-1 | Contingent | A regex that doesn't tolerate `\r`; one-line parser fix. |
| G-1 | Contingent | A pipe corrupted `$?`; check the command's own exit code. |
| G-2 | Contingent | A composite command surfaces a green sub-check above a red overall exit. |
| J-1 | Contingent | Per-claim verb discipline; fixable by scoping each verb to its check. |

**All five specific cases are contingent — none needs a redesign.** But four of the five (all but
C-1) are instances of one **fundamental** pattern: an LLM agent reads *tool artifacts* — an exit
code, a green line, its own edit, its own summary — and reports success from them rather than from a
world-state check. The individual bugs are fixable; the temptation to trust the artifact is
architectural.
