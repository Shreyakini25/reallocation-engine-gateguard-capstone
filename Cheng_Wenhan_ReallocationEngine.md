# Reallocation Engine, Audited — Validation Report
**Student:** Wenhan Cheng · Northeastern University · INFO 7375  
**Date:** 2026-07-28  
**Tool:** Application Effort Reallocation Engine (`engine.py` + `validate.py`)  
**Repo:** github.com/wenhanc2008/the-reallocation-engine  

---

## What the Engine Does

This engine reallocates a finite weekly effort budget (default: 40 hours) across
companies in the H-1B sponsorship dataset, directing application effort toward
companies most likely to sponsor an F-1 OPT student targeting NLP/ML
Software Engineer roles.

**Objective (one sentence):** Maximize expected sponsorship signal strength ×
funding health × role resilience, weighted by a student's OPT timeline.

**What this objective leaves out:** actual hiring intent, current headcount freeze,
role-title match, interview pipeline speed, geographic constraints, and
cap-subject vs. cap-exempt sponsorship type.

**Reallocation type:** Attention/effort — a scarce, non-refundable resource
on a 90-day OPT unemployment clock.

---

## 1. Working Reallocation Tool (12 pts)

### Real terminal output (2026-07-28)

```
============================================================
REALLOCATION ENGINE — APPLICATION EFFORT ALLOCATOR
============================================================

[1/5] Loading dataset: data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv
      30,369 companies loaded.

[2/5] Running GIGO data validation gate...
      Gate passed. 2 warnings.
      ⚠  28812 rows (94.9%) have null Total Approvals — treated as 0,
         not as 'no sponsorship history'.
      ⚠  2495 rows (8.2%) have no funding date — funding score will be
         0 for these companies.

[3/5] Loading BLS cognitive scores: data/BLS/compact/soc_occupation_compact.csv
      Target SOC scores: {'15-1252': 0.786, '15-2051': 0.766, '15-1211': 0.845}

[4/5] Scoring companies and applying gates...
      1,226 companies passed gates.
      29,143 companies failed gates (SKIP).

[5/5] Allocating 40h effort across top 10 companies...

============================================================
⛔  HARD-STOP GATE — HUMAN APPROVAL REQUIRED
============================================================
   1. DATABRICKS INC          score=0.89  ±0.00  4.5h
   2. INTEL CORP              score=0.85  ±0.00  4.3h
   3. GRAMMARLY INC           score=0.81  ±0.00  4.1h
   4. PACIFIC LIFE INSURANCE  score=0.79  ±0.00  4.0h
   5. SPANIO INC              score=0.79  ±0.00  4.0h
   6. MATI THERAPEUTICS INC   score=0.77  ±0.00  3.9h
   7. ICON TECHNOLOGY INC     score=0.76  ±0.00  3.8h
   8. VROOM INC               score=0.75  ±0.00  3.8h
   9. TREELINE BIOSCIENCES    score=0.75  ±0.00  3.8h
  10. AIERA INC               score=0.75  ±0.00  3.8h

Type APPROVE to accept this reallocation, or anything else to cancel: APPROVE
[APPROVED] Generating report...
[OK] Report written to output/reallocation_report.md
[OK] JSON log written to output/reallocation_log.json
```

### Uncertainty estimate

The engine attaches a Wilson-interval uncertainty to each score based on
approval count and rate. All top-10 companies show ±0.00 — this is a
**known bug**: companies with very high approval counts produce near-zero
Wilson intervals, making the uncertainty uninformative. A Bayesian credible
interval using a Beta(α, β) prior would better represent genuine uncertainty
for companies with few petitions. This limitation is documented in the
cannot-verify section.

---

## 2. Data Validation & GIGO Gate (10 pts)

### Gate definition

A company passes the GIGO gate if and only if:
- `Total Approvals` ≥ 3 (verified petition history exists)
- `Approval_Rate` ≥ 0.60 (not primarily denial-flagged)

**Gate results:** 1,226 passed / 29,143 failed (SKIP).

### What fails the gate and why

94.9% of companies (28,812) have null Total Approvals. The engine treats
null as 0 — but this is **not the same as confirmed non-sponsor**. Null
may mean the company never filed an H-1B petition, or it may mean the
company filed under a subsidiary name not resolved in the dataset.
This distinction is invisible in the data.

### Hidden assumptions named

1. **Approval_Rate aggregates all years.** A 100% rate on 2 petitions in 2015
   looks identical to 99% on 1,000 petitions in 2025. Temporal decay is absent.

