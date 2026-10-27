#!/usr/bin/env node
/**
 * Inline `pricing.json` into `client.js`.
 *
 * The browser bundle cannot read package files at runtime, so the catalog is
 * embedded as a JS object literal between two markers. Edit `pricing.json`
 * (never the generated block), then run:
 *
 *   node scripts/gen-pricing.mjs          # rewrite the block
 *   node scripts/gen-pricing.mjs --check  # fail if the block is stale (CI)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'pricing.json');
const CLIENT = path.join(ROOT, 'client.js');
const START = '// >>> generated:pricing — produced by scripts/gen-pricing.mjs from pricing.json; do not edit';
const END = '// <<< generated:pricing';

function render(catalog) {
  const body = JSON.stringify(catalog, null, 2)
    .split('\n')
    .map((line) => '  ' + line)
    .join('\n');
  return `${START}\n  const PRICING_CATALOG = ${body};\n${END}`;
}

function splice(source, block) {
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('client.js is missing the generated:pricing markers');
  }
  return source.slice(0, start) + block + source.slice(end + END.length);
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
for (const key of ['rates', 'bands']) {
  if (catalog[key] === undefined) throw new Error(`pricing.json is missing "${key}"`);
}
const block = render(catalog);
const current = fs.readFileSync(CLIENT, 'utf8');
const next = splice(current, block);

if (process.argv.includes('--check')) {
  if (current !== next) {
    console.error('client.js pricing block is stale — run: node scripts/gen-pricing.mjs');
    process.exit(1);
  }
  console.log(`pricing block in sync (${catalog.rates.length} models, updated ${catalog.updatedAt})`);
} else {
  if (current === next) console.log('pricing block already up to date');
  else {
    fs.writeFileSync(CLIENT, next);
    console.log(`inlined ${catalog.rates.length} models into client.js`);
  }
}
