# Frontend — Visuales IA en sesiones y fichas de aplicación

Guía para el equipo de front. **Este servicio (Node) es el único contrato:** el front no habla con otros microservicios ni necesita saber cómo se generan las imágenes.

---

## Resumen

El backend devuelve y persiste JSON con imágenes ya listas para mostrar. Cada imagen viene en un objeto `imagen` con `url` pública (HTTPS).

| Pantalla | Dónde está la imagen | Ruta en el JSON |
|----------|----------------------|----------------|
| Sesión didáctica | Proceso (inicio / desarrollo / cierre) | `proceso.imagen` |
| Ficha de aplicación | Sección | `seccion.imagen` |

**Responsabilidad del front:**

1. Renderizar `imagen.url` cuando exista.
2. Si no hay `imagen.url`, usar fallback legacy (`grafico`, `graficoOperacion`, etc.).
3. Al guardar sesión, enviar el `contenido` completo (incluido `imagen`) sin filtrar campos.
4. En ficha: renderizar PDF con esas URLs y subir solo el PDF a S3 (flujo ya existente).

**No hace el front:** subir PNG sueltos, llamar a generadores de IA ni reescribir URLs de imagen.

---

## Contrato `imagen`

Misma forma en sesión (`proceso.imagen`) y en ficha (`seccion.imagen`):

```typescript
type TipoImagenIA =
  | "infografia_ia"
  | "diagrama_ia"
  | "ilustracion_ia"
  | "vocabulario_ia"
  | "evidencia_ia"
  | "grafico_ia";

type ModoImagenIA =
  | "problema"
  | "solucion"
  | "concepto"
  | "proceso"
  | "producto"
  | "contexto";

type PosicionImagenIA = "antes" | "junto";

interface ImagenIA {
  url: string;
  tipo: TipoImagenIA;
  modo: ModoImagenIA;
  descripcion: string;
  posicion: PosicionImagenIA;
  /** Solo metadata: la imagen puede llevar texto legible. NO usar para ocultarla. */
  requiereTexto: boolean;
  mimeType: "image/png";
}
```

---

## Reglas de render (pantalla y PDF)

### Prioridad

```
¿existe imagen.url (https)?  →  <img src={imagen.url} />
si no                        →  <GraficoRenderer grafico={...} />  (SVG legacy)
```

### Posición

| `imagen.posicion` | Comportamiento |
|-------------------|----------------|
| `"antes"` | Imagen **antes** del texto principal (estrategias / enunciado). |
| `"junto"` | Imagen **después** del texto principal (default si falta el campo). |

### Estilos (Tailwind sugerido)

```tsx
<img
  src={imagen.url}
  alt={imagen.descripcion}
  className="w-full object-contain border border-gray-200 rounded-md"
/>
```

- Ancho completo, `object-contain`, borde suave.
- No usar `object-cover` (evita recortes).
- Renderizar **cualquier** `imagen.tipo`; no filtrar solo `grafico_ia`.

### Errores comunes (evitar)

- Ocultar la imagen cuando `requiereTexto === true`.
- Filtrar por `tipo === "grafico_ia"` y omitir `ilustracion_ia`, `diagrama_ia`, etc.
- Eliminar `proceso.imagen` o `seccion.imagen` al hacer `confirmar-upload` o `PATCH contenido`.
- Asumir que el front debe subir las imágenes a S3 (solo sube el **PDF** de la ficha).

---

## APIs Node relevantes

### Sesión

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/ia/generar-secuencia-didactica` | Genera sesión; respuesta incluye `desarrollo.procesos[].imagen` si aplica. |
| POST | `/api/sesion/confirmar-upload` | Persiste `contenido` + `pdfUrl`. **Enviar `contenido` completo.** |
| PATCH | `/api/sesion/:id/contenido` | Edición parcial; merge por clave raíz. No omitir `imagen`. |

### Ficha de aplicación

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/fichas/sesiones/:sesionId/generar` | Devuelve `{ fichaId, ficha, presignedUrl, s3Key }`. `ficha.secciones[].imagen` ya viene en la respuesta. |
| PUT | `presignedUrl` (S3) | Subir **solo el PDF** generado en el cliente. |
| POST | `/api/fichas/:fichaId/confirm-upload` | Body: `{ s3Key }`. Guarda `pdfUrl` en BD. |
| GET | `/api/fichas/:fichaId` | `fichaJSON` + `pdfUrl` para re-render o descarga. |
| GET | `/api/fichas/sesion/:sesionId` | Ficha existente de una sesión. |

