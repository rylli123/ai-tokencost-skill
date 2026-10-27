"""Generate the illustrated guide images for dsh-usage-cost (docs/guide/*.png)."""
import json, math, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "guide")
os.makedirs(OUT, exist_ok=True)
REG, BOLD = r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\msyhbd.ttc"
INK, MUTED, LINE, BG, SOFT = (31, 35, 40), (106, 115, 125), (208, 215, 222), (255, 255, 255), (246, 248, 250)
BLUE, ORANGE, GREEN, RED, PURPLE = (36, 123, 191), (214, 122, 0), (28, 138, 90), (196, 60, 60), (150, 90, 190)


def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size, index=0)


def rrect(d, box, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def center(d, box, text, font, fill=INK):
    w = d.textlength(text, font=font)
    asc, desc = font.getmetrics()
    d.text((box[0] + (box[2] - box[0] - w) / 2, box[1] + (box[3] - box[1] - (asc + desc)) / 2), text, font=font, fill=fill)


def arrow(d, p0, p1, color=LINE, width=3, head=9):
    d.line([p0, p1], fill=color, width=width)
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    for s in (-1, 1):
        a = ang + s * 0.45
        d.line([p1, (p1[0] - head * math.cos(a), p1[1] - head * math.sin(a))], fill=color, width=width)


def circle_num(d, xy, n, r=13, fill=BLUE):
    d.ellipse((xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r), fill=fill)
    center(d, (xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r), str(n), f(15, True), (255, 255, 255))


def draw_flow():
    W, H = 1240, 620
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 30), "dsh-usage-cost 使用流程", font=f(30, True), fill=INK)
    d.text((40, 76), "六步：装一次 → 看徽标 → 点明细 → 按需改价 → 用评测集测算上线成本", font=f(17), fill=MUTED)
    steps = [
        ("安装并重启", ["plugin_manager install_bundle", "或 pnpm add 到 profile", "然后完整退出并重开应用"]),
        ("打开一个会话", ["输入框下方那一排出现", "「￥x.xx · 峰/闲」徽标", "空会话（新会话）没有 dock"]),
        ("点徽标看明细", ["模型 / 时段 / 三个计费桶", "合计与本次单价", "价格是否已核对"]),
        ("改价（可选）", ["改 pricing.json", "node scripts/gen-pricing.mjs", "重启应用生效"]),
        ("跑评测集", ["每个会话 ≈ 一次评测运行", "记下徽标金额与 token", "换模型再跑一次对比"]),
        ("测算上线成本", ["单次成本 × 月调用量", "× 重试系数 ÷ 缓存收益", "与收益对比求回本点"]),
    ]
    x0, y0, cw, ch, gx, gy = 40, 130, 372, 186, 32, 44
    for i, (title, lines) in enumerate(steps):
        col, row = i % 3, i // 3
        x, y = x0 + col * (cw + gx), y0 + row * (ch + gy)
        rrect(d, (x, y, x + cw, y + ch), 16, fill=SOFT, outline=LINE, width=2)
        circle_num(d, (x + 30, y + 34), i + 1)
        d.text((x + 54, y + 20), title, font=f(20, True), fill=INK)
        for j, line in enumerate(lines):
            d.text((x + 24, y + 76 + j * 30), line, font=f(15), fill=MUTED)
        if i < 5:
            if col < 2:
                arrow(d, (x + cw + 6, y + ch / 2), (x + cw + gx - 6, y + ch / 2), LINE, 3, 10)
            else:
                mid, ex = y + ch + gy / 2, x0 + cw / 2
                d.line([(x + cw / 2, y + ch + 6), (x + cw / 2, mid), (ex, mid)], fill=LINE, width=3)
                arrow(d, (ex, mid), (ex, y + ch + gy - 6), LINE, 3, 10)
    d.text((40, H - 44), "完整说明见 GUIDE.md；每一步的验收标准见 skill/references/verify.md", font=f(14), fill=MUTED)
    img.save(os.path.join(OUT, "flow.png"))


