#!/usr/bin/env python3
"""
Reallocation Engine — Application Effort Allocator
INFO 7375 · Wenhan Cheng · 2026-07-28

Reallocates a finite pool of application-effort units (proxy: hours/week)
across companies in the H-1B sponsorship dataset, using three verified signals:
  1. H-1B approval history (80 Days to Stay layer)
  2. SEC Form D funding recency (80 Days to Stay layer)
  3. BLS cognitive-pivot score (Cognitive Pivot layer)

Hard-stop gate: the engine RECOMMENDS only. It never commits, spends,
or changes access without explicit human approval printed to stdout.

Run:
  python3 engine.py --data data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv \
                    --bls  data/BLS/compact/soc_occupation_compact.csv \
                    --effort-budget 40 \
                    --top-n 10 \
                    --out   output/reallocation_report.md
"""

import argparse
import sys
import json
import math
from datetime import datetime, date
from pathlib import Path

import pandas as pd
import numpy as np

# ── constants ──────────────────────────────────────────────────────────────
TARGET_SOCS = ["15-1252", "15-2051", "15-1211"]   # ML/NLP SOC codes
FUNDING_WINDOW_DAYS = 730                           # 24 months
MIN_APPROVALS = 3                                   # gate threshold
MIN_APPROVAL_RATE = 0.60                            # gate threshold
COG_WEIGHT = 0.20
H1B_WEIGHT = 0.50
FUNDING_WEIGHT = 0.30
TODAY = date.today()

# ── GIGO gate ──────────────────────────────────────────────────────────────

def gigo_check(df: pd.DataFrame) -> dict:
    """
    Data validation gate. Returns a report dict.
    Fails hard if critical fields are entirely missing.
    """
    report = {
        "total_rows": len(df),
        "failures": [],
        "warnings": [],
        "passed": True,
    }

    required = ["company_name", "Total Approvals", "Approval_Rate",
                "latest_funding_date", "latest_funding_amount"]
    for col in required:
        if col not in df.columns:
            report["failures"].append(f"Missing required column: {col}")
            report["passed"] = False

    if not report["passed"]:
        return report

    null_approvals = df["Total Approvals"].isna().sum()
    if null_approvals > 0:
        report["warnings"].append(
            f"{null_approvals} rows ({null_approvals/len(df):.1%}) have null Total Approvals — "
            f"treated as 0, not as 'no sponsorship history'."
        )

    null_funding = df["latest_funding_date"].isna().sum()
    report["warnings"].append(
        f"{null_funding} rows ({null_funding/len(df):.1%}) have no funding date — "
        f"funding score will be 0 for these companies."
    )

    # Hidden assumption check
    report["hidden_assumptions"] = [
        "ASSUMPTION 1: Approval_Rate is computed over all petitions ever filed, "
        "not just recent ones. A company with 100% rate on 2 petitions in 2015 "
        "looks identical to one with 99% on 1,000 petitions in 2025.",
        "ASSUMPTION 2: latest_funding_date reflects the most recent SEC Form D filing, "
        "which may lag actual funding by 15 days to 6 months.",
        "ASSUMPTION 3: The dataset does not distinguish H-1B cap-subject petitions "
        "from cap-exempt ones (universities, nonprofits). Cap-exempt sponsors "
        "are not useful to an OPT student needing a cap-subject petition.",
        "ASSUMPTION 4: company_name matching is exact-string. 'DATABRICKS INC' and "
        "'Databricks' are treated as different companies.",
    ]

    return report


# ── feature engineering ────────────────────────────────────────────────────

def compute_h1b_score(df: pd.DataFrame) -> pd.Series:
    """
    Normalized H-1B score combining approval count and rate.
    Returns values in [0, 1].
    """
    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0)

    # log-scale approvals to reduce dominance of mega-employers
    log_approvals = np.log1p(approvals)
    norm_approvals = log_approvals / (log_approvals.max() + 1e-9)

    # rate already in [0,1] range (stored as proportion, not percent)
    # clamp to [0,1] in case of data errors
    norm_rate = rate.clip(0, 1)

    return 0.6 * norm_approvals + 0.4 * norm_rate


