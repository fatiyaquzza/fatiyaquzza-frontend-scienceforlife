export const getAssetBaseUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return rawApiUrl.replace(/\/api\/?$/, "");
};

const UPLOAD_SRC_PATTERN = /\/uploads\/[^?\s"'<>]+/;

/** Extract persistent path for files served from /uploads. */
export const toRelativeAssetUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return "";

  const match = trimmed.match(UPLOAD_SRC_PATTERN);
  if (match) return match[0];

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.split("?")[0];
  }

  return trimmed;
};

/** Build a loadable URL for the current API host. */
export const resolveAssetUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return "";

  const relative = toRelativeAssetUrl(trimmed);
  if (relative.startsWith("/uploads/")) {
    return `${getAssetBaseUrl()}${relative}`;
  }

  return trimmed;
};

const transformContentHtml = (html, transformSrc) => {
  const normalized = normalizeContentHtml(html);
  if (!normalized) return "";

  if (typeof document === "undefined") {
    return normalized.replace(
      /<img\b([^>]*?)src=["']([^"']+)["']/gi,
      (match, before, src) => {
        const next = transformSrc(src);
        if (!next) return "";
        return `<img${before}src="${next}">`;
      }
    );
  }

  const container = document.createElement("div");
  container.innerHTML = normalized;
  container.querySelectorAll("img[src]").forEach((img) => {
    const next = transformSrc(img.getAttribute("src"));
    if (!next) {
      img.remove();
      return;
    }
    img.setAttribute("src", next);
  });
  return container.innerHTML;
};

/** Before saving to DB: store /uploads/... paths only (not blob: or absolute host). */
export const persistContentHtml = (html) =>
  transformContentHtml(html, toRelativeAssetUrl);

/** Before display/edit: resolve /uploads/... to current backend base URL. */
export const resolveContentHtml = (html) =>
  transformContentHtml(html, resolveAssetUrl);

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
