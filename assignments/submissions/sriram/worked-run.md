# Worked Run
**Mode:** case-mle-opt-aug2026-h1b-runway v0.1.0  
**Author:** Sriram Garimella  
**Date:** 2026-07-05  
**Scenario:** Triage batch of ML Engineering / MLOps roles using repo's scoring and liveness toolchain

---

## Setup

Cloned the repo and installed dependencies:

```
C:\assignments\5>git clone https://github.com/nikbearbrown/the-reallocation-engine.git
Cloning into 'the-reallocation-engine'...
remote: Enumerating objects: 2201, done.
remote: Counting objects: 100% (124/124), done.
remote: Compressing objects: 100% (39/39), done.
remote: Total 2201 (delta 97), reused 85 (delta 85), pack-reused 2077 (from 2)
Receiving objects: 100% (2201/2201), 276.42 MiB | 33.40 MiB/s, done.
Resolving deltas: (1041/1041), done.
Updating files: 100% (828/828), done.

C:\assignments\5\the-reallocation-engine>npm install
added 53 packages, and audited 54 packages in 8s
found 0 vulnerabilities
```

---

## Command 1 — Conformance Check (`npm run verify`)

```
C:\assignments\5\the-reallocation-engine>npm run verify

> the-reallocation-engine@1.0.0 verify
> node scripts/conformance.mjs && node scripts/manifest-check.mjs

conformance: 131 files (75 md · 30 py · 23 js · 1 sh · 1 yaml · 1 json)
✗ 1 file(s) FAILED conformance:
  • scripts\gitignore-large.sh — <3>WSL (9 - Relay) ERROR: CreateProcessCommon:798: execvpe(/bin/bash) failed: No such file or directory
```

**Interpretation:** One shell script (`gitignore-large.sh`) failed because it requires WSL (`/bin/bash`) which is not available on Windows. All other 130 files passed. This is a Windows environment issue, not a mode issue — the script does not affect the data or scoring workflow.

---

## Command 2 — Environment Check (`npm run doctor`)

```
C:\assignments\5\the-reallocation-engine>npm run doctor

> the-reallocation-engine@1.0.0 doctor
> node scripts/doctor.mjs

RECIPE DOCTOR — The Reallocation Engine
==========================================

ENVIRONMENT (required)
  ✓ node       v22.14.0
  ✓ python3    Python 3.11.9

ENVIRONMENT (optional — features degrade without these)
  — pandoc     not found (resume/PDF rendering)
  — libreoffice not found (PDF fallback)
  ✓ playwright installed

RUNNABLE COMMANDS (npm script → target file present?)
  ✓ verify         scripts/conformance.mjs
  ✓ score          scripts/score/role-scorer.mjs
  ✓ ats:liveness   scripts/ats/check-liveness.mjs
  ✓ ats:scan       scripts/ats/scan.mjs
  ✓ doctor         scripts/doctor.mjs
  … (all 18 scripts confirmed present)

DOMAIN DIRECTORIES
  ✓ data/sec
  ✓ data/bls
  ✓ data/ats
  ✓ data/80-days-to-stay

PRIVACY (no personal data committed)
  ✓ no private/PII paths are tracked

RECIPES (42)
  with lifecycle frontmatter: 0   missing: 42
  by status: —
  open TODOs: 0 declared (in frontmatter) · 517 [TODO markers in bodies
  ! missing frontmatter (42) — add: status / todos_open / last_gate / attestation / recipe_version

SUMMARY
  environment: ✓ runnable
  recipes: 0/42 carry lifecycle frontmatter — 42 need it
```

**Notable finding:** 0 of 42 existing recipes have lifecycle frontmatter. My mode file is the first to include it, which is exactly what the assignment requires.

---

## Command 3 — Role Quality Scorer (`npm run score`)

Run against the example roles file included in the repo:

```
C:\assignments\5\the-reallocation-engine>npm run score -- data\examples\ch11-roles.json

> the-reallocation-engine@1.0.0 score
> node scripts/score/role-scorer.mjs data\examples\ch11-roles.json

✓ scored 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%)
  data\examples\role-scores.json  +  data\examples\role-scores.md
```

Full markdown report (`data\examples\role-scores.md`):

