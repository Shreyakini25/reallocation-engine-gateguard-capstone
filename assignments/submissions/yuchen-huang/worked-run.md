# Worked Run: case-de-platform-cogpivot

**Author:** Yu-Chen Huang  
**Date:** 2026-06-30  
**Recipe:** case-de-platform-cogpivot v0.1.0  
**Status:** RUNNABLE-SAMPLE

## Scenario

I am an F-1 OPT student targeting SOC **15-1243** in the Bay Area and Seattle. For this run I picked three companies from the H-1B mapped dataset that passed my data-engineering keyword filter:

| Company | Location | H-1B evidence (record) |
|---|---|---|
| **DataStax Inc** | Santa Clara, CA | 94 approvals, 100% rate; titles include `Software Engineer - Data Platform` |
| **Coursera Inc** | Mountain View, CA | 88 approvals, 97.8% rate; `Data Engineer` in top titles |
| **Deako Inc** | Seattle, WA | 8 approvals, 100% rate; only listed title is `Data Engineer II` |

I also added two control rows: a company with no H-1B record, and a Coursera URL that I know is expired (for the liveness gate test).

My profile is in `search/profile.yml` (OPT 2026-09-14 to 2027-09-13, sponsorship required). The scorer script needs JSON for profile, not YAML, so I used a small JSON file for the run and kept YAML for my own reading.

---

## Commands and real terminal output

### 1. Toolchain verify

```bash
npm run verify
```

```
conformance: 131 files (75 md · 30 py · 23 js · 1 sh · 1 yaml · 1 json)
✓ all conform (machine half of P4). Adequacy is still the human gate.
✓ manifest check passed (4 warnings)
```

### 2. DE title filter on H-1B mapped data

```bash
grep -iE "data engineer|data architect|database architect|big data|data platform|data engineering" \
  data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv | wc -l
```

```
      70
```

Sample rows (includes all three target companies):

```
DATASTAX INC,...,94.0,0.0,100.0,157477.0,"['Software Engineer', 'Escalations Engineer', 'Software Engineer - Data Platform']"
COURSERA INC,...,88.0,2.0,97.77777777777776,151674.0,"['Software Engineer', 'Data Engineer', ...]"
DEAKO INC,...,8.0,0.0,100.0,100000.0,['Data Engineer II']
```

### 3. BLS cognitive pivot for SOC 15-1243

```bash
grep "15-1243" data/bls/compact/soc_occupation_compact.csv
```

```
15-1243.00,15-1243,Database Architects,...,3.933
15-1243.01,15-1243,Data Warehousing Specialists,...,3.626
```

**Formula I used in roles.json:** `role_quality.p = cognitive_pivot_score / 5.0`  
So platform-leaning is **0.787** and pipeline-leaning is **0.725**.

### 4. Composite score

```bash
npm run score /tmp/de-platform-roles.json -- \
  --profile /tmp/profile-sponsor-required.json \
  --out-dir /tmp/de-platform-score
```

```
✓ scored 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%)
  ../../../../../../../tmp/de-platform-score/role-scores.json  +  ../../../../../../../tmp/de-platform-score/role-scores.md
```

Scorer report (excerpt):

| Role | Composite | Rec | Why |
|---|---|---|---|
| DataStax / Software Engineer - Data Platform | 0.478 | **Apply** | composite ≥ 0.3, gates healthy |
| Coursera / Data Engineer (representative) | 0.467 | **Apply** | composite ≥ 0.3, gates healthy |
| Deako / Data Engineer II | 0.407 | **Consider** | soft spot: sponsorship tier "Likely" |
| Example Corp (no H-1B) / Data Engineer | 0.189 | **Skip** | composite < 0.2 |
| Coursera / expired posting | 0.000 | **Skip** | **gated: liveness ≈ 0** |

Note: the audit line shows `role_quality 0.787·0 [record]`. Weight is **0** in default config, so pivot is verified from BLS but not counted in composite yet.

### 5. Liveness gate: live posting

```bash
npm run ats:liveness -- "https://job-boards.greenhouse.io/coursera/jobs/5999885004"
```

