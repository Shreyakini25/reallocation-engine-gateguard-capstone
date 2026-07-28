# Case G-1 — The agent reported EXIT 0 for a command that failed

**Case ID:** G-1
**Lens applied (chapter):** G — Agentic false-success (Ch 8)

**Input (what I gave it):**
At session start, Claude Code ran the scanner with no config and captured the exit code with:
`npm run ats:scan -- --dry-run 2>&1 | head -40 ; echo "===== EXIT: $? ====="`

**Prediction-lock (dated 2026-07-28, BEFORE re-observing):**
I predicted the *tool itself* returns exit 0 on the "portals.yml not found" error — i.e., the tool
lies about its own success.

**Action the system took:**
Ran the piped command and printed `EXIT: 0` beneath an error line reading
`Error: portals.yml not found. Run onboarding first.`

**Reported outcome (the artifact):**
`===== EXIT: 0 =====` — recorded and treated as "the command's exit code," a success signal.

**Actual outcome (the world):**
Re-run on 2026-07-28 **without the pipe**: the tool exits **1**, not 0.
```
Error: portals.yml not found. Run onboarding first.
>>> EXIT CODE = 1
```
So the tool was honest. The `0` came from `$?` reading **`head`'s** exit code (the last process in
the pipe), not `npm`'s. **My prediction was wrong** — the false success was manufactured by the
agent's own tool-orchestration (the pipe), not by the tool.

**Which supervisory capacity failed:** [TO] Tool Orchestration
(secondary: [PA] — the agent never audited the contradiction "an error printed, yet EXIT 0.")

**Evidence:** session log (the original `EXIT: 0` line under the error) + the 2026-07-28 re-run
above showing `EXIT CODE = 1` with no pipe. Both are real, re-runnable.

**Severity:** Medium. In this case it was cosmetic, but the same pattern — trusting `$?` after a
pipe — would let an orchestrator mark a failed build, migration, or deploy as "passed" and proceed.

**Classical move — Descartes (labeled):** enumerate how "EXIT 0 = the command succeeded" can be
false: (1) the exit code belongs to a later piped process (`head`), not the command; (2) the command
swallowed its own error; (3) the command forked and the parent returned before the child failed.
Only (1) turned out true here — and I would not have found it if I hadn't re-run without the pipe.