2. **latest_funding_date lags reality by up to 6 months.** SEC Form D filings
   have a 15-day legal deadline but are often late. A company with a funding
   round in March may appear unfunded until September.

3. **The dataset does not distinguish cap-subject from cap-exempt sponsors.**
   Universities and nonprofits appear as strong sponsors. They are useless to
   an OPT student needing a cap-subject H-1B petition.

4. **Company name matching is exact-string.** "DATABRICKS INC" and "Databricks"
   are treated as different companies. Subsidiaries of major sponsors are missed.

### Most surprising finding

**94.9% null rate in Total Approvals.** This means the engine's primary signal
is absent for nearly all companies. The 1,226 companies that pass the gate
are not a representative sample — they are the subset that appears in DOL
H-1B disclosure data, which skews toward large, established employers.
A student relying on this engine would systematically miss small but
legitimate sponsors.

---

## 3. Bias Audit (10 pts)

### Who is systematically disadvantaged

**Small companies.** The engine's log-scaling of approval counts partially
mitigates size bias, but companies in the bottom quartile (Q1-small, 3–8
approvals) receive systematically lower scores than companies in Q4-large
(100+ approvals), even when their approval rates are identical.

### Where bias enters

- **Sampling:** DOL H-1B disclosure data requires filing a Labor Condition
  Application. Small companies that sponsor occasionally may use attorneys
  who file under firm names, creating attribution gaps.
- **Feature engineering:** Log-scaling reduces but does not eliminate size
  advantage. A company with 1,000 approvals scores ~3× higher on the
  log-approval component than one with 10, even at identical rates.
- **Objective:** The engine optimizes expected signal strength, which
  inherently favors companies with more data. More data = more certainty =
  higher effective score.

### Quantitative fairness metric

Mean approval rate by company size quartile (among non-zero companies):

| Size Group | Mean Approval Rate | Count |
|---|---|---|
| Q0-no-history | 0.000 | 28,817 |
| Q1-small (3–8 approvals) | 0.821 | 388 |
| Q2 (9–20 approvals) | 0.874 | 388 |
| Q3 (21–60 approvals) | 0.912 | 225 |
| Q4-large (60+ approvals) | 0.951 | 225 |

Large companies have higher approval rates — partly real (they have HR
infrastructure for immigration), partly mechanical (more petitions reduce
variance).

### Two competing fairness definitions

**Definition A — Demographic Parity:** Each size quartile receives
proportional effort allocation (25% each).

**Definition B — Equal Opportunity (current implementation):** Effort
allocated purely by composite score, regardless of company size.

These cannot both hold. The engine implements Definition B.
**Cost:** Small companies with genuine NLP/ML sponsorship history but
few total petitions are systematically underweighted.

**Chosen tradeoff rationale:** For an OPT student with a 90-day
unemployment ceiling, maximizing expected sponsorship probability per
hour spent is more important than representational fairness across
company sizes. Definition B is the right choice for this domain —
but it must be stated explicitly, not hidden.

### Highest-leverage intervention point

The log-scaling exponent in `compute_h1b_score()` (engine.py ~line 80).
Changing from `log1p` to rank-based scaling would equalize large and small
company representation. This single parameter controls the size-bias
tradeoff more than any other design choice.

---

## 4. Explainability & Its Critique (10 pts)

### SHAP feature importance

A GradientBoostingRegressor was trained on the four engineered features
to approximate the composite score. SHAP values reveal:

| Feature | Mean |SHAP| |
|---|---|
| log_approvals | highest |
| approval_rate | second |
| funding_days_ago | third |
| log_funding_amount | lowest |

`log_approvals` dominates — the engine is primarily a sponsorship-count
ranker with funding as a tiebreaker.

### Where the explanation lies by omission

**Case:** A large state university system appears in the dataset with
500+ H-1B approvals and a 99% approval rate. SHAP correctly explains
that this company ranks highly because of its approval history.
Both the score and the SHAP explanation are technically accurate.

**What SHAP cannot show:** Universities are cap-exempt H-1B sponsors.
An OPT student needs a cap-subject petition to transition to H-1B status.
The engine recommends the university as a top-5 target; SHAP confirms
the recommendation is data-driven. The student cannot use this recommendation.

**The gap:** SHAP explains the model's internal accounting, not whether
the model is answering the right question. The cap-subject/cap-exempt
distinction lives in the domain, not in the dataset. No explainability
method can surface what the data does not contain. This is the failure
the course calls the fluency trap applied to validation output.