Flujo ficha (sin cambios respecto al actual):

```
POST generar → recibes ficha (JSON con imágenes)
     → renderizas PDF en el navegador
     → PUT presignedUrl (PDF)
     → POST confirm-upload
```

Las URLs de `seccion.imagen.url` **ya vienen en el JSON** que Node guardó; el front solo las usa al renderizar.

---

## Utilidades TypeScript (copiar al front)

Referencia en backend: `src/types/visuales-ia.types.ts`, `src/utils/resolveVisual.ts`.

```typescript
// types/visuales-ia.ts — copiar al proyecto front

export interface ImagenIA {
  url: string;
  tipo: string;
  modo: string;
  descripcion: string;
  posicion: "antes" | "junto";
  requiereTexto: boolean;
  mimeType: string;
}

export type VisualKind = "imagen_ia" | "grafico" | "graficoOperacion" | "legacy_url";

export interface ResolvedVisual {
  kind: VisualKind;
  imagen?: ImagenIA;
  grafico?: Record<string, unknown>;
  graficoOperacion?: Record<string, unknown>;
  legacyUrl?: string;
}

export function hasImagenIAUrl(imagen: unknown): imagen is ImagenIA {
  if (!imagen || typeof imagen !== "object") return false;
  const url = (imagen as ImagenIA).url;
  return typeof url === "string" && url.trim().length > 0 && /^https?:\/\//i.test(url.trim());
}

function hasGrafico(g: unknown): g is Record<string, unknown> {
  return !!g && typeof g === "object" && !Array.isArray(g);
}

function isLegacyUrl(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

/** Sesión: inicio | desarrollo | cierre → procesos[] */
export function resolveProcesoVisual(
  proceso: Record<string, unknown> | null | undefined
): ResolvedVisual | null {
  if (!proceso) return null;
  if (hasImagenIAUrl(proceso.imagen)) return { kind: "imagen_ia", imagen: proceso.imagen };
  if (hasGrafico(proceso.grafico)) return { kind: "grafico", grafico: proceso.grafico };
  if (hasGrafico(proceso.graficoOperacion))
    return { kind: "graficoOperacion", graficoOperacion: proceso.graficoOperacion };
  if (isLegacyUrl(proceso.imagenProblema))
    return { kind: "legacy_url", legacyUrl: proceso.imagenProblema as string };
  if (isLegacyUrl(proceso.imagenSolucion))
    return { kind: "legacy_url", legacyUrl: proceso.imagenSolucion as string };
  if (hasGrafico(proceso.graficoProblema)) return { kind: "grafico", grafico: proceso.graficoProblema };
  if (hasGrafico(proceso.graficoSolucion)) return { kind: "grafico", grafico: proceso.graficoSolucion };
  return null;
}

/** Ficha: secciones[] */
export function resolveSeccionVisual(
  seccion: Record<string, unknown> | null | undefined
): ResolvedVisual | null {
  if (!seccion) return null;
  if (hasImagenIAUrl(seccion.imagen)) return { kind: "imagen_ia", imagen: seccion.imagen };
  const c = seccion.contenido;
  if (c && typeof c === "object" && !Array.isArray(c)) {
    const contenido = c as Record<string, unknown>;
    if (hasGrafico(contenido.grafico)) return { kind: "grafico", grafico: contenido.grafico };
    if (hasGrafico(contenido.graficoOperacion))
      return { kind: "graficoOperacion", graficoOperacion: contenido.graficoOperacion };
  }
  return null;
}

export function imagenIAPosicion(imagen?: ImagenIA): "antes" | "junto" {
  return imagen?.posicion === "antes" ? "antes" : "junto";
}
```

---

## Componente reutilizable: imagen IA

