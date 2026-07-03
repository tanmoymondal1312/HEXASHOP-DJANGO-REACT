"use client";

import { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, ChevronDown } from "lucide-react";
import type { HeroButton } from "@/types/hero";
import { newButton } from "@/lib/heroDefaults";
import { TextInput, ColorField, Range } from "./Controls";

interface Props {
  buttons: HeroButton[];
  onChange: (buttons: HeroButton[]) => void;
}

export default function ButtonBuilder({ buttons, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = buttons.findIndex((b) => b.id === active.id);
    const newIndex = buttons.findIndex((b) => b.id === over.id);
    onChange(arrayMove(buttons, oldIndex, newIndex));
  };

  const update = (id: string, patch: Partial<HeroButton>) =>
    onChange(buttons.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const updateStyle = (id: string, patch: Partial<HeroButton["style"]>) =>
    onChange(buttons.map((b) => (b.id === id ? { ...b, style: { ...b.style, ...patch } } : b)));
  const remove = (id: string) => onChange(buttons.filter((b) => b.id !== id));
  const add = () => onChange([...buttons, newButton(`b${Date.now()}`)]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={buttons.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {buttons.map((b) => (
            <SortableButton
              key={b.id}
              button={b}
              onUpdate={(patch) => update(b.id, patch)}
              onUpdateStyle={(patch) => updateStyle(b.id, patch)}
              onRemove={() => remove(b.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button onClick={add} style={addBtn}>
        <Plus size={15} /> Add button
      </button>
    </div>
  );
}

function SortableButton({
  button, onUpdate, onUpdateStyle, onRemove,
}: {
  button: HeroButton;
  onUpdate: (p: Partial<HeroButton>) => void;
  onUpdateStyle: (p: Partial<HeroButton["style"]>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: button.id });
  const s = button.style;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), transition,
        border: "1px solid #263450", borderRadius: 10, background: "#0f1520",
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.55rem 0.6rem" }}>
        <button {...attributes} {...listeners} style={handleBtn} title="Drag to reorder">
          <GripVertical size={15} />
        </button>
        <button onClick={() => setOpen((o) => !o)}
          style={{ flex: 1, textAlign: "left", background: "transparent", border: "none", color: "#e5e7eb", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{button.text || "(no label)"}</span>
          <ChevronDown size={14} style={{ marginLeft: "auto", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#4d607e" }} />
        </button>
        <button onClick={onRemove} style={{ ...handleBtn, color: "#ef4444" }} title="Delete button">
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div style={{ padding: "0 0.7rem 0.8rem", display: "grid", gap: 10 }}>
          <TextInput label="Text" value={button.text} onChange={(v) => onUpdate({ text: v })} />
          <TextInput label="Link (URL)" value={button.link} onChange={(v) => onUpdate({ link: v })} placeholder="/shop" />
          <ColorField label="Background (color or gradient)" value={s.bg} onChange={(v) => updateStyleSafe(onUpdateStyle, "bg", v)} />
          <ColorField label="Text color" value={s.color} onChange={(v) => onUpdateStyle({ color: v })} />
          <ColorField label="Border color" value={s.borderColor} onChange={(v) => onUpdateStyle({ borderColor: v })} />
          <Range label="Border radius" value={s.borderRadius} min={0} max={999} step={1} unit="px" onChange={(v) => onUpdateStyle({ borderRadius: v })} />
          <Range label="Font size" value={s.fontSize} min={0.5} max={1.6} step={0.02} unit="rem" onChange={(v) => onUpdateStyle({ fontSize: v })} />
          <Range label="Font weight" value={s.fontWeight} min={100} max={900} step={100} onChange={(v) => onUpdateStyle({ fontWeight: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Range label="Padding X" value={s.paddingX} min={0} max={60} step={1} unit="px" onChange={(v) => onUpdateStyle({ paddingX: v })} />
            <Range label="Padding Y" value={s.paddingY} min={0} max={40} step={1} unit="px" onChange={(v) => onUpdateStyle({ paddingY: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextInput label="Width" value={s.width ?? "auto"} onChange={(v) => onUpdateStyle({ width: v })} placeholder="auto" />
            <TextInput label="Height" value={s.height ?? "auto"} onChange={(v) => onUpdateStyle({ height: v })} placeholder="auto" />
          </div>
          <TextInput label="Shadow (CSS)" value={s.shadow} onChange={(v) => onUpdateStyle({ shadow: v })} placeholder="0 4px 14px rgba(0,0,0,0.3)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Range label="Hover opacity" value={s.hover?.opacity ?? 0.88} min={0.3} max={1} step={0.02}
              onChange={(v) => onUpdateStyle({ hover: { opacity: v, translateY: s.hover?.translateY ?? -1 } })} />
            <Range label="Hover lift" value={s.hover?.translateY ?? -1} min={-8} max={0} step={1} unit="px"
              onChange={(v) => onUpdateStyle({ hover: { opacity: s.hover?.opacity ?? 0.88, translateY: v } })} />
          </div>
        </div>
      )}
    </div>
  );
}

function updateStyleSafe(fn: (p: Partial<HeroButton["style"]>) => void, key: keyof HeroButton["style"], value: string) {
  fn({ [key]: value } as Partial<HeroButton["style"]>);
}

const handleBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center",
  border: "none", background: "transparent", color: "#8b9ab5", cursor: "grab",
};
const addBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  border: "1px dashed #263450", borderRadius: 9, padding: "0.6rem", background: "transparent",
  color: "#a5b4fc", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
};
