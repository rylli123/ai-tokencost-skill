# 验收清单

「装好了」不等于「能用了」。按顺序做完这几步再回报结果。

## 1. 宿主侧：条目是否被组合出来

```bash
# 需要带认证才能访问本机 Web 服务器；最省事的是直接看 index.html 里的启动图
curl -s -b "<cookie>" http://127.0.0.1:<port>/ | grep -o '@local/dsh-usage-cost'
```

`window.__DSH_BOOT__` 的 `entries[]` 里应出现本包，且 `url` 指向 `plugins/??@local/dsh-usage-cost/client.js&rev=...`，该地址应返回 200 且内容与磁盘上的 `client.js` 一致。

- 没出现 → profile 的 `bundles` 没加、依赖没装、或宿主没重启
- 出现但 404 → 宿主侧 bundle 路由问题，重启宿主

## 2. 页面侧：徽标是否渲染

在 DevTools Console（或任何能执行页面 JS 的通道）里：

```js
document.querySelector('.duc_pill')?.innerText   // "¥3.46·峰"
document.querySelector('[data-composer-stats]')  // 原生 token 用量徽标，必须同时存在
```

两个都拿到才算渲染成功；只有原生徽标说明本插件的槽位注册没生效。

## 3. 数值：手算一次

```js
// 会话累计
totals = { uncachedInputTokens, cacheReadTokens, cacheWriteTokens, outputTokens }
// 期望值（以 DeepSeek-V41-Flash 高峰为例）
(cacheReadTokens*0.04 + (uncachedInputTokens+cacheWriteTokens)*2 + outputTokens*8) / 1e6
```

和徽标文字比对到小数点后两位。不一致就查：模型 id 是否匹配、时段判断（工作日的 9–12 / 14–18 才是高峰）、币种。

## 4. 截图（最容易翻车的一步）

DPI 未声明的截图进程会把窗口底部裁掉，看起来像「徽标没出现」——先 `SetProcessDPIAware()`，再按物理分辨率抓整屏；或者干脆用 `document.querySelector('.duc_pill').innerText` 代替看图。

## 5. 交互

- 点徽标 → 弹层出现，位置在徽标上方且水平居中
- Esc 关闭、点外部关闭
- 窗口变窄时弹层不越界

## 6. 改价回归

改一条价 → `gen-pricing` → 重启 → 徽标数字应随之变化；同时 `node scripts/gen-pricing.mjs --check` 必须通过（否则 CI 会红）。

## 常见误判

| 现象 | 其实是什么 |
|---|---|
| 截图里没有徽标 | 截图被裁了，或页面还没加载完 |
| 「重启后没变化」 | 只关了窗口没退出进程；或改的是 `pricing.json` 没 `gen-pricing` |
| 数字正好是 0 | 会话还没跑过（`tokenUsage` 为空），或模型完全没匹配到 |