```tsx
// components/ImagenIAVisual.tsx

import { ImagenIA, imagenIAPosicion } from "@/types/visuales-ia";

const IMG_CLASS =
  "w-full max-w-full object-contain border border-gray-200 rounded-md";

type Props = {
  imagen: ImagenIA;
  /** Contenido textual principal (estrategias, enunciado, etc.) */
  children?: React.ReactNode;
};

export function ImagenIAVisual({ imagen, children }: Props) {
  const img = (
    <img
      src={imagen.url}
      alt={imagen.descripcion || "Ilustración"}
      className={IMG_CLASS}
      loading="lazy"
    />
  );

  if (!children) return img;

  return imagenIAPosicion(imagen) === "antes" ? (
    <>
      {img}
      {children}
    </>
  ) : (
    <>
      {children}
      {img}
    </>
  );
}
```

---

## Sesión: dónde iterar procesos

Recorrer **inicio**, **desarrollo** y **cierre**:

```tsx
const FASES = ["inicio", "desarrollo", "cierre"] as const;

function SesionProcesos({ contenido }: { contenido: Record<string, unknown> }) {
  return (
    <>
      {FASES.map((fase) => {
        const bloque = contenido[fase] as { procesos?: Record<string, unknown>[] } | undefined;
        return bloque?.procesos?.map((proceso, i) => (
          <ProcesoCard key={`${fase}-${i}`} proceso={proceso} fase={fase} />
        ));
      })}
    </>
  );
}

function ProcesoCard({ proceso }: { proceso: Record<string, unknown> }) {
  const visual = resolveProcesoVisual(proceso);
  const texto = (
    <>
      <h4>{String(proceso.proceso ?? "")}</h4>
      <p>{String(proceso.estrategias ?? "")}</p>
    </>
  );

  if (visual?.kind === "imagen_ia" && visual.imagen) {
    return <ImagenIAVisual imagen={visual.imagen}>{texto}</ImagenIAVisual>;
  }
  if (visual?.kind === "grafico") {
    return (
      <>
        {texto}
        <GraficoRenderer grafico={visual.grafico!} />
      </>
    );
  }
  if (visual?.kind === "graficoOperacion") {
    return (
      <>
        {texto}
        <GraficoRenderer grafico={visual.graficoOperacion!} />
      </>
    );
  }
  if (visual?.kind === "legacy_url") {
    return (
      <>
        {texto}
        <img src={visual.legacyUrl} alt="" className="w-full object-contain" />
      </>
    );
  }
  return <>{texto}</>;
}
```

---

## Ficha: render por sección

Aplica a cualquier `seccion.tipo` que traiga `imagen` a nivel de sección (no dentro de `contenido`):

```tsx
function FichaSeccion({ seccion }: { seccion: Record<string, unknown> }) {
  const visual = resolveSeccionVisual(seccion);
  const contenido = seccion.contenido as Record<string, unknown> | undefined;

  const cuerpo = renderCuerpoPorTipo(seccion.tipo as string, contenido);

  if (visual?.kind === "imagen_ia" && visual.imagen) {
    return (
      <section className="ficha-seccion">
        {seccion.titulo && <h3>{String(seccion.titulo)}</h3>}
        <ImagenIAVisual imagen={visual.imagen}>{cuerpo}</ImagenIAVisual>
      </section>
    );
  }

  return (
    <section className="ficha-seccion">
      {seccion.titulo && <h3>{String(seccion.titulo)}</h3>}
      {cuerpo}
      {visual?.kind === "grafico" && <GraficoRenderer grafico={visual.grafico!} />}
      {visual?.kind === "graficoOperacion" && (
        <GraficoRenderer grafico={visual.graficoOperacion!} />
      )}
    </section>
  );
}
```

Gráficos legacy en ficha siguen en `seccion.contenido.grafico` — ver [CONTRATOS_FICHAS_APLICACION.md](../features/CONTRATOS_FICHAS_APLICACION.md) y [FRONTEND_GRAFICOS_EDUCATIVOS.md](./FRONTEND_GRAFICOS_EDUCATIVOS.md).

---

## PDF (ficha y sesión)

1. Usar el **mismo markup** que en pantalla (incluido `<img src={imagen.url}>`).
2. **Esperar carga de imágenes** antes de capturar (html2canvas / jsPDF / print):

