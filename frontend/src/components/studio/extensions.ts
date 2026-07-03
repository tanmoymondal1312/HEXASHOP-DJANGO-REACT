import { Mark, mergeAttributes, Extension } from "@tiptap/core";

/**
 * Gradient-text mark. Stored in Tiptap JSON as
 *   { type: "gradient", attrs: { from, to } }
 * matching the backend seed format and the shared <TiptapRenderer>.
 */
export const GradientMark = Mark.create({
  name: "gradient",

  addAttributes() {
    return {
      from: { default: "#f5a623" },
      to: { default: "#1e90ff" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-gradient]" }];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const from = mark.attrs.from as string;
    const to = mark.attrs.to as string;
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-gradient": "",
        style:
          `background-image:linear-gradient(135deg,${from} 0%,${to} 100%);` +
          "-webkit-background-clip:text;background-clip:text;" +
          "-webkit-text-fill-color:transparent;color:transparent;",
      }),
      0,
    ];
  },
});

/**
 * Adds a `fontSize` attribute onto the built-in `textStyle` mark, so font size
 * lives alongside colour in the same mark: { type:"textStyle", attrs:{color,fontSize} }.
 */
export const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize || null,
            renderHTML: (attrs: { fontSize?: string | null }) =>
              attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
});
