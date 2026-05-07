import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Document, Footer } from "@htmldocs/react";
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { subirPDFaS3 } from "@/services/sesiones.service";
import { instance } from "@/services/instance";
import type {
  ICorregirEstandaresResponse,
  ICorregirEstandaresMiembroUpload,
} from "@/services/unidad.service";
import type {
  IUnidadUploadUrlResponse,
  IUnidadConfirmarUploadResponse,
  IUnidadConfirmarUploadRequest,
  IUnidadUploadUrlRequest,
} from "@/interfaces/IUnidad";
import { adminGenerarWordUnidad } from "@/services/admin.service";

function getAdminHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function solicitarUploadUrlUnidadAdmin(data: IUnidadUploadUrlRequest): Promise<IUnidadUploadUrlResponse> {
  const { data: res } = await instance.post<IUnidadUploadUrlResponse>("/unidad/upload-url", data, { headers: getAdminHeaders() });
  return res;
}

async function confirmarUploadUnidadAdmin(data: IUnidadConfirmarUploadRequest): Promise<IUnidadConfirmarUploadResponse> {
  const { data: res } = await instance.post<IUnidadConfirmarUploadResponse>("/unidad/confirmar-upload", data, { headers: getAdminHeaders() });
  return res;
}
import {
  UnidadDocStyles,
  UnidadDocHeader,
  UnidadDocDatosGenerales,
  UnidadDocSituacion,
  UnidadDocPropositos,
  UnidadDocEnfoques,
  UnidadDocSecuencia,
  UnidadDocMaterialesReflexiones,
} from "@/components/UnidadDoc";
import { UnidadSecundariaFormatoDoc } from "@/components/UnidadDoc/UnidadSecundariaFormatoDoc";

// ─── Helpers para parsear contenido (igual que EditarUnidad / UnidadSuscriptorResult) ───

function parseContenido(raw: any): Record<string, any> {
  let parsed = raw;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    !parsed.situacionSignificativa &&
    parsed.contenido &&
    typeof parsed.contenido === "object"
  ) {
    parsed = parsed.contenido;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return {}; }
    }
  }
  return parsed ?? {};
}

function unwrapSituacion(raw: any): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.situacionSignificativa === "string")
    return raw.situacionSignificativa;
  return "";
}

function unwrapEvidencias(raw: any) {
  if (!raw) return undefined;
  if (raw.proposito !== undefined || raw.reto !== undefined) return raw;
  if (raw.evidencias) return raw.evidencias;
  return raw;
}

function unwrapPropositos(raw: any) {
  if (!raw) return undefined;
  if (raw.areasPropositos) return raw;
  if (raw.propositos?.areasPropositos) return raw.propositos;
  return raw;
}

function unwrapAreasComplementarias(raw: any) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.areasComplementarias))
    return raw.areasComplementarias;
  return undefined;
}

function unwrapEnfoques(raw: any) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.enfoques))
    return raw.enfoques;
  return [];
}

function unwrapSecuencia(raw: any) {
  if (!raw) return undefined;
  if (raw.semanas) return raw;
  if (raw.secuencia?.semanas) return raw.secuencia;
  return raw;
}

function unwrapMateriales(raw: any) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.materiales))
    return raw.materiales;
  return undefined;
}

function unwrapReflexiones(raw: any) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.reflexiones))
    return raw.reflexiones;
  return undefined;
}

function unwrapImagenSituacion(contenido: Record<string, any>): string | undefined {
  if (typeof contenido.imagenSituacionUrl === "string") return contenido.imagenSituacionUrl;
  const rawSit = contenido.situacionSignificativa;
  if (rawSit && typeof rawSit === "object") {
    if (typeof rawSit.imagenUrl === "string") return rawSit.imagenUrl;
    if (typeof rawSit.imagenSituacionUrl === "string") return rawSit.imagenSituacionUrl;
  }
  if (typeof contenido.situacionBase?.imagenUrl === "string")
    return contenido.situacionBase.imagenUrl;
  return undefined;
}

// ─── State de navegación ───

