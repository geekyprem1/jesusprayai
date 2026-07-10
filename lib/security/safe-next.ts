/**
 * Prevent open redirects after login.
 * Only same-origin relative paths are allowed (no //host, no backslash tricks).
 */
export function safeNextPath(raw: unknown, fallback = "/app"): string {
  if (typeof raw !== "string") return fallback;
  const path = raw.trim();
  if (!path) return fallback;

  // Must be a single-origin path: /foo not //evil.com
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("\\")) return fallback;
  if (path.includes("://")) return fallback;

  // Block protocol-relative and encoded tricks
  if (/^\/[\\/]/.test(path)) return fallback;
  if (/%2f/i.test(path) && path.toLowerCase().includes("%2f%2f")) return fallback;

  // Optional: only allow app routes (not // or full URLs smuggled)
  if (path.length > 512) return fallback;

  return path;
}
