const STORAGE_KEY = "insignia_base64";
/** Lado máximo (px) de la insignia cacheada. Suficiente para el logo en PDFs/Word. */
const MAX_SIDE = 400;
/** Si el caché supera este tamaño (chars) se considera heredado sin comprimir y se descarta. */
const MAX_CACHED_LENGTH = 400_000;

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

/**
 * Reduce una imagen (data URL o URL con CORS) a MAX_SIDE px y la devuelve como data URL.
 * Mantiene PNG (transparencia) y cae a JPEG si el PNG resultante sigue siendo pesado.
 */
export function compressImageToDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL("image/png");
        if (dataUrl.length > MAX_CACHED_LENGTH) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        }
        resolve(dataUrl);
      } catch {
        resolve(null); // CORS tainted canvas
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function setInsigniaDataUrl(dataUrl: string) {
  try { localStorage.setItem(STORAGE_KEY, dataUrl); } catch { /* quota */ }
}

/** Comprime y cachea la insignia. No lanza errores. */
export async function cacheInsignia(src: string): Promise<string | null> {
  const compressed = await compressImageToDataUrl(src);
  if (compressed) setInsigniaDataUrl(compressed);
  return compressed;
}

export function clearInsigniaDataUrl() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/**
 * Limpieza única (se ejecuta una sola vez por navegador al recargar con la versión nueva).
 * Borra la insignia cacheada y sus copias base64 en los stores, más el caché de gráficos.
 * La insignia se vuelve a descargar comprimida desde S3 al entrar al Dashboard,
 * así que el docente no pierde nada. Para forzar otra limpieza en el futuro, sube la versión.
 */
const ONE_TIME_CLEANUP_FLAG = "dp_storage_cleanup_v1";

export function runOneTimeStorageCleanup() {
  try {
    if (localStorage.getItem(ONE_TIME_CLEANUP_FLAG)) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("smart_teacher_graficos");

    for (const key of ["auth-storage", "user-storage"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (!user) continue;
      if (typeof user.insigniaUrl === "string" && user.insigniaUrl.startsWith("data:")) {
        user.insigniaUrl = null;
      }
      if (key === "user-storage" && Array.isArray(user.sesiones)) delete user.sesiones;
      localStorage.setItem(key, JSON.stringify(parsed));
    }

    localStorage.setItem(ONE_TIME_CLEANUP_FLAG, String(Date.now()));
  } catch { /* ignore: si falla se reintenta en la próxima carga */ }
}

/**
 * Limpieza para usuarios que ya tienen el localStorage lleno por versiones anteriores:
 * - descarta la insignia cacheada sin comprimir
 * - quita copias base64 de la insignia dentro de auth-storage / user-storage
 */
export function cleanupLegacyInsigniaStorage() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && cached.length > MAX_CACHED_LENGTH) localStorage.removeItem(STORAGE_KEY);

    for (const key of ["auth-storage", "user-storage"]) {
      const raw = localStorage.getItem(key);
      if (!raw || !raw.includes("data:image")) continue;
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user && typeof user.insigniaUrl === "string" && user.insigniaUrl.startsWith("data:")) {
        user.insigniaUrl = null;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  } catch { /* ignore */ }
}
