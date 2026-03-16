const STORAGE_KEY = "insignia_base64";

/**
 * Returns the cached base64 insignia, or the provided URL if no cache exists.
 * Prefers the base64 version to avoid CORS issues with direct S3 URLs.
 */
export function getInsigniaDataUrl(fallbackUrl?: string | null): string | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;
  } catch { /* storage unavailable */ }
  return fallbackUrl ?? null;
}

export function setInsigniaDataUrl(dataUrl: string) {
  try { localStorage.setItem(STORAGE_KEY, dataUrl); } catch { /* quota */ }
}

export function clearInsigniaDataUrl() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
