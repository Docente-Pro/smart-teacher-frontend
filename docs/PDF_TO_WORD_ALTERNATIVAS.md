# PDF to Word — Alternativas estables al proveedor actual

El frontend no depende del proveedor: solo consume la API del backend. El cambio se hace **solo en el backend** manteniendo el mismo contrato (ver más abajo).

---

## Opciones más estables (recomendadas)

Estas son opciones con buena trayectoria, documentación clara y facturación predecible.

### 1. **Adobe PDF Services API** — Muy estable

- **Quién es:** Adobe (Document Cloud). API oficial para convertir PDF a Word.
- **Por qué es estable:** Empresa de referencia en PDF, SLAs enterprise, documentación y SDKs (Node.js, .NET, Java, Python) muy maduros.
- **Facturación:** Por **Document Transaction**, no por página. **1 transacción = hasta 50 páginas** por documento. Mucho más claro que “páginas sueltas”.
- **Gratis:** 500 transacciones de documento al mes sin tarjeta.
- **Conversión:** PDF → DOC, DOCX, RTF.
- **Docs:** [developer.adobe.com/document-services/apis/pdf-services/convert-pdf](https://developer.adobe.com/document-services/apis/pdf-services/convert-pdf)  
- **Precios:** [adobe.io/document-services/pricing](https://www.adobe.io/document-services/pricing/main/)

**Resumen:** Con PDFs de ~7–8 páginas, una “Generar Word” = 1 transacción. 500 gratis/mes ≈ 500 descargas Word/mes antes de pagar. Ideal si priorizáis estabilidad y claridad.

---

### 2. **Aspose.Words Cloud** — Muy estable

- **Quién es:** Aspose. Llevan años en APIs de documentos (Word, PDF, Excel, etc.).
- **Por qué es estable:** Producto maduro, SDKs en varios lenguajes, opción cloud y self-hosted, precios públicos.
- **Facturación:** Por **llamada API**, no por página. 1 conversión = 1 llamada.
- **Gratis:** 150 llamadas/mes. Luego escalado (ej. siguiente bloque de 1000 ≈ 30 USD).
- **Conversión:** PDF → DOCX (y otros formatos Word).
- **Docs:** [docs.aspose.cloud/words](https://docs.aspose.cloud/words/)  
- **Precios:** [purchase.aspose.cloud/pricing](https://purchase.aspose.cloud/pricing/)

**Resumen:** Facturación por “conversión”, no por página. Muy estable y predecible para producción.

---

### 3. **PDFSmart Conversion API**

- **Perfil:** API enterprise, millones de conversiones al día según el proveedor.
- **Ventajas:** Tiempos de respuesta bajos, CDN global, dashboard de uso, cifrado.
- **Docs:** [pdfsmart.com](https://www.pdfsmart.com/en/conversion-api) — revisar precios y límites en su web.

---

### 4. **Cloudmersive Convert API**

- Conversión de archivos (PDF → DOCX) vía REST.
- Facturación por volumen; planes claros en su web.
- [cloudmersive.com](https://cloudmersive.com/convert-api) — útil si buscáis alternativa con precios publicados.

---

## Lo que no conviene para “muy estable”

- **LibreOffice headless (PDF → DOCX directo):** En muchos entornos da errores (p. ej. Error 0x81a) y no se considera estable para producción para ese flujo. Solo considerarlo si aceptáis mantenimiento y pruebas continuas.
- **Proveedores pequeños sin SLAs ni precios claros:** Si la facturación “no tiene sentido” (como con el actual), es señal para cambiar a uno de los de arriba.

---

## Contrato que el backend debe mantener

Para no tocar el frontend, el backend debe seguir exponiendo:

| Elemento | Contrato |
|----------|----------|
| `POST /api/pdf-to-word/from-session` | Body: `{ sesionId }`. Response: `{ success: true, jobId: string }`. |
| `POST /api/pdf-to-word` | FormData: `file` (PDF), `sesionId`. Response: `{ success: true, jobId: string }`. |
| Socket.IO `word:listo` | Payload: `{ jobId: string, wordUrl: string }`. |
| Socket.IO `word:error` | Payload: `{ jobId: string, message?: string }`. |
| `GET /api/sesion/:id/download-url-word` | Response: `{ data: { downloadUrl: string, expiresIn: number } }`. |

El backend solo cambia la parte que llama al proveedor (SayPDF → Adobe, Aspose, etc.); el flujo S3 + Socket + `wordUrl` se mantiene.

---

## Recomendación práctica

- **Máxima estabilidad y claridad:** **Adobe PDF Services API** (500 transacciones/mes gratis, 1 transacción = 1 documento hasta 50 páginas).
- **Alternativa también estable y precios por llamada:** **Aspose.Words Cloud** (150 llamadas/mes gratis, luego por uso).

Ambos tienen documentación sólida, SDKs y uso enterprise. La implementación en el backend consiste en sustituir la llamada al proveedor actual por la de Adobe o Aspose y seguir emitiendo `word:listo` / `word:error` y guardando `wordUrl` en la sesión.
