#!/usr/bin/env python3
"""Build SearchRhody logo variants from the approved pin and fonts.

Pin geometry is never altered. Colors:
  Atlantic #142C3E, Coral #F46934, Ivory #F7F5EF, Sea Glass #69A9A1
Fonts: Fraunces opsz72 wght800 SOFT0 WONK0; Inter opsz14 wght450
"""
from __future__ import annotations

import re
from pathlib import Path

import cairosvg
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ATLANTIC = "#142C3E"
CORAL = "#F46934"
IVORY = "#F7F5EF"
SEA = "#69A9A1"
TAGLINE = "Local visibility, made simple."
TITLE = "SearchRhody. Local visibility, made simple."

FR = instantiateVariableFont(
    TTFont(ROOT / "fonts/Fraunces.ttf"),
    {"opsz": 72, "wght": 800, "SOFT": 0, "WONK": 0},
)
IN = instantiateVariableFont(
    TTFont(ROOT / "fonts/Inter.ttf"),
    {"opsz": 14, "wght": 450},
)

PIN_SVG = (ROOT / "searchrhody-pin.svg").read_text()
CLIP_INNER = re.search(r"<clipPath id=\"sr-wave\">(.*?)</clipPath>", PIN_SVG, re.S).group(1)
PIN_D = re.search(r'<path fill="#F46934" d="([^"]+)"', PIN_SVG).group(1)
WAVE_PATHS = re.findall(
    r'<path transform="([^"]+)" fill="([^"]+)" d="([^"]+)"\s*/>', PIN_SVG
)
# WAVE_PATHS[0] = sea glass body; [1], [2] = navy crest / foam
assert len(WAVE_PATHS) == 3, WAVE_PATHS
PIN_VB = (60, 50, 960, 1230)  # x, y, w, h
PIN_ASPECT = 960 / 1230


def shape(font, text, size, track=0):
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    upm = font["head"].unitsPerEm
    s = size / upm
    x = 0
    parts = []
    for ch in text:
        g = cmap[ord(ch)]
        parts.append((g, x))
        x += gs[g].width * s + track
    return parts, x - track, s, gs


def text_path(font, text, size, ox, oy, track=0):
    parts, w, s, gs = shape(font, text, size, track)
    pen = SVGPathPen(gs)
    for g, x in parts:
        tp = TransformPen(pen, (s, 0, 0, -s, ox + x, oy))
        gs[g].draw(tp)
    return pen.getCommands(), w


def bounds(font, text, size, track=0):
    parts, w, s, gs = shape(font, text, size, track)
    bp = BoundsPen(gs)
    for g, x in parts:
        gs[g].draw(TransformPen(bp, (s, 0, 0, s, x, 0)))
    return bp.bounds  # xmin, ymin, xmax, ymax in y-up


def pin_color_group(x, y, h, ids=""):
    """Approved full-color pin. Geometry unchanged."""
    sc = h / 1230
    clip = CLIP_INNER
    waves = []
    for i, (tr, fill, d) in enumerate(WAVE_PATHS):
        waves.append(f'<path transform="{tr}" fill="{fill}" d="{d}"/>')
    inner = (
        f'<defs><clipPath id="sr-wave{ids}">{clip}</clipPath></defs>'
        f'<path fill="{CORAL}" d="{PIN_D}"/>'
        f'<circle cx="538" cy="528" r="308" fill="{IVORY}"/>'
        f'<g clip-path="url(#sr-wave{ids})">{"".join(waves)}</g>'
    )
    return (
        f'<g transform="translate({x:.2f} {y:.2f}) scale({sc:.6f}) '
        f'translate(-60 -50)">{inner}</g>'
    )


