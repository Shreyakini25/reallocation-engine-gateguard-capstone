# System Dossier — Pebble: Claude Code (agentic coding CLI)

**Auditor:** Zhiyuan Yang · **Course:** INFO 7375 · **Date:** 2026-07-28

## System
**Claude Code** — Anthropic's agentic coding assistant, running in a terminal against a real
git repository (`the-reallocation-engine`) on Windows 11.

## Architecture (two sentences)
An LLM plans and then acts through a fixed set of tools, reading results back into its context to
decide the next step. It does not observe the world directly — it observes **tool outputs**, and
treats those outputs as ground truth unless something forces a re-check.

## Tool surface (what it can actually do)
- **Read / Write / Edit** files on disk
- **Bash / PowerShell** — arbitrary shell execution (run scripts, move/delete files, install packages)
- **git** — stage, commit, and **push to a public GitHub remote**
- clone repositories; attempt package installs (`winget`)

## Deployment context
Used here as a solo developer's coding agent with **write access to a public repo and push rights**.
Blast radius is real: it can commit and push code publicly, overwrite or delete files, install
software, and report a task "done."

## Candidate failure mode I already suspect
**The agent reports success from the artifact, not the world.** It reads a tool's stdout, an exit
code, or its own edit and concludes "done" — without a world-state check that the intended change
actually happened. My three lenses all probe variants of this gap.

## Access constraints (honest)
- **The auditor is the subject.** I am auditing the same class of system I am running in. This is a
  real conflict of interest and I flag it in the attestation — a self-audit is structurally the
  least reliable audit, which is itself the course's thesis.
- Evidence is this session's real logs plus fresh probes re-run on 2026-07-28 with world-state checks.
- I did not have access to the model's internal weights, system prompt, or Anthropic-side telemetry.

## Chosen lenses (3 of the table's 10)
- **C — Robustness (Ch 4):** a documented "runnable" command that breaks under this environment.
- **D — Explainability (Ch 5):** the gap between a tool's self-report and ground-truth file state.
- **G — Agentic false-success (Ch 8):** a "success" signal reported while the world says otherwise.
