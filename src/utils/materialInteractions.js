export const parseInteractions = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value || "[]") : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([^#&?]{11})/);
  return match?.[1] || null;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
