"use client";

import { useState, ReactNode } from "react";
import { HexColorPicker } from "react-colorful";
import { ChevronDown } from "lucide-react";
import { PopoverPortal } from "./PopoverPortal";

/* ── Collapsible panel (accordion section) ─────────────────────────────────── */
export function Panel({
  title, children, defaultOpen = true, badge,
}: { title: string; children: ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid #1f2d45", borderRadius: 12, background: "#0f1520", marginBottom: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "0.75rem 1rem", background: "transparent", border: "none",
          color: "#e5e7eb", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
        }}
      >
        {title}
        {badge && (
          <span style={{ fontSize: "0.6rem", color: "#4d607e", fontWeight: 600 }}>{badge}</span>
        )}
        <ChevronDown
          size={16}
          style={{ marginLeft: "auto", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#4d607e" }}
        />
      </button>
      {open && <div style={{ padding: "0 1rem 1rem", display: "grid", gap: 12 }}>{children}</div>}
    </div>
  );
}

/* ── Field label wrapper ───────────────────────────────────────────────────── */
function Label({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: "0.72rem", color: "#8b9ab5", fontWeight: 600, display: "block", marginBottom: 5 }}>
      {children}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0a0f18", border: "1px solid #263450",
  borderRadius: 8, padding: "0.5rem 0.65rem", color: "#e5e7eb",
  fontSize: "0.8rem", outline: "none",
};

/* ── Text input ────────────────────────────────────────────────────────────── */
export function TextInput({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: "block" }}>
      <Label>{label}</Label>
      <input style={inputStyle} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/* ── Textarea ──────────────────────────────────────────────────────────────── */
export function TextArea({
  label, value, onChange, rows = 3, hint,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <Label>{label}</Label>
      <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} rows={rows} value={value}
        onChange={(e) => onChange(e.target.value)} />
      {hint && <span style={{ fontSize: "0.65rem", color: "#4d607e" }}>{hint}</span>}
    </label>
  );
}

/* ── Toggle ────────────────────────────────────────────────────────────────── */
export function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
      <span style={{ fontSize: "0.78rem", color: "#c9d3e3", fontWeight: 600 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer",
          background: checked ? "#6366f1" : "#263450", position: "relative", transition: "background 0.2s",
        }}
        aria-pressed={checked}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 20 : 2, width: 18, height: 18,
          borderRadius: "50%", background: "#fff", transition: "left 0.2s",
        }} />
      </button>
    </label>
  );
}

/* ── Range slider (with number) ────────────────────────────────────────────── */
export function Range({
  label, value, onChange, min = 0, max = 100, step = 1, unit = "",
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <Label>{label}</Label>
        <span style={{ fontSize: "0.72rem", color: "#c9d3e3", fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#6366f1" }} />
    </label>
  );
}

/* ── Color field (swatch → portaled picker + hex input) ────────────────────── */
export function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  // Only feed react-colorful a real hex (it can't parse gradients/rgba).
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Portaled so the picker is never clipped by the scrollable panel */}
        <PopoverPortal
          button={() => (
            <button
              type="button"
              style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid #263450",
                background: value, cursor: "pointer", flexShrink: 0,
              }}
              aria-label={`Pick ${label}`}
            />
          )}
        >
          <HexColorPicker color={isHex ? value : "#1e90ff"} onChange={onChange} />
        </PopoverPortal>
        <input
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
