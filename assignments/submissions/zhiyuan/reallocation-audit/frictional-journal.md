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
  so it is *not* the biggest firms that win; it is small-sample firms that haven't hit a denial
  yet. 1,026 of 1,557 companies got rejected by the GIGO gate for n<20.
- **Where my prediction was wrong:** the bigger failure wasn't confounding by company size — it
  was that approval rates all sit near a 98–100% ceiling for almost everyone who files. Once
  nearly every company scores the same, the small differences the engine ranks on are mostly
  sampling noise, and a thin-sample 100% looks (wrongly) more impressive than a deep-sample 99.5%.
- **Calibration note:** I predicted the causal risk (80% confidence) and it held in spirit, but I
  named the wrong mechanism. The real error was a near-ceiling metric with too little variance to
  rank on precisely, not the size confounder I expected. Lesson: I anchored on the failure I could
  imagine, not the one in the data.
