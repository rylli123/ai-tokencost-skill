"""Draw docs/guide/lang-tax.png — 中文 vs 英文 的费用差距（分词税）。"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "guide")
REG, BOLD = r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\msyhbd.ttc"
INK, MUTED, LINE, BG, SOFT = (31, 35, 40), (106, 115, 125), (208, 215, 222), (255, 255, 255), (246, 248, 250)
BLUE, ORANGE, GREEN, RED = (36, 123, 191), (214, 122, 0), (28, 138, 90), (196, 60, 60)
FX = 7.2


def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size, index=0)


CATALOG = json.load(open(os.path.join(ROOT, "pricing.json"), encoding="utf-8"))
RATES = {r["id"]: r for r in CATALOG["rates"]}
HIT, MISS, OUTTOK = 9.0, 1.0, 0.2  # 百万 tokens，英文基准


def cost(rate, scale):
    native = (HIT * scale) * rate["cacheHit"] + (MISS * scale) * rate["cacheMiss"] + (OUTTOK * scale) * rate["output"]
    return native * (FX if rate["currency"] == "USD" else 1.0)


def main():
    picks = [(rid, r) for rid, r in RATES.items() if r.get("tokenizerTaxPct") is not None]
    picks.sort(key=lambda kv: cost(kv[1], 1.0))
    W = 1240
    row_h = 92
    H = 210 + row_h * max(1, len(picks)) + 120
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((40, 26), "同一段内容，中文比英文贵多少", font=f(28, True), fill=INK)
    d.text((40, 70), "分词税：同样语义下，非英文文本被切成更多 token。英文≈基准，中文≈×(1+税)", font=f(15), fill=MUTED)
    d.text((40, 94), "成本按同一份 token 画像（9M 命中 / 1M 未命中 / 0.2M 输出，已按倍数缩放）折算成人民币，1 USD = 7.2 CNY", font=f(13), fill=MUTED)

    if not picks:
        d.text((40, 160), "pricing.json 里还没有 tokenizerTaxPct 数据", font=f(16), fill=RED)
        img.save(os.path.join(OUT, "lang-tax.png"))
        return

    left, right, top = 300, W - 210, 150
    plot_w = right - left
    max_v = max(cost(r, 1 + r["tokenizerTaxPct"] / 100) for _, r in picks)
    for i, (rid, rate) in enumerate(picks):
        y = top + i * row_h
        tax = rate["tokenizerTaxPct"]
        en = cost(rate, 1.0)
        zh = cost(rate, 1 + tax / 100)
        d.text((left - 14 - d.textlength(rate["label"], font=f(15)), y + 22), rate["label"], font=f(15), fill=INK)
        we = max(4, int(plot_w * en / max_v))
        wz = max(4, int(plot_w * zh / max_v))
        d.rounded_rectangle((left, y + 8, left + we, y + 34), radius=5, fill=BLUE)
        d.text((left + we + 10, y + 11), "英文 ￥{:,.0f}".format(en), font=f(13), fill=MUTED)
        d.rounded_rectangle((left, y + 42, left + wz, y + 68), radius=5, fill=ORANGE)
        d.text((left + wz + 10, y + 45), "中文 ￥{:,.0f}（{}）".format(zh, "×{:.2f}".format(zh / en if en else 1)), font=f(13, True), fill=INK)

    d.text((40, H - 70), "读法：分词税越高，同样的中文内容越不经用；Kimi K3 的中文成本约为英文的 1.93 倍。", font=f(14), fill=INK)
    d.text((40, H - 44), "未标注的模型暂无公开分词税数据；评测时请用自己的语料实测 token 数，别直接套倍数。", font=f(13), fill=MUTED)
    img.save(os.path.join(OUT, "lang-tax.png"))


if __name__ == "__main__":
    main()
    print("lang-tax.png", os.path.getsize(os.path.join(OUT, "lang-tax.png")))
