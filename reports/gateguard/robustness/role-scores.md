# Role Scorer report — 2026-08-10

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is **[VERIFY]** — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

**Summary:** 8 roles → Apply 6 · Consider 0 · Skip 2. **Skip rate 25%** (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| Fictional Robustness Lab — Liveness above one | 0.731 | **Apply** | composite 0.731 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1.25[your-input]×timeline 1[your-input] |
| Fictional Robustness Lab — Timeline above one | 0.731 | **Apply** | composite 0.731 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[your-input]×timeline 1.25[your-input] |
| Fictional Robustness Lab — Missing liveness | 0.585 | **Apply** | composite 0.585 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[record]×timeline 1[your-input] |
| Fictional Robustness Lab — Missing timeline | 0.585 | **Apply** | composite 0.585 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[your-input]×timeline 1[your-input] |
| Fictional Robustness Lab — Null liveness | 0.585 | **Apply** | composite 0.585 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[your-input]×timeline 1[your-input] |
| Fictional Robustness Lab — String liveness | 0.585 | **Apply** | composite 0.585 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[your-input]×timeline 1[your-input] |
| Fictional Robustness Lab — Negative liveness | -0.146 | **Skip** | gated: liveness ≈ -0.250 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness -0.25[your-input]×timeline 1[your-input] |
| Fictional Robustness Lab — Negative timeline | -0.146 | **Skip** | gated: timeline ≈ -0.250 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.9·0.35 [your-input]; fit 0.9·0.3 [your-input] × liveness 1[your-input]×timeline -0.25[your-input] |

*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion (Ch.11).*
