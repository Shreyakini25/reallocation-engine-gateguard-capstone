#!/usr/bin/env python3
"""Reallocation engine: where should an OPT student spend scarce application effort?

Anchored to The Reallocation Engine (the "80 Days to Stay" layer: company H-1B
sponsorship history). Reads the mapped H-1B dataset, scores each company on
sponsorship reliability, and recommends moving effort from a weak company to a
strong one -- with an explicit uncertainty and a HARD STOP before it commits.

Usage:
    python reallocate.py            # recommend only (safe; commits nothing)
    python reallocate.py --approve  # clears the hard stop and commits (simulated)
"""
import csv, os, sys, math

CSV = os.path.join(os.path.dirname(__file__),
                   "../../../../data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv")
MIN_N = 20  # GIGO gate: fewer than this many total filings = too noisy to trust


def load(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for r in csv.reader(f):
            if not r or r[0] == "company_name":
                continue
            try:
                app, den, rate = float(r[15]), float(r[16]), float(r[17])
            except (ValueError, IndexError):
                continue  # GIGO gate: missing / non-numeric evidence -> reject
            rows.append({"name": r[0], "n": app + den, "rate": rate})
    return rows


def uncertainty(c):
    # margin of error (percentage points) shrinks with sample size
    return round(100 / math.sqrt(c["n"]), 1)


def main():
    rows = load(CSV)
    eligible = [c for c in rows if c["n"] >= MIN_N]      # passed the GIGO gate
    eligible.sort(key=lambda c: c["rate"], reverse=True)
    top, bottom = eligible[0], eligible[-1]

    print("Reallocation Engine -- application-effort triage\n")
    print(f"Companies read: {len(rows)} | passed GIGO gate (n>={MIN_N}): "
          f"{len(eligible)} | rejected: {len(rows) - len(eligible)}\n")
    print("RECOMMENDATION: move 1 application slot")
    print(f"  FROM  {bottom['name']}  (reliability {bottom['rate']:.1f}% "
          f"+/-{uncertainty(bottom)}, n={int(bottom['n'])})")
    print(f"  TO    {top['name']}  (reliability {top['rate']:.1f}% "
          f"+/-{uncertainty(top)}, n={int(top['n'])})")
    print("  Objective: maximize H-1B sponsorship reliability.")
    print("  Leaves out: company size, funding stage, and whether YOU fit the role.\n")

    if "--approve" not in sys.argv:
        print("HARD STOP -- this move commits scarce, irreversible application effort.")
        print("Nothing committed. Re-run with --approve after a human reviews the move.")
        return
    print(">> APPROVED by human. Effort reallocated (simulated).")


if __name__ == "__main__":
    main()
