// ── Hero Builder document schema (mirrors backend hero_defaults.py) ───────────
// `title` / `promo` are native Tiptap JSON. React renders them directly — no HTML
// is ever stored. This is the single source of truth for the slide shape.

export interface TiptapMark {
  type: string; // "bold" | "italic" | "underline" | "textStyle" | "highlight" | "gradient"
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string; // "doc" | "paragraph" | "text" | "hardBreak"
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

export interface HeroBackground {
  color: string;
  opacity: number;
  hexColor: string;
  starColor: string;
}

export interface HeroImageRef {
  assetId: number | null;
  url: string | null;
  alt: string;
}

export interface HeroBadge {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number; // rem
  paddingX: number; // px
  paddingY: number; // px
}

export interface HeroTextField {
  text: string;
  color: string;
}

export interface HeroButtonHover {
  opacity: number;
  translateY: number; // px
}

export interface HeroButtonStyle {
  bg: string;
  color: string;
  borderColor: string;
  borderRadius: number; // px
  fontSize: number; // rem
  fontWeight: number;
  paddingX: number; // px
  paddingY: number; // px
  shadow: string;
  width?: string; // "auto" | "120px" | "100%" …
  height?: string; // "auto" | "44px" …
  hover?: HeroButtonHover;
}

export interface HeroButton {
  id: string;
  text: string;
  link: string;
  style: HeroButtonStyle;
}

export interface HeroDocument {
  version: number;
  background: HeroBackground;
  image: HeroImageRef;
  badge: HeroBadge;
  title: TiptapNode;
  subtitle: HeroTextField;
  description: HeroTextField;
  promo: TiptapNode | null;
  buttons: HeroButton[];
}

export interface HeroSlideDTO {
  id: number;
  name: string;
  document: HeroDocument;
  sort_order: number;
}

// Admin payload adds status/scheduling fields.
export interface HeroSlideAdminDTO extends HeroSlideDTO {
  schema_version: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
}
