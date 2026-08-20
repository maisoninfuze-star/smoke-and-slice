#!/usr/bin/env python3
"""
Stage 2 of the retouch: composite the segmented food back onto a clean surface.

The food pixels come straight from the restaurant's original photo — this
script never repaints them. What it does:

  1. builds a dark walnut surface with a warm key falloff (brand palette)
  2. lays down a soft contact shadow under the subject
  3. composites the original cutout on top, unmodified in shape and detail
  4. applies a gentle global grade: kills the phone-flash blue cast, lifts
     warmth slightly, adds a vignette

Everything here is deterministic image maths, so the result is reproducible and
the food is provably the same food.
"""
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance, ImageChops
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUT = ROOT / "brand" / "client-media" / "cutouts"
OUT = ROOT / "brand" / "client-media" / "retouched"
OUT.mkdir(parents=True, exist_ok=True)

# Brand surface tones (from brand-kit.json): dark walnut into charcoal falloff.
WALNUT_DARK = (28, 20, 15)
WALNUT_MID = (61, 42, 30)
CHARCOAL = (20, 22, 26)


def walnut_surface(w, h, seed=7):
    """Dark walnut table: horizontal grain, warm key from upper-left, deep falloff."""
    rng = np.random.default_rng(seed)
    y = np.linspace(0, 1, h)[:, None]
    x = np.linspace(0, 1, w)[None, :]

    # Base vertical gradient — lighter where the key lands, dark at the edges.
    base = np.zeros((h, w, 3), dtype=np.float32)
    for c in range(3):
        base[..., c] = WALNUT_DARK[c] + (WALNUT_MID[c] - WALNUT_DARK[c]) * (1.0 - y[:, 0])[:, None]

    # Wood grain: low-frequency horizontal streaks.
    # Grain stays deliberately faint — visible banding reads as a fake backdrop.
    grain = np.zeros((h, w), dtype=np.float32)
    for freq, amp in ((2, 1.5), (7, 0.9), (17, 0.5)):
        phase = rng.uniform(0, np.pi * 2)
        grain += amp * np.sin(y * freq * np.pi * 2 + phase + 0.5 * np.sin(x * 2.2 + phase))
    grain += rng.normal(0, 1.4, (h, w))
    base += grain[..., None] * np.array([1.0, 0.78, 0.6], dtype=np.float32)

    # Warm key from upper-left, falling off into charcoal.
    kx, ky = 0.30, 0.20
    dist = np.sqrt(((x - kx) * 1.15) ** 2 + ((y - ky) * 1.35) ** 2)
    key = np.clip(1.0 - dist * 1.05, 0.0, 1.0) ** 1.6
    base += (key[..., None] * np.array([64.0, 44.0, 24.0], dtype=np.float32))

    # Pull the far corners toward charcoal so the subject separates.
    far = np.clip((dist - 0.55) * 1.5, 0.0, 1.0)[..., None]
    base = base * (1 - far) + np.array(CHARCOAL, dtype=np.float32) * far

    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


def contact_shadow(alpha, blur=26, squash=0.13, opacity=225, offset=(4, 8)):
    """Soft elliptical shadow derived from the subject's own silhouette."""
    w, h = alpha.size
    box = alpha.getbbox()
    if not box:
        return Image.new("L", (w, h), 0)
    l, t, r, b = box

    shadow = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(shadow)
    cx = (l + r) / 2 + offset[0]
    cy = b - (b - t) * squash + offset[1]
    rx = (r - l) * 0.52
    ry = max(8, (b - t) * squash)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=opacity)
    return shadow.filter(ImageFilter.GaussianBlur(blur))


def grade(img):
    """Neutralise the phone-flash cast, warm it slightly, add a vignette."""
    a = np.asarray(img).astype(np.float32)
    # Cool the blue channel a touch, lift red — undoes the fluorescent/flash cast.
    a[..., 0] *= 1.030
    a[..., 1] *= 1.000
    a[..., 2] *= 0.955
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")

    img = ImageEnhance.Color(img).enhance(1.06)
    img = ImageEnhance.Contrast(img).enhance(1.07)

    w, h = img.size
    y = np.linspace(-1, 1, h)[:, None]
    x = np.linspace(-1, 1, w)[None, :]
    r = np.sqrt(x**2 + y**2) / np.sqrt(2)
    vig = np.clip(1.0 - 0.46 * r**2.4, 0, 1)[..., None]
    out = np.asarray(img).astype(np.float32) * vig
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")


def compose(name, pad=0.10, seed=7):
    cut = Image.open(CUT / f"{name}.png").convert("RGBA")
    box = cut.getbbox()
    if box:
        cut = cut.crop(box)

    cw, ch = cut.size
    # Canvas: 4:3 landscape, subject occupying a comfortable share of the frame.
    target_w = int(cw * (1 + pad * 2))
    target_h = int(target_w * 3 / 4)
    if target_h < ch * (1 + pad * 2):
        target_h = int(ch * (1 + pad * 2))
        target_w = int(target_h * 4 / 3)

    bg = walnut_surface(target_w, target_h, seed=seed)

    ox = (target_w - cw) // 2
    oy = (target_h - ch) // 2

    alpha_full = Image.new("L", (target_w, target_h), 0)
    alpha_full.paste(cut.getchannel("A"), (ox, oy))

    shadow_layer = Image.new("RGB", (target_w, target_h), (0, 0, 0))
    # Two passes: a wide soft pool, then a tight dark contact line so the
    # subject sits on the surface instead of hovering above it.
    for blur, squash, op, off in ((44, 0.20, 150, (8, 18)), (12, 0.07, 205, (2, 5))):
        sh = contact_shadow(alpha_full, blur=blur, squash=squash, opacity=op, offset=off)
        bg = Image.composite(shadow_layer, bg, sh)

    bg.paste(cut, (ox, oy), cut)
    final = grade(bg)

    dest = OUT / f"{name}.jpg"
    final.save(dest, quality=92, subsampling=1)
    print(f"  {name:<14} {target_w}x{target_h}  -> {dest.relative_to(ROOT)}")
    return final


PREP = ROOT / "brand" / "client-media" / "prepped"


def grade_only(name, crop=None):
    """
    For photos whose own scene is worth keeping (the takeout container, the
    fries that come with the order), don't segment — just fix the capture.
    Nothing is removed, so nothing about the meal is misrepresented.
    """
    img = Image.open(PREP / f"{name}.jpg").convert("RGB")
    if crop:
        w, h = img.size
        l, t, r, b = crop
        img = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))

    # Lift the shadows a little before grading — these were shot dim.
    a = np.asarray(img).astype(np.float32) / 255.0
    a = np.clip(a ** 0.92, 0, 1) * 255.0
    img = Image.fromarray(a.astype(np.uint8))

    final = grade(img)
    dest = OUT / f"{name}.jpg"
    final.save(dest, quality=92, subsampling=1)
    print(f"  {name:<14} {final.size[0]}x{final.size[1]}  -> {dest.relative_to(ROOT)}  (graded, scene kept)")


if __name__ == "__main__":
    print("compositing (food pixels preserved from the originals):")
    for n, seed in (("calzone", 7), ("submarine", 15)):
        compose(n, seed=seed)
    # The wings shot already had a good scene — the fries and container are part
    # of the actual menu item, so segmenting them out would have misrepresented it.
    grade_only("wings-fries", crop=(0.0, 0.02, 0.94, 0.98))
    print("done")
