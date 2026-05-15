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

export const normalizeContentHtml = (html) => {
  if (!html) return "";
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }
  return trimmed;
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
