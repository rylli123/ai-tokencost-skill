# 发布与迁移：把这个插件搬到另一台机器 / 发到 GitHub

这个压缩包解开就是仓库根目录，以下是「拿到手 → 改名字 → 推上去 → 别人能装」的完整顺序。

## 0. 先把占位符换掉（1 分钟）

| 文件 | 要改的地方 |
|---|---|
| `package.json` | `"author": "your-name"`、`repository.url` / `homepage` / `bugs.url` 里的 `<your-org>` |
| `LICENSE` | `Copyright (c) 2026 <your-name>` |
| `README.md`、`README.en.md` | 安装命令里的 `<you>/dsh-usage-cost` |

> 包名 `@local/dsh-usage-cost` 保持不动最省事：它是 DSH 本地 bundle 的惯例（官方模板也用 `@local/`），改名要同时改 `package.json` 的 `name` 与 `client.js` 里 `window.__ModuleLoader__.load({ id })`，两处必须一致（`node scripts/validate.mjs` 会检查）。

## 1. 推到 GitHub

```bash
# 解压后进入目录
cd dsh-usage-cost

git init
git add -A
git commit -m "feat: session cost badge for DeepSeek Harness"
git branch -M main

# 在 GitHub 上先建一个空仓库（不要勾选 README / .gitignore）
git remote add origin https://github.com/<your-org>/dsh-usage-cost.git
git push -u origin main
```

- Windows 建议用 **Git for Windows**（自带 Git Bash）；PowerShell 里同样可用。
- 没有 git 的机器：先装 <https://git-scm.com/downloads>，或用 GitHub Desktop / GitHub 网页的 "upload an existing file" 直接拖整个目录上传（`.github/` 目录需要手动开启显示隐藏文件）。
- 想让 CI 亮起来：仓库 Settings → Actions → General 允许 workflow 即可，`.github/workflows/ci.yml` 会自动跑语法检查、价格块同步与目录校验。

## 2. 打一个 release（可选）

Tag 与 `package.json` 的 `version` 保持一致：

```bash
git tag v1.0.0
git push origin v1.0.0
```

在 GitHub 的 Releases 页面基于该 tag 建 release，把 `dsh-usage-cost-1.0.0.zip` 作为附件传上去，别人就能直接下载安装包。

## 3. 别人怎么装（写进 README 的三条路）

```bash
# A. 在 Harness 里（推荐，需 plugin_manager 工具）
plugin_manager { action: "install_bundle", target: "github:<your-org>/dsh-usage-cost" }

# B. 手动
cd "$DSH_PROFILE_DIR"
pnpm add "github:<your-org>/dsh-usage-cost"
# 再把 "@local/dsh-usage-cost" 加进该 profile 的 dsh.profile.bundles

# C. 本机源码
pnpm add "link:<解压后的目录>"
```

**装完必须完整退出并重开 Harness**（这个 Electron 外壳不响应页面刷新）。

## 4. 要不要发 npm

可以，但不是必需（GitHub 安装已经够用）。要发的话注意：

- `@local/` 这个 scope 在 npm 上不属于你 → 要么改成自己的 scope（如 `@your-name/dsh-usage-cost`），要么用不带 scope 的名字；改名规则同上（`client.js` 的 id 要同步）
- `package.json` 的 `files` 已经收敛，只会打包 `client.js`、`index.js`、`cordis.patch.yml`、`pricing.json`、`pricing.schema.json`、文档、`docs/`、`skill/`
- 发布前跑一遍：`node scripts/gen-pricing.mjs --check && node scripts/validate.mjs`

```bash
npm login
npm publish            # scoped 包需要加 --access public
```

## 5. 发布前自查清单

- [ ] `node --check client.js`、`node --check index.js` 通过
- [ ] `node scripts/gen-pricing.mjs --check` 通过（价格块没忘记重新生成）
- [ ] `node scripts/validate.mjs` 通过（id 一致、币种合法、band 引用存在）
- [ ] `pricing.json` 里该核的价格已改成 `"status": "verified"`，并填了 `source` 与 `checkedAt`
- [ ] README 里的截图路径（`docs/...`）都能打开
- [ ] 占位符 `<your-org>` / `<your-name>` 已全部替换（`grep -rn "your-org\|your-name" .`）
- [ ] LICENSE 年份与署名正确

## 6. 常见问题

| 问题 | 处理 |
|---|---|
| `'git' 不是内部或外部命令` | 装 Git for Windows，或用 GitHub Desktop / 网页上传 |
| 上传后 `.github/` 没出现 | Windows 资源管理器默认隐藏点开头文件，用 `dir /a` 或 Git Bash 确认，网页上传时手动选中 |
| 换行变成 CRLF 导致 CI 报错 | 仓库根目录已放 `.gitignore`，另建议加 `.gitattributes`（`* text=auto eol=lf`）或在 `git config core.autocrlf false` 后重新提交 |
| 装到 profile 后徽标不出现 | 99% 是没重启应用，或 `name` 与 `client.js` 的 id 不一致 |
| 想撤销安装 | 从 `dsh.profile.bundles` 与 `dependencies` 移除 `@local/dsh-usage-cost`，`pnpm install`，重启 |
