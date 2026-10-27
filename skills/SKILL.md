---
name: dsh-usage-cost
description: 给 DeepSeek Harness 的 Web GUI 安装/修改/验收「会话成本徽标」插件（输入框下方显示本会话 token 折算的金额，多模型、多币种、DeepSeek 分时定价）。当用户想在 Harness 里看到花了多少钱、想调整模型单价或时段规则、或这个徽标没出现/消失时使用。
whenToUse: 用户提到「成本/花费/多少钱/定价/价格表/token 费用」，或要给 Harness 加一个成本显示、改价、排查徽标不显示时。
---

# 会话成本徽标（dsh-usage-cost）

在 Harness Web GUI 的输入框下方 `conversation.composer.dock` 槽位注册一个徽标：

```
[时钟] 3 轮 230 步 · 204 tok/s   [数据库] 45M tok · 缓存命中 99.5%   [¥] ¥3.46 · 峰   [圆环] 35%
                                                                     ↑ 本技能装的
```

点击展开：模型、时段、缓存命中/未命中/输出三个桶的 token 与金额、合计、本次单价、价格核对状态。

**成本 = 命中×命中价 + 未命中×未命中价 + 输出×输出价，再 ÷ 1,000,000**（每百万 tokens 计价）。

## 先判断要做什么

| 用户诉求 | 动作 |
|---|---|
| 「帮我加成本显示」 | 走 §1 安装 → §2 验收 |
| 「价格不对 / 我要改价」 | 走 §3 改价 |
| 「没有徽标 / 徽标不见了」 | 走 §4 排查 |
| 「为什么这么贵」 | 走 §5 解释 |

## §1 安装

> 前提：插件是 **profile 级客户端 bundle**，不改 `app.asar`。装完**必须完整退出并重开应用**——这个 Electron 外壳不响应页面刷新（Ctrl+R / F5 无效）。

优先用 Harness 自己的安装通道：

```
plugin_manager { action: "install_bundle", target: "<仓库目录绝对路径或 github:you/dsh-usage-cost>" }
```

`install_bundle` 会写 profile 的 `package.json`、跑 pnpm、把包加进 `dsh.profile.bundles`。

没有 `plugin_manager` 工具时手动等价操作（**不要**手写 profile 的 `cordis.patch.yml`，bundle 自带的补丁已经 insert 了 `usage-cost` 这一行，重复会启动失败）：

```bash
cd "$DSH_PROFILE_DIR"
pnpm add "link:<插件目录>"        # 或 github:<you>/dsh-usage-cost
```

然后在该目录 `package.json` 的 `dsh.profile.bundles` 末尾加 `"@local/dsh-usage-cost"`。

**验收成功的唯一标准是重开应用后徽标出现**，而不是安装命令退出码。

## §2 验收

1. 重开应用 → 打开任一会话（新会话的空状态没有 dock，看不到徽标）
2. 输入框正下方那一排应出现 `¥x.xx · 峰` 或 `¥x.xx · 闲`（非分时模型的模型显示 `$x.xx`，没有 `· 峰/闲`）
3. 点它 → 弹层出现且能按 Esc / 点外部关闭
4. **数值必须手算对一次**：从会话状态读 `tokenUsage.totals`，按当前模型价目手算，和徽标对比

手算示例（DeepSeek-V41-Flash 高峰，¥/百万）：命中 19,027,328 × 0.04 + 未命中 146,764 × 2 + 输出 83,100 × 8 = ¥1.7194 → 徽标应显示 `¥1.72`。

会话累计 token 的位置（profile 存储）：

```
~/.dsh/storages/session_projcache/sessions/<sessionId>.json
  → record.rows.tokenUsage.val.totals { uncachedInputTokens, cacheReadTokens, cacheWriteTokens, outputTokens }
  → record.rows.modelSelection.val { lastUsed: { provider, model, reasoningEffort } }
```

截图核对时注意：**DPI 未声明的截图会把窗口底部裁掉**，看起来像「徽标没出现」。先 `SetProcessDPIAware()` 再截，或直接按当前屏幕物理分辨率截（如 1920×1080）。

