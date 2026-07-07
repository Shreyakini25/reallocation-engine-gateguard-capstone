# AI Use Disclosure

**Tool(s) used:** Claude (claude.ai)

**Portions assisted:** search/resume.json, search/profile.yml, search/gaps.md, logs/RUN_LOG.md

**How used:** To extract and structure resume.json from my DE resume PDF, draft profile.yml from my answers to the five intake questions, generate the initial gap table in gaps.md, and draft the RUN_LOG.md entry.

**What I changed:**
- `resume.json`: corrected three agent errors — wrong visa_status field, invented scale field across all projects, and invented type field on experience entries. Set attested: true after corrections.
- `profile.yml`: corrected current_status, expanded geography from specific cities to anywhere in the US, removed active applications section, replaced specific company names in sponsorship section with rule-based thresholds.
- `gaps.md`: deleted the Terraform/IaC row (agent sourced it from senior-level postings outside my target band), rewrote the Kafka row in my own words, added specific evidence citation and verifiable closing condition to the Kafka row.

**What the AI could not do:** The agent could not know my actual geography constraint. It assumed I was limited to specific cities (Boston, New York, Seattle, Austin, Chicago, SF Bay Area) based on where DE jobs are concentrated. I had to correct this -  I am open to relocating anywhere in the United States. The agent's assumption would have caused the engine to skip valid roles in other markets.
