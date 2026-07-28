# Go / No-Go Memo — Claude Code as an agentic coding assistant

**Headline (calibrated verb):** **MODIFY** for supervised coding work; **REFUSE** for the specific
use of *unattended commits/pushes to a public repo with no human world-state check.*

## Where it works (deploy)
Supervised, interactive coding: reading code, drafting edits, running tests **where a human reads
the real output before any consequential action**. In this mode the artifact-vs-world gap is caught
by the human at the loop, which is exactly where it should be caught.

## Where it must not be used (refuse)
As an **unattended agent that commits and pushes to a public repository** on the strength of its own
success reports. Cases G-1 (a success signal that was an artifact of the agent's own pipe) and D-1
(a health tool whose report inverts the truth) show the agent will confidently report "done" or
"clean" from the artifact. With push rights and no human, one such false success ships publicly.

## Where more work could change the answer (defer)
If a **forced world-state verification gate** is added before every consequential action — re-check
the command's own exit code (not a piped process's), diff the remote after a push, confirm the file
on disk after an edit — then the unattended use could be re-evaluated. Deferred until that exists.

## Named human owner
**The developer running the session** (here, Zhiyuan Yang) owns every consequential action the agent
takes. Anthropic owns the model's tendency to trust artifacts; the repo maintainer owns the two
tooling bugs (C-1, D-1). Accountability does not transfer to the agent.

## Stop condition (testable)
**Halt before any action that pushes, deletes, installs, or spends — and require a human to confirm
the world changed as intended (remote updated / file gone / package present).** "The command
printed success" does not clear this gate; a checked world-state does.
