/**
 * Utilidad para construir URLs de PDFs a través de CloudFront CDN.
 *
 * Bucket S3: docs-pdfs-generated
 * Carpetas:  sesiones/ | svg/ | unidades/
 * CloudFront: VITE_CDN_URL (ej. https://dg76t69typ5rt.cloudfront.net)
 */

const CDN_BASE = import.meta.env.VITE_CDN_URL as string | undefined;

/**
 * Construye la URL pública de CloudFront a partir de un `pdfUrl` (key S3 o URL completa S3).
 *
 * Soporta:
 *  - Key pura:  "sesiones/abc123.pdf"
 *  - URL S3:    "https://docs-pdfs-generated.s3.amazonaws.com/sesiones/abc123.pdf"
 *  - URL S3 v2: "https://s3.us-east-1.amazonaws.com/docs-pdfs-generated/sesiones/abc123.pdf"
 *
 * Retorna `null` si no hay CDN configurado o el input está vacío.
 */
export function buildCdnPdfUrl(pdfUrl: string | undefined | null): string | null {
  if (!pdfUrl || !CDN_BASE) return null;

  let key = pdfUrl;

  // Caso 1: URL completa con formato bucket.s3...amazonaws.com/key
  const bucketDomain = /^https?:\/\/[^/]+\.s3[^/]*\.amazonaws\.com\/(.+)$/i;
  const m1 = pdfUrl.match(bucketDomain);
  if (m1) {
    key = m1[1];
  }

  // Caso 2: URL completa con formato s3.region.amazonaws.com/bucket/key
  const pathStyle = /^https?:\/\/s3[^/]*\.amazonaws\.com\/[^/]+\/(.+)$/i;
  const m2 = pdfUrl.match(pathStyle);
  if (m2) {
    key = m2[1];
  }

  // Caso 3: URL que ya es de CloudFront → devolver tal cual
  if (pdfUrl.includes("cloudfront.net")) {
    return pdfUrl;
  }

  // Quitar slash inicial si existe
  key = key.replace(/^\//, "");

  return `${CDN_BASE.replace(/\/+$/, "")}/${key}`;
}
