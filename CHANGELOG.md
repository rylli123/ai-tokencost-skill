# Changelog

所有 notable 变更记录在此。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [1.0.0] — 2026-10-27

### 新增
- 输入框下方（`conversation.composer.dock`）成本徽标，点击展开明细弹层
- 多模型价目目录 `pricing.json` + `scripts/gen-pricing.mjs` 内联生成
- 多币种（CNY / USD）与按模型取符号
- DeepSeek 分时定价：`cn-business` 规则（周一至周五 09:00–12:00、14:00–18:00 高峰，其余含周末为 50%）
- 缓存写入（Anthropic 1.25×）独立计价
- 价目 `status` / `source` / `checkedAt` 溯源，弹层内提示「价格待核对」
- `scripts/validate.mjs` 静态校验 + GitHub Actions CI

### 修正
- **时段规则错误**：早期版本把「00:30–08:30」当作空闲时段，与 DeepSeek 官方规则（工作日上午/下午两段才是高峰）不符，已按官方页面重写
- 弹层定位改为按面板实测宽度居中，挂载后再校正一次

### 已知限制
- 按会话累计值估算，不逐轮、不分段计费
- 仅 DeepSeek 两档价格已核对，其余为待核对参考值
- 不含 Search / Fetch 按次费用
