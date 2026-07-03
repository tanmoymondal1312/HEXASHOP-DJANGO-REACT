import type { HeroButton, HeroDocument, TiptapNode } from "@/types/hero";

export const HERO_SCHEMA_VERSION = 1;

/** A fresh button with sensible gold-CTA defaults (used by the Button Builder). */
export function newButton(id: string): HeroButton {
  return {
    id, text: "NEW BUTTON", link: "/shop",
    style: {
      bg: "linear-gradient(135deg,#f5a623 0%,#f59e0b 100%)", color: "#000000",
      borderColor: "transparent", borderRadius: 6, fontSize: 0.8, fontWeight: 800,
      paddingX: 26, paddingY: 10, shadow: "0 4px 14px rgba(245,166,35,0.35)",
      width: "auto", height: "auto", hover: { opacity: 0.88, translateY: -1 },
    },
  };
}

const titleDoc = (text: string): TiptapNode => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text, marks: [{ type: "textStyle", attrs: { color: "#ffffff" } }] }] }],
});

/** A complete blank slide document (mirrors backend hero_defaults.blank_document). */
export function blankDocument(): HeroDocument {
  return {
    version: HERO_SCHEMA_VERSION,
    background: { color: "#0d1a2d", opacity: 1, hexColor: "#1e90ff", starColor: "#f5a623" },
    image: { assetId: null, url: null, alt: "" },
    badge: {
      enabled: false, text: "", bgColor: "rgba(30,144,255,0.14)", textColor: "#1e90ff",
      borderRadius: 999, fontSize: 0.58, paddingX: 14, paddingY: 5,
    },
    title: titleDoc("New Slide"),
    subtitle: { text: "", color: "#94a3b8" },
    description: { text: "", color: "#94a3b8" },
    promo: null,
    buttons: [{ ...newButton("b1"), text: "SHOP NOW" }],
  };
}

/** Merge a possibly-partial document (e.g. `{}` from a freshly created slide)
 *  with the blank defaults so every control has a defined value to bind to. */
export function normalizeDocument(doc: Partial<HeroDocument> | null | undefined): HeroDocument {
  const base = blankDocument();
  if (!doc || typeof doc !== "object") return base;
  return {
    ...base,
    ...doc,
    background: { ...base.background, ...(doc.background ?? {}) },
    image: { ...base.image, ...(doc.image ?? {}) },
    badge: { ...base.badge, ...(doc.badge ?? {}) },
    subtitle: { ...base.subtitle, ...(doc.subtitle ?? {}) },
    description: { ...base.description, ...(doc.description ?? {}) },
    title: doc.title ?? base.title,
    promo: doc.promo ?? null,
    buttons: doc.buttons ?? base.buttons,
  };
}
