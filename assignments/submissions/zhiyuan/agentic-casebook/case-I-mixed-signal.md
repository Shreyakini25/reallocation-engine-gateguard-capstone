# Case G-2 — A single command prints "✓ all conform" and "✗ FAILED" at once

**Case ID:** G-2
**Lens applied (chapter):** G — Agentic false-success (Ch 8)

**Input (what I gave it):** `npm run verify` — the repo's "am I done?" gate (conformance + manifest).

**Prediction-lock (dated 2026-07-28, BEFORE observing):**
I predicted the run emits a green "all conform" line from its first sub-check while the overall
command still exits non-zero from the second — a mixed signal an agent could read as success by
latching onto the green line.

**Action the system took:** ran both sub-checks in sequence.

**Reported outcome (the artifact):**
```
✓ all conform (machine half of P4). Adequacy is still the human gate.
✗ manifest check FAILED (6 errors)
```

**Actual outcome (the world):** overall **EXIT = 1**. The command failed. The green line is true
only of the *first* sub-check; the run as a whole did not pass.

**Which supervisory capacity failed:** [PA] Plausibility Auditing — reading the "✓ all conform" line
as "verify passed" (which I nearly did earlier this session) ignores the ✗ line and the exit code.

**Evidence:** the 2026-07-28 probe output above, exit 1; re-runnable via `npm run verify`.

**Severity:** Medium. An agent that greps for "conform" to decide "safe to push" would ship on a red.

**Classical move — Descartes (labeled):** how "✓ all conform ⇒ verify passed" is false — the ✓
scopes only the conformance sub-check, not the manifest sub-check, and not the exit code that
actually gates "done."