def compute_funding_score(df: pd.DataFrame) -> pd.Series:
    """
    Recency-weighted funding score.
    Full score for funding within 12 months, decays linearly to 0 at 24 months,
    0 beyond that or if missing.
    """
    scores = pd.Series(0.0, index=df.index)

    for idx, row in df.iterrows():
        raw = row.get("latest_funding_date", None)
        if pd.isna(raw) or raw == "":
            continue
        try:
            fdate = pd.to_datetime(raw).date()
            days_ago = (TODAY - fdate).days
            if days_ago <= 365:
                scores[idx] = 1.0
            elif days_ago <= FUNDING_WINDOW_DAYS:
                scores[idx] = 1.0 - (days_ago - 365) / 365
            # else 0 (stale)
        except Exception:
            continue

    return scores


def compute_cog_score(bls_path: str) -> dict:
    """
    Returns a dict mapping bls_soc_code → normalized cognitive_pivot_score.
    """
    try:
        bls = pd.read_csv(bls_path)
    except Exception as e:
        print(f"[WARN] Could not load BLS file: {e}", file=sys.stderr)
        return {}

    cog_col = "cognitive_pivot_score"
    soc_col = "bls_soc_code"

    if cog_col not in bls.columns or soc_col not in bls.columns:
        print(f"[WARN] BLS file missing expected columns.", file=sys.stderr)
        return {}

    bls[cog_col] = pd.to_numeric(bls[cog_col], errors="coerce")
    max_score = bls[cog_col].max()

    result = {}
    for _, row in bls.iterrows():
        code = str(row[soc_col]).strip()
        score = row[cog_col]
        if pd.notna(score) and max_score > 0:
            result[code] = float(score) / float(max_score)

    return result


# ── scoring ────────────────────────────────────────────────────────────────

def score_companies(df: pd.DataFrame, cog_map: dict) -> pd.DataFrame:
    """
    Produces a scored dataframe with uncertainty estimates.
    """
    out = df.copy()
    out["h1b_score"] = compute_h1b_score(df)
    out["funding_score"] = compute_funding_score(df)

    # Cognitive score: use average of target SOCs if available
    target_scores = [cog_map.get(s, None) for s in TARGET_SOCS]
    target_scores = [s for s in target_scores if s is not None]
    default_cog = float(np.mean(target_scores)) if target_scores else 0.5
    out["cog_score"] = default_cog  # same for all (role-level, not company-level)

    out["composite_score"] = (
        H1B_WEIGHT * out["h1b_score"] +
        FUNDING_WEIGHT * out["funding_score"] +
        COG_WEIGHT * out["cog_score"]
    )

    # Uncertainty: higher when data is sparse or missing
    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    # Wilson score interval half-width as uncertainty proxy
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0).clip(0, 1)
    n = approvals.clip(1, None)
    z = 1.96
    uncertainty = z * np.sqrt(rate * (1 - rate) / n)
    # Add funding uncertainty
    has_funding = out["funding_score"] > 0
    uncertainty = uncertainty + (~has_funding).astype(float) * 0.15
    out["uncertainty"] = uncertainty.clip(0, 1)

    return out


# ── gates ──────────────────────────────────────────────────────────────────

