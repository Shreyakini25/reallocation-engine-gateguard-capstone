# The Reallocation Engine, Audited — Application-Effort Triage

**Zhiyuan Yang · INFO 7375 · 2026-07-20**
Anchored to *The Reallocation Engine*, "80 Days to Stay" layer (company H-1B evidence).

The tool reads 1,557 companies' H-1B history and recommends moving a unit of an OPT student's
scarce **application effort** from a low-reliability company to a high one. Run output:

```
Companies read: 1557 | passed GIGO gate (n>=20): 531 | rejected: 1026
RECOMMENDATION: move 1 application slot
  FROM  AURORA SOLAR INC  (reliability 75.0% +/-20.4, n=24)
  TO    6SENSE INSIGHTS INC  (reliability 100.0% +/-12.7, n=62)
```

## 1. The tool
Ingests the CSV, scores each company by H-1B approval rate, attaches a margin of error
(±100/√n percentage points), and recommends one move. **Objective (one sentence):** maximize
H-1B sponsorship reliability. **What it leaves out:** company size, funding stage, and whether
the student actually fits the role — none of which the score sees.

## 2. Data validation & the GIGO gate
Hidden assumption the data makes: "approval rate is comparable across companies." It isn't — a
company with 3 filings and one with 1,600 both show a rate. **Gate:** reject any company with
fewer than 20 total filings (n<20). **Result:** 1,026 of 1,557 companies (66%) fail the gate and
are dropped. A tool that skipped this gate would happily recommend a company with a 100% rate on
2 filings.

## 3. Bias audit (data → output)
**Who is starved:** early-stage and small companies. They have thin or zero H-1B history, so they
fail the gate or score low, and never receive the reallocated effort — even when they would
sponsor. This is a feedback loop: no history → no recommendation → no applicant. **Fairness
tension:** *equal opportunity* (every company that would truly sponsor should be reachable) vs.
*predictive parity* (recommendations should be equally reliable across company-size groups). I
chose predictive parity — I only recommend where the evidence is dense — and the cost is that I
systematically ignore young sponsors. **Highest-leverage fix:** add a funding-recency signal (SEC
Form D) so a company can qualify on trajectory, not just filing history.

## 4. Explainability & its critique
The explanation is simple and honest: the recommendation is driven by `approval_rate`, gated by
`n`. **Where it lies by omission:** the explanation says "6Sense: 100% approval." Technically
true. Practically misleading — it invites the student to read "100% = I will get sponsored,"
when the field only means USCIS approved the petitions the company *chose* to file. The plot is
accurate; the inference a human draws from it is wrong.

## 5. Causal & counterfactual reasoning (Pearl's three rungs)
- **Rung 1 — Observation:** high approval rate correlates with companies that appear in the data
  as reliable sponsors.
- **Rung 2 — Intervention:** if the student actually moves effort to 6Sense, does their outcome
  improve? The score is **observational, not interventional.** Confounders that would make the
  correlation vanish: (a) **selection** — approval rate is P(approve | petition filed); companies
  only file for people they already decided to hire, so the number never contained the student's
  odds of being hired; (b) **sample size** — 6Sense's 100% rests on 62 cases; (c) **size/sector**.
- **Rung 3 — Counterfactual:** for a past applicant who spent a slot on Aurora Solar, would they
  have an offer had the engine sent them to 6Sense instead? Unknowable from this data — approval
  rate carries no information about hiring. The counterfactual rests on an assumption the dataset
  cannot support.
- **Honest verdict:** **the engine reallocates on correlation dressed as causation.** Worse, it
  optimizes the wrong quantity — approval-given-petition, not offer-probability. It is a
  reasonable *filter*, not a causal recommender.

## 6. Adversarial robustness & fragility
Perturbation: lower the GIGO threshold from n≥20 to n≥5 — a change a busy user would not notice.
The top recommendation flips to obscure companies with perfect rates on a handful of filings. The
"best" company is an artifact of the threshold, not of the world. The recommendation is stable
only inside a gate the user has to know to set.

## 7. Delegation map + the hard-stop gate
| Component | Tool decides | Human decides |
|---|---|---|
| GIGO gate, scoring, ranking | ✔ | — |
| Which move to recommend | ✔ (proposes) | — |
| **Whether to commit the move** | — | ✔ **override point** |

**Hard stop:** committing application effort is irreversible (a slot spent, identity exposed to a
company). The tool **recommends** but stops — `--approve` is required, and a human clears it. It is
non-negotiable here because the resource moved is the student's finite OPT-window effort.

## Uncertainty communication
Every recommendation ships a ±margin and an n. The plain-English line: *"6Sense looks best on
paper, but that's 62 past petitions, not a promise you'll be hired — and the score never measured
hiring at all."* **Where I would not trust this tool:** any company near the gate boundary, and any
use that reads "approval rate" as "my odds."

## AI Use Disclosure
- **Tool(s) used:** Claude (Anthropic).
- **Portions assisted:** drafting `reallocate.py`, structuring this report.
- **How used:** generated the first-pass scorer and report skeleton.
- **What I changed:** corrected my pre-build prediction after seeing the real output (the winner is
  a small-n 100% firm, not the biggest filer), and rewrote the causal section around the true error.
- **What the AI could not do:** The AI ranked companies by approval rate as if that were
  "where to apply." It could not see that `approval_rate` measures P(USCIS approves | the company
  filed) — a post-hiring step ~99% of the time — and therefore contains none of the student's
  probability of being *hired*. Knowing that gap requires having lived the F-1 → H-1B pipeline; the
  model optimized a column that looks like the answer and isn't.
