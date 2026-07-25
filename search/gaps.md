# search/gaps.md — Aakash Belide
**Target role:** AI Engineer at a large, established fintech or SaaS company building production LLM pipelines  
**Compared against:** `search/resume.json` (attested 2026-06-23) × `search/profile.yml`  
**Drafted by:** Claude Code, 2026-06-23. **Student edits applied:** one row killed (DSA — see Removed Row section); MLflow/W&B row rewritten in student's own words (see Rewritten Row section).

---

## Gap Table

| Gap | Evidence the target demands it | What I have | Plan to close it |
|---|---|---|---|
| **MLflow / W&B experiment tracking for LLM runs** | Stripe ML Infrastructure JD ([stripe.com/jobs/…/7528260](https://stripe.com/jobs/listing/software-engineer-machine-learning-infrastructure/7528260)) requires "experience with production ML platforms, MLOps solutions"; MirrorCV 2026 AI Engineer guide ([mirrorcv.com/resume-guide/ai-ml-engineer](https://mirrorcv.com/resume-guide/ai-ml-engineer)) calls MLflow + W&B the "2026 default stack" alongside Docker/K8s/cloud; O*NET 15-2051.00 in-demand technologies ([onetonline.org/link/demand/15-2051.00](https://www.onetonline.org/link/demand/15-2051.00)) include ML pipeline tooling | I have strong end-to-end experience deploying LLM applications in production — at Granite I shipped an NL2SQL pipeline (LangGraph + FastAPI + Cloud Run + GCP + Terraform + OpenTelemetry) and a RAG agent. My gap is not in deployment; it is specifically in formal experiment tracking (MLflow, W&B) for versioning LLM experiments, prompt iterations, and evaluation runs — none of that appears in my current work record. | Integrate MLflow or W&B into the public portfolio project specifically for tracking LLM experiment runs: versioned prompts, model configs, and evaluation metrics visible in a dashboard. Gap closes when: a public GitHub project demonstrates tracked LLM experiments with prompt versions and metrics logged in MLflow or W&B — not just a deployed app, but an auditable experiment history. |
| **Public open-source AI / LLM portfolio** | Stripe Data & AI JD ([stripe.com/jobs/…/7529428](https://stripe.com/jobs/listing/software-engineer-data-ai/7529428)) and Databricks AI Engineer guide ([datainterview.com/blog/databricks-ai-engineer-interview](https://www.datainterview.com/blog/databricks-ai-engineer-interview)) both reference GitHub profile as part of technical evaluation; MirrorCV guide: "resumes lacking public LLM project evidence are invisible to 70% of hiring managers building GenAI products" | Only 1 public GitHub project: WhatsApp chatbot (2021, NLTK-based). All high-signal work — NL2SQL at Granite, 10B-edge graph dedup at Bajaj, RAG agent project — is proprietary or has no public URL | Publish at least one end-to-end LLM project to GitHub with: clear architecture README, working code, and a live demo or evaluation results. Gap closes when: a public GitHub repo demonstrates production-quality LLM engineering (not a tutorial reproduction). |
| **LLMOps observability — prompt versioning, cost/latency monitoring, LLM-as-judge evaluation pipeline** | KDnuggets LLM Engineer roadmap ([kdnuggets.com/…/llm-engineer-in-2026](https://www.kdnuggets.com/the-roadmap-to-becoming-an-llm-engineer-in-2026)): "tracing token usage per request, logging inputs/outputs for debugging and compliance, versioning prompts — these separate working prototypes from maintainable production systems"; Taggd.in AI Engineer JD guide ([taggd.in/blogs/ai-engineer](https://taggd.in/blogs/ai-engineer/)): LangSmith, Arize listed as expected tooling for senior AI Engineer candidates | OpenTelemetry for distributed tracing at Granite (partial signal); golden-set + LLM-as-judge eval methodology in RAG project (strong partial signal); no named LLMOps platform (LangSmith, Arize, Braintrust) in any bullet | Integrate LangSmith or Arize into the public portfolio project; add prompt versioning and cost tracking. Gap closes when: a repo demonstrates per-request token tracing, cost logging, and at least one evaluation pipeline with documented results. |
| **ML system design interview fluency** | Databricks AI Engineer interview guide ([datainterview.com/blog/databricks-ai-engineer-interview](https://www.datainterview.com/blog/databricks-ai-engineer-interview)): ML system design is an explicit round for AI/ML engineer candidates at large companies; pattern across Stripe, Google, Amazon, Databricks hiring loops; O*NET 15-2051.00 knowledge domain: "Computers and Electronics — design and production of computer hardware and software" | Strong practical system design experience: 10B-edge TigerGraph deduplication engine (Bajaj), NL2SQL LangGraph pipeline (Granite), graph-based dedup with 1B nodes — but this work is proprietary and has never been articulated in a public system design write-up | Practice 8–10 ML system design problems (recommend: Educative.io ML System Design or "Designing Machine Learning Systems" by Chip Huyen); publish at least one public write-up explaining the architecture of one past system (e.g., NL2SQL pipeline design decisions). Gap closes when: you can whiteboard a full ML system design end-to-end and have at least one public artifact demonstrating the skill. |

---

## Removed Row

**Gap removed:** DSA / algorithmic coding interview preparation

**Why it was wrong:** The agent generated this gap because no LeetCode profile or competitive programming evidence appears on my resume, and it inferred "no resume signal = skill gap." This is a category error: DSA is an interview-assessed skill, not a resume-listed one. I do have a LeetCode profile with a decent number of problems solved. More importantly, from my direct conversations with HRs and hiring managers, LeetCode profiles are rarely checked during the screening process — the skill is assessed live in the interview, not screened from a profile link. The agent applied a "resume evidence = demonstrated skill" logic that simply does not hold for interview preparation skills.

---

## Rewritten Row

**Gap rewritten:** MLflow / W&B experiment tracking for LLM runs (first row in the table above)

| Gap | Evidence the target demands it | What I have | Plan to close it |
|---|---|---|---|
| **MLflow / W&B experiment tracking for LLM runs** | Stripe ML Infrastructure JD ([stripe.com/jobs/…/7528260](https://stripe.com/jobs/listing/software-engineer-machine-learning-infrastructure/7528260)) requires "experience with production ML platforms, MLOps solutions"; MirrorCV 2026 AI Engineer guide calls MLflow + W&B the "2026 default stack"; O*NET 15-2051.00 in-demand technologies include ML pipeline tooling | I have strong end-to-end experience deploying LLM applications in production — at Granite I shipped an NL2SQL pipeline (LangGraph + FastAPI + Cloud Run + GCP + Terraform + OpenTelemetry) and a RAG agent. My gap is not in deployment; it is specifically in formal experiment tracking (MLflow, W&B) for versioning LLM experiments, prompt iterations, and evaluation runs — none of that appears in my current work record. | Integrate MLflow or W&B into the public portfolio project specifically for tracking LLM experiment runs: versioned prompts, model configs, and evaluation metrics visible in a dashboard. Gap closes when: a public GitHub project demonstrates tracked LLM experiments with prompt versions and metrics logged in MLflow or W&B — not just a deployed app, but an auditable experiment history. |

**Why I rewrote it:** The agent's original framing treated this as a broad "MLOps gap" — as if I had no production deployment experience. That is wrong. I have shipped LLM applications end-to-end in production. The real gap is narrow and specific: formal experiment tracking (MLflow, W&B) for versioning prompt iterations and evaluation results. The original row conflated deployment (my strength) with experiment tracking (my gap). My version separates them, so the plan is precise rather than generic.

---

*Sources used to build this table:*
- [Stripe ML Infrastructure JD](https://stripe.com/jobs/listing/software-engineer-machine-learning-infrastructure/7528260)
- [Stripe Data & AI JD](https://stripe.com/jobs/listing/software-engineer-data-ai/7529428)
- [Databricks AI Engineer Interview Guide — datainterview.com](https://www.datainterview.com/blog/databricks-ai-engineer-interview)
- [O*NET 15-2051.00 Data Scientists — onetonline.org](https://www.onetonline.org/link/summary/15-2051.00)
- [O*NET 15-2051.00 In-Demand Skills](https://www.onetonline.org/link/demand/15-2051.00)
- [KDnuggets — LLM Engineer Roadmap 2026](https://www.kdnuggets.com/the-roadmap-to-becoming-an-llm-engineer-in-2026)
- [MirrorCV — AI Engineer Resume Guide 2026](https://mirrorcv.com/resume-guide/ai-ml-engineer)
- [AscendurePro — Careers in AI and ML 2026](https://ascendurepro.com/careers-in-ai-and-machine-learning/)
- [Taggd.in — AI Engineer Job Description 2026](https://taggd.in/blogs/ai-engineer-job-description-roles-and-responsibilites/)
