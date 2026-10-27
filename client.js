window.__ModuleLoader__.load({
	id: "@local/dsh-usage-cost",
	factory(require) {
		"use strict";

		const React = require("react");
		const ReactDOM = require("react-dom");
		const h = React.createElement;

		const PLUGIN_ID = "@local/dsh-usage-cost";
		const CSS_ID = PLUGIN_ID + "/usage-cost.css";
		const FALLBACK_MODEL = "deepseek-flash";

		// ---------------------------------------------------------------------
		// 定价目录：由 scripts/gen-pricing.mjs 从 pricing.json 生成，勿手改。
		// 单位：每百万 tokens（CNY 为元，USD 为美元），峰值时段由 bands 规则描述。
		// ---------------------------------------------------------------------
		// >>> generated:pricing — produced by scripts/gen-pricing.mjs from pricing.json; do not edit
  const PRICING_CATALOG =   {
    "$schema": "./pricing.schema.json",
    "version": 2,
    "updatedAt": "2026-10-27",
    "unit": "per_million_tokens",
    "defaultCurrency": "CNY",
    "sources": {
      "deepseek": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/",
      "kimi": "https://platform.kimi.com/docs/pricing/chat",
      "benchgecko": "https://benchgecko.ai/models (as of 2026-10-26, CC BY 4.0)"
    },
    "rates": [
      {
        "id": "deepseek-flash",
        "provider": "deepseek",
        "label": "DeepSeek-V41-Flash",
        "aliases": [
          "deepseek-v4-flash",
          "deepseek-v4-flash-vision-exp",
          "deepseek-chat"
        ],
        "currency": "CNY",
        "cacheHit": 0.02,
        "cacheMiss": 1,
        "output": 4,
        "cacheWrite": 0,
        "band": "cn-business",
        "status": "verified",
        "cacheHitSource": "measured",
        "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/",
        "checkedAt": "2026-10-27",
        "rank": null,
        "note": "官方分时价，空闲=高峰/2"
      },
      {
        "id": "deepseek-v4-pro",
        "provider": "deepseek",
        "label": "DeepSeek-V4-Pro",
        "aliases": [
          "deepseek-pro",
          "deepseek-reasoner"
        ],
        "currency": "CNY",
        "cacheHit": 0.15,
        "cacheMiss": 4.5,
        "output": 13.5,
        "cacheWrite": 0,
        "band": "cn-business",
        "status": "verified",
        "cacheHitSource": "measured",
        "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/",
        "checkedAt": "2026-10-27",
        "rank": null
      },
      {
        "id": "gpt-5-5-pro",
        "provider": "openai",
        "label": "GPT-5.5 Pro",
        "aliases": [
          "gpt-5.5-pro"
        ],
        "currency": "USD",
        "cacheHit": 3,
        "cacheMiss": 30,
        "output": 180,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 2,
        "benchScore": 98.3,
        "benchRank": 2
      },
      {
        "id": "gpt-6-astra",
        "provider": "openai",
        "label": "GPT-6 Astra",
        "aliases": [
          "gpt-6-astra",
          "gpt6-astra"
        ],
        "currency": "USD",
        "cacheHit": 1,
        "cacheMiss": 10,
        "output": 50,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 3,
        "benchScore": 95.8,
        "benchRank": 3
      },
      {
        "id": "deepseek-v3-2-speciale",
        "provider": "deepseek",
        "label": "DeepSeek V3.2 Speciale",
        "aliases": [
          "deepseek-v3.2-speciale"
        ],
        "currency": "USD",
        "cacheHit": 0.04,
        "cacheMiss": 0.4,
        "output": 1.2,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 4,
        "note": "开源权重，聚合站美元价",
        "benchScore": 95.2,
        "benchRank": 4
      },
      {
        "id": "gpt-6-1-sol",
        "provider": "openai",
        "label": "GPT-6.1 Sol",
        "aliases": [
          "gpt-6.1-sol",
          "gpt-6-1"
        ],
        "currency": "USD",
        "cacheHit": 0.1,
        "cacheMiss": 2,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "measured",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 5,
        "note": "flex 档 1/5；fast 4/20；ultrafast 12/60",
        "benchScore": 93.4,
        "benchRank": 5
      },
      {
        "id": "claude-opus-5-5",
        "provider": "anthropic",
        "label": "Claude Opus 5.5",
        "aliases": [
          "claude-opus-5.5",
          "claude-opus-5-5-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.2,
        "cacheMiss": 4,
        "output": 20,
        "cacheWrite": 5,
        "band": null,
        "status": "verified",
        "cacheHitSource": "measured",
        "source": "https://bestagent.dev/zh/agent-cache-pricing-measured-2026/",
        "checkedAt": "2026-10-27",
        "rank": 6,
        "note": "缓存读 0.05×（特例）；5min 写入 1.25×、1h 写入 2×；Batch /",
        "tokenizerTaxPct": 73,
        "benchScore": 91.8,
        "benchRank": 6,
        "cacheWrite1h": 8
      },
      {
        "id": "step-3-5-flash",
        "provider": "stepfun",
        "label": "Step 3.5 Flash",
        "aliases": [
          "step-3.5-flash"
        ],
        "currency": "USD",
        "cacheHit": 0.01,
        "cacheMiss": 0.1,
        "output": 0.3,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 7,
        "note": "开源权重",
        "benchScore": 89.5,
        "benchRank": 7
      },
      {
        "id": "gemini-4-argon",
        "provider": "google",
        "label": "Gemini 4 Argon",
        "aliases": [
          "gemini-4-argon"
        ],
        "currency": "USD",
        "cacheHit": 0.5,
        "cacheMiss": 2,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 8,
        "benchScore": 89.2,
        "benchRank": 8
      },
      {
        "id": "gpt-5-chat",
        "provider": "openai",
        "label": "GPT-5 Chat",
        "aliases": [
          "gpt-5-chat-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.125,
        "cacheMiss": 1.25,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "measured",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 9,
        "benchScore": 89,
        "benchRank": 9
      },
      {
        "id": "gpt-5-1-codex-max",
        "provider": "openai",
        "label": "GPT-5.1-Codex-Max",
        "aliases": [
          "gpt-5.1-codex-max"
        ],
        "currency": "USD",
        "cacheHit": 0.125,
        "cacheMiss": 1.25,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 12,
        "benchScore": 85.6,
        "benchRank": 12
      },
      {
        "id": "claude-opus-5",
        "provider": "anthropic",
        "label": "Claude Opus 5",
        "aliases": [
          "claude-opus-5-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.5,
        "cacheMiss": 5,
        "output": 25,
        "cacheWrite": 6.25,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 13,
        "benchScore": 84.6,
        "benchRank": 13,
        "cacheWrite1h": 10,
        "note": "缓存读 0.1×；1h 写入 2×"
      },
      {
        "id": "claude-fable-5-1",
        "provider": "anthropic",
        "label": "Claude Fable 5.1",
        "aliases": [
          "claude-fable-5.1",
          "claude-fable-5-1-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.25,
        "cacheMiss": 10,
        "output": 50,
        "cacheWrite": 12.5,
        "band": null,
        "status": "verified",
        "cacheHitSource": "measured",
        "source": "https://blog.laozhang.ai/zh/posts/claude-fable-5-1-api-pricing",
        "checkedAt": "2026-10-27",
        "rank": 14,
        "note": "缓存读 0.025×（特例）；5min 写入 1.25×、1h 写入 2×；Batch /",
        "tokenizerTaxPct": 73,
        "benchScore": 84.1,
        "benchRank": 14,
        "cacheWrite1h": 20
      },
      {
        "id": "claude-opus-4-6-fast",
        "provider": "anthropic",
        "label": "Claude Opus 4.6 (Fast)",
        "aliases": [
          "claude-opus-4-6-fast"
        ],
        "currency": "USD",
        "cacheHit": 3,
        "cacheMiss": 30,
        "output": 150,
        "cacheWrite": 37.5,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 15,
        "benchScore": 83.3,
        "benchRank": 15
      },
      {
        "id": "claude-fable-5",
        "provider": "anthropic",
        "label": "Claude Fable 5",
        "aliases": [
          "claude-fable-5-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.5,
        "cacheMiss": 10,
        "output": 50,
        "cacheWrite": 12.5,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 16,
        "benchScore": 82,
        "benchRank": 16,
        "cacheWrite1h": 20
      },
      {
        "id": "mimo-v2-flash",
        "provider": "xiaomi",
        "label": "MiMo-V2-Flash",
        "aliases": [
          "mimo-v2-flash"
        ],
        "currency": "USD",
        "cacheHit": 0.009,
        "cacheMiss": 0.09,
        "output": 0.29,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 18,
        "note": "开源权重",
        "benchScore": 81.7,
        "benchRank": 18
      },
      {
        "id": "claude-sonnet-5-5",
        "provider": "anthropic",
        "label": "Claude Sonnet 5.5",
        "aliases": [
          "claude-sonnet-5.5",
          "claude-sonnet-5-5-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.1,
        "cacheMiss": 2,
        "output": 10,
        "cacheWrite": 2.5,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 19,
        "benchScore": 81.7,
        "benchRank": 19,
        "note": "缓存读自 2026-10-07 由 .20 降至 .10"
      },
      {
        "id": "gpt-5-2-codex",
        "provider": "openai",
        "label": "GPT-5.2-Codex",
        "aliases": [
          "gpt-5.2-codex"
        ],
        "currency": "USD",
        "cacheHit": 0.175,
        "cacheMiss": 1.75,
        "output": 14,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 20,
        "benchScore": 80.7,
        "benchRank": 20
      },
      {
        "id": "gpt-5-4-pro",
        "provider": "openai",
        "label": "GPT-5.4 Pro",
        "aliases": [
          "gpt-5.4-pro"
        ],
        "currency": "USD",
        "cacheHit": 3,
        "cacheMiss": 30,
        "output": 180,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 21,
        "benchScore": 79.7,
        "benchRank": 21
      },
      {
        "id": "gpt-5-6-sol",
        "provider": "openai",
        "label": "GPT-5.6 Sol",
        "aliases": [
          "gpt-5.6-sol"
        ],
        "currency": "USD",
        "cacheHit": 0.2,
        "cacheMiss": 2,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 23,
        "benchScore": 78.9,
        "benchRank": 23
      },
      {
        "id": "gpt-6-sol",
        "provider": "openai",
        "label": "GPT-6 Sol",
        "aliases": [
          "gpt-6-sol"
        ],
        "currency": "USD",
        "cacheHit": 0.2,
        "cacheMiss": 2,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 24,
        "benchScore": 77.9,
        "benchRank": 24
      },
      {
        "id": "gpt-5-1-codex",
        "provider": "openai",
        "label": "GPT-5.1-Codex",
        "aliases": [
          "gpt-5.1-codex"
        ],
        "currency": "USD",
        "cacheHit": 0.125,
        "cacheMiss": 1.25,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 25,
        "benchScore": 77.7,
        "benchRank": 25
      },
      {
        "id": "grok-build-0-1",
        "provider": "xai",
        "label": "Grok Build 0.1",
        "aliases": [
          "grok-build-0.1"
        ],
        "currency": "USD",
        "cacheHit": 0.1,
        "cacheMiss": 1,
        "output": 2,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 26,
        "benchScore": 77.1,
        "benchRank": 26
      },
      {
        "id": "gpt-5-6-terra",
        "provider": "openai",
        "label": "GPT-5.6 Terra",
        "aliases": [
          "gpt-5.6-terra"
        ],
        "currency": "USD",
        "cacheHit": 0.2,
        "cacheMiss": 2,
        "output": 12,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 28,
        "benchScore": 75.3,
        "benchRank": 28
      },
      {
        "id": "kimi-k3",
        "provider": "moonshot",
        "label": "Kimi K3",
        "aliases": [
          "kimi-k3",
          "kimi-k3-0901"
        ],
        "currency": "USD",
        "cacheHit": 0.3,
        "cacheMiss": 3,
        "output": 15,
        "cacheWrite": 3.6,
        "band": null,
        "status": "verified",
        "cacheHitSource": "measured",
        "source": "https://platform.kimi.com/docs/pricing/chat",
        "checkedAt": "2026-10-27",
        "rank": 54,
        "note": "Moonshot 官方端点；缓存写入按 5min/1h TTL 分档，此处取 5min 档；聚合站最低至 $0.19/$8.11",
        "tokenizerTaxPct": 93,
        "benchScore": 65.8,
        "benchRank": 54
      },
      {
        "id": "gpt-5-5",
        "provider": "openai",
        "label": "GPT-5.5",
        "aliases": [
          "gpt-5.5"
        ],
        "currency": "USD",
        "cacheHit": 0.5,
        "cacheMiss": 5,
        "output": 30,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "measured",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "rank": 58,
        "note": "flex 档 2.5/15",
        "benchScore": 64.9,
        "benchRank": 58
      },
      {
        "id": "claude-sonnet-4-5",
        "provider": "anthropic",
        "label": "Claude Sonnet 4.5",
        "aliases": [
          "claude-sonnet-4-5-latest",
          "claude-4-5-sonnet"
        ],
        "currency": "USD",
        "cacheHit": 0.3,
        "cacheMiss": 3,
        "output": 15,
        "cacheWrite": 3.75,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "claude-opus-4-1",
        "provider": "anthropic",
        "label": "Claude Opus 4.1",
        "aliases": [
          "claude-opus-4-1-latest"
        ],
        "currency": "USD",
        "cacheHit": 1.5,
        "cacheMiss": 15,
        "output": 75,
        "cacheWrite": 18.75,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "claude-haiku-4-5",
        "provider": "anthropic",
        "label": "Claude Haiku 4.5",
        "aliases": [
          "claude-haiku-4-5-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.1,
        "cacheMiss": 1,
        "output": 5,
        "cacheWrite": 1.25,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "gpt-5",
        "provider": "openai",
        "label": "GPT-5",
        "aliases": [
          "gpt-5-codex",
          "gpt-5-chat"
        ],
        "currency": "USD",
        "cacheHit": 0.125,
        "cacheMiss": 1.25,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "measured",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "gpt-5-mini",
        "provider": "openai",
        "label": "GPT-5 mini",
        "aliases": [
          "gpt-5-mini-latest"
        ],
        "currency": "USD",
        "cacheHit": 0.025,
        "cacheMiss": 0.25,
        "output": 2,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "gemini-2-5-pro",
        "provider": "google",
        "label": "Gemini 2.5 Pro",
        "aliases": [
          "gemini-2.5-pro"
        ],
        "currency": "USD",
        "cacheHit": 0.31,
        "cacheMiss": 1.25,
        "output": 10,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      },
      {
        "id": "gemini-2-5-flash",
        "provider": "google",
        "label": "Gemini 2.5 Flash",
        "aliases": [
          "gemini-2.5-flash",
          "gemini-2-5-flash-lite"
        ],
        "currency": "USD",
        "cacheHit": 0.075,
        "cacheMiss": 0.3,
        "output": 2.5,
        "cacheWrite": 0,
        "band": null,
        "status": "unverified",
        "cacheHitSource": "estimated",
        "source": "benchgecko",
        "checkedAt": "2026-10-26",
        "legacy": true
      }
    ],
    "bands": {
      "cn-business": {
        "timezoneOffsetMinutes": 480,
        "peakMultiplier": 2,
        "offPeakMultiplier": 1,
        "peakWindows": [
          {
            "weekdays": [
              1,
              2,
              3,
              4,
              5
            ],
            "start": "09:00",
            "end": "12:00"
          },
          {
            "weekdays": [
              1,
              2,
              3,
              4,
              5
            ],
            "start": "14:00",
            "end": "18:00"
          }
        ],
        "holidays": [],
        "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/"
      }
    },
    "excludedTop30": [
      {
        "rank": 1,
        "name": "Claude Mythos Preview",
        "reason": "预览版，无公开报价"
      },
      {
        "rank": 10,
        "name": "Qwen2.5 72B Instruct Abliterated",
        "reason": "社区微调权重，无 API 报价，且仅测过简单基准"
      },
      {
        "rank": 11,
        "name": "DeepSeek-V2 (MoE-236B)",
        "reason": "2024 年模型，仅测过旧基准"
      },
      {
        "rank": 17,
        "name": "PaLM 2-L",
        "reason": "已下线，无报价"
      },
      {
        "rank": 22,
        "name": "phi-3-small 7.4B",
        "reason": "小模型，非 agent 场景"
      },
      {
        "rank": 27,
        "name": "Qwen2 7B Instruct",
        "reason": "2024 年小模型，非 agent 场景"
      },
      {
        "rank": 29,
        "name": "gpt-oss-120b (free)",
        "reason": "免费开源权重，无计价意义"
      },
      {
        "rank": 30,
        "name": "DeepSeek R1 Distill Qwen 14B",
        "reason": "蒸馏小模型，无 API 报价"
      }
    ],
    "extras": [
      {
        "id": "deepseek-search",
        "label": "DeepSeek Search",
        "currency": "CNY",
        "unit": "per_1000_successful_requests",
        "price": 5,
        "effectiveFrom": "2026-11-01T00:00:00+08:00",
        "note": "Harness / Claude Code / Codex 经 Server 端工具调用时此前免费",
        "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/"
      },
      {
        "id": "deepseek-fetch",
        "label": "DeepSeek Fetch",
        "currency": "CNY",
        "unit": "per_1000_successful_requests",
        "price": 5,
        "effectiveFrom": "2026-11-01T00:00:00+08:00",
        "note": "同上",
        "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/"
      }
    ],
    "languageNote": {
      "source": "https://benchgecko.ai/model/kimi-k3 (Gecko Test: Tokenizer Tax, as of 2026-10-26)",
      "unit": "同样内容，非英文比英文多消耗的 token 百分比；成本倍数 = 1 + pct/100",
      "newTokenizerNote": "Claude 4.7+ 换新分词器：同文本比 Sonnet 4.6 及更早多约 30% token（来源 blog.laozhang.ai）"
    },
    "benchNote": "BenchGecko 归一化均分（各模型被测过的基准集合不同，跨模型比较需谨慎）· as of 2026-10-26"
  };
// <<< generated:pricing

		const RATES = PRICING_CATALOG.rates ?? [];
		const BANDS = PRICING_CATALOG.bands ?? {};
		const CATALOG_UPDATED_AT = PRICING_CATALOG.updatedAt ?? "";

		const SYMBOLS = { CNY: "¥", USD: "$" };

		// ---------------------------------------------------------------------
		// 定价解析
		// ---------------------------------------------------------------------

		/** 归一化模型 id：小写、去掉 provider 前缀、`.`/`_` 统一为 `-`。 */
		function normalizeId(value) {
			return String(value).toLowerCase().replace(/^[^/]*\//, "").replace(/[._]/g, "-").trim();
		}

		/** 按 id → 别名 → 家族前缀 的顺序解析一个模型的价目。 */
		function resolveRate(modelId) {
			if (typeof modelId !== "string" || modelId === "") return null;
			const key = normalizeId(modelId);
			for (const rate of RATES) {
				if (normalizeId(rate.id) === key) return rate;
				for (const alias of rate.aliases ?? []) {
					if (normalizeId(alias) === key) return rate;
				}
			}
			for (const rate of RATES) {
				const base = normalizeId(rate.id);
				if (key === base || key.startsWith(base + "-")) return rate;
			}
			return null;
		}

		function hhmm(value) {
			const parts = String(value).split(":").map(Number);
			return parts[0] * 60 + parts[1];
		}

		/** 该时刻在给定时段规则下是否处于高峰。 */
		function isPeak(now, bandKey) {
			if (bandKey === null || bandKey === undefined) return false;
			const band = BANDS[bandKey];
			if (band === undefined) return false;
			const local = new Date(now.getTime() + (band.timezoneOffsetMinutes ?? 0) * 60000);
			const date = local.toISOString().slice(0, 10);
			if ((band.holidays ?? []).includes(date)) return false;
			const weekday = local.getUTCDay();
			const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
			for (const window of band.peakWindows ?? []) {
				if ((window.weekdays ?? []).includes(weekday) === false) continue;
				if (minutes >= hhmm(window.start) && minutes < hhmm(window.end)) return true;
			}
			return false;
		}

		/** 高峰/空闲的展示名；无分时定价的模型返回「标准」。 */
		function bandLabelOf(bandKey, peak) {
			if (bandKey === null || bandKey === undefined || BANDS[bandKey] === undefined) return "标准";
			return peak ? "高峰" : "空闲";
		}

		/** 三个互斥计费桶与总额。缓存写入按未命中价计费（无独立价时）。 */
		function readBuckets(usage) {
			const hit = typeof usage?.cacheReadTokens === "number" ? usage.cacheReadTokens : 0;
			const write = typeof usage?.cacheWriteTokens === "number" ? usage.cacheWriteTokens : 0;
			const miss = (typeof usage?.uncachedInputTokens === "number" ? usage.uncachedInputTokens : 0) + write;
			const out = typeof usage?.outputTokens === "number" ? usage.outputTokens : 0;
			return { hit, miss, write, out, tokens: hit + miss + out };
		}

		const intFormat = new Intl.NumberFormat("en-US");

		function formatMoney(value, currency) {
			const symbol = SYMBOLS[currency] ?? "";
			if (!Number.isFinite(value) || value <= 0) return symbol + "0";
			if (value < 0.000001) return "<" + symbol + "0.000001";
			const digits = value < 0.01 ? 6 : value < 1 ? 4 : 2;
			return symbol + value.toFixed(digits);
		}

		function formatRate(value) {
			return String(Math.round(value * 1e6) / 1e6);
		}

		/** 会话 modelSelection 投影的容错取值。 */
		function pickSelection(value) {
			if (value === null || typeof value !== "object") return null;
			const candidates = [value.current, value.next, value.lastUsed, value.selected, value];
			for (const candidate of candidates) {
				if (candidate !== null && typeof candidate === "object" && typeof candidate.model === "string") return candidate;
			}
			return null;
		}

		// ---------------------------------------------------------------------
		// 图标（不引入任何 Harness Client 包）
		// ---------------------------------------------------------------------

		function IconCost() {
			return h(
				"svg",
				{ viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
				h("circle", { cx: 8, cy: 8, r: 6.25, stroke: "currentColor", strokeWidth: 1.5 }),
				h("path", {
					d: "M9.6 5.4H7.35c-.75 0-1.35.5-1.35 1.2 0 .7.6 1.1 1.6 1.35l.9.22c.55.14.85.4.85.78 0 .45-.45.75-1.15.75H6.15M8 4.2v7.6",
					stroke: "currentColor",
					strokeWidth: 1.3,
					strokeLinecap: "round",
				}),
			);
		}

		const CSS = [
			".duc_root{position:relative;display:inline-flex;min-width:0;max-width:100%;justify-content:center}",
			".duc_pill{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:1px 8px;border:none;border-radius:999px;background:none;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));font-variant-numeric:tabular-nums;white-space:nowrap;cursor:pointer}",
			".duc_pill:hover,.duc_pill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".duc_pill svg{flex:none;width:14px;height:14px}",
			".duc_label{overflow:hidden;text-overflow:ellipsis;min-width:0}",
			".duc_sep{color:var(--dsw-alias-separator-primary);margin:0 6px}",
			".duc_panel{position:fixed;z-index:1100;box-sizing:border-box;width:max-content;min-width:min(320px,calc(100vw - 24px));max-width:min(440px,calc(100vw - 24px));max-height:calc(100vh - 120px);overflow-y:auto;padding:16px;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;cursor:default}",
			".duc_title{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:8px;color:var(--dsw-alias-label-primary);font-weight:500}",
			".duc_titleLabel{display:inline-flex;align-items:center;gap:6px;min-width:0}",
			".duc_titleLabel svg{flex:none;width:14px;height:14px}",
			".duc_titleValue{font-variant-numeric:tabular-nums;white-space:nowrap}",
			".duc_rule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:10px}",
			".duc_details{display:grid;grid-template-columns:minmax(88px,auto) minmax(0,1fr) auto;gap:6px 12px;margin:0;color:var(--dsw-alias-label-tertiary)}",
			".duc_details dt,.duc_details dd{margin:0;min-width:0}",
			".duc_details dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}",
			".duc_details dt.duc_total,.duc_details dd.duc_total{color:var(--dsw-alias-label-primary);font-weight:500}",
			".duc_note{margin-top:10px;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));font-size:11px;line-height:16px}",
			".duc_warn{color:var(--dsw-alias-state-warning-primary,inherit)}",
		].join("");

		// ---------------------------------------------------------------------
		// Composer dock 成本徽标
		// ---------------------------------------------------------------------

		function CostPill({ useProjection }) {
			const usage = useProjection("tokenUsage");
			const selection = useProjection("modelSelection");
			const [open, setOpen] = React.useState(false);
			const [pos, setPos] = React.useState(null);
			const rootRef = React.useRef(null);
			const panelRef = React.useRef(null);

			const chosen = pickSelection(selection);
			const modelId = chosen !== null && typeof chosen.model === "string" ? chosen.model : null;
			const resolved = resolveRate(modelId);
			const rate = resolved ?? resolveRate(FALLBACK_MODEL);
			const known = resolved !== null;

			const currency = rate?.currency ?? "CNY";
			const peak = isPeak(new Date(), rate?.band ?? null);
			const band = BANDS[rate?.band ?? ""];
			const factor = band === undefined ? 1 : peak ? band.peakMultiplier ?? 2 : band.offPeakMultiplier ?? 1;
			const price = {
				hit: (rate?.cacheHit ?? 0) * factor,
				miss: (rate?.cacheMiss ?? 0) * factor,
				write: (rate?.cacheWrite ?? 0) * factor,
				out: (rate?.output ?? 0) * factor,
			};
			const buckets = readBuckets(usage);
			const costs = {
				hit: (buckets.hit * price.hit) / 1e6,
				miss: (buckets.miss * price.miss) / 1e6 + (buckets.write * price.write) / 1e6,
				out: (buckets.out * price.out) / 1e6,
			};
			const total = costs.hit + costs.miss + costs.out;
			const bandName = bandLabelOf(rate?.band ?? null, peak);
			const modelLabel = rate?.label ?? (modelId ?? "未知模型");
			const verified = rate?.status === "verified";

			const place = React.useCallback(() => {
				const button = rootRef.current;
				if (button === null) return;
				const rect = button.getBoundingClientRect();
				const width = panelRef.current?.offsetWidth ?? 340;
				const left = Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12));
				const bottom = Math.max(12, window.innerHeight - rect.top + 8);
				setPos((prev) => prev !== null && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.bottom - bottom) < 0.5 ? prev : { left, bottom });
			}, []);

			const attachPanel = React.useCallback((node) => {
				panelRef.current = node;
				if (node !== null) place();
			}, [place]);

			React.useEffect(() => {
				if (!open) {
					setPos(null);
					return undefined;
				}
				place();
				const onPointerDown = (event) => {
					if (panelRef.current?.contains(event.target) === true) return;
					if (rootRef.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown, true);
				window.addEventListener("resize", place);
				window.addEventListener("scroll", place, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
					window.removeEventListener("resize", place);
					window.removeEventListener("scroll", place, true);
				};
			}, [open, place]);

			if (usage === undefined || buckets.tokens === 0) return null;

			const cacheShare = buckets.hit + buckets.miss > 0 ? buckets.hit / (buckets.hit + buckets.miss) : null;
			const ariaLabel = "本次会话成本估算 " + formatMoney(total, currency) + "（" + modelLabel + "，" + bandName + "）";
			const rows = [
				["缓存命中输入", buckets.hit, costs.hit, false],
				["缓存未命中输入", buckets.miss, costs.miss, false],
				["输出", buckets.out, costs.out, false],
				["合计", buckets.tokens, total, true],
			];

			const panel = open && pos !== null
				? h(
						"div",
						{
							ref: attachPanel,
							className: "duc_panel",
							role: "dialog",
							"aria-label": "会话成本估算",
							style: { left: pos.left + "px", bottom: pos.bottom + "px" },
						},
						h("div", { className: "duc_title" },
							h("span", { className: "duc_titleLabel" }, h(IconCost, null), "成本估算"),
							h("span", { className: "duc_titleValue" }, "总 " + formatMoney(total, currency))),
						h("div", { className: "duc_rule", "aria-hidden": true }),
						h("dl", { className: "duc_details" },
							h("dt", null, "模型"),
							h("dd", { style: { textAlign: "left" } }, modelLabel),
							h("dd", null, modelId ?? "未知"),
							h("dt", null, "时段"),
							h("dd", { style: { textAlign: "left" } }, bandName),
							h("dd", null, factor === 1 ? "×1" : "×" + String(Math.round(factor * 1e3) / 1e3)),
							...rows.flatMap(([label, tokens, cost, strong]) => [
								h("dt", { key: label + "-t", className: strong ? "duc_total" : undefined }, label),
								h("dd", { key: label + "-n" }, intFormat.format(tokens) + " tok"),
								h("dd", { key: label + "-c", className: strong ? "duc_total" : undefined }, formatMoney(cost, currency)),
							])),
						cacheShare !== null
							? h("div", { className: "duc_note" }, "缓存命中率 " + Math.round(cacheShare * 100) + "% · 命中 " + intFormat.format(buckets.hit) + " / 未命中 " + intFormat.format(buckets.miss))
							: null,
						known === false
							? h("div", { className: "duc_note duc_warn" }, "未识别当前模型，按 " + (RATES.find((item) => item.id === FALLBACK_MODEL)?.label ?? FALLBACK_MODEL) + " 单价估算。")
							: null,
						h("div", { className: "duc_note" },
							"单价（" + (SYMBOLS[currency] ?? "") + "/百万 tokens，本次 " + bandName + "）：命中 " + formatRate(price.hit)
								+ " · 未命中 " + formatRate(price.miss)
								+ (price.write > 0 ? " · 缓存写入 " + formatRate(price.write) : "")
								+ " · 输出 " + formatRate(price.out) + "。"),
						h("div", { className: verified ? "duc_note" : "duc_note duc_warn" },
							verified
								? "价格已核对（" + (rate?.checkedAt ?? CATALOG_UPDATED_AT) + "）"
								: "价格待核对，请以厂商官网为准（" + (rate?.checkedAt ?? CATALOG_UPDATED_AT) + " 抓取）"),
						h("div", { className: "duc_note" }, "按会话累计 token 与所选模型单价估算，仅作参考，非账单金额。"),
					)
				: null;

			return h(
				"span",
				{ ref: rootRef, className: "duc_root" },
				h(
					"button",
					{
						type: "button",
						className: "duc_pill",
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						"aria-label": ariaLabel,
						title: ariaLabel,
						onClick: () => {
							setOpen((value) => !value);
						},
					},
					h(IconCost, null),
					h("span", { className: "duc_label" },
						formatMoney(total, currency),
						bandName === "标准" ? null : h("span", { className: "duc_sep", "aria-hidden": true }, "·"),
						bandName === "标准" ? null : (peak ? "峰" : "闲")),
				),
				panel !== null ? ReactDOM.createPortal(panel, document.body) : null,
			);
		}

		// ---------------------------------------------------------------------
		// 插件
		// ---------------------------------------------------------------------

		return {
			inject: ["slots"],
			apply(ctx) {
				ctx.effect(() => {
					const existing = document.querySelector('style[data-plugin-css="' + CSS_ID + '"]');
					if (existing !== null) return () => {};
					const tag = document.createElement("style");
					tag.dataset.plugin = PLUGIN_ID;
					tag.dataset.pluginCss = CSS_ID;
					tag.textContent = CSS;
					document.head.appendChild(tag);
					return () => {
						tag.remove();
					};
				}, "usage-cost: composer-dock styles");

				ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
					name: "conversation.composer.dock",
					id: "usage-cost",
					order: 1,
				}, CostPill));
			},
		};
	},
});
