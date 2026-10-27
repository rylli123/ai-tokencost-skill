#!/usr/bin/env node
/**
 * Static checks for the plugin bundle — no dependencies, runs in CI.
 *
 *   node scripts/validate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = (message) => {
	console.error('✗ ' + message);
	process.exitCode = 1;
};
const ok = (message) => console.log('✓ ' + message);

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'pricing.json'), 'utf8'));
const client = fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8');
const host = fs.readFileSync(path.join(ROOT, 'index.js'), 'utf8');

// --- manifest ---------------------------------------------------------------
if (typeof pkg.dsh?.client?.platform !== 'string') fail('package.json: dsh.client.platform is required');
if (pkg.dsh?.client?.platform !== 'web') fail('package.json: dsh.client.platform must be "web"');
if (pkg.exports?.['./client'] === undefined) fail('package.json: exports["./client"] is required');
if (pkg.dsh?.bundle?.patch === undefined) fail('package.json: dsh.bundle.patch is required');
if (!/export\s+function\s+apply/.test(host)) fail('index.js: the host half must export apply()');
if (pkg.license === undefined) fail('package.json: license is required for a public repository');

// --- browser half -----------------------------------------------------------
const declaredId = /window\.__ModuleLoader__\.load\(\{\s*id:\s*"([^"]+)"/.exec(client)?.[1];
if (declaredId === undefined) fail('client.js: missing window.__ModuleLoader__.load({ id })');
else if (declaredId !== pkg.name) fail(`client.js id "${declaredId}" must equal package name "${pkg.name}"`);
if (client.includes('const PRICING_CATALOG = {}') && catalog.rates.length > 0) {
	fail('client.js: pricing block looks ungenerated — run node scripts/gen-pricing.mjs');
}
if (/require\(['"]@deepseek-ai\//.test(client)) fail('client.js: must not import Harness Client packages');

// --- catalog ----------------------------------------------------------------
const ids = new Set();
const validCurrency = new Set(['CNY', 'USD']);
for (const rate of catalog.rates ?? []) {
	for (const field of ['id', 'provider', 'label', 'currency', 'cacheHit', 'cacheMiss', 'output']) {
		if (rate[field] === undefined) fail(`pricing.json: "${rate.id ?? '?'}" is missing ${field}`);
	}
	if (ids.has(rate.id)) fail(`pricing.json: duplicate id "${rate.id}"`);
	ids.add(rate.id);
	if (!validCurrency.has(rate.currency)) fail(`pricing.json: "${rate.id}" has unknown currency ${rate.currency}`);
	for (const key of ['cacheHit', 'cacheMiss', 'cacheWrite', 'output']) {
		const value = rate[key];
		if (value !== undefined && (typeof value !== 'number' || value < 0)) fail(`pricing.json: "${rate.id}.${key}" must be a non-negative number`);
	}
	if (rate.band !== null && rate.band !== undefined && catalog.bands?.[rate.band] === undefined) {
		fail(`pricing.json: "${rate.id}" references unknown band "${rate.band}"`);
	}
	if (rate.status !== undefined && !['verified', 'unverified'].includes(rate.status)) {
		fail(`pricing.json: "${rate.id}.status" must be verified or unverified`);
	}
}

const verified = (catalog.rates ?? []).filter((rate) => rate.status === 'verified').length;
const total = (catalog.rates ?? []).length;
if (process.exitCode === undefined || process.exitCode === 0) {
	ok(`manifest ok — ${total} models (${verified} verified, ${total - verified} unverified)`);
	ok(`client half registers "${declaredId}"`);
}