```
Checking 1 URL(s)...

✅ active     https://job-boards.greenhouse.io/coursera/jobs/5999885004

Results: 1 active  0 expired  0 uncertain
```

This is a public Coursera Greenhouse URL. The title is "Chief of Staff, Data", not a Data Engineer posting. I used it as a **live board proxy** because I could not find an open DE posting on the board when I checked.

### 6. Liveness gate: break test (on purpose)

```bash
npm run ats:liveness -- "https://job-boards.greenhouse.io/coursera/jobs/0000000000"
```

```
Checking 1 URL(s)...

❌ expired    https://job-boards.greenhouse.io/coursera/jobs/0000000000
           redirect to https://job-boards.greenhouse.io/coursera?error=true

Results: 0 active  1 expired  0 uncertain
```

I put `liveness.factor: 0.0` in roles.json for this row. Final composite became **0.000** even though sponsorship was Proven.

### 7. DE filter break test: SWE-dominated sponsor

```python
# DataStax passes DE keyword filter: True
# Titles: ['Software Engineer', 'Escalations Engineer', 'Software Engineer - Data Platform']
# DE-specific: 1 of 3 listed titles
```

**Expected:** the filter should tell me to **investigate**, not treat DataStax as a DE-primary sponsor.  
**Saw:** grep still includes DataStax in the 70-company list with no title ratio check.  
**What I did:** I documented this in the recipe human gate (Step 2).

---

## Verified vs inferred

| Field | DataStax | Coursera | Deako | Source type |
|---|---|---|---|---|
| Total Approvals | 94 | 88 | 8 | **record** (CSV) |
| Approval rate | 100% | 97.8% | 100% | **record** |
| DE title in top_job_titles_sponsored | Data Platform (1/3 titles) | Data Engineer | Data Engineer II | **record** |
| cognitive_pivot_score | 3.933 → p=0.787 (15-1243.00 assumed) | 3.626 → p=0.725 (15-1243.01 default) | 3.626 → p=0.725 | **record** (BLS) |
| sponsorship tier Proven/Likely | Proven | Proven | Likely (low volume) | **record** + my rule |
| fit score | 0.72 | 0.68 | 0.75 | **model-judgment** |
| timeline factor 0.9 | yes | yes | yes | **your-input** (profile.yml) |
| Posting liveness | not checked (no URL) | active (proxy URL) | not checked | **record** (liveness script) |
| Platform vs pipeline for this posting | n/a | n/a | n/a | **inferred** (SOC prior only) |
| Composite includes pivot | No (weight 0) | No | No | **record** (scorer config) |

---

## Attestation

- **Recipe:** case-de-platform-cogpivot v0.1.0
- **By:** Yu-Chen Huang · 2026-06-30

### My judgment values for this run

| Field | What I used | Why |
|---|---|---|
| **fit** scores | DataStax 0.72, Coursera 0.68, Deako 0.75 | DataStax is most platform-related. Deako has a clear DE title and is in Seattle, so I gave it a good fit score even though the company is smaller. |
| **timeline.factor** | 0.9 for all rows | My OPT starts Sept 2026 and I want an offer by then. There is some pressure, but I am not at the 90-day unemployment limit yet. |
| **Deako tier** | Likely (not Proven) | Only 8 approvals vs 88-94 for the other two. Scorer returned Consider, which matches my expectation. |

I label fit as **model-judgment** and timeline as **your-input**. I only call something **record** when it came from CSV, BLS, or the liveness script.

### Tested

| Ran | Saw | Expected |
|---|---|---|
| `grep` DE filter on H-1B CSV | 70 companies; my 3 targets included | Filter finds DE-related sponsors from local data |
| `grep 15-1243` on BLS compact | pivot 3.933 and 3.626 | SOC rows exist for platform vs pipeline sub-codes |
| `npm run score` (5 roles) | Apply 2, Consider 1, Skip 2; ghost → 0.000 | Scorer follows gate and tier rules from Ch.11 |
| `npm run ats:liveness` live URL | `active` | Coursera board responds as live |
| `npm run ats:liveness` invalid job ID | `expired`; liveness=0 → Skip | Gate zeros composite even with strong sponsor |
| DataStax DE filter break test | Passes filter with 1/3 DE titles | Shows false-positive risk for SWE-heavy sponsors |

