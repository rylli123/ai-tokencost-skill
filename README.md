# ai-tokencost-skill
It estimates LLM token costs from model pricing and input/output token counts for single or batch calls. It supports cost estimation, bill reconciliation, and budget control in Agent/Skill workflows.根据模型单价和输入/输出 token 数，估算单次或批量 LLM 调用费用，适用于 Agent/Skill 流程中的成本预估、账单核对和预算控制；
适用于DeepSeek Harness，给其 Web GUI 加一个会话成本徽标：输入框下面那一排放着「几步 / 多少 token / 缓存命中率」，这个插件在它旁边补上「这些 token 折合多少钱」，点开能看到逐项明细。

![成本徽标](images/dock.png)

![明细弹层](images/panel.png)

要看图文教程？ [GUIDE指南](GUIDE.md) 里有完整的使用流程、多模型价格对比与优势、以及「用评测集测算上线成本与回本点」的七步法。

![使用流程](images/flow.png)

- 不改 app.asar，不动任何内置包；纯 profile 级客户端插件，升级 Harness 不会丢
- 多模型：DeepSeek V4.1-Flash / V4-Pro、Claude Sonnet 4.5 / Opus 4.1 / Haiku 4.5、GPT-5 / GPT-5 mini、Gemini 2.5 Pro / Flash
- 多币种：DeepSeek 按「元」，其余按「美元」，各自用自己的符号，不做汇率换算
- 分时定价：DeepSeek 的高峰/空闲时段（空闲 = 高峰的 50%）
- 缓存三态：命中 / 未命中 / 写入分别计价（Anthropic 的 cache write 是 1.25×，命中是 0.1×）
- 价格来源可追溯：每条价目带 status（verified / unverified）、source、checkedAt，弹层里直接显示

## 快速安装

### A. 在 Harness 里装（推荐）

让 Agent 在会话里执行（需要 plugin_manager 工具）：
```markdown
plugin_manager { action: "install_bundle", target: "<本仓库目录或 git URL>" }
```
### B. 用 pnpm 装进 profile
```markdown
cd "$DSH_PROFILE_DIR" # Windows: %USERPROFILE%\.dsh\profiles\<profile>
pnpm add "github:<you>/dsh-usage-cost"
```
然后在该 profile 的 package.json 里把它加进 dsh.profile.bundles：
```json
{ "dsh": { "profile": { "bundles": [
 "@deepseek-ai/dsh-base",
 "@deepseek-ai/dsh-web-app",
 "@local/dsh-usage-cost"
] } } }
```
### C. 从源码手动装

- 把 package.json、index.js、client.js、cordis.patch.yml、pricing.json 拷进一个目录
- 在 profile 目录 pnpm add link:<那个目录>（或 file:）
- 把 @local/dsh-usage-cost 加进 dsh.profile.bundles

> **装完必须完整退出并重开应用**。 这个 Electron 外壳不吃页面刷新（Ctrl+R / F5 无效），热插入新插件行还可能把输入框那条挤掉；重启一次就恢复正常。

## 计费模型
```markdown
成本 = 缓存命中 token × 命中价 + 未命中 token × 未命中价 + 输出 token × 输出价 （再 ÷ 1,000,000）
```
- **三个桶互斥**，直接来自 Harness 的 tokenUsage 投影：cacheReadTokens / uncachedInputTokens / cacheWriteTokens / outputTokens
- cacheWriteTokens 有独立单价就单独算，没有就并入未命中
- 分时定价用 bands 规则描述：命中 peakWindows 且不在 holidays 里就乘 peakMultiplier
- 徽标显示 ¥ 或 $，取决于模型自己的 currency

### DeepSeek 的时段规则（官方原文）

> 空闲时段价格为高峰时段价格的一半。北京时间周一至周五（不含中国法定节假日）9:00–12:00、14:00–18:00 为高峰时段；其余时段，包括周末及中国法定节假日全天均为空闲时段。

实现见 pricing.json 的 bands["cn-business"]：peakWindows 两条（09:00–12:00、14:00–18:00，周一至周五），peakMultiplier: 2。
**holidays 默认是空数组**——法定节假日每年由国务院公布，请按需补：
```markdown
"holidays": ["2026-10-01", "2026-10-02"]
```
> 早期版本用的是「00:30–08:30 空闲」的错误假设，1.0.0 已按官方规则重写。

### 支持的模型