def pin_mono_group(x, y, h, color, ids=""):
    """One-color pin. Opening is a knockout; the sea-glass wave is
    redrawn in the same color; navy crest and foam are knockouts so
    wave detail stays legible. Path data is identical to the approved
    pin. Uses an evenodd clipPath (cairosvg does not honor the
    equivalent mask inside a transformed group)."""
    sc = h / 1230
    sea_tr, _, sea_d = WAVE_PATHS[0]
    navy_els = "".join(
        f'<path transform="{tr}" d="{d}"/>' for tr, _, d in WAVE_PATHS[1:]
    )
    clip = (
        f'<clipPath id="sr-ko{ids}" clip-rule="evenodd">'
        f'<path d="{PIN_D}"/>'
        f'<circle cx="538" cy="528" r="308"/>'
        f'<path transform="{sea_tr}" d="{sea_d}"/>'
        f"{navy_els}"
        f"</clipPath>"
    )
    inner = (
        f"<defs>{clip}</defs>"
        f'<path fill="{color}" d="{PIN_D}" clip-path="url(#sr-ko{ids})"/>'
    )
    return (
        f'<g transform="translate({x:.2f} {y:.2f}) scale({sc:.6f}) '
        f'translate(-60 -50)">{inner}</g>'
    )


def pin_group(x, y, h, ids="", mode="color", color=ATLANTIC):
    if mode == "color":
        return pin_color_group(x, y, h, ids)
    return pin_mono_group(x, y, h, color, ids)


def svg_wrap(w, h, body, title=TITLE, bg=None):
    bg_el = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
        f'role="img" aria-labelledby="sr-t">'
        f'<title id="sr-t">{title}</title>{bg_el}{body}</svg>'
    )


def stacked_layout():
    """Shared geometry for every stacked lockup."""
    W = 1400
    pinh = 420
    pinw = pinh * PIN_ASPECT
    target = pinw * 3.45
    _, w0 = text_path(FR, "SearchRhody", 100, 0, 0)
    word_size = 100 * target / w0
    _, wa = text_path(FR, "Search", word_size, 0, 0)
    wx = (W - target) / 2
    bb = bounds(FR, "SearchRhody", word_size)
    gap = pinh * 0.08
    wy = 30 + pinh + gap + bb[3]
    t0w = text_path(IN, TAGLINE, 100, 0, 0)[1]
    tsz = 100 * target * 0.79 / t0w
    ty = wy - bb[1] + tsz * 1.25
    tw = text_path(IN, TAGLINE, tsz, 0, 0)[0] and text_path(IN, TAGLINE, tsz, 0, 0)[1]
    H = ty + tsz * 0.6 + 40
    return {
        "W": W,
        "H": H,
        "pinh": pinh,
        "pinw": pinw,
        "pin_x": (W - pinw) / 2,
        "pin_y": 30,
        "word_size": word_size,
        "wx": wx,
        "wy": wy,
        "wa": wa,
        "tsz": tsz,
        "ty": ty,
        "tx": (W - tw) / 2,
    }


def stacked_svg(search, rhody, tag, pin_mode="color", pin_color=ATLANTIC, bg=None, ids="st"):
    L = stacked_layout()
    sa, _ = text_path(FR, "Search", L["word_size"], L["wx"], L["wy"])
    sb, _ = text_path(FR, "Rhody", L["word_size"], L["wx"] + L["wa"], L["wy"])
    tt, _ = text_path(IN, TAGLINE, L["tsz"], L["tx"], L["ty"])
    body = (
        pin_group(L["pin_x"], L["pin_y"], L["pinh"], ids, pin_mode, pin_color)
        + f'<path fill="{search}" d="{sa}"/>'
        + f'<path fill="{rhody}" d="{sb}"/>'
        + f'<path fill="{tag}" d="{tt}"/>'
    )
    return svg_wrap(L["W"], L["H"], body, bg=bg), L["W"], L["H"]


