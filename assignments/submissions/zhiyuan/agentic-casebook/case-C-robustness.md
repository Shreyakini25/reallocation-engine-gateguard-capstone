# Case C-1 — A documented "runnable today" command breaks on this environment

**Case ID:** C-1
**Lens applied (chapter):** C — Robustness (Ch 4): tool-surface / distribution-shift probe

**Input (what I gave it):**
A command the repo's `DOMAIN.md` lists under **"Runnable today (verified command surface)"**:
`python3 scripts/bls/extract-soc-occupation-table.py`

**Prediction-lock (dated 2026-07-28, BEFORE observing):**
I predicted it fails on this machine with a non-zero exit — the "runnable" claim is not robust to
a real environment (Windows, missing optional Python deps).
**Popperian falsification condition (labeled — Popper):** if the command exits 0 and writes its
table, my "non-robust" claim is false and the case collapses.

**Action the system took:**
Ran the documented command as written.

**Reported outcome (the artifact):**
`DOMAIN.md` asserts this command is part of the "verified command surface" — i.e., it runs.

**Actual outcome (the world):**
```
ImportError: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.
>>> EXIT CODE = 1
```
It does not run. (Separately, `python3` itself resolved to a Windows Store shim earlier this session
and failed with "Python was not found" until I aliased it — a *second* environment-shift break on
the same one-line command.) The falsification condition was not met, so the case stands.

**Robust against what?** The command is robust only against the maintainer's own machine — one with
`python3` on PATH and `openpyxl` installed. The proxy the "runnable" label learned is "runs in the
author's environment," not "runs." The human-relevant feature — *runs on a fresh clone* — is exactly
what it does not guarantee.

**Rung-3 counterfactual (labeled — opens the counterfactual):** had a student followed DOMAIN.md's
"first win" and run this command on a clean Windows clone, they would have hit the same ImportError
and concluded the repo is broken — the documented happy path fails at the first environment it meets
that isn't the author's.

**Which supervisory capacity failed:** [IJ] Interpretive Judgment — reading "runnable today" as an
absolute rather than "runnable in the author's environment" is the interpretive gap.

**Evidence:** the probe output above (exit 1, ImportError), 2026-07-28; DOMAIN.md's "Runnable today"
list naming this command. Re-runnable on any machine without `openpyxl`.

**Severity:** Medium. Contingent (a missing dependency / unpinned environment), not architectural.
