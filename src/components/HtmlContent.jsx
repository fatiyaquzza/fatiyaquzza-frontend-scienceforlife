import DOMPurify from "dompurify";
import { useLineSpacing } from "../context/LineSpacingContext";
import { normalizeContentHtml, resolveContentHtml } from "../utils/contentHtml";

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "style",
  "colspan",
  "rowspan",
  "width",
  "height",
  "data-width",
  "data-alignment",
];

const HtmlContent = ({ html, className = "" }) => {
  const { lineSpacing } = useLineSpacing();

  if (!html || !html.trim()) return null;

  const normalized = normalizeContentHtml(resolveContentHtml(html));
  const sanitized = DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "sub",
      "sup",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "colgroup",
      "col",
      "tr",
      "th",
      "td",
      "span",
      "div",
      "code",
      "pre",
    ],
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  const finalHtml =
    typeof document === "undefined"
      ? sanitized
      : (() => {
          const container = document.createElement("div");
          container.innerHTML = sanitized;
          container.querySelectorAll("table").forEach((table) => {
            const parent = table.parentElement;
            if (parent?.classList.contains("table-scroll")) return;
            const wrapper = document.createElement("div");
            wrapper.className = "table-scroll";
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          });
          return container.innerHTML;
        })();

  return (
    <div
      className={`prose-content ${className}`.trim()}
      style={{ lineHeight: lineSpacing }}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  );
};

export default HtmlContent;
