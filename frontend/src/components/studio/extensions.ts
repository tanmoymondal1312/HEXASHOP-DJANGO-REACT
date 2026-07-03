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
 * Extends the built-in `textStyle` mark with `fontSize`, `fontFamily` and
 * `fontWeight` attributes, so all typographic styling lives alongside colour in
 * one mark: { type:"textStyle", attrs:{ color, fontSize, fontFamily, fontWeight } }.
 */
export const TypographyStyle = Extension.create({
  name: "typographyStyle",
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
          fontFamily: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontFamily || null,
            renderHTML: (attrs: { fontFamily?: string | null }) =>
              attrs.fontFamily ? { style: `font-family:${attrs.fontFamily}` } : {},
          },
          fontWeight: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontWeight || null,
            renderHTML: (attrs: { fontWeight?: string | null }) =>
              attrs.fontWeight ? { style: `font-weight:${attrs.fontWeight}` } : {},
          },
        },
      },
    ];
  },
});