def draw_badge():
    row = Image.open(os.path.join(ROOT, "docs", "dock.png")).convert("RGB")
    row = row.crop((0, 0, row.width, min(row.height, 30)))
    row = row.resize((row.width * 2, row.height * 2), Image.LANCZOS)
    W, H = row.width + 80, row.height + 300
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 24), "徽标怎么读", font=f(26, True), fill=INK)
    img.paste(row, (40, 78))
    marks = [
        (0.17, "① 本次会话的轮数 / 步数 / 解码速度"),
        (0.52, "② 会话累计 token 与缓存命中率（原生）"),
        (0.79, "③ 成本徽标（本插件加的）"),
        (0.95, "④ 上下文占用"),
    ]
    for index, (ratio, _t) in enumerate(marks, 1):
        cx = 40 + row.width * ratio
        d.line([(cx, 78 + row.height + 2), (cx, 78 + row.height + 16)], fill=BLUE, width=2)
        circle_num(d, (cx, 78 + row.height + 30), index, 12)
    y = 78 + row.height + 68
    for _r, text in marks:
        d.text((40, y), text, font=f(16), fill=INK if "③" in text else MUTED)
        y += 34
    d.text((40, H - 44), "③ 的金额后面跟着「峰 / 闲」，表示此刻处于高峰还是空闲时段；非分时计价的模型只显示金额。", font=f(13), fill=MUTED)
    img.save(os.path.join(OUT, "badge.png"))


def draw_panel():
    src = Image.open(os.path.join(ROOT, "docs", "panel.png")).convert("RGB")
    panel = src.crop((222, 34, 682, 414))
    W, H = panel.width + 520, panel.height + 160
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((24, 20), "点开徽标：钱花在哪", font=f(24, True), fill=INK)
    d.text((24, 54), "每一行都对应 harness 的一个计费桶，弹层里直接给出 token、单价与金额", font=f(14), fill=MUTED)
    top = 92
    img.paste(panel, (24, top))
    marks = [
        (77, "① 模型：按 id / 别名匹配价目"),
        (110, "② 时段：DeepSeek 高峰 ×2，空闲 ×1"),
        (160, "③ 三个计费桶：命中 / 未命中 / 输出"),
        (240, "④ 合计：徽标上显示的就是它"),
        (306, "⑤ 本次单价（元 / 百万 tokens）"),
        (335, "⑥ 核对状态：verified 才可信"),
    ]
    label_x = 24 + panel.width + 46
    for index, (rel_y, text) in enumerate(marks, 1):
        cy = top + rel_y - 4
        circle_num(d, (24 + panel.width + 20, cy), index, 11)
        d.text((label_x, cy - 11), text, font=f(15), fill=INK)
    d.text((24, H - 40), "金额按「会话累计 token × 所选模型单价」估算，不是账单；子代理各自有成本。", font=f(13), fill=MUTED)
    img.save(os.path.join(OUT, "panel.png"))


CATALOG = json.load(open(os.path.join(ROOT, "pricing.json"), encoding="utf-8"))
FX = 7.2
RATES = {r["id"]: r for r in CATALOG["rates"]}


def sample_cost(rate, hit=9.0, miss=1.0, out=0.2):
    native = hit * rate["cacheHit"] + miss * rate["cacheMiss"] + out * rate["output"]
    return native * (FX if rate["currency"] == "USD" else 1.0), native