```typescript
async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`No cargó: ${img.src}`));
            })
    )
  );
}
```

3. Si una imagen no carga en PDF, revisar **CORS** del bucket S3 (ver `docs/api/IMPLEMENTAR_PDF_TO_WORD.md`).

---

## Persistencia sesión (importante)

Al llamar `POST /api/sesion/confirmar-upload` o `PATCH /api/sesion/:id/contenido`, enviar el objeto `contenido` **tal como lo recibió del backend**, incluyendo:

```json
{
  "desarrollo": {
    "procesos": [
      {
        "proceso": "Familiarización con el problema",
        "imagen": {
          "url": "https://....amazonaws.com/....png",
          "tipo": "ilustracion_ia",
          "modo": "problema",
          "descripcion": "...",
          "posicion": "antes",
          "requiereTexto": true,
          "mimeType": "image/png"
        }
      }
    ]
  }
}
```

Si el front hace pick/omit del JSON, se pierde `imagen` en BD.

---

## Ejemplos de payload

### Sesión — `proceso.imagen`

```json
{
  "proceso": "Familiarización con el problema",
  "estrategias": "Los estudiantes observan la situación...",
  "tiempo": "10 min",
  "imagen": {
    "url": "https://docs-pdfs-generated.s3.us-east-1.amazonaws.com/.../imagen.png",
    "tipo": "ilustracion_ia",
    "modo": "problema",
    "descripcion": "Escena de mercado con precios de frutas",
    "posicion": "antes",
    "requiereTexto": true,
    "mimeType": "image/png"
  }
}
```

### Ficha — `secciones[0].imagen`

```json
{
  "tipo": "problema",
  "titulo": "Problema 1",
  "imagen": {
    "url": "https://docs-pdfs-generated.s3.us-east-1.amazonaws.com/.../imagen.png",
    "tipo": "diagrama_ia",
    "modo": "concepto",
    "descripcion": "Diagrama de reparto equitativo",
    "posicion": "junto",
    "requiereTexto": false,
    "mimeType": "image/png"
  },
  "contenido": {
    "enunciado": "La señora Rosa tiene 36 galletas...",
    "espacioResolucion": true,
    "grafico": null,
    "graficoOperacion": null
  }
}
```

---

## Fallback legacy (sesiones antiguas)

| Campo | Cuándo |
|-------|--------|
| `proceso.grafico` / `proceso.graficoOperacion` | Matemática con SVG (sin `imagen`) |
| `proceso.imagenProblema` / `imagenSolucion` | Sesiones muy antiguas (URL string suelta) |
| `seccion.contenido.grafico` | Fichas con gráficos SVG en el cuerpo |

Orden de resolución ya encapsulado en `resolveProcesoVisual` / `resolveSeccionVisual`.

---

## Checklist de implementación

- [ ] Tipos `ImagenIA` + helpers `resolveProcesoVisual` / `resolveSeccionVisual`
- [ ] Componente `ImagenIAVisual` (posición `antes` / `junto`)
- [ ] Sesión: render en `inicio`, `desarrollo`, `cierre` → `procesos[]`
- [ ] Ficha: render `seccion.imagen` en el switch de tipos de sección
- [ ] PDF: `object-contain`, `waitForImages` antes de exportar
- [ ] Persistencia sesión: no filtrar `imagen` en `confirmar-upload` / `PATCH contenido`
- [ ] Ficha: flujo PDF existente sin cambios (solo asegurar que el HTML incluya las `<img>`)
- [ ] Probar con y sin `imagen` (fallback a `GraficoRenderer`)

---

## Documentos relacionados

- [FRONTEND_GRAFICOS_EDUCATIVOS.md](./FRONTEND_GRAFICOS_EDUCATIVOS.md) — SVG `grafico` / `graficoOperacion`
- [CONTRATOS_FICHAS_APLICACION.md](../features/CONTRATOS_FICHAS_APLICACION.md) — flujo completo ficha + PDF
- [FRONTEND_MATEMATICA_IMAGENES.md](./FRONTEND_MATEMATICA_IMAGENES.md) — legacy DALL-E (solo sesiones viejas)
