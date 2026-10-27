# dsh-usage-cost

A session **cost badge** for the [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/) Web GUI. It sits next to the existing composer stats row (`steps · tokens · cache hit`) and answers "what did this session cost so far?", with a click-through breakdown per billing bucket.

![badge](docs/dock.png)

![breakdown](docs/panel.png)

**Illustrated guide:** [GUIDE.md](GUIDE.md) (Chinese) — install flow, cross-model price/strength comparison, and a 7-step method for costing an eval set and finding the break-even point.

- Client-only, profile-level bundle: no `app.asar` patching, survives Harness upgrades
- Multi-model: DeepSeek V4.1-Flash / V4-Pro, Claude Sonnet 4.5 / Opus 4.1 / Haiku 4.5, GPT-5 / GPT-5 mini, Gemini 2.5 Pro / Flash
- Currency-aware: CNY (`¥`) for DeepSeek, USD (`$`) for the rest — no FX conversion
- Time-of-day pricing for DeepSeek (off-peak = 50% of peak), with the official window rule
- Cache-aware: hit / miss / write priced separately (Anthropic cache write = 1.25×, hit = 0.1×)
- Every rate carries `status` (`verified` / `unverified`), `source` and `checkedAt`; the popover shows it

## Install

```bash
cd "$DSH_PROFILE_DIR"
pnpm add "github:<you>/dsh-usage-cost"
```

Add `@local/dsh-usage-cost` to `dsh.profile.bundles` in that profile's `package.json`, then **fully restart the app** (this Electron shell ignores a page reload, and a hot-inserted plugin row can evict the composer bar).

## How the cost is computed

```
cost = hitTokens × hitRate + missTokens × missRate + outputTokens × outputRate   (per 1,000,000)
```

Buckets come from the Harness `tokenUsage` projection (`cacheReadTokens`, `uncachedInputTokens`, `cacheWriteTokens`, `outputTokens`). Rules live in `pricing.json`; `node scripts/gen-pricing.mjs` inlines that catalog into `client.js` because a browser bundle cannot read package files at runtime.

Only the two DeepSeek tiers are verified against the vendor page; the other rows are marked `unverified` on purpose — check them against each vendor's pricing page before trusting them.

## Model catalog

| model id | currency | cache hit | miss | output | cache write | status |
|---|---|---|---|---|---|---|
| `deepseek-flash` | ¥ | 0.02 | 1 | 4 | — | ✅ verified |
| `deepseek-v4-pro` | ¥ | 0.15 | 4.5 | 13.5 | — | ✅ verified |
| `claude-sonnet-4-5` | $ | 0.3 | 3 | 15 | 3.75 | ⚠️ unverified |
| `claude-opus-4-1` | $ | 1.5 | 15 | 75 | 18.75 | ⚠️ unverified |
| `claude-haiku-4-5` | $ | 0.1 | 1 | 5 | 1.25 | ⚠️ unverified |
| `gpt-5` | $ | 0.125 | 1.25 | 10 | — | ⚠️ unverified |
| `gpt-5-mini` | $ | 0.025 | 0.25 | 2 | — | ⚠️ unverified |
| `gemini-2-5-pro` | $ | 0.31 | 1.25 | 10 | — | ⚠️ unverified |
| `gemini-2-5-flash` | $ | 0.075 | 0.3 | 2.5 | — | ⚠️ unverified |

## Why agent bills dwarf chat bills

Billing depends only on **model × token bucket × time band** — not on the agent. But an agent re-sends the whole context on every step, so cost is driven by `steps × context size × cache-hit rate`. A 200-step coding session at ~300k context with 99% cache hits costs about ¥2.6 on DeepSeek-V41-Flash peak; the same session with no cache hits costs about ¥12.6. That's why the cache-hit figure next to the badge matters.

## Limitations

Estimate, not an invoice. Priced by the session-wide totals and the currently selected model (a mid-session model switch is not split), at the current time band. Search / Fetch per-request fees are not included.

## License

MIT
