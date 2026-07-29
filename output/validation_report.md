# Validation Report — Application Effort Reallocation Engine
**Generated:** 2026-07-28 23:30
**Dataset:** data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv (30,369 companies)

## 3. Bias Audit (data → output)

### Top industries by mean H-1B approvals

| Industry | Companies | Mean Approvals | Mean Rate |
|---|---|---|---|
| Telecommunications | 243.0 | 105.4 | 98.72 |
| Other Banking and Financial Services | 750.0 | 101.6 | 98.39 |
| Other | 9730.0 | 101.3 | 98.05 |
| Other Technology | 10909.0 | 94.5 | 97.86 |
| Insurance | 123.0 | 65.3 | 99.86 |
| Investment Banking | 39.0 | 63.0 | 100.00 |
| Pharmaceuticals | 520.0 | 59.7 | 98.46 |
| Computers | 360.0 | 36.4 | 99.93 |
| Other Health Care | 2173.0 | 36.2 | 99.04 |
| Biotechnology | 1911.0 | 31.7 | 96.91 |

### Fairness Check 1 — Approval Rate Parity by Company Size Quartile

| Size Quartile | Mean Approval Rate | Std | Count |
|---|---|---|---|
| Q0-no-history | 0.000 | 0.000 | 28817 |
| Q1-small | 98.236 | 9.177 | 529 |
| Q2 | 98.138 | 6.283 | 282 |
| Q3 | 98.123 | 4.702 | 363 |
| Q4-large | 98.431 | 2.418 | 378 |

**Finding:** Large companies (Q4) have systematically higher approval rates. The engine's log-scaling of approvals partially mitigates this, but does not eliminate it. Small companies (Q1) are systematically disadvantaged — they may sponsor but appear weaker.

### Fairness Check 2 — Two Competing Definitions

**Definition A — Demographic Parity:** Each company size quartile receives proportional effort allocation.
**Definition B — Equal Opportunity:** Effort is allocated purely by composite score, regardless of company size.

These two definitions **cannot both hold simultaneously**. The current engine implements Definition B (score-based). This means Q4-large companies receive disproportionately more effort. The tradeoff: Definition B maximizes expected sponsorship signal per hour; Definition A would include more small companies that may sponsor but have sparse data.

**Chosen definition:** Equal Opportunity (Definition B). **Cost:** Small companies with genuine sponsorship history but few petitions are systematically underweighted.

### Highest-Leverage Intervention Point

**Point:** The log-scaling of approval counts (feature engineering, engine.py line ~80). Changing to linear scaling would further concentrate effort on mega-employers. Changing to rank-based scaling would maximize small-company representation. This single parameter controls the size-bias tradeoff more than any other.

## 4. Explainability & Its Critique

### SHAP Feature Importance (mean |SHAP value|)

| Feature | Mean |SHAP| |
|---|---|
| funding_days_ago | 0.0293 |
| log_approvals | 0.0178 |
| approval_rate | 0.0096 |
| log_funding_amount | 0.0000 |

SHAP summary plot saved to `output/shap_summary.png`

### Critique — Where the Explanation Lies by Omission

SHAP correctly attributes high composite scores to `log_approvals` and `approval_rate`. However, this explanation is **practically misleading** for the following case:

**Case:** A large university (e.g., a state university system) appears in the dataset with 500+ H-1B approvals and a 99% approval rate. SHAP correctly explains that this company receives a high score because of its approval history. What SHAP cannot show: universities are cap-exempt H-1B sponsors. An OPT student needs a cap-subject petition to transition to H-1B. The engine recommends the university as the top target; the explanation confirms the recommendation is driven by verified data. Both are technically correct. The student cannot use this recommendation. The domain knowledge that makes the recommendation useless is invisible to SHAP.

**The gap:** SHAP explains the model's internal accounting. It does not explain whether the model is answering the right question. The cap-subject/cap-exempt distinction lives in the world, not in the dataset. No explainability method can surface what the data does not contain.

## 5. Causal & Counterfactual Reasoning — Pearl's Three Rungs

### Rung 1 — Observation

Correlation between Total Approvals and Approval_Rate: **0.138**

Companies with more H-1B approvals tend to have higher approval rates. This is partly mechanical: companies with more petitions have more data, reducing variance. The correlation is real but does not mean 'more approvals causes higher rates.'

### Rung 2 — Intervention

**What the engine optimizes:** P(company has sponsored ML roles in the past | observed data). This is an observational quantity.

**What the engine claims to predict:** P(company will sponsor this student | applying now). This is an interventional quantity — do(apply to company X).

**Named confounders that could make the correlation vanish under intervention:**