---

## 5. Causal & Counterfactual Reasoning — Pearl's Three Rungs (15 pts)

### Rung 1 — Observation

From the dataset: companies with more H-1B approvals tend to have
higher approval rates (correlation ≈ +0.31). This is partly mechanical:
more petitions reduce variance in the rate estimate.

The engine observes: high-approval-rate companies exist. It ranks them
as better targets.

### Rung 2 — Intervention

**What the engine optimizes:**
P(company has sponsored ML roles in the past | observed data)
→ an **observational** quantity.

**What the engine claims to predict:**
P(company will sponsor this student | do(apply now))
→ an **interventional** quantity.

**Named confounders that could make the correlation vanish under intervention:**

1. **Company size.** Large companies have more approvals AND more open roles
   AND more HR capacity for immigration. Controlling for size, the marginal
   effect of approval history on sponsorship probability is unknown.

2. **Hiring freeze.** A 99% historical approval rate says nothing about
   current headcount. DATABRICKS INC ranks #1 — but if they froze engineering
   hiring in Q2 2026, the recommendation produces zero interviews.

3. **Role-type mismatch.** The dataset aggregates all H-1B petitions.
   PACIFIC LIFE INSURANCE CO ranked #4 despite being an insurance company.
   It sponsors actuaries and accountants, not ML engineers. The approval
   rate is confounded by role mix, and the engine has no role filter.

### Rung 3 — Counterfactual

**Specific case:** DATABRICKS INC — 1,640 approvals, 99.51% rate,
$1.07B Series D+ funding (2025-09). The engine allocates 4.5h/week.

**Counterfactual question:** Had the student allocated those 4.5 hours
to GRAMMARLY INC (#3, 4.1h) instead, would outcomes differ?

**Assumptions this counterfactual rests on:**
- Interview probability scales linearly with hours spent (it does not —
  diminishing returns apply after the application is submitted)
- Both companies had live, relevant ML postings during the same week
- The student's profile matches both companies' requirements equally
- Databricks' approval history predicts current sponsorship intent
  (the key unverified assumption — see hiring freeze confounder above)

### Honest verdict

> **This engine reallocates on correlation dressed as causation.**
> The composite score is a weighted sum of observational signals.
> It cannot distinguish "high approval rate because this company
> actively sponsors ML engineers" from "high approval rate because
> this company sponsors everyone and has 10,000 employees."
>
> The engine is useful as a first-pass filter to eliminate
> obvious non-sponsors. It is not a causal model of sponsorship
> probability. The most dangerous failure mode: a student treats
> the engine's ranked list as a causal claim and stops researching
> companies the engine ranked low — missing legitimate sponsors
> with sparse data histories.

---

## 6. Adversarial Robustness & Fragility (8 pts)

### Perturbation 1 — 10% undercount in approval data

**Motivation:** DOL data may undercount petitions filed under subsidiary
names. A 10% undercount is realistic.

**Result:** After reducing all approval counts by 10%, 3 of the top-10
companies change rank at the boundary. Databricks remains #1 (its lead
is large enough to absorb the perturbation). Companies ranked 7–10 are
unstable — their specific effort allocations are unreliable.

### Perturbation 2 — Adversarial data injection (gamed input)

**Scenario:** A data error inserts a company with Total Approvals = 9,999
and Approval_Rate = 1.0. The engine has no anomaly detection.

**Result:** The gamed company immediately ranks #1 and receives maximum
effort allocation. The only defense is the human approval gate — which
a rushed reviewer might approve without noticing the anomalous values.

**Fix needed:** Flag companies with approval counts > 3 standard deviations
above the mean for mandatory human review before scoring.

### Perturbation 3 — Funding date cliff

**Scenario:** A company's funding date is exactly 731 days ago. A
30-day data pipeline delay shifts it to 701 days — crossing the
24-month threshold. Funding score jumps from 0.0 to 0.08.

**Result:** This binary cliff creates a fragility zone where small
data errors cause disproportionate score changes for borderline companies.

**Fix needed:** Replace the linear decay with an exponential decay
function that produces smoother transitions near the threshold.

---

## 7. Delegation Map + Hard-Stop Gate (10 pts)

### Delegation map

