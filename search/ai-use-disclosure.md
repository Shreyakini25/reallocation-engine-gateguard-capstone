# AI Use Disclosure — Assignment 4: Search's Personal Layer

**Course:** INFO 7375 — Computational Skepticism for AI  
**Student:** Aakash Belide  
**Date:** 2026-06-23  
**Assignment:** Setup Exercise — Your Search's Personal Layer (25 pts)

---

## Tool Used

**Claude Code** (Claude Sonnet 4.6) via Anthropic's CLI, running inside VS Code.

---

## What the AI Did

**Extraction and structuring:**  
Claude Code read `private/master_resume.json` and extracted it into the typed, structured format required for `search/resume.json` — one record per work entry, project, degree, skill category, and certification, with typed fields (`start_date`, `end_date`, `metrics[]`, `tools[]`) replacing prose blobs.

**Profile drafting:**  
After I answered the Q1–Q5 intake questions (target role, visa constraints, geography, industry preferences, sponsorship requirement), Claude Code drafted `search/profile.yml` with all five required sections.

**Gap table research and drafting:**  
Claude Code ran web searches against O*NET 15-2051.00 (Data Scientists), the Stripe ML Infrastructure and Data & AI job postings, the Databricks AI Engineer interview guide, and the KDnuggets / MirrorCV 2026 AI Engineer guides. It synthesized these into the four-column gap table in `search/gaps.md`, with every evidence cell citing a specific, openable URL.

**Logging:**  
Claude Code drafted the `logs/RUN_LOG.md` entry structure and filled in the components it could confirm (three attestation errors, top gap, corrected profile field, verification check answers).

---

## What I Did

**Attesting the resume:**  
I read every entry in `search/resume.json` and confirmed or corrected the three flagged import errors. I set `attested: true` and `attested_date: 2026-06-23` myself after reviewing the record.

**Correcting the profile:**  
I changed `stem_eligible` from `"uncertain"` to `true` after confirming my STEM eligibility with my DSO. The agent correctly set it to uncertain (it had no way to know whether I had confirmed eligibility); the correction came from my own knowledge and documents.

**Answering the intake questions:**  
All five Q1–Q5 answers (target role, visa dates, geography, industry preferences, sponsorship requirement) came from me. The agent could not know my OPT dates, my DSO confirmation status, my salary floor, or my geographic constraints — those are personal facts only I have.

**Killing the DSA row:**  
I identified the DSA / algorithmic coding interview preparation row as inapplicable and wrote the explanation. The agent generated the gap from a category error (no resume signal = skill gap); I knew from direct experience with HRs and hiring managers that DSA is assessed live in interviews, not screened from a LeetCode profile.

**Rewriting the MLOps row:**  
I rewrote the MLOps gap in my own words to distinguish between what I actually have (end-to-end production LLM deployment experience) and what I genuinely lack (formal experiment tracking with MLflow or W&B). The agent's original framing overstated the gap; my rewrite corrects both the "what I have" and the "plan" columns to reflect my actual situation and direction.

---

## What the AI Could Not Do

**The specific instance:**

Claude Code flagged `TigerGraph` in my skills section as a potential error, reasoning that my Granite Telecommunications bullet explicitly named `Neo4j` while the skills list said `TigerGraph`. The agent suggested I might have confused the two, or that TigerGraph was inferred rather than actually used, and recommended replacing TigerGraph with Neo4j.

This was wrong.

TigerGraph and Neo4j are two different graph databases used at two different employers. TigerGraph was the system I used at Bajaj Finserv to build the large-scale graph deduplication engine with 10 billion edges and 1 billion nodes. Neo4j was the system I used at Granite Telecommunications for the NL2SQL knowledge graph pipeline. Both tools are correct, both belong in the skills section, and the Bajaj bullet needed to be updated to name TigerGraph explicitly — not to remove TigerGraph from skills.

The agent could not distinguish between these two tools at two different companies because it was reading resume text rather than knowing my actual work history. I caught it during the attestation pass. The fix was not to choose one over the other, but to correct the Bajaj bullet (which had said "graph-based deduplication engine" without naming the technology) to explicitly read "using TigerGraph."

This is the course's central claim applied to my own record: the agent's extraction was fluent; I was the source of truth.

---

## Summary

| | Agent | Me |
|---|---|---|
| Extracted and structured resume | ✓ | |
| Drafted profile.yml from intake | ✓ | |
| Researched O*NET + job postings | ✓ | |
| Drafted gap table with evidence | ✓ | |
| Answered Q1–Q5 intake | | ✓ |
| Confirmed visa dates from documents | | ✓ |
| Confirmed STEM eligibility with DSO | | ✓ |
| Attested resume.json | | ✓ |
| Identified and corrected TigerGraph/Neo4j error | | ✓ |
| Killed the DSA row with a substantive critique | | ✓ |
| Rewrote the MLOps row to reflect actual situation | | ✓ |