def apply_gates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Hard gates: companies that fail are marked SKIP regardless of score.
    """
    approvals = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)
    rate = pd.to_numeric(df["Approval_Rate"], errors="coerce").fillna(0)

    gate_pass = (approvals >= MIN_APPROVALS) & (rate >= MIN_APPROVAL_RATE)
    df = df.copy()
    df["gate_pass"] = gate_pass
    df["gate_reason"] = ""
    df.loc[approvals < MIN_APPROVALS, "gate_reason"] += \
        f"approvals<{MIN_APPROVALS}; "
    df.loc[rate < MIN_APPROVAL_RATE, "gate_reason"] += \
        f"rate<{MIN_APPROVAL_RATE:.0%}; "
    return df


# ── effort allocation ──────────────────────────────────────────────────────

def allocate_effort(df: pd.DataFrame, budget: int, top_n: int) -> pd.DataFrame:
    """
    Proportionally allocates effort-hours across top-N gate-passing companies.
    """
    eligible = df[df["gate_pass"]].copy()
    eligible = eligible.sort_values("composite_score", ascending=False).head(top_n)

    total_score = eligible["composite_score"].sum()
    if total_score == 0:
        eligible["effort_hours"] = budget / len(eligible)
    else:
        eligible["effort_hours"] = (
            eligible["composite_score"] / total_score * budget
        ).round(1)

    return eligible


# ── report ─────────────────────────────────────────────────────────────────

def write_report(
    gigo: dict,
    top: pd.DataFrame,
    skipped_count: int,
    budget: int,
    out_path: str,
):
    lines = []
    lines.append("# Reallocation Engine — Application Effort Report")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**Effort budget:** {budget} hours/week")
    lines.append("")

    lines.append("## ⚠️ HARD-STOP GATE")
    lines.append(
        "> This report is a **RECOMMENDATION ONLY**. "
        "No application has been submitted, no resource committed. "
        "A human must review and explicitly approve each company "
        "before any application effort is spent. "
        "Liveness must be verified with `npm run ats:liveness` before applying."
    )
    lines.append("")

    lines.append("## Data Validation (GIGO)")
    lines.append(f"- Total companies in dataset: {gigo['total_rows']:,}")
    lines.append(f"- Gate passed (approvals≥{MIN_APPROVALS}, rate≥{MIN_APPROVAL_RATE:.0%}): "
                 f"{len(top)} shown (top-N)")
    lines.append(f"- Gate failed / skipped: {skipped_count:,}")
    lines.append("")
    lines.append("**Hidden assumptions in this dataset:**")
    for a in gigo.get("hidden_assumptions", []):
        lines.append(f"- {a}")
    lines.append("")
    lines.append("**Warnings:**")
    for w in gigo.get("warnings", []):
        lines.append(f"- {w}")
    lines.append("")

    lines.append("## Reallocation Recommendations")
    lines.append("")
    lines.append("| Rank | Company | H-1B Score | Funding Score | Composite | Uncertainty | Effort (hrs) | Action |")
    lines.append("|---|---|---|---|---|---|---|---|")
    for rank, (_, row) in enumerate(top.iterrows(), 1):
        action = "PURSUE" if row["uncertainty"] < 0.25 else "INVESTIGATE"
        lines.append(
            f"| {rank} | {row['company_name']} "
            f"| {row['h1b_score']:.2f} "
            f"| {row['funding_score']:.2f} "
            f"| {row['composite_score']:.2f} "
            f"| ±{row['uncertainty']:.2f} "
            f"| {row['effort_hours']} "
            f"| {action} |"
        )
    lines.append("")

    lines.append("## What This Engine Cannot Verify")
    lines.append("- **Current sponsorship intent.** Approval history is past behavior.")
    lines.append("- **Liveness.** Run `npm run ats:liveness <url>` before applying.")
    lines.append("- **Cap-subject vs cap-exempt.** Universities appear as strong sponsors "
                 "but cannot file cap-subject H-1B petitions for OPT students.")
    lines.append("- **Causal validity.** The composite score optimizes a correlation "
                 "(past approval rate × funding recency × role resilience). "
                 "It does NOT establish that applying to these companies *causes* "
                 "better sponsorship outcomes. Company size is a confounder "
                 "that cannot be controlled for with this dataset alone.")
    lines.append("")

    lines.append("## Objective Statement")
    lines.append(
        "**This engine optimizes:** Expected sponsorship signal strength × funding health × role resilience, "
        "weighted by the student's OPT timeline constraints."
    )
    lines.append(
        "**What this objective leaves out:** actual hiring intent, current headcount freeze, "
        "role-title match, interview pipeline speed, and geographic constraints."
    )

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        f.write("\n".join(lines))
    print(f"[OK] Report written to {out_path}")


# ── main ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Application Effort Reallocation Engine")
    parser.add_argument("--data", required=True, help="Path to SEC_DOL_H1b_data_mapped.csv")
    parser.add_argument("--bls",  required=True, help="Path to soc_occupation_compact.csv")
    parser.add_argument("--effort-budget", type=int, default=40,
                        help="Total effort-hours to allocate per week (default: 40)")
    parser.add_argument("--top-n", type=int, default=10,
                        help="Number of top companies to recommend (default: 10)")
    parser.add_argument("--out", default="output/reallocation_report.md",
                        help="Output report path")
    parser.add_argument("--json-out", default="output/reallocation_log.json",
                        help="Machine-readable JSON log path")
    args = parser.parse_args()

    print("=" * 60)
    print("REALLOCATION ENGINE — APPLICATION EFFORT ALLOCATOR")
    print("=" * 60)

    # Load data
    print(f"\n[1/5] Loading dataset: {args.data}")
    df = pd.read_csv(args.data)
    print(f"      {len(df):,} companies loaded.")

    # GIGO gate
    print("\n[2/5] Running GIGO data validation gate...")
    gigo = gigo_check(df)
    if not gigo["passed"]:
        print("[FATAL] GIGO gate failed. Fix data issues before proceeding.")
        for f in gigo["failures"]:
            print(f"  ✗ {f}")
        sys.exit(1)
    print(f"      Gate passed. {len(gigo['warnings'])} warnings.")
    for w in gigo["warnings"]:
        print(f"      ⚠  {w}")

    # Load BLS scores
    print(f"\n[3/5] Loading BLS cognitive scores: {args.bls}")
    cog_map = compute_cog_score(args.bls)
    target_scores = {s: cog_map.get(s, "MISSING") for s in TARGET_SOCS}
    print(f"      Target SOC scores: {target_scores}")

    # Score + gate
    print("\n[4/5] Scoring companies and applying gates...")
    scored = score_companies(df, cog_map)
    gated  = apply_gates(scored)
    passed = gated[gated["gate_pass"]]
    failed = gated[~gated["gate_pass"]]
    print(f"      {len(passed):,} companies passed gates.")
    print(f"      {len(failed):,} companies failed gates (SKIP).")

    # Allocate effort
    print(f"\n[5/5] Allocating {args.effort_budget}h effort across top {args.top_n} companies...")
    top = allocate_effort(passed, args.effort_budget, args.top_n)

    # ── HARD STOP ──────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("⛔  HARD-STOP GATE — HUMAN APPROVAL REQUIRED")
    print("=" * 60)
    print("The following reallocation is RECOMMENDED, not executed.")
    print("Review each company. Verify liveness. Then type APPROVE to proceed.")
    print("")
    for rank, (_, row) in enumerate(top.iterrows(), 1):
        print(f"  {rank:2d}. {row['company_name']:<40s} "
              f"score={row['composite_score']:.2f}  "
              f"±{row['uncertainty']:.2f}  "
              f"{row['effort_hours']}h")
    print("")
    approval = input("Type APPROVE to accept this reallocation, or anything else to cancel: ")
    if approval.strip().upper() != "APPROVE":
        print("[STOPPED] Reallocation cancelled by human reviewer.")
        sys.exit(0)
    print("[APPROVED] Generating report...")

    # Write outputs
    write_report(gigo, top, len(failed), args.effort_budget, args.out)

    # JSON log
    log = {
        "run_id": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "generated_at": datetime.now().isoformat(),
        "effort_budget_hours": args.effort_budget,
        "top_n": args.top_n,
        "gigo_warnings": gigo["warnings"],
        "gate_passed": len(passed),
        "gate_failed": len(failed),
        "recommendations": [
            {
                "rank": rank,
                "company": row["company_name"],
                "composite_score": round(row["composite_score"], 4),
                "uncertainty": round(row["uncertainty"], 4),
                "effort_hours": row["effort_hours"],
                "h1b_score": round(row["h1b_score"], 4),
                "funding_score": round(row["funding_score"], 4),
            }
            for rank, (_, row) in enumerate(top.iterrows(), 1)
        ],
        "cannot_verify": [
            "current sponsorship intent",
            "posting liveness",
            "cap-subject vs cap-exempt status",
            "causal validity of composite score",
        ],
    }
    Path(args.json_out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.json_out, "w") as f:
        json.dump(log, f, indent=2)
    print(f"[OK] JSON log written to {args.json_out}")
    print("\n[DONE] Reallocation complete. Review report before taking action.")


if __name__ == "__main__":
    main()
