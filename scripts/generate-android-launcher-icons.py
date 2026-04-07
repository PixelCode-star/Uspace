"""
Generate Android mipmap launcher assets from public/logo-nobg.png.

Requires: pip install pillow
Run from repo root: python scripts/generate-android-launcher-icons.py
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install pillow", file=sys.stderr)
    sys.exit(1)

REPO = Path(__file__).resolve().parent.parent
LOGO = REPO / "public" / "logo-nobg.png"
RES = REPO / "android" / "app" / "src" / "main" / "res"

# Adaptive-icon foreground layer sizes (px per density)
ADAPTIVE = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

# Legacy full launcher icons
LEGACY = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

BG = (10, 10, 10, 255)


def load_logo() -> Image.Image:
    if not LOGO.is_file():
        print(f"Missing logo: {LOGO}", file=sys.stderr)
        sys.exit(1)
    return Image.open(LOGO).convert("RGBA")


def scale_to_fit(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    if w <= 0 or h <= 0:
        return img
    scale = min(max_side / w, max_side / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    return img.resize((nw, nh), Image.Resampling.LANCZOS)


def paste_center(canvas: Image.Image, img: Image.Image) -> None:
    cw, ch = canvas.size
    iw, ih = img.size
    x = (cw - iw) // 2
    y = (ch - ih) // 2
    canvas.alpha_composite(img, (x, y))


def make_foreground(logo: Image.Image, side: int) -> Image.Image:
    """Adaptive foreground: transparent, logo ~62% of side (material safe zone)."""
    inner = int(side * 0.62)
    scaled = scale_to_fit(logo, inner)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    paste_center(out, scaled)


def make_legacy(logo: Image.Image, side: int) -> Image.Image:
    """Square launcher with app background."""
    inner = int(side * 0.58)
    scaled = scale_to_fit(logo, inner)
    out = Image.new("RGBA", (side, side), BG)
    paste_center(out, scaled)
    return out


def main() -> None:
    logo = load_logo()
    for folder, px in ADAPTIVE.items():
        d = RES / folder
        d.mkdir(parents=True, exist_ok=True)
        fg = make_foreground(logo, px)
        fg.save(d / "ic_launcher_foreground.png", "PNG")
        print(f"Wrote {folder}/ic_launcher_foreground.png")

    for folder, px in LEGACY.items():
        d = RES / folder
        d.mkdir(parents=True, exist_ok=True)
        full = make_legacy(logo, px)
        full.save(d / "ic_launcher.png", "PNG")
        full.save(d / "ic_launcher_round.png", "PNG")
        print(f"Wrote {folder}/ic_launcher.png (+ round)")

    print("Done. Rebuild the Android app in Android Studio.")


if __name__ == "__main__":
    main()
