#!/usr/bin/env node
// gig-scorer.mjs — the gig-finder decision core (adapted from the Bayesian Role
// Scorer, book Ch.11). Combines the evidence records from
// scripts/upwork/ingest.mjs into one auditable recommendation per gig —
// Apply / Maybe / Skip.
//
//   Composite = ( Σ vote_i · weight_i ) × liveness × time_fit
//
// Votes are graduated (ai_fit, pay, client_trust). Liveness (open & not
// flooded) and time_fit (can you deliver in time) are GATES — multipliers, not
// addends — so a closed posting or an impossible deadline zeroes the composite
// no matter how good the votes. Skip is a successful outcome.
//
// THE WHOLE POINT IS AUDITABILITY: every term is emitted with its value AND its
// source type — record / model-judgment / your-input — and the arithmetic is
// shown. A recommendation you cannot trace to its sources is one to distrust.
//
//   node scripts/score/gig-scorer.mjs <gigs.evidence.json> [--out-dir dir] [--md report.md]

import fs from 'node:fs';
import path from 'node:path';

const CONFIG = {
  weights: {
    ai_fit: 0.45,        // core: can I finish this well with AI? (model-judgment)
    pay: 0.30,           // budget vs effort (record)
    client_trust: 0.25,  // payment-verified, spend, reviews (record)
  },
  apply_threshold: 0.45, // composite ≥ this, gates healthy → Apply
  maybe_floor: 0.30,     // [apply_threshold .. maybe_floor) → Maybe
  gate_zero: 0.05,       // a gate at/below this is "closed" → Skip (gated)
  soft_gate: 0.60,       // a gate below this (flooded / tight deadline) demotes Apply → Maybe
};

const SRC = { record: 'record', model: 'model-judgment', input: 'your-input' };
const num = (x) => (typeof x === 'number' && isFinite(x) ? x : null);
const fmt = (x) => (x == null ? '—' : Number(x).toFixed(3));

function scoreGig(gig, weights) {
  const votes = [];
  const push = (key, obj, defSrc) => {
    const p = num(obj?.p);
    if (p == null) return;
    votes.push({ key, p, weight: weights[key] ?? 0, source: obj.source || defSrc, note: obj?.note });
  };
  push('ai_fit', gig.ai_fit, SRC.model);
  push('pay', gig.pay, SRC.record);
  push('client_trust', gig.client_trust, SRC.record);

  const voteSum = votes.reduce((s, v) => s + v.p * v.weight, 0);

  const live = num(gig.liveness?.factor) ?? 1;
  const time = num(gig.time_fit?.factor) ?? 1;
  const gates = [
    { key: 'liveness', factor: live, source: gig.liveness?.source || SRC.record, note: gig.liveness?.note },
    { key: 'time_fit', factor: time, source: gig.time_fit?.source || SRC.input, note: gig.time_fit?.note },
  ];
  const gateProduct = gates.reduce((s, g) => s * g.factor, 1);
  const composite = voteSum * gateProduct;

  const closedGate = gates.find((g) => g.factor <= CONFIG.gate_zero);
  let rec, reason;
  if (closedGate) {
    rec = 'Skip';
    reason = `gated: ${closedGate.key} ≈ ${fmt(closedGate.factor)} (${closedGate.note}) — a closed gate zeroes the composite regardless of votes`;
  } else if (composite >= CONFIG.apply_threshold) {
    const softGate = gates.find((g) => g.factor < CONFIG.soft_gate);
    if (softGate) {
      rec = 'Maybe';
      reason = `above threshold (${fmt(composite)}) but one soft gate: ${softGate.key} ${fmt(softGate.factor)} (${softGate.note})`;
    } else { rec = 'Apply'; reason = `composite ${fmt(composite)} ≥ ${CONFIG.apply_threshold}, gates healthy`; }
  } else if (composite >= CONFIG.maybe_floor) {
    rec = 'Maybe';
    reason = `composite ${fmt(composite)} in the Maybe band [${CONFIG.maybe_floor}, ${CONFIG.apply_threshold})`;
  } else {
    rec = 'Skip';
    reason = `composite ${fmt(composite)} < ${CONFIG.maybe_floor} — your time is better spent elsewhere`;
  }

  // human override with a documented reason (you own the final call)
  let overridden = null;
  if (gig.override && gig.override.decision) {
    if (!gig.override.reason || !String(gig.override.reason).trim())
      overridden = { ...gig.override, _warning: 'override WITHOUT a documented reason — ignored (that is just ignoring the math)' };
    else overridden = gig.override;
  }

  return {
    gig_id: gig.gig_id ?? null,
    title: gig.title ?? null,
    url: gig.url ?? null,
    composite: Number(composite.toFixed(4)),
    recommendation: overridden && overridden.reason ? overridden.decision : rec,
    machine_recommendation: rec,
    reason,
    override: overridden,
    trace: {
      votes: votes.map((v) => ({ factor: v.key, value: v.p, weight: v.weight, contribution: Number((v.p * v.weight).toFixed(4)), source: v.source, note: v.note })),
      vote_sum: Number(voteSum.toFixed(4)),
      gates: gates.map((g) => ({ factor: g.key, multiplier: g.factor, source: g.source, note: g.note })),
      gate_product: Number(gateProduct.toFixed(4)),
      arithmetic: `(${votes.map((v) => `${v.p}·${v.weight}`).join(' + ') || '0'}) × ${gates.map((g) => g.factor).join(' × ')} = ${fmt(composite)}`,
    },
  };
}

