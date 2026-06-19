#!/usr/bin/env python3
"""Generate cinematic dark/warm placeholder images for the intro.
Run:  python3 images/_make_placeholders.py
Replace the resulting .jpg files with your real photos (same names)."""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
random.seed(7)

INK = (12, 11, 13)
WARM = (198, 169, 114)   # champagne
SAND = (140, 120, 92)

def font(size):
    for p in ("/System/Library/Fonts/Helvetica.ttc",
              "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()

def radial_glow(img, cx, cy, radius, color, strength):
    """Add a soft radial warm glow centred at (cx,cy)."""
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    steps = 60
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = strength * (1 - i / steps)
        c = tuple(int(ch * a) for ch in color)
        gd.ellipse([cx - r, cy - r, cx + r * 1.2, cy + r], fill=c)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    return Image.blend(img, Image.eval(Image.merge("RGB", [
        Image.blend(img.split()[i], glow.split()[i], 0.0) for i in range(3)
    ]), lambda x: x), 0)  # placeholder no-op (replaced below)

def make(path, label, glow_pos, glow_color=WARM, streak=False):
    # base vertical gradient: near-black top -> slightly warm bottom
    base = Image.new("RGB", (W, H))
    px = base.load()
    for y in range(H):
        t = y / H
        r = int(12 + 26 * t)
        g = int(11 + 20 * t)
        b = int(13 + 14 * t)
        for x in range(W):
            px[x, y] = (r, g, b)

    # additive warm glow
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = glow_pos
    for i in range(70, 0, -1):
        r = 760 * i / 70
        a = (1 - i / 70) ** 1.6
        c = tuple(int(ch * a * 0.9) for ch in glow_color)
        gd.ellipse([cx - r, cy - r * 0.85, cx + r, cy + r * 0.85], fill=c)
    glow = glow.filter(ImageFilter.GaussianBlur(90))

    if streak:  # vertical "water/rain" light streak for the shower frame
        st = Image.new("RGB", (W, H), (0, 0, 0))
        sd = ImageDraw.Draw(st)
        sx = W * 0.5
        for i in range(40, 0, -1):
            w = 220 * i / 40
            a = (1 - i / 40) ** 2
            c = tuple(int(ch * a) for ch in (150, 130, 100))
            sd.rectangle([sx - w, 0, sx + w, H], fill=c)
        st = st.filter(ImageFilter.GaussianBlur(40))
        glow = Image.eval(glow, lambda v: v)  # keep
        base = Image.blend(base, Image.new("RGB", (W, H), (0, 0, 0)), 0)
        # screen-blend streak
        b1, s1 = base.split(), st.split()
        base = Image.merge("RGB", [Image.eval(Image.blend(b1[i], s1[i], 0.5), lambda v: v) for i in range(3)])

    # screen blend glow onto base (additive-ish)
    b = base.split(); g = glow.split()
    out = Image.merge("RGB", [
        Image.eval(Image.blend(b[i], g[i], 0.55), lambda v: v) for i in range(3)
    ])

    # film grain
    noise = Image.effect_noise((W, H), 18).convert("L")
    out = Image.merge("RGB", [
        Image.blend(out.split()[i], noise, 0.04) for i in range(3)
    ])

    # vignette
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W * 0.25, -H * 0.25, W * 1.25, H * 1.25], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(260))
    black = Image.new("RGB", (W, H), (4, 3, 3))
    out = Image.composite(out, black, vig)

    # discreet label so it's clearly a placeholder
    d = ImageDraw.Draw(out)
    d.text((90, H - 150), "PLATZHALTER", font=font(26), fill=(150, 132, 104))
    d.text((90, H - 110), label, font=font(40), fill=(230, 224, 212))
    d.text((90, H - 56), "Ersetze diese Datei durch dein Foto (gleicher Name)",
           font=font(22), fill=(150, 145, 135))

    out.save(path, quality=86, optimize=True)
    print("wrote", path)

here = __file__.rsplit("/", 1)[0]
make(f"{here}/bathroom-hero.jpg", "Gesamtansicht · Badezimmer", (W * 0.30, H * 0.30))
make(f"{here}/shower-detail.jpg", "Regendusche · Detail",        (W * 0.50, H * 0.32), streak=True)
make(f"{here}/faucet-detail.jpg", "Armatur · Waschbecken",       (W * 0.40, H * 0.55))
