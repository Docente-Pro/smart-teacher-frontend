import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Cloud,
  FileDown,
  Loader2,
  Pencil,
  Eye,
  Save,
  Printer,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import {
  obtenerSesionPorId,
  solicitarUploadPDF,
  subirPDFaS3,
  confirmarUploadPDF,
  editarContenidoSesion,
} from "@/services/sesiones.service";
import { updateUsuario } from "@/services/usuarios.service";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc/SesionPremiumDoc";
import { InstrumentoEvaluacionSection } from "@/components/SesionPremiumDoc/InstrumentoEvaluacionSection";
import { getAreaColor } from "@/constants/areaColors";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import { dateOnlyToInputValue } from "@/utils/dateOnlyPeru";
import { buildInstrumentoLocal } from "@/utils/buildInstrumentoFromSesion";
import type { IListaCotejo } from "@/interfaces/IInstrumentoEvaluacion";
import type {
  ISesionPremiumResponse,
  IFasePremium,
  IProcesoPremium,
} from "@/interfaces/ISesionPremium";

/** Instrumento mínimo para mostrar siempre la tabla con al menos 30 slots (lista de cotejo vacía). */
const INSTRUMENTO_LISTA_COTEJO_VACIA: IListaCotejo = {
  tipo: "lista_cotejo",
  area: "—",
  grado: "—",
  competencia: "—",
  evidencia: "—",
  criterios: ["—"],
  columnas: ["Sí", "No"],
};

// ═══════════════════════════════════════════════════════════════════════════
// Tipos locales
// ═══════════════════════════════════════════════════════════════════════════

type FaseName = "inicio" | "desarrollo" | "cierre";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function toLabel(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    return (obj.nombre ?? obj.label ?? obj.name ?? JSON.stringify(v)) as string;
  }
  return String(v);
}

function estrategiasToString(e: string | string[]): string {
  if (typeof e === "string") return e;
  if (Array.isArray(e)) return e.join("\n\n");
  return String(e ?? "");
}