## §3 改价

唯一数据源是仓库根的 `pricing.json`：

```json
{ "id": "deepseek-flash", "currency": "CNY",
  "cacheHit": 0.02, "cacheMiss": 1, "output": 4, "cacheWrite": 0,
  "band": "cn-business", "status": "verified",
  "source": "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/", "checkedAt": "2026-10-27" }
```

改完必须重新内联（浏览器包读不到包内文件）：

```bash
node scripts/gen-pricing.mjs      # 写进 client.js 的 generated:pricing 块
node scripts/validate.mjs         # 清单/id/币种/band 引用
```

然后**重启应用**。

新增模型：往 `rates[]` 加一条，`id` 用模型名、`aliases` 放旧名/别名，`band` 没有分时定价就写 `null`。
分时规则在 `bands` 里：`peakWindows`（周几 + 起止时刻）、`peakMultiplier`、`holidays`（法定节假日，默认空数组，需按年补）。

**DeepSeek 官方时段规则**（别再用「凌晨空闲」的旧假设）：北京时间**周一至周五 09:00–12:00、14:00–18:00 为高峰**，其余时段含周末与法定节假日全天为空闲，空闲价 = 高峰价的一半。

## §4 排查

| 现象 | 处理 |
|---|---|
| 装完/改完没徽标 | 没有整进程重启；页面刷新无效 |
| 重启后仍没有 | `client.js` 的 `window.__ModuleLoader__.load({ id })` 必须等于 `package.json` 的 `name`（`node scripts/validate.mjs` 会查） |
| 输入框整条消失 | 插件行是在运行态热插入的，可能挤掉 composer bar；重启应用恢复，之后别再手改补丁文件 |
| 改价不生效 | 忘记 `node scripts/gen-pricing.mjs`；或没重启 |
| profile 里 `cordis.patch.yml` 写不进去 | 被 WPS/Office 打开（有 `~$` 锁文件），关掉再写 |
| 徽标显示「未识别模型」 | 当前模型 id 没匹配上任何 `rates[].id/aliases`，按 fallback（DeepSeek Flash）估值并在弹层提示 |

## §5 解释成本

计费只看 **模型 × token 桶 × 时段**，与用哪个 agent 无关；但 agent 决定 token 结构：每步重发整个上下文，所以

```
成本 ≈ 步数 × 上下文长度 × 缓存命中率 × 模型单价
```

一个 200 步、每步约 300k 上下文、命中 99% 的编码会话，DeepSeek-V41-Flash 高峰约 ¥2.6；同样规模命中率为 0 时约 ¥12.6 —— **命中率是数量级差异的来源**。

不含的部分要说清楚：Search / Fetch 按次费用（DeepSeek ¥5 / 千次成功请求，2026-11-01 起计费）、子代理各自的成本、以及「估算不等于账单」。

## 不要做的事

- 不要改 `app.asar` 或内置包——升级会覆盖，且不在 profile 里
- 不要在 profile 的 `cordis.patch.yml` 里再插一行 `usage-cost`
- 不要把 `pricing.json` 的改动直接写进 `client.js` 的生成块（下次 `gen-pricing` 会覆盖）
- 不要声称「装好了」而没看到徽标；安装命令成功不等于页面渲染成功

## 给用户看的图文材料

仓库里的 [`GUIDE.md`](../GUIDE.md) 是面向最终用户的图文指南，包含：

- `docs/guide/flow.png` 使用流程六步
- `docs/guide/badge.png` / `panel.png` 徽标与明细怎么读
- `docs/guide/price.png` 同一份 token 画像下各模型的单次成本对比
- `docs/guide/cache.png` 缓存命中率对月成本的影响
- `docs/guide/roi.png` 上线回本点

用户问「怎么用 / 怎么选模型 / 上线要花多少」时，直接指到 GUIDE.md，不要重复生成图（图片由 `scripts/gen-docs.py` 生成，改价后重新跑一次即可同步）。
