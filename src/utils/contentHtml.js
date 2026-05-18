export const getAssetBaseUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return rawApiUrl.replace(/\/api\/?$/, "");
};

export const isEmptyHtml = (html) => {
  if (!html || !html.trim()) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
};

/** Trim and optionally decode entity-wrapped HTML before DOMPurify. */
export const normalizeContentHtml = (html) => {
  if (html == null) return "";
  let s = String(html).trim();
  if (!s) return "";

  const hasRawAngleBracket = s.includes("<");
  const looksEntityEncoded =
    /&(lt|#60|#x3c);/i.test(s) && /&(gt|#62|#x3e);/i.test(s);

  if (!hasRawAngleBracket && looksEntityEncoded && typeof document !== "undefined") {
    const ta = document.createElement("textarea");
    ta.innerHTML = s;
    s = ta.value.trim();
  }

  return s;
};

export const stripHtml = (html, maxLength = 80) => {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