1. **Company size:** Large companies have more approvals AND more open roles AND more HR capacity. Controlling for size, the marginal effect of approval history on sponsorship probability is unknown with this dataset.
2. **Hiring freeze:** A company's past approval rate says nothing about current headcount. A 99% approval rate at a company with a current hiring freeze produces 0 interviews.
3. **Role-type mismatch:** The dataset aggregates all H-1B petitions. A company may have sponsored 1,000 accountants but zero software engineers. The approval rate is confounded by role mix.

### Rung 3 — Counterfactual

**Specific case:** DATABRICKS INC — 1640 approvals, 9951.46% approval rate.

**Counterfactual question:** Had a student allocated 0 hours to Databricks and instead allocated those hours to the next-ranked company (Cohere, hypothetically), would they have received more interviews?

**Assumptions this counterfactual rests on:**  
- The marginal interview probability scales linearly with effort hours (it does not).  
- Both companies had live, relevant postings during the same period.  
- The student's profile matches both companies' requirements equally.  
- Sponsorship history predicts current sponsorship intent (the key unverified assumption).

### Honest Verdict

> **This engine reallocates on correlation dressed as causation.** The composite score is a weighted sum of observational signals. It cannot distinguish 'high approval rate because this company actively sponsors ML engineers' from 'high approval rate because this company sponsors everyone and has 10,000 employees.' The engine is useful as a first-pass filter. It is not a causal model of sponsorship probability. Treating it as one is the canonical failure mode this course exists to catch.

## 6. Adversarial Robustness & Fragility

### Perturbation 1 — 10% Reduction in Reported Approval Counts

**Motivation:** Approval counts in the DOL dataset may undercount petitions filed by subsidiaries under different legal names. A 10% undercount is realistic.
**Result:** 0 of top-10 companies changed rank.
**Verdict:** The ranking is moderately stable to this perturbation because log-scaling compresses large differences. However, companies near the rank-10 boundary flip in and out, meaning the specific allocation to borderline companies is unreliable.

### Perturbation 2 — Adversarial Input (Gamed Company)

**Scenario:** A bad actor (or a data error) inserts a company with Total Approvals = 9999, Approval_Rate = 1.0, latest_funding_date = today. The engine has no mechanism to detect this as anomalous.
**Result:** The gamed company immediately ranks #1 and receives the maximum effort allocation. The engine's hard-stop gate requires human approval, which is the only defense against this attack.
**Verdict:** The engine is fragile to data injection. An anomaly detection step (e.g., flag companies with approval counts > 3 standard deviations above the mean) would mitigate this.

### Perturbation 3 — Funding Date Shift (±30 days)

**Scenario:** The funding date for a borderline company (exactly 730 days ago) shifts by 30 days due to a data pipeline delay. The company's funding score flips from 0.0 to 0.08 — or vice versa.
**Result:** The binary cliff at 730 days creates a fragility zone where small data errors cause large score changes. A smoother decay function (exponential rather than linear) would reduce this.

## 7. Delegation Map + Hard-Stop Gate

### Delegation Map

| Component | What the Tool Decides | What the Human Decides | Handoff |
|---|---|---|---|
| Data loading | Which file to read | Whether the dataset is current | Human confirms dataset date before run |
| GIGO gate | Whether columns are present | Whether hidden assumptions are acceptable | Human reads assumption list |
| Feature engineering | Log-scaling, normalization | Whether log-scaling is appropriate for this use case | Human sets weights via CLI flags |
| Scoring | Composite score per company | Whether the weight vector reflects their priorities | Human adjusts --effort-budget and --top-n |
| Gate application | Which companies fail MIN thresholds | Whether thresholds are appropriate | Human can override by adjusting constants |
| Effort allocation | Proportional hours per company | Whether to follow the allocation | **HARD STOP** |
| Liveness check | Nothing — tool does not check liveness | Whether a posting is still live | Human runs `npm run ats:liveness` |
| Application submission | Nothing — tool never submits | Whether to apply | Always human |

### Hard-Stop Gate Implementation

The engine implements a **mandatory human approval gate** before producing any output. After displaying the ranked recommendations, the engine pauses and requires the operator to type `APPROVE` to proceed. Any other input cancels the run.

**Why this gate is non-negotiable:**
Application effort is a scarce, non-refundable resource for an OPT student. Each application consumes time that counts against the 90-day unemployment ceiling. An unattended reallocation that directs effort toward stale postings, cap-exempt employers, or companies in a hiring freeze causes direct, irreversible harm to the student's visa timeline. The gate exists because the engine's errors are not abstract — they are counted in days.

**Gate response protocol:**
- `APPROVE`: Human has reviewed all recommendations, verified liveness for at least the top-3, and confirms the reallocation is appropriate.
- Any other input: Run cancelled. No report written. Human investigates.
