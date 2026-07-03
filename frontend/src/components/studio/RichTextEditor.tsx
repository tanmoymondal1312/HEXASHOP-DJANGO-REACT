"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { HexColorPicker } from "react-colorful";
import {
  Bold, Italic, Underline as UnderIcon, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Baseline, Sparkles,
} from "lucide-react";
import type { TiptapNode } from "@/types/hero";
import { GradientMark, TypographyStyle } from "./extensions";

const FONT_SIZES = ["1rem", "1.5rem", "2rem", "2.6rem", "3.2rem", "4rem", "5rem"];
const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];
const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Inter (default)", value: "Inter, sans-serif" },
  { label: "System sans", value: "system-ui, sans-serif" },
  { label: "Serif (Georgia)", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
];

interface Props {
  value: TiptapNode;
  onChange: (doc: TiptapNode) => void;
  /** Placeholder styling context (title vs promo). */
  minHeight?: number;
}

/**
 * Custom Tiptap editor for hero rich text. Emits native Tiptap JSON (never HTML)
 * via onChange. Toolbar: bold/italic/underline, text colour, gradient text,
 * highlight, alignment, font size.
 */
export default function RichTextEditor({ value, onChange, minHeight = 90 }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TypographyStyle,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      GradientMark,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapNode),
  });

  // Keep editor content in sync if the document is swapped externally
  // (e.g. loading a different slide). Avoid clobbering while the user types.
  const lastEmitted = useRef<string>("");
  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(value);
    const current = JSON.stringify(editor.getJSON());
    if (incoming !== current && incoming !== lastEmitted.current) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => { lastEmitted.current = JSON.stringify(editor.getJSON()); };
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor]);

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #263450", borderRadius: 10, overflow: "hidden", background: "#0a0f18" }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="hx-rte" style={{ minHeight }} />
      <style>{`
        .hx-rte .ProseMirror {
          padding: 0.7rem 0.8rem; outline: none; color: #e5e7eb;
          font-size: 1.4rem; font-weight: 800; line-height: 1.15; min-height: ${minHeight}px;
        }
        .hx-rte .ProseMirror p { margin: 0; }
        .hx-rte .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  );
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */
function Toolbar({ editor }: { editor: Editor }) {
  const [showText, setShowText] = useState(false);
  const [showHi, setShowHi] = useState(false);
  const [showGrad, setShowGrad] = useState(false);
  const [gFrom, setGFrom] = useState("#f5a623");
  const [gTo, setGTo] = useState("#1e90ff");

  const btn = (active: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center",
    border: "1px solid " + (active ? "#6366f1" : "#263450"),
    background: active ? "rgba(99,102,241,0.18)" : "transparent",
    color: active ? "#a5b4fc" : "#8b9ab5", cursor: "pointer",
  });

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 5, padding: "0.5rem",
      borderBottom: "1px solid #1f2d45", background: "#0f1520", position: "relative",
    }}>
      <button style={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={15} /></button>
      <button style={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={15} /></button>
      <button style={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderIcon size={15} /></button>

      <Divider />

      {/* Text colour */}
      <Popover open={showText} setOpen={setShowText} icon={<Baseline size={15} />} active={editor.isActive("textStyle")} title="Text colour">
        <HexColorPicker color="#ffffff" onChange={(c) => editor.chain().focus().setColor(c).run()} />
        <button style={clearBtn} onClick={() => editor.chain().focus().unsetColor().run()}>Clear colour</button>
      </Popover>

      {/* Gradient text */}
      <Popover open={showGrad} setOpen={setShowGrad} icon={<Sparkles size={15} />} active={editor.isActive("gradient")} title="Gradient text">
        <div style={{ display: "grid", gap: 8, width: 200 }}>
          <span style={{ fontSize: "0.7rem", color: "#8b9ab5" }}>From</span>
          <HexColorPicker color={gFrom} onChange={setGFrom} />
          <span style={{ fontSize: "0.7rem", color: "#8b9ab5" }}>To</span>
          <HexColorPicker color={gTo} onChange={setGTo} />
          <button style={applyBtn} onClick={() => editor.chain().focus().setMark("gradient", { from: gFrom, to: gTo }).run()}>Apply gradient</button>
          <button style={clearBtn} onClick={() => editor.chain().focus().unsetMark("gradient").run()}>Remove gradient</button>
        </div>
      </Popover>

      {/* Highlight */}
      <Popover open={showHi} setOpen={setShowHi} icon={<Highlighter size={15} />} active={editor.isActive("highlight")} title="Highlight">
        <HexColorPicker color="#facc15" onChange={(c) => editor.chain().focus().setHighlight({ color: c }).run()} />
        <button style={clearBtn} onClick={() => editor.chain().focus().unsetHighlight().run()}>Clear highlight</button>
      </Popover>

      <Divider />

      <button style={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left"><AlignLeft size={15} /></button>
      <button style={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center"><AlignCenter size={15} /></button>
      <button style={btn(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right"><AlignRight size={15} /></button>

      <Divider />

      {/* Font family */}
      <select
        onChange={(e) => editor.chain().focus().setMark("textStyle", { fontFamily: e.target.value }).run()}
        defaultValue=""
        style={selectStyle}
        title="Font family"
      >
        <option value="" disabled>Font</option>
        {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* Font weight */}
      <select
        onChange={(e) => editor.chain().focus().setMark("textStyle", { fontWeight: e.target.value }).run()}
        defaultValue=""
        style={selectStyle}
        title="Font weight"
      >
        <option value="" disabled>Weight</option>
        {FONT_WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
      </select>

      {/* Font size */}
      <select
        onChange={(e) => editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run()}
        defaultValue=""
        style={selectStyle}
        title="Font size"
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "#0a0f18", color: "#8b9ab5", border: "1px solid #263450",
  borderRadius: 7, fontSize: "0.75rem", padding: "0 6px", height: 30, cursor: "pointer",
  maxWidth: 110,
};

function Divider() {
  return <span style={{ width: 1, background: "#1f2d45", margin: "2px 3px" }} />;
}

function Popover({
  open, setOpen, icon, active, title, children,
}: {
  open: boolean; setOpen: (v: boolean) => void; icon: React.ReactNode;
  active: boolean; title: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        style={{
          width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center",
          border: "1px solid " + (active ? "#6366f1" : "#263450"),
          background: active ? "rgba(99,102,241,0.18)" : "transparent",
          color: active ? "#a5b4fc" : "#8b9ab5", cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
        title={title}
      >
        {icon}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 36, left: 0, zIndex: 60,
          background: "#141c2e", border: "1px solid #263450", borderRadius: 12,
          padding: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.55)", display: "grid", gap: 8,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

const applyBtn: React.CSSProperties = {
  background: "#6366f1", color: "#fff", border: "none", borderRadius: 7,
  padding: "0.4rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
};
const clearBtn: React.CSSProperties = {
  background: "transparent", color: "#8b9ab5", border: "1px solid #263450",
  borderRadius: 7, padding: "0.35rem", fontSize: "0.7rem", cursor: "pointer",
};
