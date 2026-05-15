import DOMPurify from "dompurify";
import { normalizeContentHtml } from "../utils/contentHtml";

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
  if (!html || !html.trim()) return null;

  const normalized = normalizeContentHtml(html);
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
      "tr",
      "th",
      "td",
      "span",
      "div",
    ],
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className={`prose-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default HtmlContent;
