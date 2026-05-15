import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

const toCssWidth = (width) => {
  if (!width) return null;
  const w = String(width);
  return /^\d+$/.test(w) ? `${w}px` : w;
};

const alignmentMargin = (alignment) => {
  if (alignment === "center") return "margin-left: auto; margin-right: auto;";
  if (alignment === "right") return "margin-left: auto; margin-right: 0;";
  return "margin-left: 0; margin-right: auto;";
};

const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          return (
            element.getAttribute("data-width") ||
            element.style.width ||
            element.getAttribute("width") ||
            null
          );
        },
      },
      alignment: {
        default: "left",
        parseHTML: (element) =>
          element.getAttribute("data-alignment") || "left",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, alignment = "left", ...rest } = HTMLAttributes;
    const cssWidth = toCssWidth(width);
    const styleParts = [
      "display: block",
      alignmentMargin(alignment),
      "max-width: 100%",
      "height: auto",
    ];
    if (cssWidth) styleParts.unshift(`width: ${cssWidth}`);

    return [
      "img",
      mergeAttributes(rest, {
        "data-width": cssWidth || null,
        "data-alignment": alignment,
        style: styleParts.filter(Boolean).join("; "),
      }),
    ];
  },
});

export default ResizableImage;
