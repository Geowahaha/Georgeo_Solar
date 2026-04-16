/** Restrict post-login redirects to same-origin paths (no open redirects). */
export function sanitizeInternalPath(path: string | undefined, fallback: string): string {
  if (!path?.trim()) return fallback;
  const p = path.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallback;
  return p;
}
