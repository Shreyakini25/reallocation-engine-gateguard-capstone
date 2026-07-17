# Role Scorer report — 2026-07-07

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 8 roles → Apply 2 · Consider 3 · Skip 3. **Skip rate 38%** (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| Series-A applied-AI startup (recent Form D) — Applied AI Engineer — new grad | 0.478 | **Apply** | composite 0.478 ≥ 0.3, gates healthy | sponsorship 0.85·0.35 [record]; fit 0.78·0.3 [model-judgment]; role_quality 0.8·0 [record] × liveness 1[record]×timeline 0.9[your-input] |
| Established sponsor — enterprise AI lab — Full-Stack SWE (New Grad), prototyping team | 0.421 | **Apply** | composite 0.421 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [record]; fit 0.6·0.3 [model-judgment]; role_quality 0.65·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Likely-tier sponsor (HCI/VR studio) — XR Prototype Developer (Unity/C#) | 0.389 | **Consider** | above threshold (0.389) but one soft spot: sponsorship tier "Likely" | sponsorship 0.55·0.35 [record]; fit 0.8·0.3 [model-judgment]; role_quality 0.75·0 [record] × liveness 1[record]×timeline 0.9[your-input] |
| Household-name non-sponsor — Research-Engineer (prototype/benchmark) | 0.209 | **Consider** | composite 0.209 in the Consider band [0.2, 0.3) | sponsorship 0·0.35 [record]; fit 0.82·0.3 [model-judgment]; role_quality 0.9·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Non-sponsor, but HM is a referral — Software Engineer (prototyping) — scorer says Skip | 0.199 | **Consider ⟵ override** | composite 0.198 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.72·0.3 [model-judgment]; role_quality 0.7·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Vague 'AI Innovation' posting — AI Innovation Associate (actually sales/support) | 0.157 | **Skip** | composite 0.157 < 0.2 — time is better spent elsewhere | sponsorship 0.4·0.35 [record]; fit 0.15·0.3 [model-judgment]; role_quality 0.2·0 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Proven sponsor (ghost posting) — AI Prototype Engineer — looks perfect, not live | 0.000 | **Skip** | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.9·0.35 [record]; fit 0.85·0.3 [model-judgment]; role_quality 0.85·0 [record] × liveness 0[record]×timeline 0.85[your-input] |
| Proven sponsor — start date before OPT EAD — Simulation Engineer (start date too early) | 0.000 | **Skip** | gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.85·0.35 [record]; fit 0.75·0.3 [model-judgment]; role_quality 0.7·0 [record] × liveness 1[record]×timeline 0[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