function stringToEstrategias(s: string): string[] {
  return s
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function recursosToString(r: string | string[] | undefined): string {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (Array.isArray(r)) return r.join("\n");
  return String(r ?? "");
}

function stringToRecursos(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function pick<T>(...candidates: unknown[]): T {
  for (const v of candidates) {
    if (v == null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (
      typeof v === "object" &&
      !Array.isArray(v) &&
      Object.keys(v as object).length === 0
    )
      continue;
    return v as T;
  }
  return candidates[candidates.length - 1] as T;
}


// ═══════════════════════════════════════════════════════════════════════════
// Estilos para el modo edición (tablas tipo PDF con celdas editables)
// ═══════════════════════════════════════════════════════════════════════════

const EDIT_DOC_STYLES = `
  .edit-doc table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
  }
  .edit-doc td,
  .edit-doc th {
    border: 1px solid #555;
    padding: 0.3rem 0.4rem;
    font-size: 9pt;
    vertical-align: top;
  }
  .edit-doc th {
    font-weight: bold;
    font-size: 8.5pt;
  }
  .edit-doc .ec textarea,
  .edit-doc .ec input[type="text"] {
    width: 100%;
    background: transparent;
    border: 1px dashed transparent;
    border-radius: 2px;
    padding: 4px 6px;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s, background-color 0.15s;
    box-sizing: border-box;
    min-height: 32px;
  }
  .edit-doc .ec textarea {
    field-sizing: content;
    min-height: 56px;
    overflow-y: hidden;
  }
  .edit-doc .ec input[type="text"] {
    min-height: 32px;
  }
  .edit-doc .ec textarea:hover,
  .edit-doc .ec input[type="text"]:hover {
    border-color: #93c5fd;
    background-color: rgba(219, 234, 254, 0.3);
  }
  .edit-doc .ec textarea:focus,
  .edit-doc .ec input[type="text"]:focus {
    border-color: #3b82f6;
    background-color: rgba(239, 246, 255, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
  }
  .edit-doc .ec-inline {
    display: inline-block;
    background: transparent;
    border: 1px dashed transparent;
    border-radius: 2px;
    padding: 1px 4px;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    outline: none;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .edit-doc .ec-inline:hover {
    border-color: #93c5fd;
    background-color: rgba(219, 234, 254, 0.3);
  }
  .edit-doc .ec-inline:focus {
    border-color: #3b82f6;
    background-color: rgba(239, 246, 255, 0.6);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════════════════

function EditarSesionPremium() {
  const { id: sesionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { user: usuario, updateUsuario: updateUsuarioStore, fetchUsuario } = useUserStore();

  // ── Cargar perfil completo del usuario (forzar refresh para datos actualizados) ──
  useEffect(() => {
    const authId = user?.id || usuario?.id;
    if (authId) {
      fetchUsuario(authId, true);
    }
  }, [user?.id]);

  // ── Estado de carga ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawSesion, setRawSesion] = useState<any>(null);
  const [docente, setDocente] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [seccion, setSeccion] = useState("");

  // ── Edición inline de sección ──
  const [editingSeccion, setEditingSeccion] = useState(false);
  const [seccionInput, setSeccionInput] = useState("");
  const [savingSeccion, setSavingSeccion] = useState(false);

  const handleStartEditSeccion = useCallback(() => {
    setSeccionInput(seccion || usuario?.seccion || "");
    setEditingSeccion(true);
  }, [seccion, usuario?.seccion]);

  const handleSaveSeccion = useCallback(async () => {
    const valor = seccionInput.trim();
    if (!valor) {
      toast.error("Ingresa la sección");
      return;
    }
    const userId = usuario?.id || user?.id;
    if (!userId) return;
    try {
      setSavingSeccion(true);
      await updateUsuario(userId, { seccion: valor });
      updateUsuarioStore({ seccion: valor });
      setSeccion(valor);
      setEditingSeccion(false);
      toast.success("Sección guardada correctamente");
    } catch {
      toast.error("Error al guardar la sección");
    } finally {
      setSavingSeccion(false);
    }
  }, [seccionInput, usuario?.id, user?.id, updateUsuarioStore]);

  // ── Vista ──
  const [view, setView] = useState<"edit" | "preview">("edit");

  // ── Guardado ──
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [fillingListaCotejo, setFillingListaCotejo] = useState(false);

  // ═════════════════════════════════════════════════════════════════════════
  // Estado editable — campos del contenido
  // ═════════════════════════════════════════════════════════════════════════

  const [titulo, setTitulo] = useState("");
  /** Área curricular (cabecera): editable por docentes premium. */
  const [areaEdit, setAreaEdit] = useState("");
  const [propositoSesion, setPropositoSesion] = useState("");

  const [propositos, setPropositos] = useState<
    {
      competencia: string;
      capacidades: string;
      criterios: string;
      evidencia: string;
      estandar: string;
      instrumento: string;
    }[]
  >([]);

  const [enfoques, setEnfoques] = useState<
    { enfoque: string; valor: string; actitud: string }[]
  >([]);

  const [quehacerAntes, setQuehacerAntes] = useState("");
  const [recursosMateriales, setRecursosMateriales] = useState("");

  const [fases, setFases] = useState<
    Record<
      FaseName,
      {
        tiempo: string;
        procesos: {
          proceso: string;
          estrategias: string;
          recursos: string;
          tiempo: string;
        }[];
      }
    >
  >({
    inicio: { tiempo: "", procesos: [] },
    desarrollo: { tiempo: "", procesos: [] },
    cierre: { tiempo: "", procesos: [] },
  });

  const [reflexionAprendizajes, setReflexionAprendizajes] = useState("");
  const [reflexionEnsenanza, setReflexionEnsenanza] = useState("");
  /** Fecha de la sesión (editable). Se guarda en contenido.fechaSesion y se muestra en el PDF. */
  const [fechaSesion, setFechaSesion] = useState("");

  // ═════════════════════════════════════════════════════════════════════════
  // Cargar sesión del backend
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!sesionId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerSesionPorId(sesionId!);
        if (cancelled) return;

        setRawSesion(data);

        const sesionUsuario = data.usuario as
          | { nombre?: string; nombreInstitucion?: string; seccion?: string }
          | undefined;
        setDocente(
          sesionUsuario?.nombre || usuario?.nombre || user?.name || "",
        );
        setInstitucion(
          sesionUsuario?.nombreInstitucion ||
            usuario?.nombreInstitucion ||
            "",
        );
        setSeccion(sesionUsuario?.seccion || usuario?.seccion || "");

        const raw = data as any;
        let contenido: Record<string, any> = {};
        try {
          const c = raw.contenido;
          if (typeof c === "string") contenido = JSON.parse(c);
          else if (c && typeof c === "object") contenido = c;
        } catch {
          /* vacío */
        }

        // Título
        setTitulo(
          pick<string>(raw.titulo, contenido.titulo, "Sesión de Aprendizaje"),
        );

        // Área curricular (cabecera, editable)
        setAreaEdit(
          toLabel(
            pick(raw.area, contenido.area, contenido.datosGenerales?.area),
          ) || "",
        );

        // Propósito de sesión
        setPropositoSesion(
          pick<string>(raw.propositoSesion, contenido.propositoSesion, ""),
        );

        // Propósitos de aprendizaje (soporta array premium o objeto free)
        const propRaw = pick<any>(
          raw.propositoAprendizaje,
          contenido.propositoAprendizaje,
          [],
        );
        // Free envía un solo objeto; premium envía un array
        const propArr = Array.isArray(propRaw) ? propRaw : (propRaw && typeof propRaw === "object" ? [propRaw] : []);
        setPropositos(
          propArr.map((p: any) => {
            // capacidades: premium=["str",...], free=[{nombre,descripcion},...]
            let caps = "";
            if (Array.isArray(p.capacidades)) {
              caps = p.capacidades
                .map((c: any) => (typeof c === "string" ? c : c?.nombre || ""))
                .join("\n");
            } else if (typeof p.capacidades === "string") {
              caps = p.capacidades;
            }
            // criterios: premium=["str",...], free=[{criterioCompleto,...},...]
            let crit = "";
            if (Array.isArray(p.criteriosEvaluacion)) {
              crit = p.criteriosEvaluacion
                .map((c: any) => (typeof c === "string" ? c : c?.criterioCompleto || ""))
                .join("\n");
            } else if (typeof p.criteriosEvaluacion === "string") {
              crit = p.criteriosEvaluacion;
            }
            return {
              competencia: p.competencia || "",
              capacidades: caps,
              criterios: crit,
              evidencia: p.evidencia || p.evidenciaAprendizaje || "",
              estandar: p.estandar || "",
              instrumento: p.instrumento || p.instrumentoEvaluacion || "",
            };
          }),
        );

        // Enfoques
        const enfRaw = pick<any[]>(
          raw.enfoquesTransversales,
          contenido.enfoquesTransversales,
          [],
        );
        const enfArr = Array.isArray(enfRaw) ? enfRaw : [];
        setEnfoques(
          enfArr.map((e: any) => ({
            enfoque: e.enfoque || e.nombre || "",
            valor: e.valor || "",
            actitud: e.actitud || e.actitudes || e.actitudesObservables || "",
          })),
        );

        // Preparación
        const prep = pick<any>(
          raw.preparacion,
          contenido.preparacion,
          { quehacerAntes: [], recursosMateriales: [] },
        );
        setQuehacerAntes(
          Array.isArray(prep.quehacerAntes)
            ? prep.quehacerAntes.join("\n")
            : prep.quehacerAntes || "",
        );
        setRecursosMateriales(
          Array.isArray(prep.recursosMateriales)
            ? prep.recursosMateriales.join("\n")
            : prep.recursosMateriales || "",
        );

        // Fases
        const fasesLoaded: Record<
          FaseName,
          {
            tiempo: string;
            procesos: {
              proceso: string;
              estrategias: string;
              recursos: string;
              tiempo: string;
            }[];
          }
        > = {
          inicio: { tiempo: "", procesos: [] },
          desarrollo: { tiempo: "", procesos: [] },
          cierre: { tiempo: "", procesos: [] },
        };
        // secuenciaDidactica: free anida fases aquí; premium las pone en raíz
        const secDidactica = contenido.secuenciaDidactica || {};
        for (const fase of ["inicio", "desarrollo", "cierre"] as FaseName[]) {
          const f = pick<IFasePremium>(raw[fase], contenido[fase], secDidactica[fase], {
            tiempo: "",
            procesos: [],
          });
          fasesLoaded[fase] = {
            tiempo: f.tiempo || "",
            procesos: (f.procesos || []).map((p: IProcesoPremium) => ({
              proceso: p.proceso || "",
              estrategias: estrategiasToString(p.estrategias),
              recursos: recursosToString(p.recursos || p.recursosDidacticos),
              tiempo: p.tiempo || "",
            })),
          };
        }
        setFases(fasesLoaded);

        // Reflexiones
        const refl = pick<any>(raw.reflexiones, contenido.reflexiones, {
          sobreAprendizajes: "",
          sobreEnsenanza: "",
        });
        setReflexionAprendizajes(
          refl.sobreAprendizajes || refl.avancesEstudiantes || "",
        );
        setReflexionEnsenanza(
          refl.sobreEnsenanza || refl.dificultadesExperimentadas || "",
        );

        // Fecha de la sesión (editable, alineada a Perú)
        const dateStr =
          contenido.fechaSesion || raw.fechaInicio || raw.createdAt;
        setFechaSesion(dateOnlyToInputValue(dateStr) || dateStr || "");
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Error al cargar la sesión",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sesionId, usuario, user]);

  // ═════════════════════════════════════════════════════════════════════════
  // Construir ISesionPremiumResponse desde el estado de edición
  // ═════════════════════════════════════════════════════════════════════════

  const buildPremiumData = useCallback((): ISesionPremiumResponse | null => {
    if (!rawSesion) return null;
    const raw = rawSesion as any;
    let contenido: Record<string, any> = {};
    try {
      const c = raw.contenido;
      if (typeof c === "string") contenido = JSON.parse(c);
      else if (c && typeof c === "object") contenido = c;
    } catch {
      /* vacío */
    }

    function rebuildFase(fase: FaseName): IFasePremium {
      const secDidactica = contenido.secuenciaDidactica || {};
      const original = pick<IFasePremium>(raw[fase], contenido[fase], secDidactica[fase], {
        tiempo: "",
        procesos: [],
      });
      const edited = fases[fase];
      return {
        tiempo: edited.tiempo || original.tiempo,
        procesos: edited.procesos.map((ep, i) => {
          const orig = (original.procesos?.[i] || {}) as any;
          return {
            ...orig,
            proceso: ep.proceso,
            estrategias: stringToEstrategias(ep.estrategias),
            recursos: stringToRecursos(ep.recursos),
            tiempo: ep.tiempo,
          };
        }),
      };
    }

    const sesionForDoc: any = {
      id: raw.id,
      titulo,
      area: areaEdit.trim() || pick(raw.area, contenido.area, contenido.datosGenerales?.area),
      nivel: pick(raw.nivel, contenido.nivel, contenido.datosGenerales?.nivel),
      grado: pick(raw.grado, contenido.grado, contenido.datosGenerales?.grado),
      duracion: raw.duracion ?? contenido.duracion ?? contenido.datosGenerales?.duracion,
      usuario: raw.usuario,
      fechaInicio: fechaSesion || raw.fechaInicio || raw.createdAt,

      propositoSesion,
      propositoAprendizaje: propositos.map((p) => ({
        competencia: p.competencia,
        capacidades: p.capacidades
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
        criteriosEvaluacion: p.criterios
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
        evidencia: p.evidencia,
        estandar: p.estandar,
        instrumento: p.instrumento,
      })),
      enfoquesTransversales: enfoques.map((e) => ({
        enfoque: e.enfoque,
        valor: e.valor,
        actitud: e.actitud,
      })),
      preparacion: {
        quehacerAntes: quehacerAntes
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
        recursosMateriales: recursosMateriales
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
      },

      inicio: rebuildFase("inicio"),
      desarrollo: rebuildFase("desarrollo"),
      cierre: rebuildFase("cierre"),

      reflexiones: {
        sobreAprendizajes: reflexionAprendizajes,
        sobreEnsenanza: reflexionEnsenanza,
      },

      resumen: pick<string>(raw.resumen, contenido.resumen, ""),
      fuentesMinedu: pick<any[]>(
        raw.fuentesMinedu,
        contenido.fuentesMinedu,
        [],
      ),
      imagenesDisponibles: pick<any[]>(
        raw.imagenesDisponibles,
        contenido.imagenesDisponibles,
        [],
      ),

      ...(raw.recursoNarrativo || contenido.recursoNarrativo
        ? {
            recursoNarrativo:
              raw.recursoNarrativo || contenido.recursoNarrativo,
          }
        : {}),
    };

    return {
      success: true,
      docente,
      institucion,
      seccion,
      nombreDirectivo: usuario?.nombreDirectivo ?? "",
      sesion: sesionForDoc,
    };
  }, [
    rawSesion,
    titulo,
    areaEdit,
    propositoSesion,
    propositos,
    enfoques,
    quehacerAntes,
    recursosMateriales,
    fases,
    reflexionAprendizajes,
    reflexionEnsenanza,
    fechaSesion,
    docente,
    institucion,
    seccion,
    usuario?.nombreDirectivo,
  ]);

  // Instrumento de evaluación (lista de cotejo / escala) para la vista previa PDF
  const instrumentoPreview = useMemo(() => {
    if (!propositos?.length) return null;
    const raw = rawSesion as any;
    const contenido = raw?.contenido;
    let parsedContenido: Record<string, any> = {};
    try {
      const c = typeof contenido === "string" ? JSON.parse(contenido) : contenido;
      if (c && typeof c === "object") parsedContenido = c;
    } catch {
      /* ignore */
    }
    const grado = toLabel(
      raw?.grado ?? parsedContenido.grado ?? parsedContenido.datosGenerales?.grado,
    );
    const area =
      areaEdit.trim() ||
      toLabel(raw?.area ?? parsedContenido.area ?? parsedContenido.datosGenerales?.area) ||
      "—";
    // Cualquier propósito con instrumento (ej. "Lista de cotejo") o evidencia; si no hay criterios usamos "—"
    const first =
      propositos.find(
        (p) => (p.instrumento?.trim() || p.evidencia?.trim() || p.competencia?.trim()),
      ) ?? propositos[0];
    const criteriosList = (first.criterios ?? "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    return buildInstrumentoLocal({
      area,
      grado: grado || "—",
      competencia: first.competencia || "—",
      evidencia: first.evidencia || "—",
      criterios: criteriosList.length > 0 ? criteriosList : ["—"],
      instrumento: first.instrumento?.trim() || "Lista de cotejo",
    });
  }, [rawSesion, areaEdit, propositos]);

  // ═════════════════════════════════════════════════════════════════════════
  // Guardar: PATCH contenido + regenerar PDF + subir a S3
  // ═════════════════════════════════════════════════════════════════════════

  const handleGuardar = useCallback(async () => {
    if (!sesionId) return;
    setSaving(true);
    setSavedOk(false);

    try {
      const premData = buildPremiumData();
      if (!premData) throw new Error("No se pudo construir la sesión");

      const { sesion } = premData;
      const contenidoPatch: Record<string, any> = {};

      if (sesion.propositoSesion !== undefined)
        contenidoPatch.propositoSesion = sesion.propositoSesion;
      if (sesion.propositoAprendizaje)
        contenidoPatch.propositoAprendizaje = sesion.propositoAprendizaje;
      if (sesion.enfoquesTransversales)
        contenidoPatch.enfoquesTransversales = sesion.enfoquesTransversales;
      if (sesion.preparacion)
        contenidoPatch.preparacion = sesion.preparacion;
      if (sesion.inicio) contenidoPatch.inicio = sesion.inicio;
      if (sesion.desarrollo) contenidoPatch.desarrollo = sesion.desarrollo;
      if (sesion.cierre) contenidoPatch.cierre = sesion.cierre;
      if (sesion.reflexiones)
        contenidoPatch.reflexiones = sesion.reflexiones;
      if (fechaSesion) contenidoPatch.fechaSesion = fechaSesion;
      if (sesion.area !== undefined) contenidoPatch.area = sesion.area;

      toast.info("Guardando cambios...");
      await editarContenidoSesion(sesionId, {
        titulo:
          titulo !== (rawSesion as any)?.titulo ? titulo : undefined,
        contenido: contenidoPatch,
      });

      toast.success("Contenido guardado en la base de datos");

      setView("preview");
      setPdfUploading(true);
      await new Promise((r) => setTimeout(r, 2000));

      if (documentRef.current && user?.id) {
        const images = documentRef.current.querySelectorAll("img");
        const pending = Array.from(images).filter((img) => !img.complete);
        if (pending.length > 0) {
          await Promise.all(
            pending.map(
              (img) =>
                new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }),
            ),
          );
          await new Promise((r) => setTimeout(r, 500));
        }

        toast.info("Generando PDF actualizado...");

        const { generatePDFBlob } = await import(
          "@/services/htmldocs.service"
        );
        const pdfBlob = await generatePDFBlob(documentRef.current, {
          size: "A4",
          orientation: "portrait",
          preserveGraphicSize: true,
        });

        const respUpload = await solicitarUploadPDF({
          sesionId,
          usuarioId: user.id,
        });
        const uploadData = (respUpload as any)?.data ?? respUpload;

        await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

        await confirmarUploadPDF({
          sesionId,
          usuarioId: user.id,
          key: uploadData.key,
          contenido: premData.sesion as any,
        });

        toast.success("PDF actualizado y guardado en la nube ☁️");
      }

      setSavedOk(true);
    } catch (err: any) {
      console.error("❌ Error al guardar sesión:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al guardar",
      );
    } finally {
      setSaving(false);
      setPdfUploading(false);
    }
  }, [sesionId, buildPremiumData, titulo, rawSesion, user?.id]);

  /** Completar lista de cotejo: toma alumnos del storage, guarda en sesión (listaAlumnos) y actualiza PDF */
  const handleCompletarListaCotejo = useCallback(async () => {
    const alumnos = getSavedAlumnos();
    if (!alumnos?.length) {
      toast.error("No hay lista de alumnos. Sube tu lista desde el dashboard (Modificar lista de alumnos).");
      return;
    }
    if (!sesionId) return;
    setFillingListaCotejo(true);
    try {
      const listaAlumnos = alumnos.map((a) => ({
        orden: a.orden,
        apellidos: a.apellidos ?? "",
        nombres: a.nombres ?? "",
        nombreCompleto: [a.apellidos, a.nombres].filter(Boolean).join(", ") || "—",
        ...(a.sexo && { sexo: a.sexo }),
        ...(a.dni != null && a.dni !== "" && { dni: a.dni }),
      }));
      await editarContenidoSesion(sesionId, {
        contenido: { listaAlumnos },
      });
      toast.success(`Lista de ${listaAlumnos.length} alumnos guardada en la sesión. Actualizando PDF...`);
      await handleGuardar();
    } catch (err: any) {
      console.error("Error al completar lista de cotejo:", err);
      toast.error(err?.response?.data?.message || err?.message || "Error al guardar la lista");
    } finally {
      setFillingListaCotejo(false);
    }
  }, [sesionId, handleGuardar]);

  // ═════════════════════════════════════════════════════════════════════════
  // Helpers de actualización
  // ═════════════════════════════════════════════════════════════════════════

  const updateFaseProceso = (
    fase: FaseName,
    index: number,
    field: string,
    value: string,
  ) => {
    setFases((prev) => ({
      ...prev,
      [fase]: {
        ...prev[fase],
        procesos: prev[fase].procesos.map((p, i) =>
          i === index ? { ...p, [field]: value } : p,
        ),
      },
    }));
  };

  const updateProposito = (
    index: number,
    field: string,
    value: string,
  ) => {
    setPropositos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const updateEnfoque = (
    index: number,
    field: string,
    value: string,
  ) => {
    setEnfoques((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  };

  const handleDownloadPDF = async () => {
    const premData = buildPremiumData();
    if (!premData) return;

    setView("preview");
    await new Promise((r) => setTimeout(r, 1500));

    if (!documentRef.current) {
      toast.error("No se pudo acceder al documento");
      return;
    }

    try {
      const timestamp = Date.now().toString().slice(-8);
      const { generateAndDownloadPDF } = await import(
        "@/services/htmldocs.service"
      );
      await generateAndDownloadPDF(
        documentRef.current,
        `sesion-editada-${timestamp}.pdf`,
        {
          size: "A4",
          orientation: "portrait",
          preserveGraphicSize: true,
        },
      );
      toast.success("PDF descargado");
    } catch {
      toast.error("Error al generar PDF");
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !rawSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {error || "No se pudo cargar la sesión"}
          </h2>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    );
  }

  // ── Datos derivados para el modo edición ──
  const raw = rawSesion as any;
  let parsedContenido: Record<string, any> = {};
  try {
    const c = raw.contenido;
    if (typeof c === "string") parsedContenido = JSON.parse(c);
    else if (c && typeof c === "object") parsedContenido = c;
  } catch {
    /* vacío */
  }

  const areaName = (areaEdit && areaEdit.trim()) ? areaEdit.trim() : toLabel(raw.area || parsedContenido.area || parsedContenido.datosGenerales?.area);
  const hex = getAreaColor(areaName).hex;
  const premiumData = buildPremiumData();

  /** Renderiza una fase (INICIO / DESARROLLO / CIERRE) con celdas editables */
  const renderEditFase = (fase: FaseName, label: string) => {
    const data = fases[fase];
    return (
      <>
        <tr>
          <td
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              padding: "0.3rem 0.5rem",
            }}
          >
            {label} - Tiempo aproximado:{" "}
            <input
              type="text"
              className="ec-inline"
              value={data.tiempo}
              onChange={(e) =>
                setFases((prev) => ({
                  ...prev,
                  [fase]: { ...prev[fase], tiempo: e.target.value },
                }))
              }
              placeholder="15 min"
              style={{ width: "100px", fontWeight: "normal" }}
            />
          </td>
        </tr>
        {data.procesos.map((p, i) => (
          <tr key={`${fase}-${i}`}>
            <td
              className="ec"
              style={{ padding: "0.5rem 0.6rem", lineHeight: 1.6 }}
            >
              {/* Título del proceso */}
              <div style={{ marginBottom: "0.5rem" }}>
                <input
                  type="text"
                  value={p.proceso}
                  onChange={(e) =>
                    updateFaseProceso(fase, i, "proceso", e.target.value)
                  }
                  style={{
                    fontWeight: "bold",
                    fontSize: "10pt",
                    width: "100%",
                  }}
                  placeholder="Nombre del proceso"
                />
              </div>

              {/* Estrategias */}
              <div style={{ marginBottom: "0.5rem" }}>
                <strong style={{ fontSize: "9pt" }}>Estrategias:</strong>
                <textarea
                  value={p.estrategias}
                  onChange={(e) =>
                    updateFaseProceso(
                      fase,
                      i,
                      "estrategias",
                      e.target.value,
                    )
                  }
                  rows={Math.max(4, p.estrategias.split("\n").length + 1)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    whiteSpace: "pre-wrap",
                  }}
                  placeholder="Describe las estrategias y actividades..."
                />
              </div>

              {/* Recursos */}
              <div style={{ marginBottom: "0.3rem" }}>
                <strong style={{ fontSize: "9pt" }}>Recursos:</strong>{" "}
                <input
                  type="text"
                  value={p.recursos}
                  onChange={(e) =>
                    updateFaseProceso(fase, i, "recursos", e.target.value)
                  }
                  style={{ width: "calc(100% - 70px)" }}
                  placeholder="Recursos didácticos"
                />
              </div>

              {/* Tiempo */}
              <div>
                <strong style={{ fontSize: "9pt" }}>Tiempo:</strong>{" "}
                <input
                  type="text"
                  value={p.tiempo}
                  onChange={(e) =>
                    updateFaseProceso(fase, i, "tiempo", e.target.value)
                  }
                  style={{ width: "100px" }}
                  placeholder="15 min"
                />
              </div>
            </td>
          </tr>
        ))}
        {data.procesos.length === 0 && (
          <tr>
            <td
              style={{
                padding: "0.5rem",
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              Sin procesos en esta fase
            </td>
          </tr>
        )}
      </>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Editar Sesión de Aprendizaje
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Toggle Editar / Vista Previa */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setView("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "edit"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => setView("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "preview"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Vista Previa
              </button>
            </div>

            {/* Botones de acción */}
            <Button
              onClick={handleGuardar}
              disabled={saving || pdfUploading}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
            >
              {saving || pdfUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedOk ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {saving
                  ? "Guardando..."
                  : pdfUploading
                    ? "Subiendo PDF..."
                    : savedOk
                      ? "Guardado ✓"
                      : "Guardar cambios"}
              </span>
              <span className="sm:hidden">
                {saving || pdfUploading ? "..." : "Guardar"}
              </span>
            </Button>

            {view === "preview" && (
              <>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Modo EDITAR — Diseño tipo PDF con celdas editables
        ══════════════════════════════════════════════════════════════════ */}
        {view === "edit" && (
          <div
            className="edit-doc bg-white shadow-lg mx-auto rounded"
            style={{
              maxWidth: "270mm",
              padding: "12mm 15mm",
              fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
              color: "#1a1a1a",
            }}
          >
            <style>{EDIT_DOC_STYLES}</style>

            <p className="text-center text-xs text-blue-500 mb-3 no-print">
              💡 Haz clic en cualquier celda para editarla — los cambios se
              reflejarán en el PDF final
            </p>

            {/* ── HEADER ── */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "0.5rem",
                paddingBottom: "0.3rem",
                borderBottom: `2px solid ${hex.accent}`,
              }}
            >
              <p
                style={{
                  fontSize: "10pt",
                  fontWeight: "bold",
                  color: hex.accent,
                  margin: 0,
                }}
              >
                {institucion || "Institución Educativa"}
              </p>
              <div
                className="ec"
                style={{ display: "inline-block", width: "80%" }}
              >
                <textarea
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  rows={1}
                  style={{
                    fontSize: "13pt",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "100%",
                    overflow: "hidden",
                    minHeight: "36px",
                  } as React.CSSProperties & Record<string, string>}
                  ref={(el) => { if (el) el.style.setProperty("field-sizing", "content"); }}
                  placeholder="Título de la sesión"
                />
              </div>
            </div>

            {/* ── DATOS GENERALES (misma estructura que la vista previa: Área: | valor, luego DATOS INFORMATIVOS) ── */}
            <table>
              <tbody>
                <tr>
                  <td style={{ width: "18%", fontWeight: "bold", backgroundColor: hex.light }}>Área:</td>
                  <td style={{ width: "82%", backgroundColor: hex.light }}>
                    <input
                      type="text"
                      value={areaEdit || ""}
                      onChange={(e) => setAreaEdit(e.target.value)}
                      placeholder="Área Curricular"
                      className="ec-inline"
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "1px dashed transparent",
                        borderRadius: "4px",
                        padding: "2px 4px",
                        fontSize: "inherit",
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      backgroundColor: hex.light,
                      fontWeight: "bold",
                    }}
                  >
                    DATOS INFORMATIVOS:
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: hex.light,
                      width: "18%",
                    }}
                  >
                    Docente
                  </td>
                  <td colSpan={3}>{docente}</td>
                </tr>
                {usuario?.nombreDirectivo && (
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: hex.light,
                        width: "18%",
                      }}
                    >
                      Director(a)
                    </td>
                    <td colSpan={3}>{usuario.nombreDirectivo}</td>
                  </tr>
                )}
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: hex.light,
                    }}
                  >
                    Nivel
                  </td>
                  <td style={{ width: "32%" }}>
                    {toLabel(raw.nivel || parsedContenido.nivel)}
                  </td>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: hex.light,
                      width: "18%",
                    }}
                  >
                    Grado{seccion ? " y Sección" : ""}
                  </td>
                  <td>
                    {editingSeccion ? (
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span>{toLabel(raw.grado || parsedContenido.grado)} — "</span>
                        <input type="text" value={seccionInput} onChange={(e) => setSeccionInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveSeccion()} autoFocus style={{ border: "1px solid #3b82f6", borderRadius: 4, padding: "2px 6px", fontSize: "9pt", width: 60 }} />
                        <span>"</span>
                        <button onClick={handleSaveSeccion} disabled={savingSeccion} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px", fontSize: "8pt", cursor: "pointer" }}>{savingSeccion ? "..." : "Guardar"}</button>
                        <button onClick={() => setEditingSeccion(false)} style={{ background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "2px 8px", fontSize: "8pt", cursor: "pointer" }}>✕</button>
                      </span>
                    ) : seccion ? (
                      <>{toLabel(raw.grado || parsedContenido.grado)} — "{seccion}"</>
                    ) : (
                      <span>
                        {toLabel(raw.grado || parsedContenido.grado)}{" "}
                        <button className="no-print" onClick={handleStartEditSeccion} style={{ background: "none", border: "1px dashed #3b82f6", borderRadius: 4, padding: "2px 8px", color: "#3b82f6", cursor: "pointer", fontSize: "8pt" }}>Agregar Sección</button>
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: hex.light,
                    }}
                  >
                    Duración
                  </td>
                  <td colSpan={3}>
                    {raw.duracion || parsedContenido.duracion || ""}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: hex.light,
                    }}
                  >
                    Fecha
                  </td>
                  <td colSpan={3} className="ec">
                    <Input
                      type="date"
                      value={fechaSesion}
                      onChange={(e) => setFechaSesion(e.target.value || "")}
                      className="h-8 text-sm w-full max-w-[180px]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── PROPÓSITOS DE APRENDIZAJE ── */}
            {propositos.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th
                      colSpan={4}
                      style={{
                        backgroundColor: hex.light,
                        textAlign: "center",
                      }}
                    >
                      PROPÓSITOS DE APRENDIZAJE Y EVIDENCIAS
                    </th>
                  </tr>
                  <tr>
                    <th
                      style={{
                        width: "25%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Competencias / Capacidades
                    </th>
                    <th
                      style={{
                        width: "25%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Criterios de Evaluación
                    </th>
                    <th
                      style={{
                        width: "25%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Producto / Evidencia
                    </th>
                    <th
                      style={{
                        width: "25%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Instrumento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {propositos.map((p, i) => (
                    <tr key={i}>
                      {/* Competencia + Capacidades + Estándar */}
                      <td className="ec">
                        <input
                          type="text"
                          value={p.competencia}
                          onChange={(e) =>
                            updateProposito(
                              i,
                              "competencia",
                              e.target.value,
                            )
                          }
                          style={{
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                          placeholder="Competencia"
                        />
                        <textarea
                          value={p.capacidades}
                          onChange={(e) =>
                            updateProposito(
                              i,
                              "capacidades",
                              e.target.value,
                            )
                          }
                          rows={Math.max(
                            2,
                            p.capacidades.split("\n").length,
                          )}
                          placeholder="Capacidades (una por línea)"
                        />
                      </td>

                      {/* Criterios */}
                      <td className="ec">
                        <textarea
                          value={p.criterios}
                          onChange={(e) =>
                            updateProposito(
                              i,
                              "criterios",
                              e.target.value,
                            )
                          }
                          rows={Math.max(
                            3,
                            p.criterios.split("\n").length,
                          )}
                          placeholder="Criterios (uno por línea)"
                        />
                      </td>

                      {/* Evidencia */}
                      <td className="ec">
                        <textarea
                          value={p.evidencia}
                          onChange={(e) =>
                            updateProposito(
                              i,
                              "evidencia",
                              e.target.value,
                            )
                          }
                          rows={Math.max(
                            2,
                            (p.evidencia || "").split("\n").length,
                          )}
                          placeholder="Evidencia / Producto"
                        />
                      </td>

                      {/* Instrumento */}
                      <td className="ec">
                        <input
                          type="text"
                          value={p.instrumento}
                          onChange={(e) =>
                            updateProposito(
                              i,
                              "instrumento",
                              e.target.value,
                            )
                          }
                          placeholder="Instrumento"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── PROPÓSITO DE LA SESIÓN ── */}
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: hex.light,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    PROPÓSITO DE LA SESIÓN
                  </td>
                </tr>
                <tr>
                  <td className="ec">
                    <textarea
                      value={propositoSesion}
                      onChange={(e) => setPropositoSesion(e.target.value)}
                      rows={Math.max(
                        2,
                        propositoSesion.split("\n").length + 1,
                      )}
                      placeholder="Propósito de la sesión"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── ENFOQUES TRANSVERSALES ── */}
            {enfoques.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th
                      colSpan={3}
                      style={{
                        backgroundColor: hex.light,
                        textAlign: "center",
                      }}
                    >
                      ENFOQUES TRANSVERSALES
                    </th>
                  </tr>
                  <tr>
                    <th
                      style={{
                        width: "30%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Enfoques Transversales
                    </th>
                    <th
                      style={{
                        width: "25%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Valor
                    </th>
                    <th
                      style={{
                        width: "45%",
                        backgroundColor: hex.light,
                      }}
                    >
                      Actitudes o Acciones Observables
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enfoques.map((e, i) => (
                    <tr key={i}>
                      <td className="ec">
                        <textarea
                          value={e.enfoque}
                          onChange={(ev) =>
                            updateEnfoque(i, "enfoque", ev.target.value)
                          }
                          rows={1}
                          style={{ fontWeight: "bold" }}
                          placeholder="Enfoque"
                        />
                      </td>
                      <td className="ec">
                        <textarea
                          value={e.valor}
                          onChange={(ev) =>
                            updateEnfoque(i, "valor", ev.target.value)
                          }
                          rows={1}
                          placeholder="Valor"
                        />
                      </td>
                      <td className="ec">
                        <textarea
                          value={e.actitud}
                          onChange={(ev) =>
                            updateEnfoque(i, "actitud", ev.target.value)
                          }
                          rows={2}
                          placeholder="Actitudes observables"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── ANTES DE LA SESIÓN ── */}
            <table>
              <tbody>
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      backgroundColor: hex.light,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    ANTES DE LA SESIÓN
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      width: "50%",
                      backgroundColor: hex.light,
                      fontSize: "8pt",
                    }}
                  >
                    ¿QUÉ NECESITAMOS HACER ANTES DE LA SESIÓN?
                  </th>
                  <th
                    style={{
                      width: "50%",
                      backgroundColor: hex.light,
                      fontSize: "8pt",
                    }}
                  >
                    ¿QUÉ RECURSOS O MATERIALES SE UTILIZARÁN EN ESTA
                    SESIÓN?
                  </th>
                </tr>
                <tr>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    <ul style={{ margin: 0, paddingLeft: "1.4em", listStyleType: "disc" }}>
                      {(quehacerAntes || "\n").split("\n").map((line, idx, arr) => (
                        <li key={idx} style={{ marginBottom: "2px" }}>
                          <input
                            type="text"
                            className="ec-inline"
                            value={line}
                            onChange={(e) => {
                              const lines = quehacerAntes.split("\n");
                              lines[idx] = e.target.value;
                              setQuehacerAntes(lines.join("\n"));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const lines = quehacerAntes.split("\n");
                                lines.splice(idx + 1, 0, "");
                                setQuehacerAntes(lines.join("\n"));
                                setTimeout(() => {
                                  const next = (e.target as HTMLElement)
                                    .parentElement?.nextElementSibling
                                    ?.querySelector("input");
                                  next?.focus();
                                }, 50);
                              } else if (
                                e.key === "Backspace" &&
                                line === "" &&
                                arr.length > 1
                              ) {
                                e.preventDefault();
                                const lines = quehacerAntes.split("\n");
                                lines.splice(idx, 1);
                                setQuehacerAntes(lines.join("\n"));
                              }
                            }}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "1px dashed transparent",
                              borderRadius: "2px",
                              padding: "2px 4px",
                              fontFamily: "inherit",
                              fontSize: "inherit",
                              outline: "none",
                            }}
                            placeholder="Escribir..."
                          />
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: "0.4rem 0.5rem" }}>
                    <ul style={{ margin: 0, paddingLeft: "1.4em", listStyleType: "disc" }}>
                      {(recursosMateriales || "\n").split("\n").map((line, idx, arr) => (
                        <li key={idx} style={{ marginBottom: "2px" }}>
                          <input
                            type="text"
                            className="ec-inline"
                            value={line}
                            onChange={(e) => {
                              const lines = recursosMateriales.split("\n");
                              lines[idx] = e.target.value;
                              setRecursosMateriales(lines.join("\n"));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const lines = recursosMateriales.split("\n");
                                lines.splice(idx + 1, 0, "");
                                setRecursosMateriales(lines.join("\n"));
                                setTimeout(() => {
                                  const next = (e.target as HTMLElement)
                                    .parentElement?.nextElementSibling
                                    ?.querySelector("input");
                                  next?.focus();
                                }, 50);
                              } else if (
                                e.key === "Backspace" &&
                                line === "" &&
                                arr.length > 1
                              ) {
                                e.preventDefault();
                                const lines = recursosMateriales.split("\n");
                                lines.splice(idx, 1);
                                setRecursosMateriales(lines.join("\n"));
                              }
                            }}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "1px dashed transparent",
                              borderRadius: "2px",
                              padding: "2px 4px",
                              fontFamily: "inherit",
                              fontSize: "inherit",
                              outline: "none",
                            }}
                            placeholder="Escribir..."
                          />
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── MOMENTOS Y TIEMPOS DE LA SESIÓN ── */}
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: hex.light,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    MOMENTOS Y TIEMPOS DE LA SESIÓN
                  </td>
                </tr>
                {renderEditFase("inicio", "INICIO")}
                {renderEditFase("desarrollo", "DESARROLLO")}
                {renderEditFase("cierre", "CIERRE")}
              </tbody>
            </table>

            {/* ── REFLEXIONES SOBRE EL APRENDIZAJE (solo si hay contenido) ── */}
            {(reflexionAprendizajes || reflexionEnsenanza) && (
              <table>
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        backgroundColor: hex.light,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      REFLEXIONES SOBRE EL APRENDIZAJE
                    </td>
                  </tr>
                  <tr>
                    <th
                      style={{
                        width: "50%",
                        backgroundColor: hex.light,
                      }}
                    >
                      SOBRE LOS APRENDIZAJES
                    </th>
                    <th
                      style={{
                        width: "50%",
                        backgroundColor: hex.light,
                      }}
                    >
                      SOBRE LA ENSEÑANZA
                    </th>
                  </tr>
                  <tr>
                    <td className="ec">
                      <textarea
                        value={reflexionAprendizajes}
                        onChange={(e) =>
                          setReflexionAprendizajes(e.target.value)
                        }
                        rows={3}
                        placeholder="Reflexión sobre aprendizajes"
                      />
                    </td>
                    <td className="ec">
                      <textarea
                        value={reflexionEnsenanza}
                        onChange={(e) =>
                          setReflexionEnsenanza(e.target.value)
                        }
                        rows={3}
                        placeholder="Reflexión sobre enseñanza"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* ── LISTA DE COTEJO (siempre visible al editar; actualizable con el botón) ── */}
            <div
              style={{
                marginTop: "1rem",
                marginBottom: "1rem",
                border: `2px solid ${hex.accent}`,
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: hex.light ? `${hex.light}20` : undefined,
              }}
            >
              <div
                style={{
                  backgroundColor: hex.light ?? hex.accent,
                  color: hex.primary ?? "#1e293b",
                  fontWeight: "bold",
                  padding: "0.5rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <ListChecks className="w-5 h-5" />
                  Lista de cotejo
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={fillingListaCotejo || saving}
                  onClick={handleCompletarListaCotejo}
                  style={{
                    backgroundColor: hex.accent,
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {fillingListaCotejo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <ListChecks className="w-4 h-4 mr-1.5" />
                      Completar lista de cotejo
                    </>
                  )}
                </Button>
              </div>
              <div style={{ padding: "0.75rem" }}>
                <InstrumentoEvaluacionSection
                  instrumento={instrumentoPreview ?? INSTRUMENTO_LISTA_COTEJO_VACIA}
                  hex={hex}
                  alumnos={getSavedAlumnos()}
                />
              </div>
            </div>

            {/* ── Botón guardar al final ── */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleGuardar}
                disabled={saving || pdfUploading}
                size="lg"
                className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 px-8"
              >
                {saving || pdfUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving
                  ? "Guardando cambios..."
                  : pdfUploading
                    ? "Subiendo PDF..."
                    : "Guardar cambios y actualizar PDF"}
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Modo VISTA PREVIA — Renderiza el SesionPremiumDoc real
        ══════════════════════════════════════════════════════════════════ */}
        {view === "preview" && premiumData && (
          <div ref={documentRef}>
            <SesionPremiumDoc data={premiumData} instrumento={instrumentoPreview ?? undefined} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditarSesionPremium;
