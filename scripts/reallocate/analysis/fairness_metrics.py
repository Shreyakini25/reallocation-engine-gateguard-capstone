import csv, statistics, math
from collections import defaultdict
from fairlearn.metrics import MetricFrame, selection_rate, demographic_parity_difference, demographic_parity_ratio

PRACT=['machine learning engineer','ml engineer','ai engineer','mlops','applied ml','ai platform']
RESR=['research scientist','applied scientist','research engineer','senior research scientist','principal scientist','staff research']
def classify(t):
    t=(t or '').lower(); p=any(x in t for x in PRACT); r=any(x in t for x in RESR)
    return 'hybrid' if (p and r) else 'practitioner' if p else 'researcher-only' if r else 'no-data'

rows=list(csv.DictReader(open('data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv')))
h1b=[r for r in rows if (r.get('Total Approvals') or '0') not in ('','0') or (r.get('Total Denials') or '0') not in ('','0')]

STAGES=['Pre-Seed','Seed','Series A','Series B','Series C','Series D+']
def stage_of(r):
    s=(r.get('latest_funding_stage') or '').strip()
    return s if s in STAGES else 'Other/Unknown'

# selection = passes the GIGO gate (the tool's first gate; a company that fails is never recommended)
recs=[]; groups=[]; approvals=[]
for r in h1b:
    st=stage_of(r)
    if st=='Other/Unknown': continue
    a=float(r.get('Total Approvals') or 0)
    recs.append(1 if a>=5 else 0)
    groups.append(st)
    approvals.append(a)

mf = MetricFrame(metrics={'selection_rate': selection_rate}, y_true=recs, y_pred=recs, sensitive_features=groups)
print('=== fairlearn: selection (GIGO-gate-pass) rate by funding stage ===')
sr = mf.by_group['selection_rate']
for st in STAGES:
    if st in sr.index: print(f'  {st:12s} {sr[st]*100:5.1f}%')
print(f'  demographic_parity_difference = {demographic_parity_difference(recs, recs, sensitive_features=groups):.3f}')
print(f'  demographic_parity_ratio      = {demographic_parity_ratio(recs, recs, sensitive_features=groups):.3f}  (4/5ths rule fails if < 0.80)')

# ---- competing definition: RELIABILITY (avg posterior SD of the SELECTED set) ----
# Beta-Binomial posterior sd for approval rate, prior mean 0.9812, k=10
PM, K = 0.9812, 10
def post_sd(a, d):
    a0,b0=PM*K,(1-PM)*K; ap,bp=a0+a,b0+d
    return math.sqrt(ap*bp/((ap+bp)**2*(ap+bp+1)))

sel = [r for r in h1b if float(r.get('Total Approvals') or 0)>=5 and stage_of(r)!='Other/Unknown']
sel_sd = statistics.mean(post_sd(float(r.get('Total Approvals') or 0), float(r.get('Total Denials') or 0)) for r in sel)

# parity-enforcing counterfactual: force each stage's selection rate up to the max (88%, Series D+)
# by admitting the highest-N currently-rejected companies from each under-selected stage
target_rate = max(sr[st] for st in STAGES if st in sr.index)
extra=[]
bystage=defaultdict(list)
for r in h1b:
    st=stage_of(r)
    if st=='Other/Unknown': continue
    bystage[st].append(r)
parity_selected=list(sel)
for st in STAGES:
    grp=bystage[st]
    npass=sum(1 for r in grp if float(r.get('Total Approvals') or 0)>=5)
    need=int(round(target_rate*len(grp)))-npass
    if need>0:
        rej=sorted([r for r in grp if float(r.get('Total Approvals') or 0)<5],
                   key=lambda r: -float(r.get('Total Approvals') or 0))[:need]
        parity_selected+=rej
parity_sd = statistics.mean(post_sd(float(r.get('Total Approvals') or 0), float(r.get('Total Denials') or 0)) for r in parity_selected)

print()
print('=== competing definition: estimate RELIABILITY (avg sponsorship posterior SD of selected set) ===')
print(f'  current selection (calibration-leaning, fixed floor): avg posterior SD = {sel_sd:.4f}  (n={len(sel)})')
print(f'  parity-enforced selection (equal rate across stages):  avg posterior SD = {parity_sd:.4f}  (n={len(parity_selected)})')
print(f'  RELIABILITY COST OF PARITY: +{(parity_sd/sel_sd-1)*100:.1f}% mean estimator uncertainty in the selected set')