def horizontal_layout():
    """Pin left, wordmark right, tagline under the wordmark.

    Proportions follow the brand-board horizontal lockup: the pin is
    roughly as tall as the wordmark-plus-tagline block and vertically
    centered with it.
    """
    word_size = 200
    _, wa = text_path(FR, "Search", word_size, 0, 0)
    _, wb = text_path(FR, "Rhody", word_size, 0, 0)
    word_w = wa + wb
    bb = bounds(FR, "SearchRhody", word_size)
    t0w = text_path(IN, TAGLINE, 100, 0, 0)[1]
    tsz = 100 * word_w * 0.94 / t0w
    tbb = bounds(IN, TAGLINE, tsz)
    text_gap = word_size * 0.20
    # y-up bounds: ymax = ascent, ymin = descent (typically negative)
    word_top_off = bb[3]  # distance above baseline
    word_bot_off = -bb[1]
    tag_bot_off = -tbb[1]
    text_h = word_top_off + text_gap + tsz * 0.15 + (tbb[3] - tbb[1])
    # Simpler: from wordmark top to tagline bottom
    # word baseline at 0: top = -ymax in SVG (y-down) wait we place baseline at wy
    text_h = bb[3] + text_gap + tbb[3] - tbb[1]
    pinh = text_h * 1.04
    pinw = pinh * PIN_ASPECT
    pad = pinh * 0.20
    gap = pinh * 0.18
    # Total size
    content_w = pinw + gap + word_w
    content_h = max(pinh, text_h)
    W = content_w + pad * 2
    H = content_h + pad * 2
    pin_x = pad
    pin_y = (H - pinh) / 2
    # Text block vertically centered with pin
    # text top at text_y0, word baseline = text_y0 + bb[3]
    text_y0 = (H - text_h) / 2
    wy = text_y0 + bb[3]
    ty = wy + text_gap + tbb[3]
    wx = pin_x + pinw + gap
    return {
        "W": W,
        "H": H,
        "pinh": pinh,
        "pinw": pinw,
        "pin_x": pin_x,
        "pin_y": pin_y,
        "word_size": word_size,
        "wx": wx,
        "wy": wy,
        "wa": wa,
        "tsz": tsz,
        "ty": ty,
        "pad": pad,
    }


def horizontal_svg(search, rhody, tag, pin_mode="color", pin_color=ATLANTIC, bg=None, ids="hz"):
    L = horizontal_layout()
    sa, _ = text_path(FR, "Search", L["word_size"], L["wx"], L["wy"])
    sb, _ = text_path(FR, "Rhody", L["word_size"], L["wx"] + L["wa"], L["wy"])
    tt, _ = text_path(IN, TAGLINE, L["tsz"], L["wx"], L["ty"])
    body = (
        pin_group(L["pin_x"], L["pin_y"], L["pinh"], ids, pin_mode, pin_color)
        + f'<path fill="{search}" d="{sa}"/>'
        + f'<path fill="{rhody}" d="{sb}"/>'
        + f'<path fill="{tag}" d="{tt}"/>'
    )
    return svg_wrap(L["W"], L["H"], body, bg=bg), L["W"], L["H"]


def favicon_svg(size=512, radius_ratio=0.22, pad_ratio=0.16, ids="fav"):
    """Pin on an ivory rounded-square."""
    r = size * radius_ratio
    pad = size * pad_ratio
    pinh = size - pad * 2
    pinw = pinh * PIN_ASPECT
    px = (size - pinw) / 2
    py = pad
    body = (
        f'<rect width="{size}" height="{size}" rx="{r:.1f}" fill="{IVORY}"/>'
        + pin_color_group(px, py, pinh, ids)
    )
    return svg_wrap(size, size, body, title="SearchRhody", bg=None)


def write_svg(path: Path, markup: str):
    path.write_text(markup)
    return path


def export_png(svg_path: Path, png_path: Path, width: int):
    cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=width)
    return png_path


def save_pair(stem: str, markup: str, width_1x: int, dest=ROOT):
    svg_path = dest / f"{stem}.svg"
    write_svg(svg_path, markup)
    export_png(svg_path, dest / f"{stem}.png", width_1x)
    export_png(svg_path, dest / f"{stem}@2x.png", width_1x * 2)
    return svg_path


def font_pil(path, size):
    return ImageFont.truetype(str(path), size=size)


