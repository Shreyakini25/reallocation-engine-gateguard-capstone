#!/usr/bin/env python3
"""confound_and_gaming.py - validation analyses for the reallocation-audit report.

Two self-contained (stdlib-only) analyses:
  1. RUNG 2 confound (Component 5): is the practitioner title classification
     entangled with company SIZE? If so, the "practitioner signal" the engine
     ranks on is partly a proxy for scale, and the correlation could vanish
     under an intervention that held size fixed.
  2. GAMED INPUT (Component 6): a researcher-only company appends ONE
     practitioner-sounding title to its filings; show the classification flip
     and the downstream composite move.

Run: python3 scripts/reallocate/analysis/confound_and_gaming.py
"""
import csv, math, statistics
from collections import defaultdict

CSV = 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv'
PRACT = ['machine learning engineer', 'ml engineer', 'ai engineer', 'mlops', 'applied ml', 'ai platform']
RESR = ['research scientist', 'applied scientist', 'research engineer', 'senior research scientist', 'principal scientist', 'staff research']
FIT_BY_CLASS = {'practitioner': 0.75, 'hybrid': 0.55, 'researcher-only': 0.2, 'no-data': 0.1}


def classify(t):
    t = (t or '').lower()
    p = any(x in t for x in PRACT)
    r = any(x in t for x in RESR)
    return 'hybrid' if (p and r) else 'practitioner' if p else 'researcher-only' if r else 'no-data'


def main():
    rows = list(csv.DictReader(open(CSV)))
    h1b = [r for r in rows if (r.get('Total Approvals') or '0') not in ('', '0') or (r.get('Total Denials') or '0') not in ('', '0')]

    print('=== RUNG 2 CONFOUND - practitioner classification vs company size ===')
    by = defaultdict(list)
    for r in h1b:
        by[classify(r.get('top_job_titles_sponsored'))].append(float(r.get('Total Approvals') or 0))
    for c in ('practitioner', 'researcher-only', 'hybrid'):
        v = by[c]
        print(f'  {c:16s} n={len(v):3d}  median_approvals={statistics.median(v):6.1f}  mean={statistics.mean(v):8.1f}')

    xs, ys = [], []
    for r in h1b:
        c = classify(r.get('top_job_titles_sponsored'))
        if c in ('practitioner', 'researcher-only'):
            xs.append(1 if c == 'practitioner' else 0)
            ys.append(math.log(float(r.get('Total Approvals') or 1) + 1))
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs) / n)
    sy = math.sqrt(sum((y - my) ** 2 for y in ys) / n)
    print(f'  corr(is_practitioner, log approvals) = {cov / (sx * sy):.3f} (n={n}) '
          '-> classification is entangled with scale')

    print('\n=== GAMED INPUT - one added title flips the classification ===')
    d = next(r for r in rows if r['company_name'].upper() == 'DATAMINR INC')
    orig = d['top_job_titles_sponsored']
    gamed = orig + '; AI Engineer'
    s = 0.9687  # Dataminr shrunk sponsorship rate
    for lab, field in (('original', orig), ('gamed +1 title', gamed)):
        cls = classify(field)
        fit = FIT_BY_CLASS[cls]
        pre = s * 0.35 + fit * 0.30  # pre-gate composite
        print(f'  {lab:16s} class={cls:15s} fit={fit:.2f}  pre-gate composite={pre:.3f}')
    print('  -> researcher-only -> hybrid, fit 0.20 -> 0.55, pre-gate composite +0.10, '
          'in a free-text field the filer partly controls.')


if __name__ == '__main__':
    main()
