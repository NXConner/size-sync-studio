export const APP_BASENAME = import.meta.env.VITE_APP_BASENAME || "";
export const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

export function withApiBase(path: string): string {
  if (!path) return API_BASE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

