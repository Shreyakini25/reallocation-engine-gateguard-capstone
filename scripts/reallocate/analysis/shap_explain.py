import json, numpy as np, shap

roles = json.load(open('data/raw/reallocation-audit/roles.json'))
# feature matrix: [sponsorship, fit, role_quality] pre-gate; composite_pregate = 0.35*s + 0.30*f + 0*rq
W = np.array([0.35, 0.30, 0.0])
names = [r['company'] for r in roles]
X = np.array([[r['sponsorship']['p'], r['fit']['p'], r['role_quality']['p']] for r in roles])
feat = ['sponsorship','fit','role_quality']

# the model is exactly linear (pre-gate). SHAP LinearExplainer with the sample as background.
model = lambda A: A @ W
expl = shap.LinearExplainer((W, 0.0), X)
sv = expl.shap_values(X)
base = float(X.mean(axis=0) @ W)

print('SHAP LinearExplainer - per-feature contribution to the pre-gate score')
print(f'base (mean pre-gate score) = {base:.4f}\n')
print(f'{"company":26s}{"sponsorship":>13s}{"fit":>9s}{"role_q":>9s}{"pred":>9s}')
for i,nm in enumerate(names):
    pred = float(X[i]@W)
    print(f'{nm:26s}{sv[i][0]:>13.4f}{sv[i][1]:>9.4f}{sv[i][2]:>9.4f}{pred:>9.4f}')

# confirm SHAP == analytic coef*(x - E[x])
analytic = (X - X.mean(axis=0)) * W
print(f'\nmax |SHAP - analytic coef*(x-E[x])| = {np.abs(sv-analytic).max():.2e}  (0 => SHAP is exact for this linear model)')

# Which feature drives the Apply verdicts? Roblox specifically:
ri = names.index('ROBLOX CORP')
print(f'\nROBLOX SHAP: sponsorship={sv[ri][0]:+.3f}, fit={sv[ri][1]:+.3f} -> fit (from title-class) is the swing that lifts it above the field')
