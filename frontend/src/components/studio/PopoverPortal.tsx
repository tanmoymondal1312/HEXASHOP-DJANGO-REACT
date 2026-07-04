"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * A popover whose panel is portaled to <body> and positioned `fixed` relative
 * to the trigger. This escapes every `overflow:hidden` / `overflow:auto`
 * ancestor (editor box, scrollable control column) so pickers are never clipped.
 * Closes on outside-click and on scroll/resize (to avoid drift).
 */
export function PopoverPortal({
  button, children, panelWidth = 236,
}: {
  button: (open: boolean) => ReactNode;
  children: ReactNode;
  panelWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    let left = r.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    // Prefer below the trigger; flip above if there isn't room.
    const estH = 300;
    let top = r.bottom + 6;
    if (top + estH > window.innerHeight - 8 && r.top - estH > 8) top = r.top - estH - 6;
    setPos({ top, left });
  }, [panelWidth]);

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  return (
    <span
      ref={anchorRef}
      style={{ display: "inline-flex" }}
      onClick={() => setOpen((o) => !o)}
    >
      {button(open)}
      {open && mounted && createPortal(
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", top: pos.top, left: pos.left, zIndex: 9999,
            width: panelWidth, background: "#141c2e", border: "1px solid #263450",
            borderRadius: 12, padding: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            display: "grid", gap: 8,
          }}
        >
          {children}
        </div>,
        document.body,
      )}
    </span>
  );
}
