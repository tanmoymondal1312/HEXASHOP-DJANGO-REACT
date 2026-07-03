"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { studioApi, siteApi } from "@/lib/api";
import { blankDocument } from "@/lib/heroDefaults";
import type { HeroSlideAdminDTO } from "@/types/hero";
import SlideThumb from "@/components/studio/SlideThumb";

export default function HeroListPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlideAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [fallbackImg, setFallbackImg] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studioApi.heroSlides.list();
      setSlides(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    siteApi.settings().then(({ data }) => setFallbackImg(data.hero_image_url)).catch(() => {});
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await studioApi.heroSlides.create({
        name: "Untitled slide",
        sort_order: slides.length,
        document: blankDocument(),
      });
      router.push(`/studio/hero/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete slide “${name}”? This cannot be undone.`)) return;
    await studioApi.heroSlides.remove(id);
    await studioApi.revalidateStore();
    setSlides((s) => s.filter((x) => x.id !== id));
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIndex, newIndex);
    setSlides(reordered); // optimistic
    await studioApi.heroSlides.reorder(reordered.map((s, i) => ({ id: s.id, sort_order: i })));
    await studioApi.revalidateStore();
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0 }}>Hero Builder</h1>
          <p style={{ color: "#8b9ab5", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Drag to reorder · changes go live after saving.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff",
            border: "none", borderRadius: 10, padding: "0.65rem 1.1rem",
            fontWeight: 700, fontSize: "0.85rem", cursor: creating ? "wait" : "pointer",
          }}
        >
          <Plus size={17} /> {creating ? "Creating…" : "Add New Slider"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#8b9ab5" }}>Loading slides…</p>
      ) : slides.length === 0 ? (
        <div style={{ border: "1px dashed #263450", borderRadius: 14, padding: "3rem", textAlign: "center", color: "#8b9ab5" }}>
          No slides yet. Click <strong style={{ color: "#c9d3e3" }}>Add New Slider</strong> to create one.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
              {slides.map((slide) => (
                <SortableCard
                  key={slide.id}
                  slide={slide}
                  fallbackImg={fallbackImg}
                  onDelete={() => handleDelete(slide.id, slide.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableCard({
  slide, fallbackImg, onDelete,
}: { slide: HeroSlideAdminDTO; fallbackImg: string | null; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), transition,
        background: "#0f1520", border: "1px solid #1f2d45", borderRadius: 14, padding: 12,
        display: "flex", flexDirection: "column", gap: 10, opacity: isDragging ? 0.6 : 1,
      }}
    >
      <SlideThumb document={slide.document} fallbackImageUrl={fallbackImg} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button {...attributes} {...listeners} style={{ ...iconBtn, border: "none", cursor: "grab" }} title="Drag to reorder">
          <GripVertical size={16} style={{ color: "#4d607e" }} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {slide.name}
          </div>
          <div style={{ fontSize: "0.68rem", color: slide.is_active ? "#10b981" : "#6b7280", fontWeight: 600 }}>
            {slide.is_active ? "● Active" : "○ Hidden"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Link href={`/studio/hero/${slide.id}`} style={iconBtn} title="Edit"><Pencil size={15} /></Link>
          <button onClick={onDelete} style={{ ...iconBtn, color: "#ef4444" }} title="Delete"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
  border: "1px solid #263450", background: "transparent", color: "#8b9ab5", cursor: "pointer",
  textDecoration: "none",
};
