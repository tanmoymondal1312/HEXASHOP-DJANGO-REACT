"""
Hero slide JSON-document helpers.

Single source of truth for the shape of a HeroSlide `document`. Used by:
  • the data migration that ports the original 3 hardcoded storefront slides
  • the "create new slide" API default (a sensible blank slide)

`title` / `promo` are **native Tiptap JSON** — the frontend renders them
directly (see frontend TiptapRenderer). No HTML is ever stored.

Schema (version 1):
{
  "version": 1,
  "background": {"color", "opacity", "hexColor", "starColor"},
  "image": {"assetId": int|None, "url": str|None, "alt": str},
  "badge": {"enabled", "text", "bgColor", "textColor", "borderRadius",
            "fontSize", "paddingX", "paddingY"},
  "title":  <Tiptap doc>,
  "subtitle": {"text", "color"},
  "description": {"text", "color"},
  "promo": <Tiptap doc>|None,
  "buttons": [{"id", "text", "link", "style": {...}}]
}
"""

SCHEMA_VERSION = 1


# ── Tiptap JSON builders ──────────────────────────────────────────────────────
def _text(value, *, color=None, gradient=None, bold=False, italic=False,
          underline=False, highlight=None):
    """Build one Tiptap text node with optional marks."""
    marks = []
    if bold:
        marks.append({"type": "bold"})
    if italic:
        marks.append({"type": "italic"})
    if underline:
        marks.append({"type": "underline"})
    if highlight:
        marks.append({"type": "highlight", "attrs": {"color": highlight}})
    if gradient:
        marks.append({"type": "gradient",
                      "attrs": {"from": gradient[0], "to": gradient[1]}})
    if color:
        marks.append({"type": "textStyle", "attrs": {"color": color}})
    node = {"type": "text", "text": value}
    if marks:
        node["marks"] = marks
    return node


def _para(*text_nodes, align=None):
    node = {"type": "paragraph", "content": list(text_nodes)}
    if align:
        node["attrs"] = {"textAlign": align}
    return node


def _doc(*paragraphs):
    return {"type": "doc", "content": list(paragraphs)}


# ── Button style presets (reproduce the original storefront look) ─────────────
def _btn(bid, text, link, style):
    return {"id": bid, "text": text, "link": link, "style": style}


_GOLD = {
    "bg": "linear-gradient(135deg,#f5a623 0%,#f59e0b 100%)",
    "color": "#000", "borderColor": "transparent", "borderRadius": 6,
    "fontSize": 0.8, "fontWeight": 800, "paddingX": 26, "paddingY": 10,
    "shadow": "0 4px 14px rgba(245,166,35,0.35)",
}


def _outline(color="#fff", border="rgba(255,255,255,0.22)"):
    return {
        "bg": "transparent", "color": color, "borderColor": border,
        "borderRadius": 6, "fontSize": 0.8, "fontWeight": 600,
        "paddingX": 21, "paddingY": 10, "shadow": "none",
    }


def _bg(color, hex_color, star_color, opacity=1.0):
    return {"color": color, "opacity": opacity,
            "hexColor": hex_color, "starColor": star_color}


# ── Blank default (used by "Add New Slider") ──────────────────────────────────
def blank_document():
    return {
        "version": SCHEMA_VERSION,
        "background": _bg("#0d1a2d", "#1e90ff", "#f5a623"),
        "image": {"assetId": None, "url": None, "alt": ""},
        "badge": {
            "enabled": False, "text": "", "bgColor": "rgba(30,144,255,0.14)",
            "textColor": "#1e90ff", "borderRadius": 999, "fontSize": 0.58,
            "paddingX": 14, "paddingY": 5,
        },
        "title": _doc(_para(_text("New Slide", color="#ffffff"))),
        "subtitle": {"text": "", "color": "#94a3b8"},
        "description": {"text": "", "color": "#94a3b8"},
        "promo": None,
        "buttons": [_btn("b1", "SHOP NOW", "/shop", dict(_GOLD))],
    }


