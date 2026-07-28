# Frictional Journal

## Prediction (before building — 2026-07-20)

- **Hardest failure I expect:** the engine will rank companies by H-1B approval history and
  call that "where your application effort should go" — but that ranking is confounded by
  company size and funding stage (big companies file more H-1Bs simply because they hire more),
  so it optimizes a correlation that would not survive as a causal claim.
- **How causally valid I expect it to be:** low. It is an observational scorer, not an
  interventional one.
- **Confidence in that prediction:** 80%.

## Reflection (after building — 2026-07-20)

- **What actually happened:** my "size confounder" prediction was only half right. The top pick
  is 6SENSE INSIGHTS (100%, n=62), which beats Databricks (99.5%, n=1648) despite 26× less data —
  so it is *not* the biggest firms that win; it is the small-sample 100% firms. 1026 of 1557
  companies got rejected by the GIGO gate for n<20.
- **Where my prediction was wrong:** the bigger failure wasn't confounding by size — it was that
  "approval rate" answers the wrong question entirely. It measures P(USCIS approves | a petition
  was filed), which is ~99% for almost everyone; it says nothing about whether the company will
  *hire or sponsor me*. The engine optimizes a number that isn't the one the student needs.
- **Calibration note:** I predicted the causal risk (80% confidence) and it held in spirit, but I
  named the wrong confounder. The real error was measurement validity, not sample size. Lesson: I
  anchored on the failure I could imagine, not the one in the data.