### Did not test

- `[TODO: DEV] scripts/de/filter-h1b-de-titles.py`
- `[TODO: DEV] scripts/de/platform-pipeline-classifier.py`
- Scorer with `role_quality` weight greater than 0
- DataStax job posting liveness (Greenhouse API returned 0 open jobs when I checked)

### Broke during testing, fixed

- **`npm run score -- --profile search/profile.yml`** failed because scorer expects JSON, not YAML (`SyntaxError: Unexpected token '#'`). I fixed it with JSON: `{"authorization": "F-1 OPT, sponsorship required"}`.
- **`npm run ats:liveness`** failed first time because Playwright browser was missing. I ran `npx playwright install chromium` and then it worked.

---

## Reflection

**What went well:**  
I think the three layers work together on real data. DataStax and Coursera got Apply because of strong sponsorship plus reasonable fit. Deako got Consider because the approval count is small (Likely tier). The no-sponsor row and the expired URL both became Skip, but for different reasons I can explain from the audit trail. The expired URL test was the clearest example that liveness is a gate, not just another score.

**What the mode missed:**  
The cognitive pivot number from BLS is real, but the default scorer does not use it yet (`role_quality` weight is 0). DataStax also showed me a weakness in my grep filter: it enters the DE list even when most titles are SWE. I could not test liveness on a DataStax DE posting because their Greenhouse board had no open jobs when I checked.

**Next steps for me:**  
(1) Build the `[TODO: DEV]` DE title filter with O*NET alternate titles and a SWE vs DE ratio. (2) Decide a real weight for `role_quality` in the scorer. (3) Add a JD classifier so I do not treat 15-1243.00 vs .01 as posting fact without reading the job description.

---

## roles.json used (inline, not a separate file)

```json
[
  {
    "role_id": "datastax-platform",
    "company": "DataStax Inc",
    "title": "Software Engineer - Data Platform",
    "sponsorship": { "p": 0.9, "tier": "Proven", "source": "record" },
    "role_quality": { "p": 0.787, "source": "record" },
    "fit": { "p": 0.72, "source": "model-judgment" },
    "liveness": { "factor": 1.0, "source": "record" },
    "timeline": { "factor": 0.9, "source": "your-input" }
  },
  {
    "role_id": "coursera-de-live",
    "company": "Coursera Inc",
    "title": "Data Engineer (representative)",
    "sponsorship": { "p": 0.9, "tier": "Proven", "source": "record" },
    "role_quality": { "p": 0.725, "source": "record" },
    "fit": { "p": 0.68, "source": "model-judgment" },
    "liveness": { "factor": 1.0, "source": "record" },
    "timeline": { "factor": 0.9, "source": "your-input" }
  },
  {
    "role_id": "deako-de-ii",
    "company": "Deako Inc",
    "title": "Data Engineer II",
    "sponsorship": { "p": 0.65, "tier": "Likely", "source": "record" },
    "role_quality": { "p": 0.725, "source": "record" },
    "fit": { "p": 0.75, "source": "model-judgment" },
    "liveness": { "factor": 1.0, "source": "record" },
    "timeline": { "factor": 0.9, "source": "your-input" }
  },
  {
    "role_id": "no-sponsor-control",
    "company": "Example Corp (no H-1B record)",
    "title": "Data Engineer",
    "sponsorship": { "p": 0.0, "tier": "None", "source": "record" },
    "role_quality": { "p": 0.787, "source": "record" },
    "fit": { "p": 0.7, "source": "model-judgment" },
    "liveness": { "factor": 1.0, "source": "record" },
    "timeline": { "factor": 0.9, "source": "your-input" }
  },
  {
    "role_id": "coursera-ghost",
    "company": "Coursera Inc",
    "title": "Data Engineer (expired posting)",
    "sponsorship": { "p": 0.9, "tier": "Proven", "source": "record" },
    "role_quality": { "p": 0.725, "source": "record" },
    "fit": { "p": 0.7, "source": "model-judgment" },
    "liveness": { "factor": 0.0, "source": "record" },
    "timeline": { "factor": 0.9, "source": "your-input" }
  }
]
```