def draw_price():
    rows = []
    for rate in CATALOG["rates"]:
        if rate.get("legacy"):
            continue
        cny, native = sample_cost(rate)
        rows.append((rate["label"], cny, native, rate["currency"], rate["status"]))
    rows.sort(key=lambda r: r[1])
    W, H = 1240, 265 + 35 * len(rows)
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 26), "跑一次评测样本要多少钱（同一份 token 画像）", font=f(26, True), fill=INK)
    d.text((40, 68), "假设：100 步 × 每步 100k 上下文（90% 命中）+ 200k 输出 ≈ 9M 命中 / 1M 未命中 / 0.2M 输出", font=f(15), fill=MUTED)
    d.text((40, 92), "美元模型按 1 USD = 7.2 CNY 折算，仅为同图对比；实际计费以各自币种为准", font=f(13), fill=MUTED)
    left, right, top = 330, W - 190, 145
    plot_w, max_v, bar_h, gap = right - left, max(r[1] for r in rows), 42, 16
    for i, (label, cny, native, currency, status) in enumerate(rows):
        y = top + i * (bar_h + gap)
        w = max(6, int(plot_w * cny / max_v))
        color = BLUE if "DeepSeek" in label else ORANGE if "Claude" in label else GREEN if "GPT" in label else PURPLE
        rrect(d, (left, y, left + w, y + bar_h), 6, fill=color)
        d.text((left - 14 - d.textlength(label, font=f(15)), y + 3), label, font=f(15), fill=INK)
        amount = "￥{:,.2f}".format(cny) if cny >= 1 else "￥{:,.4f}".format(cny)
        native_text = "" if currency == "CNY" else "（${:,.2f}）".format(native)
        d.text((left + w + 10, y + 3), amount + native_text + (" *" if status == "unverified" else ""), font=f(15, True), fill=INK)
    d.line([(left, top - 10), (left, top + len(rows) * (bar_h + gap))], fill=LINE, width=2)
    d.text((40, H - 92), "读法：差距来自「单价 × 缓存命中率」两项；DeepSeek 显示的是空闲价，高峰要 ×2。", font=f(14), fill=MUTED)
    d.text((40, H - 66), "* 除 DeepSeek 两档外均为待核对参考价（status: unverified），请以厂商官网为准。", font=f(14), fill=ORANGE)
    d.text((40, H - 40), "数据来源：pricing.json · 生成脚本 scripts/gen-docs.py", font=f(12), fill=MUTED)
    img.save(os.path.join(OUT, "price.png"))


def month_cost(rate, samples, hit_rate, steps=100.0, ctx=100_000.0, out=200_000.0):
    inp = samples * steps * ctx / 1e6
    c = inp * hit_rate * rate["cacheHit"] + inp * (1 - hit_rate) * rate["cacheMiss"] + samples * out / 1e6 * rate["output"]
    return c * (FX if rate["currency"] == "USD" else 1.0)


def draw_cache():
    picks = [("deepseek-flash", "DeepSeek-V41-Flash（空闲）", BLUE), ("gpt-6-1-sol", "GPT-6.1 Sol", GREEN), ("claude-opus-5-5", "Claude Opus 5.5", ORANGE)]
    samples, W, H = 1000, 1240, 780
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 26), "缓存命中率就是成本开关", font=f(26, True), fill=INK)
    d.text((40, 68), "假设：每月 {:,} 次评测样本，每次 100 步 × 100k 上下文 + 200k 输出；纵轴为对数刻度（元）".format(samples), font=f(15), fill=MUTED)
    left, right, top, bottom = 130, W - 230, 120, H - 120
    series = [(label, color, [(i / 100, month_cost(RATES[rid], samples, i / 100)) for i in range(0, 101, 5)]) for rid, label, color in picks]
    values = [v for _, _, pts in series for _, v in pts]
    lo, hi = math.floor(math.log10(min(values))), math.ceil(math.log10(max(values)))
    x_of = lambda r: left + (right - left) * r
    y_of = lambda v: bottom - (bottom - top) * (math.log10(v) - lo) / (hi - lo)
    for decade in range(lo + 1, hi + 1):
        y = y_of(10 ** decade)
        d.line([(left, y), (right, y)], fill=(238, 241, 244), width=1)
        label = "￥{:,.0f}".format(10 ** decade)
        d.text((left - 12 - d.textlength(label, font=f(13)), y - 9), label, font=f(13), fill=MUTED)
    for r in (0, 0.25, 0.5, 0.75, 1.0):
        x = x_of(r)
        d.line([(x, top), (x, bottom)], fill=(242, 244, 246), width=1)
        lab = "{}%".format(int(r * 100))
        d.text((x - d.textlength(lab, font=f(13)) / 2, bottom + 12), lab, font=f(13), fill=MUTED)
    d.line([(left, bottom), (right, bottom)], fill=LINE, width=2)
    d.line([(left, top), (left, bottom)], fill=LINE, width=2)
    for label, color, pts in series:
        d.line([(x_of(r), y_of(v)) for r, v in pts], fill=color, width=4, joint="curve")
        d.text((right + 14, y_of(pts[-1][1]) - 9), label, font=f(14, True), fill=color)
    d.text((40, H - 70), "同样的工作量，命中率从 0 拉到 90%+，DeepSeek 的成本能掉一个数量级；省钱的开关在缓存，不在换模型。", font=f(14), fill=MUTED)
    d.text((40, H - 44), "所以评测时一定要记录「缓存命中率」，只比单价会得出错误结论。", font=f(14), fill=ORANGE)
    img.save(os.path.join(OUT, "cache.png"))


