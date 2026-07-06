# Domain Justification — case-phd-econ-stem-opt-v2
**Milivoje Davidovic · 2026-07-06**

---

## Who Uses This Mode and In What Situation

A PhD student or recent graduate in economics, econometrics, or quantitative
finance on F-1 STEM OPT extension, targeting industry roles across economic
consulting, tech economist teams, think tanks, and financial services. The
calibration case for this recipe is a PhD economist with a background in fiscal
policy, financial conditions, and topological data analysis (persistent homology
applied to industry portfolio returns), on STEM extension, evaluating roles in
the New York and DC metro areas.

The STEM extension window (24 months beyond initial OPT) changes the risk
calculus relative to initial OPT: the failure mode is not running out of time
before an offer, but spending the extension on cap-subject companies that lose
the H-1B lottery while cap-exempt employers (Federal Reserve Banks, think tanks,
nonprofits) go uninvestigated.

---

## Information Asymmetry Addressed

Standard job-search tools show a job title and a salary range. They do not show
which SOC code an employer will use when filing the Labor Condition Application
— and that classification governs the prevailing wage floor, the H-1B
sponsorship probability, and the role's cognitive demand score.

The same work — structural econometrics, causal inference, fiscal policy
analysis — can be filed under SOC 19-3011 (Economists, national median
$115,440), 15-2051 (Data Scientists, $124,590), or 15-2041 (Statisticians,
$100,910). The P25-to-P75 interquartile ranges across these codes barely
overlap. A candidate who anchors on the wrong SOC median misjudges the salary
floor by up to $24,000 at the median level and miscalibrates every negotiation.

Amazon is the clearest example of this asymmetry in practice. The company has
filed roughly 47 LCAs under SOC 19-3011 and 823 under 15-2051 over three years.
P(SOC=19-3011 | Amazon) ≈ 0.054. A candidate who evaluates Amazon as an
economist-track employer based on the job title alone is almost certainly being
hired as a Data Scientist, with a different wage floor and a lower cognitive
demand score (0.76 vs 0.84). This recipe makes that ambiguity explicit and
requires it to be labeled before scoring proceeds.

The second asymmetry is the federal employer gap. Federal Reserve Banks, CBO,
BLS, IMF, and World Bank are disproportionately important for PhD fiscal
economists — cap-exempt, historically strong sponsors, strong research culture.
They show LCA count = 0 in standard DOL disclosure data because they are not
required to file standard LCAs. A candidate who interprets this as evidence of
no sponsorship will systematically underinvest in the highest-fit part of the
target market.

---

## Engine Layer Connections

**80 Days to Stay:** Sponsorship evidence filtered by all three relevant SOC
codes (19-3011, 15-2051, 15-2041), with SOC probability scores derived from
filing distributions — not a simple yes/no on whether the employer has ever
sponsored. The proposed `econ-soc-sponsor-tracker.py` script operationalizes
this logic against the 80-days data.

**Job-Ops:** Liveness checking is especially important for economist roles at
tech companies. These postings are typically filled within 2–4 weeks and
removed quickly. The liveness gate runs before scoring — an expired posting
zeroes the composite regardless of sponsorship or fit. Verified in this run:
the liveness script correctly returned expired for a Greenhouse 404 URL and for
a deliberately fabricated Lever URL.

**Cognitive Pivot:** SOC code determines the cognitive demand score. A role
coded as 15-2051 has a composite cognitive score of 0.76 vs 0.84 for 19-3011,
with the gap concentrated in causal reasoning (0.72 vs 0.91) and institutional
knowledge (0.61 vs 0.84) — dimensions where PhD economist training provides the
strongest differentiation from AI substitution. Note: the current scorer config
sets `role_quality` weight to 0 (marked `[VERIFY]`), meaning this signal
currently contributes nothing to the composite. This is an open issue identified
during the worked run.

---

## Failure Modes

**Failure Mode 1 — SOC reclassification invisible until offer stage.**
The recipe estimates P(SOC | employer) from LCA filing history. A company
building a new economist team from scratch has no LCA history for that SOC — and
a company that dissolved its economist team after 2022 layoffs still shows high
historical counts. The error is worst for recently reorganized tech employers.
It is hardest to catch because the recipe will assign MEDIUM or HIGH priority
based on stale data, and the candidate discovers the mismatch only at the offer
stage when the title and wage floor differ from expectations. The shape of the
error: the candidate prepares for an Economist offer and receives a Data
Scientist offer at a $9,000 lower median salary floor. For a STEM OPT extension
candidate with limited runway, this is especially costly if the role requires
H-1B filing under a different SOC than expected.

**Failure Mode 2 — Federal employer underweighting (most expensive error for
this domain).**
The recipe flags federal employers as `[TODO: DATA SOURCE]` when
`data/federal_multilateral_employers.csv` does not exist, which is correct but
can be misread as low priority. For a PhD fiscal economist, the NY Fed, CBO, and
RAND are not edge cases — they are the primary target market. A candidate who
deprioritizes these employers because the recipe cannot score them loses the most
relevant applications. This error is hardest to catch because it looks like
responsible data hygiene (not scoring without verified data) but produces the
wrong decision for this specific domain. A software engineer mode would not make
this mistake because federal employers are not disproportionately important for
that population.
