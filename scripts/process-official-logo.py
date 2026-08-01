"""Create lossless display variants from the official NaysTrip master PNG.

The master is never altered. Only near-white background pixels are made
transparent, and the symbol variant is cropped from the upper artwork region.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "public" / "branding" / "naystrip-logo.png"
TRANSPARENT = ROOT / "public" / "branding" / "naystrip-logo-transparent.png"
SYMBOL = ROOT / "public" / "branding" / "naystrip-symbol.png"
APPLE = ROOT / "public" / "apple-touch-icon.png"
FAVICON = ROOT / "public" / "favicon.ico"
OG_IMAGE = ROOT / "public" / "og.png"


def remove_white_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = []
    for red, green, blue, alpha in rgba.get_flattened_data():
        minimum = min(red, green, blue)
        if minimum >= 250:
            pixels.append((red, green, blue, 0))
        elif minimum >= 235:
            # Preserve antialiased edges with a soft deterministic matte.
            edge_alpha = round(alpha * (250 - minimum) / 15)
            pixels.append((red, green, blue, edge_alpha))
        else:
            pixels.append((red, green, blue, alpha))
    rgba.putdata(pixels)
    return rgba


def contain(image: Image.Image, size: int, padding: int, background) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    available = size - padding * 2
    scaled = image.copy()
    scaled.thumbnail((available, available), Image.Resampling.LANCZOS)
    x = (size - scaled.width) // 2
    y = (size - scaled.height) // 2
    canvas.alpha_composite(scaled, (x, y))
    return canvas


master = Image.open(MASTER)
transparent = remove_white_background(master)
transparent.save(TRANSPARENT, optimize=True)

# The official symbol occupies the upper 76.5% of the square master. This crop
# includes the complete globe and location-pin outline and excludes wordmark text.
symbol_region = transparent.crop((0, 0, transparent.width, round(transparent.height * 0.765)))
bounds = symbol_region.getbbox()
if not bounds:
    raise RuntimeError("The official symbol crop is empty")
symbol_region = symbol_region.crop(bounds)
symbol = contain(symbol_region, 512, 28, (0, 0, 0, 0))
symbol.save(SYMBOL, optimize=True)

apple = contain(symbol_region, 180, 18, (255, 255, 255, 255)).convert("RGB")
apple.save(APPLE, optimize=True)

favicon = contain(symbol_region, 256, 22, (255, 255, 255, 255)).convert("RGB")
favicon.save(FAVICON, sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

# Deterministic social preview using the official artwork, not a redrawn mark.
og = Image.new("RGB", (1200, 630), (255, 250, 242))
accent = Image.new("RGB", (310, 630), (23, 60, 52))
og.paste(accent, (890, 0))
orange = Image.new("RGB", (26, 630), (249, 115, 22))
og.paste(orange, (864, 0))
og_logo = transparent.copy()
og_logo.thumbnail((700, 540), Image.Resampling.LANCZOS)
og.alpha_composite(og_logo, ((840 - og_logo.width) // 2, (630 - og_logo.height) // 2)) if og.mode == "RGBA" else og.paste(og_logo, ((840 - og_logo.width) // 2, (630 - og_logo.height) // 2), og_logo)
og.save(OG_IMAGE, optimize=True)

print(f"master={master.size} transparent={transparent.size} symbol={symbol.size}")