interface AdminCorregirEstandaresState {
  corregirResponse: ICorregirEstandaresResponse;
  unidadId: string;
  titulo: string;
  numeroUnidad: number;
  grado: string;
  nivel: string;
  fechaInicio: string;
  fechaFin: string;
  docente: string;
  institucion: string;
  seccion: string;
  nombreDirectivo: string;
  nombreSubdirectora: string;
  usuarioId: string;
  /** true si el Word anterior fue eliminado y debe regenerarse tras el PDF */
  wordInvalidado?: boolean;
}

/**
 * Página dedicada para que el admin regenere el PDF de una unidad
 * tras corregir estándares.
 *
 * Flujo (idéntico a AdminRehacerPdf):
 *  1. Recibe `ICorregirEstandaresResponse` + metadatos via `location.state`.
 *  2. Parsea el contenido corregido de `corregirResponse.unidad`.
 *  3. Renderiza el documento de unidad (UnidadDoc*) **visible** en el DOM.
 *  4. Espera imágenes, genera PDF blob.
 *  5. Sube el PDF a S3 via presigned URL (`upload.presignedUrl`).
 *  6. Confirma la subida con `confirmarUploadUnidad`.
 *  7. Opcionalmente sube PDFs de miembros.
 *  8. Navega de vuelta al detalle del usuario.
 */
