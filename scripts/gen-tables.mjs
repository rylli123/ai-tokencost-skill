#!/usr/bin/env node
/**
 * 从 pricing.json 重新生成文档里的模型表，写进带标记的区块：
 *
 *   <!-- BEGIN:models -->   ...   <!-- END:models -->
 *
 * 这样改价后只需 `node scripts/gen-tables.mjs`，GUIDE / README 不会和价目表漂移。
 * `--check` 用于 CI：区块与 pricing.json 不一致时失败。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'pricing.json'), 'utf8'));
const FX = 7.2;
const BEGIN = '<!-- BEGIN:models -->';
const END = '<!-- END:models -->';

const SAMPLE = { hit: 9.0, miss: 1.0, out: 0.2 };

function sampleCny(rate) {
  const native = SAMPLE.hit * rate.cacheHit + SAMPLE.miss * rate.cacheMiss + SAMPLE.out * rate.output;
  return native * (rate.currency === 'USD' ? FX : 1);
}

function money(value) {
  return value >= 1 ? '¥' + value.toFixed(2) : '¥' + value.toFixed(3);
}

function status(rate) {
  if (rate.status === 'verified') return '✅ 已核对';
  return rate.cacheHitSource === 'measured' ? '⚠️ 待核对' : '⚠️ 待核对（缓存价估）';
}

function table(withScore) {
  const rows = catalog.rates
    .filter((rate) => rate.legacy !== true)
    .sort((a, b) => (b.benchScore ?? 0) - (a.benchScore ?? 0) || sampleCny(a) - sampleCny(b));

  const head = withScore
    ? '| 模型 | BenchGecko 均分（名次） | 输入 / 输出（每百万） | 缓存读 | 单样本成本 | 状态 |\n|---|---|---|---|---|---|'
    : '| 模型 | 输入 / 输出（每百万） | 缓存读 | 单样本成本 | 状态 |\n|---|---|---|---|---|';

  const body = rows.map((rate) => {
    const sym = rate.currency === 'CNY' ? '¥' : '$';
    const price = `${sym}${rate.cacheMiss} / ${sym}${rate.output}`;
    const hit = rate.cacheHit === 0 ? '—' : `${sym}${rate.cacheHit}`;
    const cost = money(sampleCny(rate)) + (rate.band === 'cn-business' ? '（空闲，高峰×2）' : '');
    const name = rate.label + (rate.rank ? ` (#${rate.rank})` : '');
    const score = rate.benchScore === undefined ? '—' : `${rate.benchScore}（#${rate.benchRank}）`;
    return withScore
      ? `| **${name}** | ${score} | ${price} | ${hit} | ${cost} | ${status(rate)} |`
      : `| **${name}** | ${price} | ${hit} | ${cost} | ${status(rate)} |`;
  });

  const note = [
    '',
    `> 单位：每百万 tokens；单样本成本按「100 步 × 每步 100k 上下文（90% 命中）+ 200k 输出」估算，美元按 1 USD = ${FX} CNY 折算。`,
    '> 均分是 BenchGecko 归一化平均（各模型被测基准不同，跨模型比较需谨慎）；`待核对` 表示价格尚未对着厂商官网确认。',
    '> 由 `node scripts/gen-tables.mjs` 从 `pricing.json` 生成，请勿手改本区块。',
  ].join('\n');

  return [head, ...body].join('\n') + note;
}

function rewrite(file, body) {
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf(BEGIN);
  const end = source.indexOf(END);
  if (start === -1 || end === -1 || end < start) throw new Error(`${path.basename(file)} 缺少 BEGIN/END:models 标记`);
  return source.slice(0, start + BEGIN.length) + '\n' + body + '\n' + source.slice(end);
}

const targets = [
  { file: path.join(ROOT, 'GUIDE.md'), withScore: true },
  { file: path.join(ROOT, 'README.md'), withScore: false },
];

const check = process.argv.includes('--check');
let stale = 0;
for (const { file, withScore } of targets) {
  const next = rewrite(file, table(withScore));
  const current = fs.readFileSync(file, 'utf8');
  if (next === current) {
    console.log(`✓ ${path.basename(file)} 表格已同步`);
    continue;
  }
  if (check) {
    console.error(`✗ ${path.basename(file)} 表格与 pricing.json 不一致`);
    stale += 1;
  } else {
    fs.writeFileSync(file, next);
    console.log(`✎ ${path.basename(file)} 表格已重写`);
  }
}
if (stale > 0) process.exit(1);