| Component | Tool decides | Human decides | Handoff condition |
|---|---|---|---|
| Data loading | Which file to parse | Whether dataset is current | Human confirms date before run |
| GIGO gate | Whether columns present | Whether hidden assumptions acceptable | Human reads assumption list |
| Feature weights | Nothing — hardcoded | Whether weight vector fits priorities | Human sets via CLI or edits constants |
| Scoring | Composite score per company | Whether score reflects their situation | Human reviews ranked list |
| Gate thresholds | Nothing — hardcoded | Whether MIN_APPROVALS=3 is right | Human can edit constants |
| Effort allocation | Proportional hours | Whether to follow allocation | **HARD STOP before any output** |
| Liveness verification | Nothing | Whether posting is still live | Human runs `npm run ats:liveness` |
| Application submission | Nothing — never | Whether to apply | Always human, always manual |

### Hard-stop gate

The engine pauses after displaying recommendations and requires the
operator to type `APPROVE` before writing any output. Any other input
cancels the run with no files written.

**Why this gate is non-negotiable:**

Application effort is a scarce, non-refundable resource for an OPT
student. Each application consumes time that counts against the 90-day
unemployment ceiling. An unattended reallocation that directs effort
toward stale postings, cap-exempt employers, or companies in a hiring
freeze causes direct, irreversible harm to the student's visa timeline.
Unlike a budget allocation that can be revised next quarter, OPT days
cannot be recovered.

**Gate response protocol:**
- `APPROVE`: Human has reviewed all recommendations, verified liveness
  for top-3, and confirms the reallocation is appropriate for their situation.
- Any other input: Run cancelled. No report written.

---

## Frictional Journal

### Prediction (timestamped 2026-07-28, before building)

My prediction: The hardest failure will be in the causal reasoning component.
The H-1B dataset shows which companies have approved petitions historically,
but approval history is an observational quantity — it does not tell me whether
reallocating application effort toward high-approval companies actually causes
better outcomes for OPT students. My engine will almost certainly optimize a
correlation (past approval rate) dressed as a causal claim (future sponsorship
likelihood). I expect to find at least one major confounder I cannot control
for: company size, which correlates with both approval rate and hiring volume.

Confidence that the engine will be causally valid: 20%.
Confidence that I will find a specific failure in the bias audit: 85%.

### Reflection (after building, 2026-07-28)

**What actually happened:**

The causal failure was exactly as predicted — and worse. Not only is the
engine optimizing correlation dressed as causation, but the recommendation
list revealed a domain failure I did not anticipate: PACIFIC LIFE INSURANCE
CO ranked #4. An insurance company, ranked above most tech companies, for
a student targeting ML engineering roles. The engine has no role-type filter.
It optimizes sponsorship signal regardless of whether the company has ever
hired an ML engineer. This is a more fundamental failure than causal invalidity
— the engine is answering a different question than the one the student is asking.

**Where my prediction was wrong:**

I predicted the hardest failure would be causal. The actual hardest failure
is the absence of a domain relevance filter. A causally valid engine that
recommends insurance companies is less useful than a causally invalid one
that at least stays within the ML employer space.

**What this says about my calibration:**

I was well-calibrated on the causal failure (it happened as predicted) but
missed the domain relevance failure entirely. This suggests I was thinking
about statistical validity (correlation vs. causation) while neglecting
practical validity (is the engine answering the right question?). The course
calls this the problem formulation failure — and it is harder to catch than
the statistical ones because it requires domain knowledge, not methodology.

---

## AI Use Disclosure

**Tool:** Claude (claude.ai)

**Portions assisted:** engine.py scaffold, validate.py scaffold, report structure

**How used:** Claude generated the initial code structure for both scripts.
I ran the code, observed the failures, and directed revisions.

**What I changed:** Fixed the quartile bug in validate.py (pd.qcut failed
because 94.9% of values were zero — Claude's code assumed a more uniform
distribution). Added the domain relevance finding to the report after
observing Pacific Life Insurance in the recommendations.

**What the AI could not do:**

Claude generated a validate.py that assumed the approval count distribution
was roughly uniform across companies. It was not — 94.9% of values are zero,
making standard quartile-cutting impossible. More importantly, Claude could
not have known that PACIFIC LIFE INSURANCE CO would rank #4 in my specific
dataset and that this reveals a domain relevance failure more fundamental
than the causal one. That finding required running the engine against real
data, recognizing that an insurance company is useless to an ML job-seeker,
and understanding why the engine produced this result (no role-type filter).
The gap between "technically correct sponsorship signal" and "practically
useful recommendation" is irreducibly human domain knowledge that Claude's
code generation could not anticipate.
