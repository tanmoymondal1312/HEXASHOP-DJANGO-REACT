import { CSSProperties, Fragment, ReactNode } from "react";
import type { TiptapMark, TiptapNode } from "@/types/hero";

/**
 * Renders a Tiptap JSON document as React nodes with inline styles derived from
 * marks. No `dangerouslySetInnerHTML` — every run becomes a styled <span>.
 *
 * Supported marks: bold, italic, underline, textStyle(color), highlight(color),
 * gradient({from,to}). Supported nodes: doc, paragraph (block, textAlign),
 * text, hardBreak. This same component powers both the storefront and the
 * studio live preview, so what you build is exactly what ships.
 */
function styleFromMarks(marks: TiptapMark[] = []): CSSProperties {
  const style: CSSProperties = {};
  let gradient: { from?: string; to?: string } | null = null;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        style.fontWeight = 800;
        break;
      case "italic":
        style.fontStyle = "italic";
        break;
      case "underline":
        style.textDecoration = "underline";
        break;
      case "textStyle":
        if (mark.attrs?.color) style.color = mark.attrs.color as string;
        if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize as string;
        if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily as string;
        if (mark.attrs?.fontWeight) style.fontWeight = mark.attrs.fontWeight as string;
        break;
      case "highlight":
        style.backgroundColor =
          (mark.attrs?.color as string) || "rgba(245,166,35,0.35)";
        break;
      case "gradient":
        gradient = {
          from: mark.attrs?.from as string,
          to: mark.attrs?.to as string,
        };
        break;
    }
  }

  // Gradient text wins over plain colour (transparent fill clipped to text).
  if (gradient?.from && gradient?.to) {
    style.backgroundImage = `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`;
    style.WebkitBackgroundClip = "text";
    style.backgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.color = "transparent";
  }

  return style;
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  switch (node.type) {
    case "doc":
      return (
        <Fragment key={key}>
          {(node.content ?? []).map((child, i) => renderNode(child, i))}
        </Fragment>
      );

    case "paragraph": {
      const align = node.attrs?.textAlign as string | undefined;
      return (
        <span
          key={key}
          style={{ display: "block", textAlign: (align as CSSProperties["textAlign"]) }}
        >
          {(node.content ?? []).map((child, i) => renderNode(child, i))}
          {/* keep empty paragraphs from collapsing */}
          {(node.content ?? []).length === 0 ? " " : null}
        </span>
      );
    }

    case "text":
      return (
        <span key={key} style={styleFromMarks(node.marks)}>
          {node.text}
        </span>
      );

    case "hardBreak":
      return <br key={key} />;

    default:
      // Unknown node — render its children if any, else nothing.
      return node.content ? (
        <Fragment key={key}>
          {node.content.map((child, i) => renderNode(child, i))}
        </Fragment>
      ) : null;
  }
}

export default function TiptapRenderer({ doc }: { doc: TiptapNode | null | undefined }) {
  if (!doc) return null;
  return <>{renderNode(doc, 0)}</>;
}