# ── The 3 ported storefront slides (visual parity with the old static hero) ────
def seed_documents():
    """Return [(name, document, sort_order), ...] for the 3 original slides."""
    slide1 = {
        "version": SCHEMA_VERSION,
        "background": _bg("#0d1a2d", "#1e90ff", "#f5a623"),
        # image url None → storefront falls back to the SiteSettings hero image
        "image": {"assetId": None, "url": None, "alt": "HEXASHOP"},
        "badge": {"enabled": False, "text": "", "bgColor": "rgba(30,144,255,0.14)",
                  "textColor": "#1e90ff", "borderRadius": 999, "fontSize": 0.58,
                  "paddingX": 14, "paddingY": 5},
        "title": _doc(_para(
            _text("HEXA", color="#ffffff"),
            _text("SHOP", color="#1e90ff"),
        )),
        "subtitle": {"text": "Style That Defines You", "color": "#94a3b8"},
        "description": {
            "text": "Discover the latest trends in fashion.\n"
                    "Premium quality. Best prices.",
            "color": "#94a3b8",
        },
        "promo": None,
        "buttons": [
            _btn("b1", "SHOP NOW", "/shop", dict(_GOLD)),
            _btn("b2", "EXPLORE COLLECTION", "/shop?is_featured=true", _outline()),
        ],
    }

    slide2 = {
        "version": SCHEMA_VERSION,
        "background": _bg("#1a070d", "#d4af37", "#d4af37"),
        "image": {"assetId": None, "url": "/slides/sharee-lehenga.jpg",
                  "alt": "Sharee and Lehenga Collection"},
        "badge": {
            "enabled": True, "text": "✦ Ethnic Collection 2025 ✦",
            "bgColor": "linear-gradient(135deg, rgba(212,175,55,0.14), rgba(160,40,70,0.14))",
            "textColor": "#d4af37", "borderRadius": 999, "fontSize": 0.58,
            "paddingX": 14, "paddingY": 5,
        },
        "title": _doc(
            _para(_text("ETHNIC", color="#ffffff")),
            _para(_text("GRACE", gradient=("#d4af37", "#c9a227"))),
        ),
        "subtitle": {"text": "Sharee & Lehenga Collection", "color": "#c9a227"},
        "description": {
            "text": "Drape yourself in timeless elegance.\n"
                    "Exquisite handcrafted ethnic wear for every celebration.",
            "color": "#94a3b8",
        },
        "promo": None,
        "buttons": [
            _btn("b1", "EXPLORE NOW", "/shop", {
                **_GOLD,
                "bg": "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
                "shadow": "0 4px 14px rgba(212,175,55,0.38)",
            }),
            _btn("b2", "VIEW COLLECTION", "/shop",
                 _outline("#d4af37", "rgba(212,175,55,0.38)")),
        ],
    }

    slide3 = {
        "version": SCHEMA_VERSION,
        "background": _bg("#030e07", "#22c55e", "#22c55e"),
        "image": {"assetId": None, "url": "/slides/low-cost-fashion.jpg",
                  "alt": "Budget Fashion Deals"},
        "badge": {
            "enabled": True, "text": "🔥 UPTO 70% OFF",
            "bgColor": "linear-gradient(135deg, #ef4444, #dc2626)",
            "textColor": "#ffffff", "borderRadius": 8, "fontSize": 0.7,
            "paddingX": 14, "paddingY": 5,
        },
        "title": _doc(
            _para(_text("BIG", color="#ffffff")),
            _para(_text("SAVINGS", gradient=("#22c55e", "#86efac"))),
        ),
        "subtitle": {"text": "Fashion Starts at Just $29", "color": "#22c55e"},
        "description": {
            "text": "Why spend more when you can look amazing for less?\n"
                    "Discover our budget collection — new deals every day!",
            "color": "#94a3b8",
        },
        "promo": _doc(_para(
            _text("Starting from ", color="#9ca3af"),
            _text("$29", gradient=("#22c55e", "#86efac"), bold=True),
        )),
        "buttons": [
            _btn("b1", "SHOP DEALS", "/shop?ordering=base_price", {
                **_GOLD,
                "bg": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                "color": "#ffffff",
                "shadow": "0 4px 14px rgba(34,197,94,0.38)",
            }),
            _btn("b2", "ALL OFFERS", "/shop",
                 _outline("#22c55e", "rgba(34,197,94,0.38)")),
        ],
    }

    return [
        ("HEXASHOP Main", slide1, 0),
        ("Ethnic Grace", slide2, 1),
        ("Big Savings", slide3, 2),
    ]
