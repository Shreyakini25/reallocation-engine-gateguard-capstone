#!/usr/bin/env node
// optjob.mjs — one-command runner for the opt-research-like-job mode.
//
// Chains the two real stages so the mode produces a score straight from the
// 80 Days to Stay dataset:
//   ① sponsorship-lookup.mjs  — join company → H-1B record → sponsorship vote
//   ② role-scorer.mjs (Ch.11) — combine votes × gates → Apply/Consider/Skip
//
//   npm run mode:optjob [roles-input.json] [--profile p.json] [--date YYYY-MM-DD]
//
// Defaults reproduce this repo's sample run. No network, no writes outside
// data/examples/ (enriched file) and reports/generated/ (the report).

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--')) || 'data/examples/research-like-roles-input.json';
const pi = args.indexOf('--profile');
const profile = pi >= 0 ? args[pi + 1] : 'data/examples/research-like-profile.json';
const di = args.indexOf('--date');
const date = di >= 0 ? args[di + 1] : '2026-07-06';

const enriched = 'data/examples/research-like-roles-enriched.json';
const outDir = 'reports/generated';
const md = path.join(outDir, `opt-research-like-job-${date}.md`);

const run = (script, extra) => execFileSync('node', [script, ...extra], { stdio: 'inherit' });

console.log('── ① sponsorship lookup (80-days join) ─────────────────────────');
run('scripts/modes/sponsorship-lookup.mjs', [input, '--out', enriched]);

console.log('\n── ② score & rank (Ch.11 combiner) ─────────────────────────────');
run('scripts/score/role-scorer.mjs', [enriched, '--profile', profile, '--out-dir', outDir, '--md', md]);

console.log(`\n✓ done — report: ${md}`);