def compose_sheet(assets: dict):
    """Brand variants sheet, labeled, ivory ground."""
    W, H = 2400, 3080
    img = Image.new("RGB", (W, H), IVORY)
    draw = ImageDraw.Draw(img)
    # Instantiated TTF files aren't paths; use the variable fonts with a size
    # that approximates the intended weight. For labels, a system-like look
    # from the actual files is fine at modest size.
    fr_path = ROOT / "fonts/Fraunces.ttf"
    in_path = ROOT / "fonts/Inter.ttf"
    title_f = ImageFont.truetype(str(fr_path), 64)
    label_f = ImageFont.truetype(str(in_path), 28)
    cap_f = ImageFont.truetype(str(in_path), 22)

    def heading(text, x, y, font=title_f, fill=ATLANTIC):
        draw.text((x, y), text, font=font, fill=fill)

    def label(text, x, y):
        draw.text((x, y), text, font=label_f, fill=ATLANTIC)

    def paste_fit(im, box, bg=None, outline=None):
        """Scale image to fit inside box (x, y, w, h), centered. Optional bg."""
        x, y, w, h = box
        if bg:
            draw.rounded_rectangle(
                [x, y, x + w, y + h], 18, fill=bg, outline=outline, width=2 if outline else 0
            )
        src = im.convert("RGBA")
        # If the asset has a near-solid background close to the card, the
        # padded card and the asset canvas blend instead of showing a
        # nested rectangle.
        sc = min((w - 48) / src.width, (h - 48) / src.height)
        nw, nh = max(1, int(src.width * sc)), max(1, int(src.height * sc))
        src = src.resize((nw, nh), Image.Resampling.LANCZOS)
        px = x + (w - nw) // 2
        py = y + (h - nh) // 2
        img.paste(src, (px, py), src)

    margin = 80
    heading("SearchRhody", margin, 64)
    draw.text((margin, 140), "Logo variants  ·  approved pin  ·  coral #F46934", font=cap_f, fill="#4A5C68")

    # Row 1: stacked + horizontal color
    label("Stacked primary", margin, 210)
    label("Horizontal header lockup", 1240, 210)
    paste_fit(assets["stacked"], (margin, 250, 1080, 720), bg=IVORY, outline="#E4E0D8")
    paste_fit(assets["horizontal"], (1240, 250, 1080, 720), bg=IVORY, outline="#E4E0D8")

    # Row 2: light-on-navy
    label("Light-on-navy  ·  stacked", margin, 1000)
    label("Light-on-navy  ·  horizontal", 1240, 1000)
    paste_fit(assets["stacked-navy"], (margin, 1040, 1080, 520), bg=ATLANTIC)
    paste_fit(assets["horizontal-navy"], (1240, 1040, 1080, 520), bg=ATLANTIC)

    # Row 3: one-color atlantic
    label("One-color  ·  Atlantic", margin, 1600)
    label("One-color  ·  Atlantic  ·  horizontal", 1240, 1600)
    paste_fit(assets["stacked-atlantic"], (margin, 1640, 1080, 480), bg=IVORY, outline="#E4E0D8")
    paste_fit(assets["horizontal-atlantic"], (1240, 1640, 1080, 480), bg=IVORY, outline="#E4E0D8")

    # Row 4: one-color ivory (shown on Atlantic)
    label("One-color  ·  Ivory  (for dark backgrounds)", margin, 2160)
    label("One-color  ·  Ivory  ·  horizontal", 1240, 2160)
    paste_fit(assets["stacked-ivory"], (margin, 2200, 1080, 400), bg=ATLANTIC)
    paste_fit(assets["horizontal-ivory"], (1240, 2200, 1080, 400), bg=ATLANTIC)

    # The sheet is getting tight — put favicons in a footer row by
    # extending if needed. We'll use a taller canvas if this clips;
    # 3000 should just fit a compact favicon row.
    # Actually 2200+400 = 2600, room for favicon row at 2680.
    label("Pin-only favicon  ·  32  ·  180  ·  512", margin, 2640)
    # Place favicons at native-ish sizes, left to right
    fx = margin
    fy = 2690
    for key, box in (("fav32", 64), ("fav180", 180), ("fav512", 220)):
        im = assets[key].convert("RGBA")
        # draw a light hairline so ivory icons don't disappear
        bw = box + 8
        draw.rounded_rectangle([fx, fy, fx + bw, fy + bw], 8, outline="#D9D4C8", width=2)
        im2 = im.resize((box, box), Image.Resampling.LANCZOS)
        img.paste(im2, (fx + 4, fy + 4), im2)
        fx += bw + 36

    # Pin only color / atlantic / ivory at the right of the favicon row
    label("Pin  ·  color, Atlantic, ivory", 1240, 2640)
    px = 1240
    for key, bg in (("pin-color", "#FFFFFF"), ("pin-atlantic", "#FFFFFF"), ("pin-ivory", ATLANTIC)):
        box = 180
        draw.rounded_rectangle([px, fy, px + box, fy + box], 16, fill=bg)
        im = assets[key].convert("RGBA")
        sc = min(140 / im.width, 140 / im.height)
        nw, nh = int(im.width * sc), int(im.height * sc)
        im2 = im.resize((nw, nh), Image.Resampling.LANCZOS)
        img.paste(im2, (px + (box - nw) // 2, fy + (box - nh) // 2), im2)
        px += box + 24

    out = ROOT / "variants-sheet.png"
    img.save(out, "PNG", optimize=True)
    return out


def pin_only_svg(mode="color", color=ATLANTIC, bg=None, ids="p"):
    # Tight viewBox around the pin with a little padding, in the pin's
    # own coordinate space scaled into a convenient canvas.
    pad = 40
    pinh = 1230
    pinw = 960
    W = pinw + pad * 2
    H = pinh + pad * 2
    body = pin_group(pad, pad, pinh, ids, mode, color)
    return svg_wrap(W, H, body, title="SearchRhody", bg=bg), W, H


def main():
    site = ROOT.parent  # /workspace/searchrhody-site

    # --- Stacked primary (color, transparent SVG, ivory PNG via a bg sibling)
    color_stacked, sw, sh = stacked_svg(ATLANTIC, CORAL, ATLANTIC, ids="st")
    save_pair("searchrhody-logo-stacked", color_stacked, 1400)
    # Also a preview PNG already written with transparent bg; composite onto ivory for the 1x/2x kit
    def ivory_composite(stem, w, h, width_1x):
        """Re-export PNGs with an ivory background for the brand kit."""
        svg = (ROOT / f"{stem}.svg").read_text()
        # Wrap with ivory background for PNG only, leave SVG transparent
        with_bg = svg.replace("<title", f'<rect width="100%" height="100%" fill="{IVORY}"/><title', 1)
        tmp = ROOT / f"_{stem}-ivorybg.svg"
        tmp.write_text(with_bg)
        export_png(tmp, ROOT / f"{stem}.png", width_1x)
        export_png(tmp, ROOT / f"{stem}@2x.png", width_1x * 2)
        tmp.unlink()

    ivory_composite("searchrhody-logo-stacked", sw, sh, 1400)

    # --- Horizontal header lockup
    color_h, hw, hh = horizontal_svg(ATLANTIC, CORAL, ATLANTIC, ids="hz")
    # 1x width chosen so the lockup is crisp in headers and print
    h_width = 1600
    save_pair("searchrhody-logo-horizontal", color_h, h_width)
    ivory_composite("searchrhody-logo-horizontal", hw, hh, h_width)

    # --- Light-on-navy (Atlantic background in both SVG and PNG)
    navy_s, _, _ = stacked_svg(IVORY, CORAL, IVORY, ids="stn", bg=ATLANTIC)
    save_pair("searchrhody-logo-stacked-navy", navy_s, 1400)
    navy_h, _, _ = horizontal_svg(IVORY, CORAL, IVORY, ids="hzn", bg=ATLANTIC)
    save_pair("searchrhody-logo-horizontal-navy", navy_h, h_width)

    # --- One-color Atlantic (transparent SVG; ivory PNG)
    atl_s, _, _ = stacked_svg(
        ATLANTIC, ATLANTIC, ATLANTIC, pin_mode="mono", pin_color=ATLANTIC, ids="sta"
    )
    save_pair("searchrhody-logo-stacked-atlantic", atl_s, 1400)
    ivory_composite("searchrhody-logo-stacked-atlantic", sw, sh, 1400)
    atl_h, _, _ = horizontal_svg(
        ATLANTIC, ATLANTIC, ATLANTIC, pin_mode="mono", pin_color=ATLANTIC, ids="hza"
    )
    save_pair("searchrhody-logo-horizontal-atlantic", atl_h, h_width)
    ivory_composite("searchrhody-logo-horizontal-atlantic", hw, hh, h_width)

    # --- One-color ivory (transparent SVG; Atlantic PNG so it reads)
    def atlantic_composite(stem, width_1x):
        svg = (ROOT / f"{stem}.svg").read_text()
        with_bg = svg.replace("<title", f'<rect width="100%" height="100%" fill="{ATLANTIC}"/><title', 1)
        tmp = ROOT / f"_{stem}-navybg.svg"
        tmp.write_text(with_bg)
        export_png(tmp, ROOT / f"{stem}.png", width_1x)
        export_png(tmp, ROOT / f"{stem}@2x.png", width_1x * 2)
        tmp.unlink()

    ivy_s, _, _ = stacked_svg(IVORY, IVORY, IVORY, pin_mode="mono", pin_color=IVORY, ids="sti")
    save_pair("searchrhody-logo-stacked-ivory", ivy_s, 1400)
    atlantic_composite("searchrhody-logo-stacked-ivory", 1400)
    ivy_h, _, _ = horizontal_svg(IVORY, IVORY, IVORY, pin_mode="mono", pin_color=IVORY, ids="hzi")
    save_pair("searchrhody-logo-horizontal-ivory", ivy_h, h_width)
    atlantic_composite("searchrhody-logo-horizontal-ivory", h_width)

    # --- Pin-only color / mono (SVG transparent; PNG with contrasting ground)
    pin_c, pw, ph = pin_only_svg(mode="color", ids="pc")
    write_svg(ROOT / "searchrhody-pin-color.svg", pin_c)
    # Do not overwrite searchrhody-pin.svg — that is the approved master.
    export_png(write_svg(ROOT / "_pin-color-tmp.svg", pin_c), ROOT / "searchrhody-pin-color.png", 960)
    export_png(ROOT / "_pin-color-tmp.svg", ROOT / "searchrhody-pin-color@2x.png", 1920)
    (ROOT / "_pin-color-tmp.svg").unlink()

    pin_a, _, _ = pin_only_svg(mode="mono", color=ATLANTIC, ids="pa")
    save_pair("searchrhody-pin-atlantic", pin_a, 960)
    ivory_composite("searchrhody-pin-atlantic", pw, ph, 960)

    pin_i, _, _ = pin_only_svg(mode="mono", color=IVORY, ids="pi")
    save_pair("searchrhody-pin-ivory", pin_i, 960)
    atlantic_composite("searchrhody-pin-ivory", 960)

    # --- Favicon set in brand/ and site root
    fav = favicon_svg(size=512, ids="fav")
    write_svg(ROOT / "favicon.svg", fav)
    write_svg(site / "favicon.svg", fav)
    export_png(ROOT / "favicon.svg", ROOT / "favicon-32.png", 32)
    export_png(ROOT / "favicon.svg", site / "favicon-32.png", 32)
    export_png(ROOT / "favicon.svg", ROOT / "apple-touch-icon-180.png", 180)
    export_png(ROOT / "favicon.svg", site / "apple-touch-icon-180.png", 180)
    export_png(ROOT / "favicon.svg", ROOT / "icon-512.png", 512)
    export_png(ROOT / "favicon.svg", site / "icon-512.png", 512)

    # --- Variants sheet
    def load(name):
        return Image.open(ROOT / name)

    # pin-color PNG is transparent; others as exported
    assets = {
        "stacked": load("searchrhody-logo-stacked.png"),
        "horizontal": load("searchrhody-logo-horizontal.png"),
        "stacked-navy": load("searchrhody-logo-stacked-navy.png"),
        "horizontal-navy": load("searchrhody-logo-horizontal-navy.png"),
        "stacked-atlantic": load("searchrhody-logo-stacked-atlantic.png"),
        "horizontal-atlantic": load("searchrhody-logo-horizontal-atlantic.png"),
        "stacked-ivory": load("searchrhody-logo-stacked-ivory.png"),
        "horizontal-ivory": load("searchrhody-logo-horizontal-ivory.png"),
        "fav32": load("favicon-32.png"),
        "fav180": load("apple-touch-icon-180.png"),
        "fav512": load("icon-512.png"),
        "pin-color": load("searchrhody-pin-color.png"),
        "pin-atlantic": load("searchrhody-pin-atlantic.png"),
        "pin-ivory": load("searchrhody-pin-ivory.png"),
    }
    sheet = compose_sheet(assets)
    print("Wrote", sheet)
    print("Done.")


if __name__ == "__main__":
    main()