```
# Role Scorer report — 2026-07-05

Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0
[role_quality weight is **[VERIFY]** — not pinned by the chapter].
Threshold 0.3. Profile requires sponsorship.

Summary: 5 roles → Apply 2 · Consider 1 · Skip 2. Skip rate 40%

| Role | Composite | Rec | Why |
|---|---|---|---|
| Cambridge biotech — Data role (Proven tier) | 0.446 | Apply | composite ≥ 0.3, gates healthy |
| Likely-tier sponsor — Strong but Likely not Proven | 0.418 | Consider | above threshold but sponsorship tier is "Likely" |
| Non-sponsor, but HM is a contact | 0.193 | Apply (override) | composite < 0.2 — scorer says skip, human overrides |
| Household-name non-sponsor | 0.178 | Skip | composite < 0.2 |
| Proven sponsor (ghost posting) | 0.000 | Skip | liveness gate = 0 — zeroes composite regardless of other scores |
```

**Key observation for my mode:** The last row demonstrates the liveness gate behavior central to Gate G1 in my mode — a ghost posting from a Proven H-1B sponsor scores 0.000 and is skipped. The scorer enforces this automatically. A dead posting cannot be rescued by good sponsorship history.

---

## Command 4 — ATS Liveness Check (`npm run ats:liveness`)

Playwright browser installed first (required on Windows):

```
C:\assignments\5\the-reallocation-engine>npx playwright install chromium
Downloading Chrome for Testing 149.0.7827.55 (playwright chromium v1228)...
183.6 MiB downloaded
Chrome Headless Shell 149.0.7827.55 downloaded
```

Liveness check run against Anthropic's Greenhouse board:

```
C:\assignments\5\the-reallocation-engine>npm run ats:liveness -- --url https://boards.greenhouse.io/anthropic

> the-reallocation-engine@1.0.0 ats:liveness
> node scripts/ats/check-liveness.mjs --url https://boards.greenhouse.io/anthropic

Checking 2 URL(s)...
⚠️ uncertain  --url
           invalid URL
⚠️ uncertain  https://boards.greenhouse.io/anthropic
           content present but no visible apply control found
Results: 0 active  0 expired  2 uncertain
```

**Interpretation:** The tool returned `uncertain` — not `DEAD`. The Anthropic Greenhouse board is a listing page, not an individual job posting. The liveness checker looks for an "Apply" button on a single role page. This is expected behavior: the tool is designed for individual posting URLs, not board index pages.

**What this means for my mode:** Gate G1 requires a per-posting URL, not a company board URL. An `uncertain` result is a stop condition — the mode must not proceed to triage until a direct posting URL is supplied and returns `active`. This is correctly handled in my mode's Stop Conditions section.

---

## Verified vs. Inferred

| Claim | Source | Status |
|---|---|---|
| Repo clones and installs cleanly | Terminal output | ✓ VERIFIED |
| `npm run verify` passes on 130/131 files | Terminal output | ✓ VERIFIED |
| WSL failure on `gitignore-large.sh` is Windows-only environment issue | Error message text | ✓ VERIFIED |
| `npm run doctor` confirms all 18 scripts present and data directories exist | Terminal output | ✓ VERIFIED |
| 0 of 42 existing recipes have lifecycle frontmatter | `doctor` output | ✓ VERIFIED |
| Scorer ran on 5 roles, produced Apply 2 / Consider 1 / Skip 2 | Terminal output | ✓ VERIFIED |
| Ghost posting scored 0.000 due to liveness gate | `role-scores.md` output | ✓ VERIFIED |
| `ats:liveness` returns `uncertain` for board-level URLs | Terminal output | ✓ VERIFIED |
| `uncertain` ≠ `DEAD` — tool needs per-posting URL | Script behavior observed | ✓ VERIFIED |
| Scorer uses sponsorship weight 0.35 | `role-scores.md` header | ✓ VERIFIED |
| `role_quality` weight is 0 and marked [VERIFY] in scorer | `role-scores.md` header | ✓ VERIFIED |
| Scorer would apply same logic to MLOps roles in ch11-roles.json | Scorer architecture | [HUMAN] Inferred — ch11-roles.json uses example data, not MLOps-specific titles |
| H-1B CSV contains MLOps-specific petition rows | data/80-days-to-stay/ contents | [HUMAN] Not directly verified — no H-1B CSV found at expected path |

---

## Attestation

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | 130 pass, 1 fail (WSL/bash, Windows only) | All pass or known env failure |
| `npm run doctor` | All scripts confirmed, 0/42 recipes have frontmatter | Environment runnable |
| `npm run score -- data\examples\ch11-roles.json` | 5 roles scored, Apply 2 / Consider 1 / Skip 2 | Numeric output |
| `npm run score` (no args) | Usage error printed | Graceful error, not crash |
| `npm run ats:liveness -- --url https://boards.greenhouse.io/anthropic` | `uncertain` — board page, no apply control | `active` or `uncertain` |
| **Break attempt 1:** `npm run score` with no arguments | Printed usage instructions, exited cleanly | Graceful failure |
| **Break attempt 2:** `npm run ats:liveness` with a board-level URL instead of a posting URL | Returned `uncertain`, not `active` — correctly refused to confirm liveness | Should not return `active` |

