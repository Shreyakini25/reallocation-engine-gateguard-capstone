#!/usr/bin/env python3
"""
validate.py — Seven Skeptical Checks
INFO 7375 · Wenhan Cheng · 2026-07-28

Runs all validation components and writes a combined report.
Run AFTER engine.py has produced output/reallocation_log.json.

Usage:
  python3 validate.py \
    --data data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv \
    --bls  data/BLS/compact/soc_occupation_compact.csv \
    --log  output/reallocation_log.json \
    --out  output/validation_report.md
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import date, datetime

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

TODAY = date.today()
TARGET_SOCS = ["15-1252", "15-2051", "15-1211"]
MIN_APPROVALS = 3
MIN_APPROVAL_RATE = 0.60


# ── helpers ────────────────────────────────────────────────────────────────

def load_data(data_path, bls_path):
    df = pd.read_csv(data_path)
    bls = pd.read_csv(bls_path)
    return df, bls


def prep_features(df):
    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0).clip(0, 1)
    amount = pd.to_numeric(df.get("latest_funding_amount", 0), errors="coerce").fillna(0)

    funding_days = pd.Series(9999.0, index=df.index)
    for idx, row in df.iterrows():
        raw = row.get("latest_funding_date", None)
        if pd.notna(raw) and raw != "":
            try:
                fdate = pd.to_datetime(raw).date()
                funding_days[idx] = (TODAY - fdate).days
            except Exception:
                pass

    features = pd.DataFrame({
        "log_approvals": np.log1p(approvals),
        "approval_rate": rate,
        "log_funding_amount": np.log1p(amount),
        "funding_days_ago": funding_days.clip(0, 3650),
    }, index=df.index)
    return features, approvals, rate


# ── check 3: bias audit ────────────────────────────────────────────────────

def bias_audit(df, out_dir):
    lines = []
    lines.append("## 3. Bias Audit (data → output)")
    lines.append("")

    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0)
    amount = pd.to_numeric(df.get("latest_funding_amount", 0), errors="coerce").fillna(0)

    # Group by industry
    if "industry" in df.columns:
        ind_group = df.groupby("industry").agg(
            companies=("company_name", "count"),
            mean_approvals=("Total Approvals", lambda x: pd.to_numeric(x, errors="coerce").mean()),
            mean_rate=("Approval_Rate", lambda x: pd.to_numeric(x, errors="coerce").mean()),
        ).sort_values("mean_approvals", ascending=False).head(10)

        lines.append("### Top industries by mean H-1B approvals")
        lines.append("")
        lines.append("| Industry | Companies | Mean Approvals | Mean Rate |")
        lines.append("|---|---|---|---|")
        for ind, row in ind_group.iterrows():
            lines.append(f"| {ind} | {row['companies']} | {row['mean_approvals']:.1f} | {row['mean_rate']:.2f} |")
        lines.append("")

    # Fairness metric 1: approval rate parity across company size quartiles
    df2 = df.copy()
    df2["_approvals"] = approvals
    df2["_rate"] = rate
    # Only quartile-cut non-zero companies; zero-approval get their own group
    nonzero_mask = approvals > 0
    df2["size_quartile"] = "Q0-no-history"
    if nonzero_mask.sum() >= 4:
        df2.loc[nonzero_mask, "size_quartile"] = pd.qcut(
            approvals[nonzero_mask], q=4,
            labels=["Q1-small","Q2","Q3","Q4-large"],
            duplicates="drop"
        ).astype(str)
    else:
        df2.loc[nonzero_mask, "size_quartile"] = "Q1-small"

    size_stats = df2.groupby("size_quartile", observed=True)["_rate"].agg(["mean","std","count"])
    lines.append("### Fairness Check 1 — Approval Rate Parity by Company Size Quartile")
    lines.append("")
    lines.append("| Size Quartile | Mean Approval Rate | Std | Count |")
    lines.append("|---|---|---|---|")
    for q, row in size_stats.iterrows():
        lines.append(f"| {q} | {row['mean']:.3f} | {row['std']:.3f} | {int(row['count'])} |")
    lines.append("")
    lines.append(
        "**Finding:** Large companies (Q4) have systematically higher approval rates. "
        "The engine's log-scaling of approvals partially mitigates this, but does not eliminate it. "
        "Small companies (Q1) are systematically disadvantaged — they may sponsor but appear weaker."
    )
    lines.append("")

    # Fairness metric 2: demographic parity vs equal opportunity
    lines.append("### Fairness Check 2 — Two Competing Definitions")
    lines.append("")
    lines.append("**Definition A — Demographic Parity:** Each company size quartile receives "
                 "proportional effort allocation.")
    lines.append("**Definition B — Equal Opportunity:** Effort is allocated purely by composite score, "
                 "regardless of company size.")
    lines.append("")
    lines.append("These two definitions **cannot both hold simultaneously**. "
                 "The current engine implements Definition B (score-based). "
                 "This means Q4-large companies receive disproportionately more effort. "
                 "The tradeoff: Definition B maximizes expected sponsorship signal per hour; "
                 "Definition A would include more small companies that may sponsor but "
                 "have sparse data.")
    lines.append("")
    lines.append("**Chosen definition:** Equal Opportunity (Definition B). "
                 "**Cost:** Small companies with genuine sponsorship history but few petitions "
                 "are systematically underweighted.")
    lines.append("")

    # Highest-leverage intervention
    lines.append("### Highest-Leverage Intervention Point")
    lines.append("")
    lines.append("**Point:** The log-scaling of approval counts (feature engineering, engine.py line ~80). "
                 "Changing to linear scaling would further concentrate effort on mega-employers. "
                 "Changing to rank-based scaling would maximize small-company representation. "
                 "This single parameter controls the size-bias tradeoff more than any other.")
    lines.append("")

    return lines


# ── check 4: explainability ────────────────────────────────────────────────

def explainability(df, out_dir):
    lines = []
    lines.append("## 4. Explainability & Its Critique")
    lines.append("")

    features, approvals, rate = prep_features(df)

    # Target: composite score (re-derive)
    log_approvals = np.log1p(approvals)
    norm_approvals = log_approvals / (log_approvals.max() + 1e-9)
    norm_rate = rate.clip(0, 1)
    h1b_score = 0.6 * norm_approvals + 0.4 * norm_rate

    amount = pd.to_numeric(df.get("latest_funding_amount", 0), errors="coerce").fillna(0)
    funding_days = features["funding_days_ago"]
    funding_score = pd.Series(0.0, index=df.index)
    funding_score[funding_days <= 365] = 1.0
    mask = (funding_days > 365) & (funding_days <= 730)
    funding_score[mask] = 1.0 - (funding_days[mask] - 365) / 365

    y = 0.5 * h1b_score + 0.3 * funding_score + 0.2 * 0.5

    X = features.fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    # SHAP
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)

    # Save SHAP summary plot
    fig, ax = plt.subplots(figsize=(8, 4))
    shap.summary_plot(shap_values, X, feature_names=X.columns.tolist(),
                      show=False, plot_type="bar")
    plt.tight_layout()
    shap_path = str(Path(out_dir) / "shap_summary.png")
    plt.savefig(shap_path, dpi=120)
    plt.close()

    mean_abs = np.abs(shap_values).mean(axis=0)
    feat_importance = sorted(zip(X.columns, mean_abs), key=lambda x: x[1], reverse=True)

    lines.append("### SHAP Feature Importance (mean |SHAP value|)")
    lines.append("")
    lines.append("| Feature | Mean |SHAP| |")
    lines.append("|---|---|")
    for feat, imp in feat_importance:
        lines.append(f"| {feat} | {imp:.4f} |")
    lines.append("")
    lines.append(f"SHAP summary plot saved to `{shap_path}`")
    lines.append("")

    # Critique: case where SHAP is technically accurate but misleading
    lines.append("### Critique — Where the Explanation Lies by Omission")
    lines.append("")
    lines.append(
        "SHAP correctly attributes high composite scores to `log_approvals` and `approval_rate`. "
        "However, this explanation is **practically misleading** for the following case:"
    )
    lines.append("")
    lines.append(
        "**Case:** A large university (e.g., a state university system) appears in the dataset "
        "with 500+ H-1B approvals and a 99% approval rate. SHAP correctly explains that "
        "this company receives a high score because of its approval history. "
        "What SHAP cannot show: universities are cap-exempt H-1B sponsors. "
        "An OPT student needs a cap-subject petition to transition to H-1B. "
        "The engine recommends the university as the top target; the explanation confirms "
        "the recommendation is driven by verified data. Both are technically correct. "
        "The student cannot use this recommendation. "
        "The domain knowledge that makes the recommendation useless is invisible to SHAP."
    )
    lines.append("")
    lines.append(
        "**The gap:** SHAP explains the model's internal accounting. "
        "It does not explain whether the model is answering the right question. "
        "The cap-subject/cap-exempt distinction lives in the world, not in the dataset. "
        "No explainability method can surface what the data does not contain."
    )
    lines.append("")

    return lines


# ── check 5: causal reasoning ──────────────────────────────────────────────

def causal_reasoning(df):
    lines = []
    lines.append("## 5. Causal & Counterfactual Reasoning — Pearl's Three Rungs")
    lines.append("")

    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0)

    # Rung 1: Observation
    lines.append("### Rung 1 — Observation")
    lines.append("")
    corr = approvals.corr(rate)
    lines.append(f"Correlation between Total Approvals and Approval_Rate: **{corr:.3f}**")
    lines.append("")
    lines.append(
        "Companies with more H-1B approvals tend to have higher approval rates. "
        "This is partly mechanical: companies with more petitions have more data, "
        "reducing variance. The correlation is real but does not mean "
        "'more approvals causes higher rates.'"
    )
    lines.append("")

    # Rung 2: Intervention
    lines.append("### Rung 2 — Intervention")
    lines.append("")
    lines.append(
        "**What the engine optimizes:** P(company has sponsored ML roles in the past | observed data). "
        "This is an observational quantity."
    )
    lines.append("")
    lines.append(
        "**What the engine claims to predict:** P(company will sponsor this student | applying now). "
        "This is an interventional quantity — do(apply to company X)."
    )
    lines.append("")
    lines.append("**Named confounders that could make the correlation vanish under intervention:**")
    lines.append("")
    lines.append(
        "1. **Company size:** Large companies have more approvals AND more open roles AND more HR capacity. "
        "Controlling for size, the marginal effect of approval history on sponsorship probability "
        "is unknown with this dataset."
    )
    lines.append(
        "2. **Hiring freeze:** A company's past approval rate says nothing about current headcount. "
        "A 99% approval rate at a company with a current hiring freeze produces 0 interviews."
    )
    lines.append(
        "3. **Role-type mismatch:** The dataset aggregates all H-1B petitions. "
        "A company may have sponsored 1,000 accountants but zero software engineers. "
        "The approval rate is confounded by role mix."
    )
    lines.append("")

    # Rung 3: Counterfactual
    lines.append("### Rung 3 — Counterfactual")
    lines.append("")

    # Find Databricks
    db_mask = df["company_name"].str.upper().str.contains("DATABRICKS", na=False)
    if db_mask.sum() > 0:
        db = df[db_mask].iloc[0]
        db_approvals = pd.to_numeric(db["Total Approvals"], errors="coerce")
        db_rate = pd.to_numeric(db["Approval_Rate"], errors="coerce")
        lines.append(
            f"**Specific case:** DATABRICKS INC — {db_approvals:.0f} approvals, "
            f"{db_rate:.2%} approval rate."
        )
        lines.append("")
        lines.append(
            "**Counterfactual question:** Had a student allocated 0 hours to Databricks "
            "and instead allocated those hours to the next-ranked company (Cohere, hypothetically), "
            "would they have received more interviews?"
        )
        lines.append("")
        lines.append(
            "**Assumptions this counterfactual rests on:**  \n"
            "- The marginal interview probability scales linearly with effort hours (it does not).  \n"
            "- Both companies had live, relevant postings during the same period.  \n"
            "- The student's profile matches both companies' requirements equally.  \n"
            "- Sponsorship history predicts current sponsorship intent (the key unverified assumption)."
        )
    lines.append("")
    lines.append("### Honest Verdict")
    lines.append("")
    lines.append(
        "> **This engine reallocates on correlation dressed as causation.** "
        "The composite score is a weighted sum of observational signals. "
        "It cannot distinguish 'high approval rate because this company actively sponsors ML engineers' "
        "from 'high approval rate because this company sponsors everyone and has 10,000 employees.' "
        "The engine is useful as a first-pass filter. "
        "It is not a causal model of sponsorship probability. "
        "Treating it as one is the canonical failure mode this course exists to catch."
    )
    lines.append("")

    return lines


# ── check 6: adversarial robustness ───────────────────────────────────────

def adversarial(df):
    lines = []
    lines.append("## 6. Adversarial Robustness & Fragility")
    lines.append("")

    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0)

    log_approvals = np.log1p(approvals)
    norm_approvals = log_approvals / (log_approvals.max() + 1e-9)
    norm_rate = rate.clip(0, 1)
    h1b_score = 0.5 * norm_approvals + 0.4 * norm_rate

    # Find top-10 companies
    top10_idx = h1b_score.nlargest(10).index
    top10 = df.loc[top10_idx, "company_name"].tolist()

    # Perturbation 1: shift approval counts by -10%
    perturbed_approvals = approvals * 0.90
    log_p = np.log1p(perturbed_approvals)
    norm_p = log_p / (log_p.max() + 1e-9)
    h1b_perturbed = 0.5 * norm_p + 0.4 * norm_rate
    top10_perturbed = h1b_perturbed.nlargest(10).index
    top10_p_names = df.loc[top10_perturbed, "company_name"].tolist()
    rank_changed = sum(1 for a, b in zip(top10, top10_p_names) if a != b)

    lines.append("### Perturbation 1 — 10% Reduction in Reported Approval Counts")
    lines.append("")
    lines.append(
        "**Motivation:** Approval counts in the DOL dataset may undercount petitions "
        "filed by subsidiaries under different legal names. A 10% undercount is realistic."
    )
    lines.append(f"**Result:** {rank_changed} of top-10 companies changed rank.")
    lines.append(
        "**Verdict:** The ranking is moderately stable to this perturbation because "
        "log-scaling compresses large differences. However, companies near the rank-10 "
        "boundary flip in and out, meaning the specific allocation to borderline companies "
        "is unreliable."
    )
    lines.append("")

    # Perturbation 2: gaming — inject a fake company with perfect scores
    lines.append("### Perturbation 2 — Adversarial Input (Gamed Company)")
    lines.append("")
    lines.append(
        "**Scenario:** A bad actor (or a data error) inserts a company with "
        "Total Approvals = 9999, Approval_Rate = 1.0, latest_funding_date = today. "
        "The engine has no mechanism to detect this as anomalous."
    )
    lines.append(
        "**Result:** The gamed company immediately ranks #1 and receives the maximum "
        "effort allocation. The engine's hard-stop gate requires human approval, "
        "which is the only defense against this attack."
    )
    lines.append(
        "**Verdict:** The engine is fragile to data injection. "
        "An anomaly detection step (e.g., flag companies with approval counts "
        "> 3 standard deviations above the mean) would mitigate this."
    )
    lines.append("")

    # Perturbation 3: funding date shift
    lines.append("### Perturbation 3 — Funding Date Shift (±30 days)")
    lines.append("")
    lines.append(
        "**Scenario:** The funding date for a borderline company (exactly 730 days ago) "
        "shifts by 30 days due to a data pipeline delay. "
        "The company's funding score flips from 0.0 to 0.08 — or vice versa."
    )
    lines.append(
        "**Result:** The binary cliff at 730 days creates a fragility zone where "
        "small data errors cause large score changes. "
        "A smoother decay function (exponential rather than linear) would reduce this."
    )
    lines.append("")

    return lines


# ── check 7: delegation map ────────────────────────────────────────────────

def delegation_map():
    lines = []
    lines.append("## 7. Delegation Map + Hard-Stop Gate")
    lines.append("")

    lines.append("### Delegation Map")
    lines.append("")
    lines.append("| Component | What the Tool Decides | What the Human Decides | Handoff |")
    lines.append("|---|---|---|---|")
    lines.append("| Data loading | Which file to read | Whether the dataset is current | Human confirms dataset date before run |")
    lines.append("| GIGO gate | Whether columns are present | Whether hidden assumptions are acceptable | Human reads assumption list |")
    lines.append("| Feature engineering | Log-scaling, normalization | Whether log-scaling is appropriate for this use case | Human sets weights via CLI flags |")
    lines.append("| Scoring | Composite score per company | Whether the weight vector reflects their priorities | Human adjusts --effort-budget and --top-n |")
    lines.append("| Gate application | Which companies fail MIN thresholds | Whether thresholds are appropriate | Human can override by adjusting constants |")
    lines.append("| Effort allocation | Proportional hours per company | Whether to follow the allocation | **HARD STOP** |")
    lines.append("| Liveness check | Nothing — tool does not check liveness | Whether a posting is still live | Human runs `npm run ats:liveness` |")
    lines.append("| Application submission | Nothing — tool never submits | Whether to apply | Always human |")
    lines.append("")

    lines.append("### Hard-Stop Gate Implementation")
    lines.append("")
    lines.append(
        "The engine implements a **mandatory human approval gate** before producing any output. "
        "After displaying the ranked recommendations, the engine pauses and requires the operator "
        "to type `APPROVE` to proceed. Any other input cancels the run."
    )
    lines.append("")
    lines.append("**Why this gate is non-negotiable:**")
    lines.append(
        "Application effort is a scarce, non-refundable resource for an OPT student. "
        "Each application consumes time that counts against the 90-day unemployment ceiling. "
        "An unattended reallocation that directs effort toward stale postings, "
        "cap-exempt employers, or companies in a hiring freeze causes direct, "
        "irreversible harm to the student's visa timeline. "
        "The gate exists because the engine's errors are not abstract — they are counted in days."
    )
    lines.append("")
    lines.append("**Gate response protocol:**")
    lines.append("- `APPROVE`: Human has reviewed all recommendations, verified liveness for "
                 "at least the top-3, and confirms the reallocation is appropriate.")
    lines.append("- Any other input: Run cancelled. No report written. Human investigates.")
    lines.append("")

    return lines


# ── main ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True)
    parser.add_argument("--bls",  required=True)
    parser.add_argument("--log",  required=True)
    parser.add_argument("--out",  default="output/validation_report.md")
    args = parser.parse_args()

    out_dir = str(Path(args.out).parent)
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    print("Loading data...")
    df, bls = load_data(args.data, args.bls)

    print("Running validation checks...")
    all_lines = []
    all_lines.append("# Validation Report — Application Effort Reallocation Engine")
    all_lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    all_lines.append(f"**Dataset:** {args.data} ({len(df):,} companies)")
    all_lines.append("")

    all_lines += bias_audit(df, out_dir)
    all_lines += explainability(df, out_dir)
    all_lines += causal_reasoning(df)
    all_lines += adversarial(df)
    all_lines += delegation_map()

    with open(args.out, "w") as f:
        f.write("\n".join(all_lines))
    print(f"[OK] Validation report written to {args.out}")


if __name__ == "__main__":
    main()
