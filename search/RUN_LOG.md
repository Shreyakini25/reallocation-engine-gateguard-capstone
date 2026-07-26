# RUN_LOG.md — Setup Exercise: Search's Personal Layer

## What was built
Three files in `search/`:
- `resume.json` — structured, attested record of my experience (Amazon SDE Co-op, Citi SDE 2, LLM fine-tuning project, education, skills)
- `profile.yml` — target role (Backend/Infrastructure Engineer, secondary AI Infra/AI Engineer interest), visa/OPT timeline, geography, industry preferences, sponsorship gate
- `gaps.md` — 4 evidence-backed gaps between my resume and target role, sourced from actual job postings (Scale AI, vCluster) and O*NET SOC 15-1252.00

## Attestation errors caught in resume.json
The agent's first extraction was faithful to my resume text, but the resume itself contained three claims I couldn't fully defend once I looked closely:
1. **Citi "Led a 3-engineer task force"** — kept as-is after review, but flagged as a claim I need to be ready to explain in detail (who assigned lead, how work was split) if pressed in an interview.
2. **Precise metrics (99.8% accuracy, 40% reduction, "5+ projects")** — these are team/system-reported numbers, not individually measured by me. Reworded in resume.json to say "team-reported" instead of stating them as personally verified facts.
3. **Amazon "serving 300+ sites"** — originally implied I personally verified deployment across 300+ sites. Reworded to reflect that 300+ sites is the scale of the system I built into, not a count I personally confirmed.
4. **Golang** — listed as a core language with zero supporting project evidence anywhere in my experience. Moved to a separate "exposure-only" tier since I can't defend it at the same depth as Java/Python in an interview.

## Top gap (from gaps.md)
Kubernetes: I list it as a skill, but I've never actually shipped anything on it — my Amazon Bedrock Agent project was fully serverless (Lambda-based) and never touched container orchestration. What I have is conceptual knowledge, not a running system. Plan: containerize and deploy that same Bedrock Agent service on Kubernetes with autoscaling, so I have a real "I built and deployed this on K8s" story instead of just a skill listed on a resume.

## Killed row and why
Killed: "LLM serving / inference frameworks (vLLM, SGLang, TensorRT-LLM)." This gap targets AI infra roles focused on building/optimizing the serving framework and model runtime itself. My actual target within AI is building LLM-powered applications (agents, RAG, chatbots) on top of existing infra like Bedrock — not researching or operating the inference framework layer. The gap doesn't apply to the role I'm actually going for, even though it showed up as a common requirement in AI infra job postings.

## profile.yml field corrected from the agent's first draft
Graduation date. The agent's first draft assumed a May 2026 Northeastern graduation (based on prior conversation context), but my actual graduation date is August 29, 2026. This mattered because my OPT start date (Oct 28, 2026) is ~2 months after actual graduation — which is a normal EAD processing gap. Against the wrong May graduation date, that same OPT start date would have looked like an unexplained 5-month gap, which could have thrown off how the engine reads my timeline.

## Step 4 — Verification check

**resume.json: Is every job entry traceable to something verifiable?**
Yes for the underlying jobs and dates (Amazon, Citi — verifiable via offer letters, LinkedIn). The specific metrics I flagged (99.8%, 40%, 300+ sites) are NOT independently verifiable by me personally — they're system/team-level figures I'm citing, not measuring, and I've labeled them as such rather than removing them, since I can still speak to them accurately as context I have credible knowledge of.

**profile.yml: Does the visa constraint section reflect actual documents, or hoped-for timeline?**
STEM OPT eligibility is confirmed with my DSO, not assumed. Dates (OPT start 10/28/2026, OPT end 10/27/2027, STEM extension end 10/27/2029) reflect what I currently understand as accurate; I have not re-verified these against my actual EAD/I-20 documents as part of this exercise, so I'm treating this as accurate-to-my-knowledge rather than document-confirmed. I should double check the EAD card dates directly before relying on this for real decisions.

**gaps.md: Does every gap in the evidence column cite something real?**
Yes — Kubernetes, Terraform, and GPU distributed training gaps are each sourced from real job postings (Scale AI, vCluster) found via search, not invented from training data. The killed LLM-serving-frameworks gap was also real evidence (same Scale AI posting) — it was accurate but irrelevant to my actual target, which is why it got killed rather than disputed on factual grounds.
