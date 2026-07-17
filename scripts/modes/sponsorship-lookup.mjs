#!/usr/bin/env node
// sponsorship-lookup.mjs — populate the `sponsorship` vote from RECORDS.
//
// Closes the opt-research-like-job recipe's [TODO: DATA SOURCE]: instead of a
// hand-set sponsorship number, look each role's company up in the 80 Days to
// Stay mapped dataset (SEC Form D funding × DOL/H-1B approvals) and derive
// sponsorship.p / .tier from the H-1B approval record. Every enriched term is
// labelled source:"record" and carries its evidence, so the downstream scorer
// (npm run score, Ch.11) stays fully auditable (P3: provenance or it isn't
// evidence).
//
//   node scripts/modes/sponsorship-lookup.mjs <roles-input.json> [--out enriched.json] [--data csv]
//
// Input roles carry company/title/fit/liveness/timeline (NO sponsorship).
// Output roles gain sponsorship:{p,tier,source:"record",evidence:{...}} and are
// ready to pipe into `npm run score`.

import fs from 'node:fs';

const DATA_DEFAULT = 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv';

// ── minimal RFC-4180-ish CSV line parser (handles quoted commas + "" escapes) ─
function parseLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else { if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c; }
  }
  out.push(cur); return out;
}

// normalise a company name for matching: uppercase, drop punctuation, strip
// trailing legal suffixes so "Addepar" matches "ADDEPAR INC".
const SUFFIXES = /\b(INC|LLC|LP|LTD|CORP|CORPORATION|CO|COMPANY|GROUP|HOLDINGS|TECHNOLOGIES|TECH|LABS|INSIGHTS)\b/g;
function norm(name) {
  return String(name || '').toUpperCase().replace(SUFFIXES, ' ').replace(/[^A-Z0-9]/g, '').trim();
}

const numOr = (x) => { const n = parseFloat(x); return isFinite(n) ? n : null; };

// ── tier + probability from the H-1B approval record ─────────────────────────
// Proven: a real, high-volume, high-rate approval history.
// Likely / Possible: some record but softer (the scorer demotes Apply→Consider).
// Unknown: not found in the mapping (honest — not the same as "None").
function tierFrom({ approvals, rate, funded }) {
  if (approvals == null) {
    return funded
      ? { p: 0.30, tier: 'Possible', why: 'in SEC funding data but no H-1B approval record mapped' }
      : { p: 0.20, tier: 'Unknown',  why: 'not found in the 80-days mapping' };
  }
  if (approvals >= 10 && (rate == null || rate >= 75)) return { p: 0.90, tier: 'Proven',   why: `${approvals} H-1B approvals${rate != null ? `, ${rate.toFixed(0)}% rate` : ''}` };
  if (approvals >= 3)  return { p: 0.60, tier: 'Likely',   why: `${approvals} H-1B approvals (moderate history)` };
  if (approvals >= 1)  return { p: 0.45, tier: 'Possible', why: `${approvals} H-1B approval(s) (thin history)` };
  return { p: 0.05, tier: 'None', why: '0 H-1B approvals on record' };
}

function main() {
  const args = process.argv.slice(2);
  const src = args.find((a) => !a.startsWith('--'));
  const oi = args.indexOf('--out'); const out = oi >= 0 ? args[oi + 1] : 'data/examples/research-like-roles-enriched.json';
  const di = args.indexOf('--data'); const dataPath = di >= 0 ? args[di + 1] : DATA_DEFAULT;
  if (!src || !fs.existsSync(src)) { console.error('Usage: sponsorship-lookup.mjs <roles-input.json> [--out enriched.json] [--data csv]'); process.exit(2); }
  if (!fs.existsSync(dataPath)) { console.error(`data source not found: ${dataPath}`); process.exit(2); }

  // build the lookup map from the 80-days mapped CSV
  const lines = fs.readFileSync(dataPath, 'utf8').split(/\r?\n/);
  const hdr = parseLine(lines[0]);
  const col = (n) => hdr.indexOf(n);
  const cName = col('company_name'), cAppr = col('Total Approvals'), cDen = col('Total Denials'),
        cRate = col('Approval_Rate'), cSal = col('median_salary_offered'), cTitles = col('top_job_titles_sponsored'),
        cFund = col('total_funding'), cStage = col('latest_funding_stage'), cFdate = col('latest_funding_date');
  const map = new Map();
  for (let k = 1; k < lines.length; k++) {
    if (!lines[k]) continue;
    const f = parseLine(lines[k]);
    const key = norm(f[cName]);
    if (key && !map.has(key)) map.set(key, f);
  }
  console.log(`loaded ${map.size} companies from ${dataPath}`);

  let roles = JSON.parse(fs.readFileSync(src, 'utf8'));
  if (!Array.isArray(roles)) roles = roles.roles || [];

  let matched = 0;
  const enriched = roles.map((r) => {
    const rec = map.get(norm(r.company));
    const approvals = rec ? numOr(rec[cAppr]) : null;
    const denials = rec ? numOr(rec[cDen]) : null;
    const rate = rec ? numOr(rec[cRate]) : null;
    const funded = rec ? (numOr(rec[cFund]) != null) : false;
    const { p, tier, why } = tierFrom({ approvals, rate, funded });
    if (rec) matched++;
    return {
      ...r,
      sponsorship: {
        p, tier, source: 'record',
        evidence: {
          matched: !!rec,
          dataset: '80-days-to-stay/SEC_DOL_H1b_data_mapped.csv',
          note: why,
          h1b_approvals: approvals, h1b_denials: denials, approval_rate_pct: rate,
          median_salary_offered: rec ? numOr(rec[cSal]) : null,
          latest_funding_stage: rec ? (rec[cStage] || null) : null,
          latest_funding_date: rec ? (rec[cFdate] || null) : null,
          top_job_titles_sponsored: rec ? (rec[cTitles] || null) : null,
        },
      },
    };
  });

  fs.writeFileSync(out, JSON.stringify(enriched, null, 2));
  console.log(`✓ enriched ${enriched.length} roles — ${matched} matched a record, ${enriched.length - matched} not found`);
  console.log(`  → ${out}`);
  for (const r of enriched) {
    const e = r.sponsorship.evidence;
    console.log(`  ${r.company}: ${r.sponsorship.tier} (p=${r.sponsorship.p}) — ${e.note}`);
  }
}

main();
