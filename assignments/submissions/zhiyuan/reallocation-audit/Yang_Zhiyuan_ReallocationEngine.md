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
(±100/√n percentage points), and recommends one move. **Objective (one sentence):** rank companies
by their H-1B approval reliability. **What it leaves out:** company size, funding stage, and salary —
none of which the score sees.

## 2. Data validation & the GIGO gate
Hidden assumption the data makes: "approval rate is comparable across companies." It isn't — a
company with 3 filings and one with 1,600 both show a rate. **Gate:** reject any company with
fewer than 20 total filings (n<20). **Result:** 1,026 of 1,557 companies (66%) fail the gate and
are dropped. A tool that skipped this gate would happily recommend a company with a 100% rate on
2 filings.

## 3. Bias audit (data → output)
**Who is starved:** early-stage and small companies. They have thin or zero H-1B history, so they
fail the gate or score noisily, and never receive the reallocated effort — even if their short
record is genuinely strong. This is a feedback loop: no history → no recommendation → no applicant.
**Fairness tension:** *equal opportunity* (every company with a real record should be reachable, not
just the high-volume ones) vs. *predictive parity* (recommendations should be equally reliable
across company-size groups). I chose predictive parity — I only recommend where the evidence is
dense — and the cost is that I systematically ignore young companies with thin records.
**Highest-leverage fix:** add a funding-recency signal (SEC Form D) so a company can qualify on
trajectory, not just filing volume.

## 4. Explainability & its critique
The explanation is simple and honest: the recommendation is driven by `approval_rate`, gated by
`n`. **Where it lies by omission:** the explanation says "6Sense: 100% approval." Technically
true. Practically misleading — "100%" reads as rock-solid certainty, but it rests on just 62
filings; the identical label would sit on a company with a 100% rate on 2 filings. The number is
accurate; the confidence a reader hears in the word "100%" is not earned by the sample behind it.

## 5. Causal & counterfactual reasoning (Pearl's three rungs)
- **Rung 1 — Observation:** across the data, approval rates cluster near the ceiling — almost every
  company that files sits around 98–100%. The rate correlates with little *because* it barely varies.
- **Rung 2 — Intervention:** if the student moves effort to the top-rated company, does the ranking
  reflect a real difference in the world? The score is **observational, not interventional.**
  Confounders that dissolve the gap: (a) **sample size** — 6Sense's 100% rests on 62 filings, not a
  stable rate; (b) **near-ceiling base rate** — with everyone at 98–100%, the differences the tool
  ranks on are mostly sampling noise; (c) **selection** — companies choose which petitions to file.
- **Rung 3 — Counterfactual:** had the engine ranked a different company first, would the approval
  picture actually differ? Not measurably — the 0.5-point gap between 100% and 99.5% is inside the
  margins. The counterfactual would rest on treating noise as signal.
- **Honest verdict:** **the engine ranks on observed rates, not a causal claim** — and the metric it
  ranks on barely discriminates once sample size is accounted for. It is a reasonable *coarse filter*
  (does a company have a solid approval record at all), not a fine-grained recommender.

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
paper, but that's a 100% from only 62 filings — one that hasn't met its first denial, not a
meaningfully better rate than Databricks' 99.5% on 1,648."* **Where I would not trust this tool:**
any company near the gate boundary, and any fine-grained ranking between companies whose rates
differ by less than their margins.

## AI Use Disclosure
- **Tool(s) used:** Claude (Anthropic).
- **Portions assisted:** drafting `reallocate.py`, structuring this report.
- **How used:** generated the first-pass scorer and report skeleton.
- **What I changed:** corrected my pre-build prediction after seeing the real output (the winner is
  a small-n 100% firm, not the biggest filer), and rewrote the causal section around sample size and
  near-ceiling base rates instead of my first, wrong framing.
- **What the AI could not do:** The AI ranked companies by raw approval rate and placed a
  100%-on-62-filings company above a 99.5%-on-1,648 one — treating the smaller sample as "better."
  It did not flag that these rates all sit near the ceiling, so the gaps it ranked on are mostly
  sampling noise, not real differences in the world. Deciding that a precise-looking rate on thin
  data deserves *less* trust, not more, was the judgment I had to add.