function renderMarkdown(scored, when) {
  const o = [];
  o.push(`# Gig Scorer report — ${when}`);
  o.push(`\n*Votes: ai_fit ${CONFIG.weights.ai_fit}, pay ${CONFIG.weights.pay}, client_trust ${CONFIG.weights.client_trust}. Gates (multiplicative): liveness, time_fit. Apply ≥ ${CONFIG.apply_threshold}; Maybe ≥ ${CONFIG.maybe_floor}.*\n`);
  const by = (r) => scored.filter((s) => s.recommendation === r);
  const skipPct = (by('Skip').length / scored.length * 100).toFixed(0);
  o.push(`**Summary:** ${scored.length} gigs → Apply ${by('Apply').length} · Maybe ${by('Maybe').length} · Skip ${by('Skip').length}. **Skip rate ${skipPct}%** ${by('Skip').length / scored.length >= 0.5 ? '(healthy — a good run skips at least half)' : '(below the ~50% a healthy run skips; check the inputs)'}.`);
  o.push('\n| Gig | Composite | Rec | Why | Audit (term · value · weight · source) |');
  o.push('|---|---|---|---|---|');
  for (const s of [...scored].sort((a, b) => b.composite - a.composite)) {
    const audit = s.trace.votes.map((v) => `${v.factor} ${v.value}·${v.weight} [${v.source}]`).join('; ') +
      ` × ` + s.trace.gates.map((g) => `${g.factor} ${g.multiplier}[${g.source}]`).join('×');
    const recCell = s.override && s.override.reason ? `${s.recommendation} ⟵ override` : s.recommendation;
    o.push(`| ${s.title || s.gig_id || ''} | ${fmt(s.composite)} | **${recCell}** | ${s.reason} | ${audit} |`);
  }
  o.push('\n*Every term traces to its source. If you cannot explain a row term-by-term, distrust the recommendation before your confusion. You own the final call — override with a documented reason.*');
  return o.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  const src = args.find((a) => !a.startsWith('--'));
  if (!src || !fs.existsSync(src)) {
    console.error('Usage: gig-scorer.mjs <gigs.evidence.json> [--out-dir dir] [--md report.md]');
    process.exit(2);
  }
  const oi = args.indexOf('--out-dir'); const outDir = oi >= 0 ? args[oi + 1] : path.dirname(src);
  const mi = args.indexOf('--md'); const mdOut = mi >= 0 ? args[mi + 1] : path.join(outDir, 'gig-scores.md');

  let gigs = JSON.parse(fs.readFileSync(src, 'utf8'));
  if (!Array.isArray(gigs)) gigs = gigs.gigs || [];
  const scored = gigs.map((g) => scoreGig(g, CONFIG.weights));

  const when = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonOut = path.join(outDir, 'gig-scores.json');
  fs.writeFileSync(jsonOut, JSON.stringify({ _scorer: 'gig-scorer', _adapted_from: 'bayesian-role-scorer (ch.11)', generated: when, config: CONFIG, gigs: scored }, null, 2));
  fs.writeFileSync(mdOut, renderMarkdown(scored, when));

  const by = (r) => scored.filter((s) => s.recommendation === r).length;
  console.log(`✓ scored ${scored.length} gigs → Apply ${by('Apply')} · Maybe ${by('Maybe')} · Skip ${by('Skip')} (skip ${(by('Skip') / scored.length * 100).toFixed(0)}%)`);
  console.log(`  ${path.relative(process.cwd(), jsonOut)}  +  ${path.relative(process.cwd(), mdOut)}`);
  for (const s of scored) if (s.override?._warning) console.warn(`  ! ${s.title}: ${s.override._warning}`);
}

main();
