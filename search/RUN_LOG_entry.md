# RUN_LOG entry — Search Setup Exercise (Step 5)
# Append this block to logs/RUN_LOG.md. No contents from search/private-notes.md.

## Entry: Search personal-data layer built — 2026-06-25

**What was built**
- search/resume.json — structured records extracted from my resume PDF, attested.
- search/profile.yml — target role (Software Engineer/Developer, SOC 15-1252.00), F-1 OPT visa, geography, industry, sponsorship gate.
- search/gaps.md — gap table grounded in O*NET 15-1252.00 + 2026 SWE posting patterns.
- search/private-notes.md — gitignored (confirmed not tracked).

**Three attestation errors I caught in resume.json**
1. "Led the setup and maintenance of MySQL" softened to "Set up and maintained" — unverifiable seniority claim at a 4-month role.
2. Removed "TensorFlow" from skills — no project or job uses it; the deep-learning work used PyTorch and raw CUDA.
3. Marked the LLaMA-2 speedup figures (~10x, ~40→~400 tok/s) as self-measured rather than stated as hard fact.

**Top gap from gaps.md**
- G1 (automated testing + CI/CD): the clearest distance between my solo, untested projects and what every SWE posting expects, and the cheapest to close with a visible output.

**Row I killed and why**
- "Coding-interview readiness (DS&A under pressure)".This row was describing my resume doesn't show enough information about how good am I during DS&A,more specifically, my resume doesn't show I'm good at leetcoding. I think this was wrong because everyone who is job hunting in tech industry will do leetcode or such stuff. No need to mention it, plus I graduate with a computer science degree.

**profile.yml field I had to correct from the agent's first draft**
- stem_eligible: left as "uncertain" rather than asserting "yes" 
- location：left as Boston, but actually every place in US is acceptable to me.

## Step 4 — Verification check
- resume.json: Project repos and the EC2 work are traceable; I fixed the "led" inflation, the unevidenced TensorFlow skill, and the over-stated metrics. A few listed skills (C#, React, Node, MongoDB, Docker) still need a repo link or should be trimmed.
- profile.yml:  STEM is "uncertain"  — it should be Yes.
- gaps.md: Every evidence cell traces to O*NET 15-1252.00 or named 2026 postings.
