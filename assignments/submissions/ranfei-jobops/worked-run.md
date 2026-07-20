# Worked Run — Backend/AI-Infra Job-Ops Pipeline Integrity

## Inputs used

Real company names from my active application list, run through the public tools —
no private application notes or personal contact data used or reproduced here.
Companies: Fireworks AI, Notion, Cartesia, Box, FT Partners.

## Commands run, verbatim, with real output

### 1. Platform detection — first pass (default platforms: greenhouse, lever)

```
$ python scripts/ats/detect-ats.py "Box" "Notion" "Cartesia" "FT Partners" --json-output detect-results-v2.json
[1/4] Box -> none (0 jobs)
[2/4] Notion -> none (0 jobs)
[3/4] Cartesia -> none (0 jobs)
[4/4] FT Partners -> none (0 jobs)
```
All four returned `detection_status: "not_found"` with 404s on both Greenhouse and
Lever endpoints (e.g. `https://boards-api.greenhouse.io/v1/boards/box/jobs`,
`https://api.lever.co/v0/postings/box`).

### 2. Attempted Ashby via the same script — script does not support it

```
$ python scripts/ats/detect-ats.py "Box" "Notion" "Cartesia" "FT Partners" --platforms greenhouse,lever,ashby ...
detect-ats.py: error: argument --platforms: Unknown platform(s): ashby. Valid: greenhouse, lever
```

### 3. Confirmed a working company for contrast — Fireworks AI

```
$ python scripts/ats/detect-ats.py "Fireworks AI" --json-output detect-fireworks.json
[1/1] Fireworks AI -> greenhouse (37 jobs)
```
`ats_slug: "fireworksai"`, `ats_api_url: "https://boards-api.greenhouse.io/v1/boards/fireworksai/jobs"`.

### 4. Manual verification of the "not_found" companies (web search + web fetch)

- Box: `careers.box.com/en/jobs/` states "Careers website powered by Happydance" —
  confirmed genuinely not on Greenhouse/Lever/Ashby.
- Notion: multiple live postings found at `jobs.ashbyhq.com/notion/<id>` — confirmed
  on Ashby, `not_found` was a tool coverage gap, not a real absence.
- Cartesia: confirmed on Ashby at `jobs.ashbyhq.com/cartesia` via a third-party
  hiring-roundup source.
- FT Partners: not resolved — left as an open item, not guessed.

### 5. Built `data/ats/portals.yml` with the confirmed companies (Fireworks AI via
   explicit `api:`, since the `careers_url` auto-match regex in
   `scripts/ats/providers/greenhouse.mjs` only matches `job-boards.greenhouse.io`, not
   the `boards.greenhouse.io` URL the detector returned — a real interface mismatch
   between the two scripts, fixed by using the `api:` override field). Notion and
   Cartesia set with `provider: ashby` and their real `careers_url`.

### 6. Scan — dry run, then real

First dry run (before the Greenhouse URL fix) errored:
```
Errors (1):
  ✗ Fireworks AI: greenhouse: cannot derive API URL for Fireworks AI
```
After switching to the explicit `api:` field:
```
$ npm run ats:scan -- --dry-run
Companies scanned:     3
Total jobs found:      208
Filtered by title:     134 removed
Filtered by location:  71 removed
New offers added:      3
New offers:
  + Fireworks AI | AI Field Engineer - AI Natives | New York, NY; Remote, USA; San Mateo, CA
  + Fireworks AI | AI Field Engineer - Enterprise | New York, NY; Remote, USA; San Mateo, CA
  + Fireworks AI | AI Field Engineer - Strategic Partnerships | New York, NY; Remote, USA; San Mateo, CA
```
Real (non-dry) run wrote identical results to `data/ats/pipeline.md` and
`data/ats/scan-history.tsv`.

### 7. Liveness — real posting, then two deliberate break attempts

```
$ npm run ats:liveness -- https://job-boards.greenhouse.io/fireworksai/jobs/4280748009
✅ active     https://job-boards.greenhouse.io/fireworksai/jobs/4280748009
Results: 1 active  0 expired  0 uncertain
```

Break attempt 1 — fabricated job ID on a real, supported board:
```
$ npm run ats:liveness -- https://job-boards.greenhouse.io/fireworksai/jobs/0000000000
❌ expired    ... redirect to https://job-boards.greenhouse.io/fireworksai?error=true
Results: 0 active  1 expired  0 uncertain
```