export default function AdminCorregirEstandaresPdf() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentRef = useRef<HTMLDivElement>(null);
  const guardadoIniciado = useRef(false);

  // ── State ──
  const [estado, setEstado] = useState("Preparando documento…");
  const [error, setError] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);

  // ── Extraer datos de navegación ──
  const navState = location.state as AdminCorregirEstandaresState | undefined;

  // Si no hay state, volver al panel
  useEffect(() => {
    if (!navState?.corregirResponse) {
      navigate("/admin/usuarios", { replace: true });
    }
  }, [navState, navigate]);

  // ── Parsear contenido corregido ──
  const contenido = navState?.corregirResponse?.unidad
    ? parseContenido(navState.corregirResponse.unidad)
    : {};

  const situacionSignificativa = unwrapSituacion(contenido.situacionSignificativa);
  const evidencias = unwrapEvidencias(contenido.evidencias);
  const propositos = unwrapPropositos(contenido.propositos);
  const areasComplementarias = unwrapAreasComplementarias(contenido.areasComplementarias);
  const enfoques = unwrapEnfoques(contenido.enfoques);
  const secuencia = unwrapSecuencia(contenido.secuencia);
  const materiales = unwrapMateriales(contenido.materiales);
  const reflexiones = unwrapReflexiones(contenido.reflexiones);
  const imagenSituacionUrl = unwrapImagenSituacion(contenido);

  const areasNombres = (propositos?.areasPropositos ?? []).map(
    (a: any) => a.area ?? a.nombre ?? "",
  );

  const isSecundaria =
    /secundaria/i.test(navState?.nivel || "") ||
    Array.isArray((contenido as any)?.propositosPorGrado);

  const formatoSecundaria = (() => {
    if (!isSecundaria) return null;

    const propositosPorGrado = ((contenido as any)?.propositosPorGrado || []) as Array<any>;
    const secuenciaPorGrado = ((contenido as any)?.secuenciaPorGrado || []) as Array<any>;
    const gradosList =
      propositosPorGrado.map((g: any) => g?.grado).filter(Boolean) ||
      secuenciaPorGrado.map((g: any) => g?.grado).filter(Boolean);
    const gradoTexto = Array.from(new Set(gradosList)).join(", ") || navState?.grado || "—";
    const totalSemanas = Number((contenido as any)?.duracion || 0) || 1;
    const secuenciaGradosRecord: Record<string, Record<string, string[]>> = {};

    secuenciaPorGrado.forEach((g: any) => {
      const nombreGrado = g?.grado || `Grado ${g?.gradoId ?? ""}`.trim();
      const semanas = (g?.secuencia?.semanasPorSesiones || []) as Array<any>;
      const bySemana: Record<string, string[]> = {};
      semanas.forEach((s: any) => {
        bySemana[String(s?.semana ?? "")] = (s?.sesiones || [])
          .map((ses: any) => ses?.actividad)
          .filter(Boolean);
      });
      secuenciaGradosRecord[nombreGrado] = bySemana;
    });

    return {
      datosInformativos: {
        numeroUnidad: Number(navState?.numeroUnidad || 1),
        titulo: navState?.titulo || "",
        institucionEducativa: navState?.institucion || "—",
        director: navState?.nombreDirectivo || "—",
        subdirector: navState?.nombreSubdirectora || "—",
        nivel: navState?.nivel || "—",
        area: areasNombres[0] || "—",
        grado: gradoTexto,
        secciones: navState?.seccion || "—",
        docente: navState?.docente || "—",
        duracion: totalSemanas,
      },
      componentes: {
        planteamientoSituacionSignificativa: situacionSignificativa || "—",
        productoUnidadAprendizajePorGrado: (() => {
          const fromFormato = (contenido as any)?.formatoSecundaria?.componentes?.productoUnidadAprendizajePorGrado;
          if (Array.isArray(fromFormato) && fromFormato.length > 0) {
            return fromFormato.map((pg: any) => ({
              grado: pg?.grado || "—",
              producto: pg?.producto || evidencias?.productoIntegrador || "—",
            }));
          }
          if (propositosPorGrado.length > 0) {
            return propositosPorGrado.map((pg: any) => ({
              grado: pg?.grado || "—",
              producto: pg?.propositos?.productoIntegradorGrado || evidencias?.productoIntegrador || "—",
            }));
          }
          return [{ grado: navState?.grado || "—", producto: evidencias?.productoIntegrador || "—" }];
        })(),
        enfoquesTransversales: (enfoques || []).map((e: any) => ({
          enfoque: e?.enfoque || "—",
          valor: e?.valor || "—",
          actitudes: e?.actitudes || "—",
        })),
        instrumentoEvaluacion:
          evidencias?.instrumentoEvaluacion ||
          propositosPorGrado?.[0]?.propositos?.areasPropositos?.[0]?.competencias?.[0]?.instrumento ||
          "Lista de cotejo",
        propositosAprendizajePorGrado: propositosPorGrado.map((pg: any) => ({
          grado: pg?.grado || "—",
          area: pg?.propositos?.areasPropositos?.[0]?.area || areasNombres[0] || "—",
          competencias: (pg?.propositos?.areasPropositos || [])
            .flatMap((a: any) => a?.competencias || [])
            .map((c: any) => ({
              competenciaCapacidades: {
                competencia: c?.nombre || c?.competencia || "—",
                capacidades: c?.capacidades || [],
              },
              estandar: c?.estandar || "—",
              actividades: c?.actividades || [],
              campoTematico: c?.campoTematico || "—",
              criteriosEvaluacion: c?.criterios || [],
              instrumentoEvaluacion: c?.instrumento || "Lista de cotejo",
            })),
        })),
        competenciasTransversalesPorGrado: (() => {
          const fromFormato = (contenido as any)?.formatoSecundaria?.componentes?.competenciasTransversalesPorGrado;
          if (Array.isArray(fromFormato) && fromFormato.length > 0) {
            return fromFormato.map((tg: any) => ({
              grado: tg?.grado || "—",
              competencias: (tg?.competencias || []).map((ct: any) => {
                const criterios = Array.isArray(ct?.criterios)
                  ? ct.criterios
                  : Array.isArray(ct?.criteriosEvaluacion)
                    ? ct.criteriosEvaluacion
                    : [];
                return {
                  competenciaCapacidades: {
                    competencia: ct?.competenciaCapacidades?.competencia || ct?.nombre || "—",
                    capacidades: ct?.competenciaCapacidades?.capacidades || ct?.capacidades || [],
                  },
                  estandarCiclo: ct?.estandarCiclo || ct?.estandar || "—",
                  criterios,
                };
              }),
            }));
          }
          return propositosPorGrado.map((pg: any) => ({
            grado: pg?.grado || "—",
            competencias: (pg?.propositos?.competenciasTransversales || []).map((ct: any) => ({
              competenciaCapacidades: {
                competencia: ct?.nombre || "—",
                capacidades: ct?.capacidades || [],
              },
              estandarCiclo: ct?.estandar || "—",
              criterios: Array.isArray(ct?.criterios)
                ? ct.criterios
                : Array.isArray(ct?.criteriosEvaluacion)
                  ? ct.criteriosEvaluacion
                  : [],
            })),
          }));
        })(),
        secuenciaSesionesPorGrado: {
          totalSemanas,
          grados: secuenciaGradosRecord,
        },
        recursosMaterialesDidacticos: Array.isArray(materiales)
          ? materiales
          : Array.isArray((materiales as any)?.materiales)
            ? (materiales as any).materiales
            : [],
        recursosMaterialesPorGrado: ((contenido as any)?.materialesPorGrado || []).map((g: any) => {
          let mats: string[] = [];
          const raw = g?.materiales;
          if (Array.isArray(raw)) {
            mats = raw.filter((m: any) => typeof m === "string");
          } else if (raw && typeof raw === "object" && Array.isArray(raw.materiales)) {
            mats = raw.materiales.filter((m: any) => typeof m === "string");
          }
          return {
            grado: g?.grado || `Grado ${g?.gradoId ?? ""}`.trim(),
            materiales: mats,
          };
        }),
        bibliografia: (contenido as any)?.bibliografia || [],
      },
      imagenSituacionUrl: imagenSituacionUrl || undefined,
    };
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // Generar PDF + subir a S3
  // ═══════════════════════════════════════════════════════════════════════════
  const generarYSubir = useCallback(async () => {
    if (!documentRef.current || !navState?.corregirResponse) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    const { corregirResponse, unidadId, usuarioId } = navState;

    try {
      // ── Generar PDF blob ──
      setEstado("Generando PDF…");
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "landscape",
      });

      // ── Subir PDF del propietario ──
      // Si la respuesta no trae presigned URL (ej: arreglar-actividades), solicitarla ahora
      let uploadPresignedUrl = corregirResponse.upload?.presignedUrl ?? null;
      let uploadS3Key = corregirResponse.upload?.s3Key ?? null;

      if (!uploadPresignedUrl) {
        setEstado("Solicitando URL de subida…");
        const urlRes = await solicitarUploadUrlUnidadAdmin({ unidadId, usuarioId });
        uploadPresignedUrl = urlRes.data.uploadUrl;
        uploadS3Key = urlRes.data.key;
      }

      if (uploadPresignedUrl && uploadS3Key) {
        setEstado("Subiendo PDF…");
        await subirPDFaS3(uploadPresignedUrl, pdfBlob);

        // ── Confirmar subida ──
        setEstado("Confirmando subida…");
        await confirmarUploadUnidadAdmin({
          unidadId,
          usuarioId,
          key: uploadS3Key,
        });
      }

      // ── Subir PDFs de miembros/suscriptores ──
      const miembros = corregirResponse.miembrosUpload ?? [];
      if (miembros.length > 0) {
        setEstado(`Subiendo ${miembros.length} PDF(s) de miembro(s)…`);
        for (const miembro of miembros) {
          try {
            await subirPDFaS3(miembro.presignedUrl, pdfBlob);
            await confirmarUploadUnidadAdmin({
              unidadId,
              usuarioId: miembro.usuarioId,
              key: miembro.s3Key,
            });
          } catch (miembroErr) {
            console.error(
              `❌ [AdminCorregirEstandares] Error subiendo miembro ${miembro.miembroId}:`,
              miembroErr,
            );
          }
        }
      }

      // ── Regenerar Word si fue invalidado (fire-and-forget) ──
      if (navState.wordInvalidado) {
        setEstado("Regenerando Word en segundo plano…");
        adminGenerarWordUnidad(unidadId).then(() => {
          toast.success("Word regenerado correctamente");
        }).catch((wordErr: any) => {
          console.error("❌ [AdminCorregirEstandares] Error regenerando Word:", wordErr);
          toast.warning("PDF subido, pero el Word no pudo regenerarse — inténtalo manualmente.");
        });
      }

      // ── Éxito ──
      setCompletado(true);
      const total = corregirResponse.totalCorregidos;
      setEstado(`¡${total} corrección(es) — PDF regenerado y subido!`);
      toast.success(`${total} corrección(es) aplicada(s) — PDF actualizado`);

      // Navegar de vuelta
      setTimeout(() => {
        navigate(`/admin/usuarios/${usuarioId}`, { replace: true });
      }, 2500);
    } catch (err: any) {
      console.error("❌ [AdminCorregirEstandares] Error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al generar o subir el PDF",
      );
      guardadoIniciado.current = false; // Permitir reintentar
    }
  }, [navState, navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Auto-generación: esperar render + imágenes
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!navState?.corregirResponse || completado || guardadoIniciado.current) return;

    const waitForImages = (): Promise<void> => {
      const images = documentRef.current?.querySelectorAll("img") || [];
      const pending = Array.from(images).filter((img) => !img.complete);
      if (pending.length === 0) return Promise.resolve();
      return Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      ).then(() => {});
    };

    const timer = setTimeout(async () => {
      try {
        if (!documentRef.current) return;
        await waitForImages();
        await new Promise((r) => setTimeout(r, 500));
        await generarYSubir();
      } catch (err) {
        console.error("❌ [AdminCorregirEstandares] Error en auto-generación:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.corregirResponse]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Sin datos de navegación
  if (!navState?.corregirResponse) {
    return null; // El useEffect redirige
  }

  // Cargando (no hay premiumData que esperar aquí, se parsea sincrónicamente)
  if (!Object.keys(contenido).length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Header con estado ── */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate(`/admin/usuarios/${navState.usuarioId}`, {
                  replace: true,
                })
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Admin – Corregir Estándares (PDF)
            </h1>
          </div>

          {/* ── Indicador de progreso ── */}
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-white dark:bg-slate-800">
            {error ? (
              <>
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Error al procesar
                  </p>
                  <p className="text-xs text-red-500">{error}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    setError(null);
                    generarYSubir();
                  }}
                >
                  Reintentar
                </Button>
              </>
            ) : completado ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-600">
                    {estado}
                  </p>
                  <p className="text-xs text-slate-500">
                    Regresando al detalle del usuario…
                  </p>
                </div>
                <Cloud className="h-5 w-5 text-green-400 ml-auto" />
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 text-amber-500 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {estado}
                  </p>
                  <p className="text-xs text-slate-400">
                    No cierres esta pestaña hasta que finalice.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Detalle de correcciones ── */}
          {navState.corregirResponse.correcciones.length > 0 && (
            <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 space-y-2">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {navState.corregirResponse.totalCorregidos} estándar(es) corregido(s):
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {navState.corregirResponse.correcciones.map((c, i) => (
                  <div key={i} className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-medium">{c.area}</span>
                    {" — "}
                    <span className="italic">{c.competencia}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Documento para captura PDF ── */}
        <div ref={documentRef}>
          <Document size="A4" orientation="landscape" margin={isSecundaria ? "0.45in" : "0.5in"}>
            {isSecundaria && formatoSecundaria ? (
              <UnidadSecundariaFormatoDoc formato={formatoSecundaria} />
            ) : (
              <>
                <UnidadDocStyles />

                <UnidadDocHeader
                  titulo={navState.titulo}
                  numeroUnidad={navState.numeroUnidad}
                  grado={navState.grado}
                  seccion={navState.seccion}
                />

                <UnidadDocDatosGenerales
                  institucion={navState.institucion}
                  directivo={navState.nombreDirectivo}
                  subdirectora={navState.nombreSubdirectora}
                  docente={navState.docente}
                  grado={navState.grado}
                  seccion={navState.seccion}
                  nivel={navState.nivel}
                  fechaInicio={navState.fechaInicio}
                  fechaFin={navState.fechaFin}
                  areas={areasNombres}
                />

                <UnidadDocSituacion
                  situacionSignificativa={situacionSignificativa}
                  evidencias={evidencias}
                  grado={navState.grado}
                  imagenSituacionUrl={imagenSituacionUrl}
                />

                {propositos && (
                  <UnidadDocPropositos
                    propositos={propositos}
                    areasComplementarias={areasComplementarias}
                  />
                )}

                <UnidadDocEnfoques enfoques={enfoques} />

                {secuencia && <UnidadDocSecuencia secuencia={secuencia} />}

                <UnidadDocMaterialesReflexiones
                  materiales={materiales}
                  reflexiones={reflexiones}
                />
              </>
            )}

            <Footer position="bottom-center">
              {() => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    fontSize: "8pt",
                    borderTop: "1px solid #000",
                    paddingTop: "0.2rem",
                  }}
                >
                  <span>
                    Unidad de Aprendizaje N° {navState.numeroUnidad} — {navState.titulo}
                  </span>
                </div>
              )}
            </Footer>
          </Document>
        </div>
      </div>
    </div>
  );
}
