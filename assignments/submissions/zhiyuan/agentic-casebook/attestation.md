# Accountability Attestation

**Audit of:** Claude Code (agentic coding CLI) · **By:** Zhiyuan Yang · **Date:** 2026-07-28

## 1. What I tested
- **G-1:** re-ran `npm run ats:scan -- --dry-run` (no config) **without a pipe** and read the real
  exit code (1), against the session log that recorded `EXIT: 0`.
- **C-1:** ran the DOMAIN.md "runnable today" command `python3 scripts/bls/extract-soc-occupation-table.py`
  and observed exit 1 + `ImportError: openpyxl`.
- **D-1:** ran `npm run doctor` and compared "missing frontmatter (42)" against the actual bytes of a
  flagged file (`head -3` shows valid frontmatter).
All three observations are real, dated 2026-07-28, and re-runnable.

## 2. What I did NOT test (honest list)
- **A clean machine / fresh clone.** Every probe ran in my already-configured environment (I had
  aliased `python3`, created `portals.yml`, etc.). The most likely real failures live on the fresh
  clone I did not test.
- **git push false-success.** I never checked whether the agent ever reported "pushed" while the
  GitHub remote did not update — I trusted the push output, which is the exact artifact-vs-world
  trap this audit is about.
- **Whether G-1's wrong-exit-code pattern recurred** in the other piped commands the agent ran this
  session. I re-verified one; I did not sweep the rest.
- **The model internals** — system prompt, weights, Anthropic-side telemetry, and non-terminal tools
  (browser, MCP). Out of my access.
- **Independent replication.** See the conflict below.

## 3. Who clears which gate
| Failure category | Answerable party |
|---|---|
| G-1 — agent misreads a success signal | **Non-owner user / owner** running the agent: verifying a consequential command's real exit/world state is the operator's gate. The **model provider (Anthropic)** owns making the agent audit contradictory signals ("error printed, yet exit 0"). |
| C-1 — a documented command that doesn't run | **Framework/repo developer** owns the false "runnable today" claim; the **deploying org** owns pinning the environment (dependencies, PATH). |
| D-1 — doctor's inverted health signal | **Framework/repo developer** owns the CRLF parser bug. A user who acts on the report is not at fault for trusting a tool sold as a health check. |

No line here is "everyone's" — each break has one named owner.

## 4. Verbs calibrated
My claims are pitched at licensed verbs: I write "I **observed**," "the re-run **shows**," "root
cause **is** a regex" only where I have the output; the causal-chain claims are marked as such.
Crucially, **my G-1 prediction was falsified** — the tool exits 1, not 0 — and I report that as a
surprise, not a hit. I do not claim to have "proven" the fundamental pattern; I claim three
instances **consistent** with it.

## Conflict of interest (mandatory disclosure)
**The auditor is the subject.** I audited the same class of system I run in, with no independent
replicator. A self-audit is structurally the least reliable audit — which is the course's own
thesis, and the single biggest caveat on everything above.