Break attempt 2 — a real, independently-confirmed-live posting on an unsupported
custom ATS:
```
$ npm run ats:liveness -- https://careers.box.com/en/jobs/7900512/customer-success-manager-public-sector/
❌ expired    ... insufficient content — likely nav/footer only
Results: 0 active  1 expired  0 uncertain
```
This posting was visible and active in a Box careers-page fetch minutes before this
check. This is the false negative documented in the Domain Justification.

## Verified vs. inferred

**Verified (by script output, cross-checked against a second source):**
- Fireworks AI is on Greenhouse, 37 open jobs, one specific posting confirmed active.
- A fabricated Greenhouse job ID is correctly flagged expired, with a redirect trail
  as evidence.
- Notion and Cartesia are on Ashby (confirmed via their own job posting URLs, not just
  a third-party claim, for Notion; via a hiring-roundup source for Cartesia).
- Box is not on Greenhouse/Lever/Ashby (confirmed via Box's own careers page footer
  text).

**Inferred / not fully verified:**
- That the Box liveness false negative is caused specifically by JS-rendering /
  content-extraction failure rather than some other cause — plausible given the
  "insufficient content" message, but not confirmed by reading the checker's source.
- FT Partners' actual ATS platform — not determined at all, left open rather than
  guessed.
- Whether the Ashby gap in `detect-ats.py` is an oversight or an intentional scope
  decision — I only confirmed the CLI rejects the flag, not why.

## Verification steps taken

- Re-ran `detect-ats.py` twice (once without Ashby, once attempting Ashby) to isolate
  whether the flag itself was the blocker.
- Cross-checked Notion's Ashby slug against real, distinct posting URLs (not just the
  company root) to rule out a coincidental match.
- Deliberately constructed two break tests for liveness: one to confirm it correctly
  flags a definitely-fake posting, one to test it against a definitely-real posting on
  an unsupported platform.
- Compared dry-run and real-run `ats:scan` output to confirm the write step produced
  identical figures to the preview.

## Attestation

- Recipe: case-backend-infra-jobops-liveness-ranfei v0.2.0
- By: Ranfei (Faye) Pang · 2026-07-19/20

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `detect-ats.py` on 4 real companies, default platforms | All 4 `not_found` | Some hits expected; got none — prompted manual check |
| `detect-ats.py --platforms ...,ashby` | CLI error, ashby not a valid platform value | Either support or a clear error — got the latter |
| `ats:scan --dry-run` before Greenhouse URL fix | Errored on Fireworks AI, "cannot derive API URL" | Wanted to confirm the tool fails loudly rather than silently dropping the company — it did |
| `ats:liveness` on fabricated job ID (deliberate break attempt) | Correctly `expired` with redirect evidence | Confirms liveness is reliable on supported platforms |
| `ats:liveness` on real live Box posting on unsupported platform (deliberate break attempt) | Incorrectly `expired`, "insufficient content" | Expected either `uncertain` or a platform-not-supported flag; got a confident wrong answer instead — this is the key finding |

### Did not test
- Whether `ats:liveness` behaves the same on Ashby-hosted postings (only tested
  Greenhouse URLs for liveness in this run).
- FT Partners' platform.
- Behavior of `ats:scan` at the full tracked-company scale this mode implies (only 3
  companies configured, not 10–50).

### Broke during testing, fixed
- `ats:scan --dry-run` failed on Fireworks AI because the `careers_url` I got from
  `detect-ats.py` (`boards.greenhouse.io/...`) doesn't match the auto-detect regex in
  `scripts/ats/providers/greenhouse.mjs` (which only matches `job-boards.greenhouse.io`).
  Fixed by using the explicit `api:` field with the exact `ats_api_url` from the
  detector's own JSON output instead of relying on auto-detection from `careers_url`.

## Reflection

What went well: the scan and the "normal" liveness path both worked exactly as
documented, and the deliberate break tests turned up a real, previously undocumented
gap rather than a contrived one — the Ashby blind spot and the Box false negative are
both things I'd have hit for real while tracking my own applications.

What the mode got wrong or missed: I did not resolve FT Partners' platform at all, and
I did not test whether the liveness checker's false-negative pattern also affects
other JS-heavy custom career sites beyond Box, so I can't yet say how common this
failure mode is — only that it exists.

Next steps: implement the `--confirm-platform` override proposed above so a
manually-verified platform (like Notion/Cartesia here) doesn't have to be re-derived
by hand each run, and extend the break-test set to at least one more custom-ATS
company to see if the Box result generalizes.
