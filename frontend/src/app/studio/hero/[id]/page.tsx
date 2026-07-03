"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, Trash2, Check } from "lucide-react";
import { studioApi, siteApi } from "@/lib/api";
import { normalizeDocument } from "@/lib/heroDefaults";
import type { HeroDocument, TiptapNode } from "@/types/hero";
import {
  Panel, TextInput, TextArea, Toggle, Range, ColorField,
} from "@/components/studio/Controls";
import RichTextEditor from "@/components/studio/RichTextEditor";
import ButtonBuilder from "@/components/studio/ButtonBuilder";
import SlideThumb from "@/components/studio/SlideThumb";

const DEFAULT_PROMO: TiptapNode = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Starting from $29" }] }],
};

export default function HeroEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [doc, setDoc] = useState<HeroDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fallbackImg, setFallbackImg] = useState<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await studioApi.heroSlides.get(id);
        setName(data.name);
        setIsActive(data.is_active);
        setDoc(normalizeDocument(data.document));
      } finally {
        setLoading(false);
      }
    })();
    siteApi.settings().then(({ data }) => setFallbackImg(data.hero_image_url)).catch(() => {});
  }, [id]);

  // ── document updaters ──────────────────────────────────────────────────────
  const patch = useCallback(<K extends keyof HeroDocument>(key: K, value: HeroDocument[K]) => {
    dirty.current = true;
    setSaved(false);
    setDoc((d) => (d ? { ...d, [key]: value } : d));
  }, []);
  const patchNested = useCallback(
    <K extends keyof HeroDocument>(key: K, partial: Partial<HeroDocument[K]>) => {
      dirty.current = true;
      setSaved(false);
      setDoc((d) => (d ? { ...d, [key]: { ...(d[key] as object), ...partial } } : d));
    }, []);

  const handleSave = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      await studioApi.heroSlides.update(id, { name, is_active: isActive, document: doc });
      await studioApi.revalidateStore(); // storefront reflects the save immediately
      dirty.current = false;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    const { data } = await studioApi.heroAssets.upload(file);
    patchNested("image", { assetId: data.id, url: data.url });
  };

  if (loading || !doc) {
    return <div style={{ padding: 40, color: "#8b9ab5" }}>Loading slide…</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,420px) 1fr", minHeight: "calc(100vh - 57px)" }}>
      {/* ── LEFT: controls ── */}
      <div style={{ borderRight: "1px solid #1f2d45", background: "#0a0f18", overflowY: "auto", maxHeight: "calc(100vh - 57px)" }}>
        {/* toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem",
          borderBottom: "1px solid #1f2d45", position: "sticky", top: 0, background: "#0a0f18", zIndex: 10,
        }}>
          <button onClick={() => router.push("/studio/hero")} style={backBtn} title="Back">
            <ArrowLeft size={17} />
          </button>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e5e7eb" }}>Edit slide</span>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7,
              background: saved ? "#10b981" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff", border: "none", borderRadius: 9, padding: "0.55rem 1rem",
              fontWeight: 700, fontSize: "0.82rem", cursor: saving ? "wait" : "pointer",
            }}
          >
            {saved ? <><Check size={15} /> Saved</> : <><Save size={15} /> {saving ? "Saving…" : "Save"}</>}
          </button>
        </div>

        <div style={{ padding: "1rem" }}>
          <Panel title="Slide">
            <TextInput label="Slide name (admin only)" value={name}
              onChange={(v) => { dirty.current = true; setName(v); }} placeholder="e.g. Ethnic Grace" />
            <Toggle label="Active (visible on store)" checked={isActive}
              onChange={(v) => { dirty.current = true; setIsActive(v); }} />
          </Panel>

          <Panel title="Background">
            <ColorField label="Background color" value={doc.background.color}
              onChange={(v) => patchNested("background", { color: v })} />
            <Range label="Background opacity" value={doc.background.opacity} min={0} max={1} step={0.05}
              onChange={(v) => patchNested("background", { opacity: v })} />
            <ColorField label="Hexagon color" value={doc.background.hexColor}
              onChange={(v) => patchNested("background", { hexColor: v })} />
            <ColorField label="Decorative star color" value={doc.background.starColor}
              onChange={(v) => patchNested("background", { starColor: v })} />
          </Panel>

          <Panel title="Hero Image">
            {doc.image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.image.url} alt="" style={{ maxHeight: 120, borderRadius: 8, background: "#090d12", objectFit: "contain", alignSelf: "start" }} />
            ) : (
              <div style={{ fontSize: "0.72rem", color: "#4d607e" }}>
                No image set. Slide 1 falls back to the admin hero image.
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ ...uploadBtn }}>
                <Upload size={14} /> Upload
                <input type="file" accept="image/*" hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              </label>
              {doc.image.url && (
                <button style={{ ...uploadBtn, color: "#ef4444" }}
                  onClick={() => patchNested("image", { assetId: null, url: null })}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <TextInput label="Image alt text" value={doc.image.alt}
              onChange={(v) => patchNested("image", { alt: v })} placeholder="Describe the image" />
          </Panel>

          <Panel title="Top Badge">
            <Toggle label="Show badge" checked={doc.badge.enabled}
              onChange={(v) => patchNested("badge", { enabled: v })} />
            <TextInput label="Badge text" value={doc.badge.text}
              onChange={(v) => patchNested("badge", { text: v })} placeholder="✦ Ethnic Collection 2025 ✦" />
            <ColorField label="Text color" value={doc.badge.textColor}
              onChange={(v) => patchNested("badge", { textColor: v })} />
            <ColorField label="Background (color or gradient)" value={doc.badge.bgColor}
              onChange={(v) => patchNested("badge", { bgColor: v })} />
            <Range label="Font size" value={doc.badge.fontSize} min={0.4} max={1.2} step={0.02} unit="rem"
              onChange={(v) => patchNested("badge", { fontSize: v })} />
            <Range label="Border radius" value={doc.badge.borderRadius} min={0} max={999} step={1} unit="px"
              onChange={(v) => patchNested("badge", { borderRadius: v })} />
            <Range label="Padding X" value={doc.badge.paddingX} min={0} max={40} step={1} unit="px"
              onChange={(v) => patchNested("badge", { paddingX: v })} />
            <Range label="Padding Y" value={doc.badge.paddingY} min={0} max={30} step={1} unit="px"
              onChange={(v) => patchNested("badge", { paddingY: v })} />
          </Panel>

          <Panel title="Main Title (rich text)">
            <div style={{ fontSize: "0.7rem", color: "#4d607e", marginTop: -4 }}>
              Select text, then apply colour, gradient, highlight, size or alignment.
            </div>
            <RichTextEditor value={doc.title} onChange={(t: TiptapNode) => patch("title", t)} minHeight={90} />
          </Panel>

          <Panel title="Subtitle">
            <TextInput label="Text" value={doc.subtitle.text}
              onChange={(v) => patchNested("subtitle", { text: v })} placeholder="Sharee & Lehenga Collection" />
            <ColorField label="Text color" value={doc.subtitle.color}
              onChange={(v) => patchNested("subtitle", { color: v })} />
          </Panel>

          <Panel title="Description">
            <TextArea label="Text (one line per row)" value={doc.description.text} rows={3}
              onChange={(v) => patchNested("description", { text: v })} />
            <ColorField label="Text color" value={doc.description.color}
              onChange={(v) => patchNested("description", { color: v })} />
          </Panel>

          <Panel title="Promo text" defaultOpen={false}>
            <Toggle
              label="Show promo text"
              checked={!!doc.promo}
              onChange={(v) => patch("promo", v ? (doc.promo ?? DEFAULT_PROMO) : null)}
            />
            {doc.promo && (
              <>
                <div style={{ fontSize: "0.7rem", color: "#4d607e" }}>
                  Rich text — select to apply colour, gradient, size, etc.
                </div>
                <RichTextEditor value={doc.promo} onChange={(t: TiptapNode) => patch("promo", t)} minHeight={70} />
              </>
            )}
          </Panel>

          <Panel title="Buttons" defaultOpen={false}>
            <ButtonBuilder buttons={doc.buttons} onChange={(b) => patch("buttons", b)} />
          </Panel>
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <div style={{ padding: "1.5rem", background: "#070b12", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4d607e" }}>
            Live preview
          </span>
          <span style={{ fontSize: "0.68rem", color: "#4d607e" }}>· updates as you edit</span>
          <Link href="/" target="_blank" style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#6366f1", textDecoration: "none" }}>
            Open store ↗
          </Link>
        </div>
        <div style={{ position: "sticky", top: 12 }}>
          <SlideThumb document={doc} fallbackImageUrl={fallbackImg} baseWidth={1280} baseHeight={620} />
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
  border: "1px solid #263450", background: "transparent", color: "#8b9ab5", cursor: "pointer",
};
const uploadBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
  border: "1px solid #263450", borderRadius: 8, padding: "0.45rem 0.7rem",
  fontSize: "0.75rem", color: "#c9d3e3", fontWeight: 600, background: "transparent",
};