价格单位：每百万 tokens。**只有 DeepSeek 两档是核对过的**，其余标记为 unverified（弹层里会显示「价格待核对」），请以厂商官网为准。
<!-- BEGIN:models -->
| 模型 | 输入 / 输出（每百万） | 缓存读 | 单样本成本 | 状态 |
|---|---|---|---|---|
| **GPT-5.5 Pro (#2)** | $30 / $180 | $3 | ¥669.60 | ⚠️ 待核对（缓存价估） |
| **GPT-6 Astra (#3)** | $10 / $50 | $1 | ¥208.80 | ⚠️ 待核对（缓存价估） |
| **DeepSeek V3.2 Speciale (#4)** | $0.4 / $1.2 | $0.04 | ¥7.20 | ⚠️ 待核对（缓存价估） |
| **GPT-6.1 Sol (#5)** | $2 / $10 | $0.1 | ¥35.28 | ⚠️ 待核对 |
| **Claude Opus 5.5 (#6)** | $4 / $20 | $0.2 | ¥70.56 | ✅ 已核对 |
| **Step 3.5 Flash (#7)** | $0.1 / $0.3 | $0.01 | ¥1.80 | ⚠️ 待核对（缓存价估） |
| **Gemini 4 Argon (#8)** | $2 / $10 | $0.5 | ¥61.20 | ⚠️ 待核对（缓存价估） |
| **GPT-5 Chat (#9)** | $1.25 / $10 | $0.125 | ¥31.50 | ⚠️ 待核对 |
| **GPT-5.1-Codex-Max (#12)** | $1.25 / $10 | $0.125 | ¥31.50 | ⚠️ 待核对（缓存价估） |
| **Claude Opus 5 (#13)** | $5 / $25 | $0.5 | ¥104.40 | ⚠️ 待核对（缓存价估） |
| **Claude Fable 5.1 (#14)** | $10 / $50 | $0.25 | ¥160.20 | ✅ 已核对 |
| **Claude Opus 4.6 (Fast) (#15)** | $30 / $150 | $3 | ¥626.40 | ⚠️ 待核对（缓存价估） |
| **Claude Fable 5 (#16)** | $10 / $50 | $0.5 | ¥176.40 | ⚠️ 待核对（缓存价估） |
| **MiMo-V2-Flash (#18)** | $0.09 / $0.29 | $0.009 | ¥1.65 | ⚠️ 待核对（缓存价估） |
| **Claude Sonnet 5.5 (#19)** | $2 / $10 | $0.1 | ¥35.28 | ⚠️ 待核对（缓存价估） |
| **GPT-5.2-Codex (#20)** | $1.75 / $14 | $0.175 | ¥44.10 | ⚠️ 待核对（缓存价估） |
| **GPT-5.4 Pro (#21)** | $30 / $180 | $3 | ¥669.60 | ⚠️ 待核对（缓存价估） |
| **GPT-5.6 Sol (#23)** | $2 / $10 | $0.2 | ¥41.76 | ⚠️ 待核对（缓存价估） |
| **GPT-6 Sol (#24)** | $2 / $10 | $0.2 | ¥41.76 | ⚠️ 待核对（缓存价估） |
| **GPT-5.1-Codex (#25)** | $1.25 / $10 | $0.125 | ¥31.50 | ⚠️ 待核对（缓存价估） |
| **Grok Build 0.1 (#26)** | $1 / $2 | $0.1 | ¥16.56 | ⚠️ 待核对（缓存价估） |
| **GPT-5.6 Terra (#28)** | $2 / $12 | $0.2 | ¥44.64 | ⚠️ 待核对（缓存价估） |
| **Kimi K3 (#54)** | $3 / $15 | $0.3 | ¥62.64 | ✅ 已核对 |
| **GPT-5.5 (#58)** | $5 / $30 | $0.5 | ¥111.60 | ⚠️ 待核对 |
| **DeepSeek-V41-Flash** | ¥1 / ¥4 | ¥0.02 | ¥1.98（空闲，高峰×2） | ✅ 已核对 |
| **DeepSeek-V4-Pro** | ¥4.5 / ¥13.5 | ¥0.15 | ¥8.55（空闲，高峰×2） | ✅ 已核对 |
> 单位：每百万 tokens；单样本成本按「100 步 × 每步 100k 上下文（90% 命中）+ 200k 输出」估算，美元按 1 USD = 7.2 CNY 折算。
> 均分是 BenchGecko 归一化平均（各模型被测基准不同，跨模型比较需谨慎）；`待核对` 表示价格尚未对着厂商官网确认。
> 由 `node scripts/gen-tables.mjs` 从 `pricing.json` 生成，请勿手改本区块。
<!-- END:models -->

DeepSeek 两个价格档位分别对应官方表格的两列；deepseek-v4-flash、deepseek-v4-flash-vision-exp、deepseek-chat 等旧名会解析到 Flash 价。

### 以后调价怎么办

改 pricing.json → node scripts/gen-pricing.mjs（把目录内联进 client.js，因为浏览器包读不到包里的文件）→ 重启应用。CI 会跑 --check，忘记重新生成会直接失败。

### Agent 与时序：为什么「agent 的账单」和「聊天的账单」不是一个量级
计费只取决于 **模型 × token 桶 × 时段**，与哪个 agent 无关；但 agent 决定了 token 的结构：每一步都把整个上下文重发一遍，所以「步数 × 上下文长度 × 缓存命中率」才是成本的主项。

| Agent | 典型 token 结构 | 成本敏感点 |
|---|---|---|
| **Claude Code** | 长系统提示 + 密集工具循环，强依赖 prompt caching | 单价高；命中率高时成本主要由**输出 token**决定 |
| **Codex** | 以文件读写、终端为主的工具循环，单步输出长 | 输出 token 与长上下文重发 |
| **WorkBuddy / CodeBuddy** | 办公/表格类任务，中英混排 | 中文每 token 承载信息更少，同字数消耗更多 token |
| **OpenCode / OpenClaw / Hermes / Reasonix / Qoder** | 开源 CLI agent，前缀缓存策略各异 | 缓存命中率差异直接造成数倍差别 |
| **DeepSeek Harness（本插件所在）** | 多步工具循环 + 子代理 + 后台任务 | 子代理各自计费，会话汇总才看得出真实成本 |

以上 agent 都能通过 OpenAI / Anthropic 兼容接口跑 DeepSeek 模型，官方接入索引：api-docs.deepseek.com（接入 Agent 工具）。


一个量级参考（DeepSeek-V41-Flash，高峰价）：200 步、每步约 300k 上下文、缓存命中 99% →
```markdown
命中 59.4M × 0.04 = ¥2.38
未命中 0.6M × 2    = ¥0.12
输出 0.06M × 8     = ¥0.048
────────────────────────────
合计 ≈ ¥2.55
```
同样的步数与上下文，缓存全不命中则是 ¥12.6：命中率就是钱包的分水岭。这也是 why 徽标旁边那个「缓存命中 99%」值得盯着看。

#### 局限与免责
- 按整段会话累计 token × 当前所选模型估算；同一会话中途切过模型不会分段计价
- 徽标按当前时刻的时段取价，不回溯每次调用发生的时间
- 不含 Search / Fetch 的按次费用（DeepSeek：¥5 / 1,000 次成功请求；2026-11-01 起计费，Harness/Claude Code/Codex 经 Server 端工具调用此前免费）
- 同时选用了 unverified 的价格时，弹层会明确提示「价格待核对」
- 估算值，不是账单；对账请以厂商控制台为准
- 子代理会话各自有成本，本徽标只反映当前会话的累计投影


### 排障
| 现象 | 原因 / 处理 |
|---|---|
| 装完没有徽标 | 没重启应用；这个外壳不支持刷新页面，必须整进程退出重开 |
| 重启后仍没有 | `client.js` 里的 id 必须与 `package.json` 的 `name` 完全一致（CI 会查） |
| 输入框整条消失 | 插件行是在运行中热插入的，可能把 composer bar 挤掉；重启应用即可，之后不要手改 profile 的补丁文件 |
| 改 `pricing.json` 不生效 | 忘了 `node scripts/gen-pricing.mjs`；浏览器包读不到包内文件，必须内联 |
| profile 里 `cordis.patch.yml` 写不进去 | 被 WPS / Office 打开了（会留 `~$` 锁文件），关掉再改 |
| 徽标消失了但输入框还在 | 看设置 → 插件列表里这一行是否被禁用 |

### 仓库结构
```markdown
client.js            浏览器半：徽标 + 弹层（定价块由脚本内联）
index.js             Host 半：空 apply()，只为让 Loader 条目存在
cordis.patch.yml     bundle 补丁：插入 usage-cost 这一行
pricing.json         价目目录（唯一数据源）
pricing.schema.json  目录结构
scripts/gen-pricing.mjs   把 pricing.json 内联进 client.js / --check
scripts/validate.mjs      清单与目录的静态校验
skill/SKILL.md       给 Agent 用的技能：安装、改价、验收
docs/                截图
.github/workflows     CI：node --check + 价格块同步 + 校验
```
#### 开发
```markdown

node scripts/gen-pricing.mjs --check   # 价格块是否同步
node scripts/validate.mjs              # 清单 / id / 币种 / band 引用
npm run check                          # 两者都跑

```
#### 发布

本机没有 git 时（'git' 不是内部或外部命令），先在别的机器或装好 Git 后再执行：
```markdown

git init
git add .
git commit -m "feat: session cost badge for DeepSeek Harness"
git branch -M main
git remote add origin https://github.com/<you>/dsh-usage-cost.git
git push -u origin main
```
发布前把 package.json 里的 `your-org`、`your-name`、LICENSE 的年份署名替换掉。

### License

MIT