def draw_roi():
    rate = RATES["deepseek-flash"]
    samples, unit_value = 1000, 3.0
    cost = month_cost(rate, samples, 0.95)
    per_call = cost / samples
    W, H = 1240, 640
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 26), "上线前怎么算回本点", font=f(26, True), fill=INK)
    d.text((40, 68), "示例：DeepSeek-V41-Flash 空闲价，单次样本成本 ￥{:.2f}（命中率 95%），每次调用价值 ￥{:.0f}".format(per_call, unit_value), font=f(15), fill=MUTED)
    left, right, top, bottom = 130, W - 280, 130, H - 110
    calls_max = 2400
    y_max = max(per_call * calls_max, unit_value * calls_max) * 1.05
    x_of = lambda c: left + (right - left) * c / calls_max
    y_of = lambda v: bottom - (bottom - top) * v / y_max
    for i in range(5):
        v = y_max * i / 4
        y = y_of(v)
        d.line([(left, y), (right, y)], fill=(238, 241, 244), width=1)
        lab = "￥{:,.0f}".format(v)
        d.text((left - 12 - d.textlength(lab, font=f(13)), y - 9), lab, font=f(13), fill=MUTED)
    d.line([(left, bottom), (right, bottom)], fill=LINE, width=2)
    d.line([(left, top), (left, bottom)], fill=LINE, width=2)
    for i in range(5):
        c = calls_max * i / 4
        lab = "{:,}".format(int(c))
        d.text((x_of(c) - d.textlength(lab, font=f(13)) / 2, bottom + 12), lab, font=f(13), fill=MUTED)
    d.line([(x_of(0), y_of(0)), (x_of(calls_max), y_of(per_call * calls_max))], fill=BLUE, width=4)
    d.line([(x_of(0), y_of(0)), (x_of(calls_max), y_of(unit_value * calls_max))], fill=GREEN, width=4)
    d.text((right + 12, y_of(per_call * calls_max) - 12), "月成本", font=f(14, True), fill=BLUE)
    d.text((right + 12, top - 6), "月收益", font=f(14, True), fill=GREEN)
    be = cost / (unit_value - per_call) if unit_value > per_call else None
    if be is not None and 0 < be < calls_max:
        x, y = x_of(be), y_of(unit_value * be)
        d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=RED)
        d.text((x + 26, y - 40), "回本点 ≈ {} 次/月".format(int(be)), font=f(16, True), fill=RED)
        d.text((x + 26, y - 18), "单次毛利 ￥{:.2f}".format(unit_value - per_call), font=f(13), fill=MUTED)
    d.text((40, H - 66), "公式：月成本 = 单次成本 × 月调用量 × 重试系数；单次毛利 = 单次价值 − 单次成本；回本点 = 固定开销 ÷ 单次毛利。", font=f(14), fill=INK)
    d.text((40, H - 40), "把评测集里量出来的 token 画像代进去；换模型、命中率变一次，这张图就重画一次。", font=f(14), fill=MUTED)
    img.save(os.path.join(OUT, "roi.png"))


if __name__ == "__main__":
    for fn in (draw_flow, draw_badge, draw_panel, draw_price, draw_cache, draw_roi):
        fn()
    for name in sorted(os.listdir(OUT)):
        print(name, os.path.getsize(os.path.join(OUT, name)))