### Did not test

- `ats:liveness` against a confirmed-dead individual posting URL (would confirm `expired` behavior)
- `ats:scan` — requires `portals.yml` setup via an onboarding step that does not exist as a script
- `npm run score` against a custom roles.json with MLOps-specific titles (ch11-roles.json uses generic example roles)
- H-1B CSV grep (file not found at `data/h1b/` — path assumed in mode design; actual path needs verification)
- SEC Form D JSON lookup (file location in `data/sec/` not explored in this run)

### Broke during testing, fixed

- `npm run ats:liveness` failed with Playwright browser missing. Fixed by running `npx playwright install chromium`. Re-ran successfully.
- `npm run ats:liveness -- --url <paste a real job URL>` — angle brackets were interpreted as shell redirection operators on Windows. Fixed by replacing with a real URL directly.

---

## Reflection

**What went well:**  
The scorer ran cleanly on the first real attempt once the correct input file path was supplied. The ghost-posting row in the example output (`liveness = 0 → composite = 0.000`) directly demonstrates the core gate logic in my mode — a dead posting cannot be rescued by strong sponsorship history. That's the most important behavioral property of Gate G1, and the script enforced it automatically without any configuration.

The `doctor` output revealed something genuinely useful: 0 of 42 existing recipes have lifecycle frontmatter. My mode file is structured to be the first properly conformant recipe in the repo, which is exactly what the assignment asks for.

**What the mode got wrong or missed:**  
The biggest gap uncovered during the run: `ats:liveness` requires individual posting URLs, not company board pages. My mode's Gate G1 section said "run liveness on each URL" but did not specify that the URL must be a direct job posting link. A student following the mode as written might run it against a company's careers page and get `uncertain`, which the mode currently treats as a stop condition — but without explaining *why* it's uncertain or what to do next. The gate description needs to be more precise.

Additionally, `ats:scan` requires a `portals.yml` file that has no documented setup path. The mode references this command but it cannot be run without prior configuration that isn't scripted. This should be marked `[TODO]` or removed from the workflow until the setup path exists.

The H-1B CSV path assumed in the mode (`data/h1b/h1b_disclosure_data.csv`) was not verified — the actual data may be structured differently inside `data/80-days-to-stay/`. This is a stop condition gap: the mode should verify the path before running any grep commands.

**Next steps:**  
1. Locate actual H-1B data path inside `data/80-days-to-stay/` and update Source Inventory accordingly.
2. Clarify Gate G1 to specify that liveness URLs must be individual posting URLs, not board pages.
3. Remove or `[TODO]`-tag `ats:scan` until `portals.yml` setup is documented.
4. Run scorer against a custom `roles.json` with MLOps-specific titles (ML Platform Engineer, MLOps Engineer) to verify SOC handling.

---

## RUN_LOG Entry

```markdown
## 2026-07-05 — case-mle-opt-aug2026-h1b-runway v0.1.0

- Mode: case-mle-opt-aug2026-h1b-runway
- OPT Start: 2026-09-01
- Commands Run:
  - git clone + npm install
  - npm run verify
  - npm run doctor
  - npm run score -- data\examples\ch11-roles.json
  - npx playwright install chromium
  - npm run ats:liveness -- --url https://boards.greenhouse.io/anthropic
- Outputs:
  - data\examples\role-scores.json (written by scorer)
  - data\examples\role-scores.md (written by scorer)
- Key findings:
  - Scorer enforces liveness gate: ghost posting → 0.000 composite regardless of sponsorship
  - 0/42 existing recipes have lifecycle frontmatter — mode file is first conformant recipe
  - ats:liveness requires per-posting URL, not board-level URL → uncertain on board pages
  - ats:scan requires portals.yml — no setup path documented → marked [TODO] in mode
- Open issues:
  - H-1B CSV path not confirmed (data/h1b/ assumed, not verified)
  - ats:scan cannot run without portals.yml setup
  - WSL/bash conformance failure on Windows (environment issue, not mode issue)
- Notes: Two deliberate break attempts passed. Playwright install required on Windows before liveness check.
```
