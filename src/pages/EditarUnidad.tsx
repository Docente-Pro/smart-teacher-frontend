import { Document, Footer } from "@htmldocs/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Cloud,
  Eye,
  FileDown,
  Loader2,
  Pencil,
  Printer,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import {
  getUnidadDetalleSuscriptor,
  getUnidadById,
  solicitarUploadUrlUnidad,
  confirmarUploadUnidad,
  editarContenidoUnidad,
} from "@/services/unidad.service";
import { subirPDFaS3 } from "@/services/sesiones.service";
import { updateUsuario } from "@/services/usuarios.service";
import { getAreaColor } from "@/constants/areaColors";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import type {
  IEvidencias,
  IEnfoqueUnidad,
  IReflexionPregunta,
  ICompetenciaProposito,
  IAreaProposito,
  IAreaComplementaria,
  ISemanaSecuencia,
  IDiaSecuencia,
  IHoraActividad,
} from "@/interfaces/IUnidadIA";

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

// ═══════════════════════════════════════════════════════════════════════════
// Helpers para parsear contenido
// ═══════════════════════════════════════════════════════════════════════════

function parseContenido(raw: any): Record<string, any> {
  let parsed = raw;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return {};
    }
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return {};
    }
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
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return {};
      }
    }
  }
  return parsed ?? {};
}

function unwrapSituacion(raw: any): string {
  if (typeof raw === "string") return raw;
  if (
    raw &&
    typeof raw === "object" &&
    typeof raw.situacionSignificativa === "string"
  )
    return raw.situacionSignificativa;
  return "";
}

function unwrapEvidencias(raw: any): IEvidencias | undefined {
  if (!raw) return undefined;
  if (raw.proposito !== undefined || raw.reto !== undefined) return raw;
  if (raw.evidencias) return raw.evidencias;
  return raw;
}

function unwrapPropositos(raw: any): any | undefined {
  if (!raw) return undefined;
  if (raw.areasPropositos) return raw;
  if (raw.propositos?.areasPropositos) return raw.propositos;
  return raw;
}

function unwrapAreasComplementarias(
  raw: any,
): IAreaComplementaria[] | undefined {
  if (Array.isArray(raw)) return raw;
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray(raw.areasComplementarias)
  )
    return raw.areasComplementarias;
  return undefined;
}

function unwrapEnfoques(raw: any): IEnfoqueUnidad[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.enfoques))
    return raw.enfoques;
  return [];
}

function unwrapSecuencia(raw: any): any | undefined {
  if (!raw) return undefined;
  if (raw.semanas) return raw;
  if (raw.secuencia?.semanas) return raw.secuencia;
  return raw;
}

function unwrapMateriales(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.materiales))
    return raw.materiales;
  return [];
}

function unwrapReflexiones(raw: any): IReflexionPregunta[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.reflexiones))
    return raw.reflexiones;
  return [];
}

function unwrapImagenSituacion(
  contenido: Record<string, any>,
): string | undefined {
  if (typeof contenido.imagenSituacionUrl === "string")
    return contenido.imagenSituacionUrl;
  const rawSit = contenido.situacionSignificativa;
  if (rawSit && typeof rawSit === "object") {
    if (typeof rawSit.imagenUrl === "string") return rawSit.imagenUrl;
    if (typeof rawSit.imagenSituacionUrl === "string")
      return rawSit.imagenSituacionUrl;
  }
  if (typeof contenido.situacionBase?.imagenUrl === "string")
    return contenido.situacionBase.imagenUrl;
  return undefined;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const months = [
    "",
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${day} de ${months[month]} de ${year}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Estilos para el modo edición (tablas tipo PDF con celdas editables)
// ═══════════════════════════════════════════════════════════════════════════

const EDIT_DOC_STYLES = `
  .edit-doc-unidad table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
  }
  .edit-doc-unidad td,
  .edit-doc-unidad th {
    border: 1px solid #555;
    padding: 0.25rem 0.35rem;
    font-size: 8.5pt;
    vertical-align: top;
  }
  .edit-doc-unidad th {
    font-weight: bold;
    font-size: 8pt;
    text-align: center;
    background-color: #FEF3C7;
  }
  .edit-doc-unidad .ec textarea,
  .edit-doc-unidad .ec input[type="text"] {
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
  .edit-doc-unidad .ec textarea {
    field-sizing: content;
    min-height: 56px;
    overflow-y: hidden;
  }
  .edit-doc-unidad .ec input[type="text"] {
    min-height: 32px;
  }
  .edit-doc-unidad .ec textarea:hover,
  .edit-doc-unidad .ec input[type="text"]:hover {
    border-color: #fbbf24;
    background-color: rgba(254, 243, 199, 0.3);
  }
  .edit-doc-unidad .ec textarea:focus,
  .edit-doc-unidad .ec input[type="text"]:focus {
    border-color: #f59e0b;
    background-color: rgba(254, 243, 199, 0.5);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.08);
  }
  .edit-doc-unidad .situacion-box {
    border: 1.5px solid #000;
    border-radius: 4px;
    padding: 0.4rem 0.5rem;
    margin-bottom: 0.4rem;
  }
  .edit-doc-unidad .ec-inline {
    width: 100%;
    background: transparent;
    border: 1px dashed transparent;
    border-radius: 2px;
    padding: 2px 4px;
    font-family: inherit;
    font-size: inherit;
    outline: none;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .edit-doc-unidad .ec-inline:hover {
    border-color: #fbbf24;
    background-color: rgba(254, 243, 199, 0.3);
  }
  .edit-doc-unidad .ec-inline:focus {
    border-color: #f59e0b;
    background-color: rgba(254, 243, 199, 0.5);
  }
  .edit-doc-unidad h3.section-title {
    font-size: 10pt;
    font-weight: bold;
    margin-bottom: 0.15rem;
    margin-top: 0.3rem;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════════════════

function EditarUnidad() {
  const { id: unidadId } = useParams<{ id: string }>();
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
  const [rawUnidad, setRawUnidad] = useState<IUnidadListItem | null>(null);
  const [rawContenido, setRawContenido] = useState<Record<string, any>>(
    {},
  );

  // ── Edición inline de datos del usuario ──
  const [editingField, setEditingField] = useState<"directivo" | "subdirectora" | "seccion" | null>(null);
  const [fieldInput, setFieldInput] = useState("");
  const [savingField, setSavingField] = useState(false);

  const handleStartEditField = useCallback((field: "directivo" | "subdirectora" | "seccion") => {
    const currentValue =
      field === "directivo" ? (usuario?.nombreDirectivo || "") :
      field === "subdirectora" ? (usuario?.nombreSubdirectora || "") :
      (usuario?.seccion || "");
    setFieldInput(currentValue);
    setEditingField(field);
  }, [usuario]);

  const handleSaveField = useCallback(async () => {
    if (!editingField) return;
    const valor = fieldInput.trim();
    if (!valor) {
      toast.error(editingField === "directivo" ? "Ingresa el nombre del directivo" : editingField === "subdirectora" ? "Ingresa el nombre del subdirector(a)" : "Ingresa la sección");
      return;
    }
    const userId = usuario?.id || user?.id;
    if (!userId) return;

    try {
      setSavingField(true);
      const patchData =
        editingField === "directivo" ? { nombreDirectivo: valor } :
        editingField === "subdirectora" ? { nombreSubdirectora: valor } :
        { seccion: valor };
      await updateUsuario(userId, patchData);
      updateUsuarioStore(patchData);
      setEditingField(null);
      toast.success("Dato guardado correctamente");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSavingField(false);
    }
  }, [editingField, fieldInput, usuario?.id, user?.id, updateUsuarioStore]);

  // ── Vista ──
  const [view, setView] = useState<"edit" | "preview">("edit");

  // ── Guardado ──
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  // ═════════════════════════════════════════════════════════════════════════
  // Estado editable
  // ═════════════════════════════════════════════════════════════════════════

  const [titulo, setTitulo] = useState("");
  const [situacionSignificativa, setSituacionSignificativa] = useState("");

  // Evidencias
  const [evidReto, setEvidReto] = useState("");
  const [evidProposito, setEvidProposito] = useState("");
  const [evidProductoIntegrador, setEvidProductoIntegrador] = useState("");
  const [evidInstrumento, setEvidInstrumento] = useState("");

  // Enfoques
  const [enfoquesEdit, setEnfoquesEdit] = useState<
    { enfoque: string; valor: string; actitudes: string }[]
  >([]);

  // Materiales
  const [materialesEdit, setMaterialesEdit] = useState("");

  // Reflexiones
  const [reflexionesEdit, setReflexionesEdit] = useState<
    { pregunta: string }[]
  >([]);

  // Propósitos
  const [propositosEdit, setPropositosEdit] = useState<
    {
      area: string;
      competencias: {
        nombre: string;
        capacidades: string;
        estandar: string;
        criterios: string;
        actividades: string;
        instrumento: string;
      }[];
    }[]
  >([]);

  // Secuencia
  const [secuenciaHilo, setSecuenciaHilo] = useState("");
  const [semanasEdit, setSemanasEdit] = useState<
    {
      semana: number;
      dias: {
        dia: string;
        fecha: string;
        horas: {
          hora: number;
          inicio: string;
          fin: string;
          area: string;
          actividad: string;
        }[];
      }[];
    }[]
  >([]);

  // ═════════════════════════════════════════════════════════════════════════
  // Cargar unidad
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!unidadId || !user?.id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data: any;
        try {
          data = await getUnidadDetalleSuscriptor(unidadId!, user!.id!);
        } catch {
          const resp = await getUnidadById(unidadId!);
          data = (resp as any)?.data ?? resp;
        }

        if (cancelled) return;
        setRawUnidad(data as IUnidadListItem);

        const contenido = parseContenido(data.contenido);
        setRawContenido(contenido);

        setTitulo(data.titulo || "");
        setSituacionSignificativa(
          unwrapSituacion(contenido.situacionSignificativa),
        );

        const evid = unwrapEvidencias(contenido.evidencias);
        setEvidReto(evid?.reto || "");
        setEvidProposito(evid?.proposito || "");
        setEvidProductoIntegrador(evid?.productoIntegrador || "");
        setEvidInstrumento(evid?.instrumentoEvaluacion || "");

        const enf = unwrapEnfoques(contenido.enfoques);
        setEnfoquesEdit(
          enf.map((e) => ({
            enfoque: e.enfoque || "",
            valor: e.valor || "",
            actitudes: e.actitudes || "",
          })),
        );

        const mat = unwrapMateriales(contenido.materiales);
        setMaterialesEdit(mat.join("\n"));

        const refl = unwrapReflexiones(contenido.reflexiones);
        setReflexionesEdit(
          refl.map((r) => ({ pregunta: r.pregunta || "" })),
        );

        const prop = unwrapPropositos(contenido.propositos);
        if (prop?.areasPropositos) {
          setPropositosEdit(
            prop.areasPropositos.map((ap: IAreaProposito) => ({
              area: ap.area || "",
              competencias: (ap.competencias || []).map(
                (c: ICompetenciaProposito) => ({
                  nombre: c.nombre || "",
                  capacidades: (c.capacidades || []).join("\n"),
                  estandar: c.estandar || "",
                  criterios: (c.criterios || []).join("\n"),
                  actividades: (c.actividades || []).join("\n"),
                  instrumento: c.instrumento || "",
                }),
              ),
            })),
          );
        }

        const sec = unwrapSecuencia(contenido.secuencia);
        if (sec) {
          setSecuenciaHilo(sec.hiloConductor || "");
          setSemanasEdit(
            (sec.semanas || []).map((s: ISemanaSecuencia) => ({
              semana: s.semana,
              dias: (s.dias || []).map((d: IDiaSecuencia) => ({
                dia: d.dia || "",
                fecha: d.fecha || "",
                horas: (d.horas || []).map((h: IHoraActividad) => ({
                  hora: h.hora,
                  inicio: h.inicio || "",
                  fin: h.fin || "",
                  area: h.area || "",
                  actividad: h.actividad || "",
                })),
              })),
            })),
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Error al cargar la unidad",
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
  }, [unidadId, user?.id]);

  // ═════════════════════════════════════════════════════════════════════════
  // Reconstruir contenido
  // ═════════════════════════════════════════════════════════════════════════

  const buildContenido = useCallback(() => {
    return {
      situacionSignificativa: situacionSignificativa,
      imagenSituacionUrl: unwrapImagenSituacion(rawContenido),
      situacionBase: rawContenido.situacionBase,
      evidencias: {
        reto: evidReto,
        proposito: evidProposito,
        productoIntegrador: evidProductoIntegrador,
        instrumentoEvaluacion: evidInstrumento,
      } as IEvidencias,
      propositos: {
        areasPropositos: propositosEdit.map((ap) => ({
          area: ap.area,
          competencias: ap.competencias.map((c) => ({
            nombre: c.nombre,
            capacidades: c.capacidades
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
            estandar: c.estandar,
            criterios: c.criterios
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
            actividades: c.actividades
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
            instrumento: c.instrumento,
          })),
        })),
        competenciasTransversales:
          unwrapPropositos(rawContenido.propositos)
            ?.competenciasTransversales || [],
      },
      areasComplementarias: unwrapAreasComplementarias(
        rawContenido.areasComplementarias,
      ),
      enfoques: enfoquesEdit.map((e) => ({
        enfoque: e.enfoque,
        valor: e.valor,
        actitudes: e.actitudes,
      })) as IEnfoqueUnidad[],
      secuencia: {
        hiloConductor: secuenciaHilo,
        semanas: semanasEdit.map((s) => ({
          semana: s.semana,
          dias: s.dias.map((d) => ({
            dia: d.dia,
            fecha: d.fecha,
            horas: d.horas.map((h) => ({
              hora: h.hora,
              inicio: h.inicio,
              fin: h.fin,
              area: h.area,
              actividad: h.actividad,
            })),
          })),
        })),
      },
      materiales: materialesEdit
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      reflexiones: reflexionesEdit.map((r) => ({
        pregunta: r.pregunta,
      })) as IReflexionPregunta[],
    };
  }, [
    situacionSignificativa,
    rawContenido,
    evidReto,
    evidProposito,
    evidProductoIntegrador,
    evidInstrumento,
    enfoquesEdit,
    materialesEdit,
    reflexionesEdit,
    propositosEdit,
    secuenciaHilo,
    semanasEdit,
  ]);

  // ═════════════════════════════════════════════════════════════════════════
  // Guardar: PATCH + PDF + S3
  // ═════════════════════════════════════════════════════════════════════════

  const handleGuardar = useCallback(async () => {
    if (!unidadId) return;
    setSaving(true);
    setSavedOk(false);

    try {
      const nuevoContenido = buildContenido();

      toast.info("Guardando cambios...");
      const patchRes = await editarContenidoUnidad(unidadId, {
        titulo:
          titulo !== rawUnidad?.titulo ? titulo : undefined,
        contenido: nuevoContenido,
      });
      toast.success("Contenido guardado en la base de datos");

      // ── Actualizar estado local con el contenido guardado ──
      // Así la preview y futuros guardados usan los datos confirmados.
      setRawContenido(nuevoContenido);
      if (patchRes?.data && typeof patchRes.data === "object") {
        // Si el backend devuelve el contenido mergeado, usarlo
        const mergedContenido = parseContenido(patchRes.data);
        if (mergedContenido.situacionSignificativa !== undefined) {
          setRawContenido(mergedContenido);
        }
      }

      // ── Generar PDF ──
      setView("preview");
      setPdfUploading(true);

      // Esperar a que el preview se renderice con polling
      // en lugar de un timeout fijo de 2s que puede fallar.
      let waitMs = 0;
      const MAX_WAIT = 6000;
      while (!documentRef.current && waitMs < MAX_WAIT) {
        await new Promise((r) => setTimeout(r, 200));
        waitMs += 200;
      }

      if (!documentRef.current) {
        console.warn("⚠️ documentRef.current sigue null tras", MAX_WAIT, "ms");
        toast.warning(
          "El contenido se guardó, pero no se pudo regenerar el PDF. " +
            "Puedes descargarlo manualmente desde la vista previa.",
        );
        setSavedOk(true);
        return;
      }

      if (!user?.id) {
        toast.warning("Contenido guardado, pero no se pudo identificar al usuario para el PDF.");
        setSavedOk(true);
        return;
      }

      // Esperar imágenes del preview
      const images = documentRef.current.querySelectorAll("img");
      const pending = Array.from(images).filter(
        (img) => !img.complete,
      );
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
        orientation: "landscape",
      });

      const respUpload = await solicitarUploadUrlUnidad({
        unidadId,
        usuarioId: user.id,
      });
      const uploadData =
        respUpload?.data ?? (respUpload as any);

      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      await confirmarUploadUnidad({
        unidadId,
        usuarioId: user.id,
        key: uploadData.key,
      });

      toast.success("PDF actualizado y guardado en la nube ☁️");

      setSavedOk(true);
    } catch (err: any) {
      console.error("❌ Error al guardar unidad:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al guardar",
      );
    } finally {
      setSaving(false);
      setPdfUploading(false);
    }
  }, [unidadId, buildContenido, titulo, rawUnidad?.titulo, user?.id]);

  // ═════════════════════════════════════════════════════════════════════════
  // Helpers de actualización
  // ═════════════════════════════════════════════════════════════════════════

  const updateEnfoque = (
    i: number,
    field: string,
    value: string,
  ) => {
    setEnfoquesEdit((prev) =>
      prev.map((e, idx) =>
        idx === i ? { ...e, [field]: value } : e,
      ),
    );
  };

  const updateProposito = (
    ai: number,
    ci: number,
    field: string,
    value: string,
  ) => {
    setPropositosEdit((prev) =>
      prev.map((ap, idx) =>
        idx === ai
          ? {
              ...ap,
              competencias: ap.competencias.map((c, cidx) =>
                cidx === ci ? { ...c, [field]: value } : c,
              ),
            }
          : ap,
      ),
    );
  };

  const updateSecuenciaActividad = (
    si: number,
    di: number,
    hi: number,
    value: string,
  ) => {
    setSemanasEdit((prev) =>
      prev.map((s, sidx) =>
        sidx === si
          ? {
              ...s,
              dias: s.dias.map((d, didx) =>
                didx === di
                  ? {
                      ...d,
                      horas: d.horas.map((h, hidx) =>
                        hidx === hi
                          ? { ...h, actividad: value }
                          : h,
                      ),
                    }
                  : d,
              ),
            }
          : s,
      ),
    );
  };

  const handleDownloadPDF = async () => {
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
        `unidad-editada-${timestamp}.pdf`,
        {
          size: "A4",
          orientation: "landscape",
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !rawUnidad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {error || "No se pudo cargar la unidad"}
          </h2>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    );
  }

  // ── Datos para las vistas ──
  const contenidoPreview = buildContenido();
  const areasNombres = (
    contenidoPreview.propositos?.areasPropositos ?? []
  ).map((a: any) => a.area ?? "");
  const gradoLabel = rawUnidad.grado?.nombre ?? "";
  const docenteNombre = usuario?.nombre || user?.name || "";
  const institucionLabel = usuario?.nombreInstitucion || "";
  const seccionLabel = usuario?.seccion || "";
  const fechaInicio = rawUnidad.fechaInicio?.split("T")[0] ?? "";
  const fechaFin = rawUnidad.fechaFin?.split("T")[0] ?? "";
  const periodoTexto =
    fechaInicio && fechaFin
      ? `Del ${formatDate(fechaInicio)} al ${formatDate(fechaFin)}`
      : "";
  const gradoSeccionTexto = seccionLabel
    ? `${gradoLabel} de ${rawUnidad.nivel?.nombre ?? ""} - Sección "${seccionLabel}"`
    : `${gradoLabel} de ${rawUnidad.nivel?.nombre ?? ""}`;

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Editar Unidad de Aprendizaje
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setView("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "edit"
                    ? "bg-amber-600 text-white"
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
                    ? "bg-amber-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Vista Previa
              </button>
            </div>

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
            Modo EDITAR — Diseño tipo PDF (landscape) con celdas editables
        ══════════════════════════════════════════════════════════════════ */}
        {view === "edit" && (
          <div
            className="edit-doc-unidad bg-white shadow-lg mx-auto rounded"
            style={{
              maxWidth: "297mm",
              padding: "10mm 12mm",
              fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
              color: "#1a1a1a",
            }}
          >
            <style>{EDIT_DOC_STYLES}</style>

            <p className="text-center text-xs text-amber-600 mb-3 no-print">
              💡 Haz clic en cualquier celda para editarla — los cambios
              se reflejarán en el PDF final
            </p>

            {/* ── HEADER ── */}
            <div
              style={{
                position: "relative",
                textAlign: "center",
                marginBottom: "0.3rem",
                paddingBottom: "0.3rem",
                borderBottom: "2px solid #000",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "#FDE68A",
                  padding: "2px 10px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "8pt",
                }}
              >
                {seccionLabel
                  ? `${gradoLabel} "${seccionLabel}"`
                  : gradoLabel}
              </div>
              <h1
                style={{
                  fontSize: "13pt",
                  fontWeight: "bold",
                  marginBottom: "0.15rem",
                }}
              >
                UNIDAD N°{" "}
                {String(rawUnidad.numeroUnidad).padStart(2, "0")}
              </h1>
              <div
                className="ec"
                style={{ display: "inline-block", width: "70%" }}
              >
                <textarea
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  rows={1}
                  style={{
                    fontSize: "12pt",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    textAlign: "center",
                    width: "100%",
                    overflow: "hidden",
                    minHeight: "36px",
                  } as React.CSSProperties & Record<string, string>}
                  ref={(el) => { if (el) el.style.setProperty("field-sizing", "content"); }}
                  placeholder="Título de la unidad"
                />
              </div>
            </div>

            {/* ── I. DATOS GENERALES ── */}
            <h3 className="section-title">
              I. &nbsp;&nbsp;DATOS GENERALES
            </h3>
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "22%",
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    I. E.
                  </td>
                  <td colSpan={3}>{institucionLabel}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    Directivo(a) de la I. E.
                  </td>
                  <td colSpan={3}>
                    {editingField === "directivo" ? (
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="text" value={fieldInput} onChange={(e) => setFieldInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveField()} autoFocus style={{ border: "1px solid #d97706", borderRadius: 4, padding: "2px 6px", fontSize: "9pt", flex: 1 }} />
                        <button onClick={handleSaveField} disabled={savingField} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px", fontSize: "8pt", cursor: "pointer" }}>{savingField ? "..." : "Guardar"}</button>
                        <button onClick={() => setEditingField(null)} style={{ background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "2px 8px", fontSize: "8pt", cursor: "pointer" }}>✕</button>
                      </span>
                    ) : usuario?.nombreDirectivo ? (
                      usuario.nombreDirectivo
                    ) : (
                      <button className="no-print" onClick={() => handleStartEditField("directivo")} style={{ background: "none", border: "1px dashed #d97706", borderRadius: 4, padding: "2px 8px", color: "#d97706", cursor: "pointer", fontSize: "8pt" }}>Coloca el nombre de tu Directivo(a)</button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    Subdirector(a) de la I. E.
                  </td>
                  <td colSpan={3}>
                    {editingField === "subdirectora" ? (
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="text" value={fieldInput} onChange={(e) => setFieldInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveField()} autoFocus style={{ border: "1px solid #d97706", borderRadius: 4, padding: "2px 6px", fontSize: "9pt", flex: 1 }} />
                        <button onClick={handleSaveField} disabled={savingField} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px", fontSize: "8pt", cursor: "pointer" }}>{savingField ? "..." : "Guardar"}</button>
                        <button onClick={() => setEditingField(null)} style={{ background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "2px 8px", fontSize: "8pt", cursor: "pointer" }}>✕</button>
                      </span>
                    ) : usuario?.nombreSubdirectora ? (
                      usuario.nombreSubdirectora
                    ) : (
                      <button className="no-print" onClick={() => handleStartEditField("subdirectora")} style={{ background: "none", border: "1px dashed #d97706", borderRadius: 4, padding: "2px 8px", color: "#d97706", cursor: "pointer", fontSize: "8pt" }}>Coloca el nombre del Subdirector(a)</button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    Docente
                  </td>
                  <td colSpan={3}>{docenteNombre}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    Periodo de ejecución:
                  </td>
                  <td colSpan={3}>{periodoTexto}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    Grado y Sección:
                  </td>
                  <td colSpan={3}>
                    {editingField === "seccion" ? (
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span>{gradoLabel} de {rawUnidad.nivel?.nombre ?? ""} - Sección "</span>
                        <input type="text" value={fieldInput} onChange={(e) => setFieldInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveField()} autoFocus style={{ border: "1px solid #d97706", borderRadius: 4, padding: "2px 6px", fontSize: "9pt", width: 60 }} />
                        <span>"</span>
                        <button onClick={handleSaveField} disabled={savingField} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px", fontSize: "8pt", cursor: "pointer" }}>{savingField ? "..." : "Guardar"}</button>
                        <button onClick={() => setEditingField(null)} style={{ background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "2px 8px", fontSize: "8pt", cursor: "pointer" }}>✕</button>
                      </span>
                    ) : seccionLabel ? (
                      gradoSeccionTexto
                    ) : (
                      <span>
                        {gradoLabel} de {rawUnidad.nivel?.nombre ?? ""}{" "}
                        <button className="no-print" onClick={() => handleStartEditField("seccion")} style={{ background: "none", border: "1px dashed #d97706", borderRadius: 4, padding: "2px 8px", color: "#d97706", cursor: "pointer", fontSize: "8pt" }}>Agregar Sección</button>
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                    }}
                  >
                    ÁREAS
                  </td>
                  <td colSpan={3}>{areasNombres.join(", ")}</td>
                </tr>
              </tbody>
            </table>

            {/* ── PLANTEAMIENTO DE LA SITUACIÓN ── */}
            <h3 className="section-title">
              PLANTEAMIENTO DE LA SITUACIÓN.
            </h3>
            <div className="situacion-box">
              <div className="ec">
                <textarea
                  value={situacionSignificativa}
                  onChange={(e) =>
                    setSituacionSignificativa(e.target.value)
                  }
                  rows={Math.max(
                    5,
                    situacionSignificativa.split("\n").length + 1,
                  )}
                  style={{
                    width: "100%",
                    fontSize: "9pt",
                    textAlign: "justify",
                  }}
                  placeholder="Describe la situación significativa..."
                />
              </div>
              {evidReto && (
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "9pt",
                    marginTop: "0.3rem",
                  }}
                >
                  Ante esta situación nos planteamos el siguiente
                  reto:
                </p>
              )}
              <div className="ec">
                <textarea
                  value={evidReto}
                  onChange={(e) => setEvidReto(e.target.value)}
                  rows={Math.max(
                    1,
                    (evidReto || "").split("\n").length,
                  )}
                  style={{ width: "100%", fontSize: "9pt" }}
                  placeholder="Reto (opcional)"
                />
              </div>
            </div>

            {/* ── EVIDENCIA DE APRENDIZAJE ── */}
            <h3 className="section-title" style={{ marginTop: "0.3rem" }}>
              EVIDENCIA DE APRENDIZAJE
            </h3>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "100%", textAlign: "center" }}>
                    PROPÓSITO
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ec">
                    <textarea
                      value={evidProposito}
                      onChange={(e) =>
                        setEvidProposito(e.target.value)
                      }
                      rows={Math.max(
                        2,
                        (evidProposito || "").split("\n").length,
                      )}
                      style={{ width: "100%" }}
                      placeholder="Propósito"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ marginTop: "0.3rem" }}>
              <thead>
                <tr>
                  <th
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    PRODUCTO INTEGRADOR
                  </th>
                  <th
                    style={{ width: "50%", textAlign: "center" }}
                  >
                    INSTRUMENTO DE EVALUACIÓN
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ec">
                    <textarea
                      value={evidProductoIntegrador}
                      onChange={(e) =>
                        setEvidProductoIntegrador(e.target.value)
                      }
                      rows={2}
                      style={{ width: "100%" }}
                      placeholder="Producto integrador"
                    />
                  </td>
                  <td className="ec">
                    <textarea
                      value={evidInstrumento}
                      onChange={(e) =>
                        setEvidInstrumento(e.target.value)
                      }
                      rows={1}
                      placeholder="Instrumento de evaluación"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── II. PROPÓSITO DE APRENDIZAJE ── */}
            {propositosEdit.length > 0 && (
              <>
                <h3 className="section-title" style={{ marginTop: "0.5rem" }}>
                  II. &nbsp;&nbsp;PROPÓSITO DE APRENDIZAJE.
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "6%" }}>ÁREA</th>
                      <th style={{ width: "24%" }}>
                        COMPETENCIAS Y CAPACIDADES
                      </th>
                      <th style={{ width: "26%" }}>
                        CRITERIOS DE EVALUACIÓN
                      </th>
                      <th style={{ width: "22%" }}>ACTIVIDADES</th>
                      <th style={{ width: "22%" }}>INSTRUMENTOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propositosEdit.map((ap, aIdx) => {
                      const totalComp = ap.competencias.length;
                      const areaHex = getAreaColor(ap.area).hex;
                      return ap.competencias.map((comp, cIdx) => {
                        const isFirst = cIdx === 0;
                        return (
                          <tr key={`${aIdx}-${cIdx}`}>
                            {/* AREA — only first row */}
                            <td
                              style={{
                                textAlign: "center",
                                verticalAlign: "middle",
                                fontWeight: "bold",
                                fontSize: "7pt",
                                backgroundColor: areaHex.light,
                                borderTop:
                                  isFirst
                                    ? "1px solid #555"
                                    : "none",
                                borderBottom:
                                  cIdx === totalComp - 1
                                    ? "1px solid #555"
                                    : "none",
                              }}
                            >
                              {isFirst
                                ? ap.area.toUpperCase()
                                : ""}
                            </td>

                            {/* Competencia + Capacidades */}
                            <td className="ec">
                              <textarea
                                value={comp.nombre}
                                onChange={(e) =>
                                  updateProposito(
                                    aIdx,
                                    cIdx,
                                    "nombre",
                                    e.target.value,
                                  )
                                }
                                rows={1}
                                style={{
                                  fontWeight: "bold",
                                  marginBottom: "3px",
                                }}
                                placeholder="Competencia"
                              />
                              <textarea
                                value={comp.capacidades}
                                onChange={(e) =>
                                  updateProposito(
                                    aIdx,
                                    cIdx,
                                    "capacidades",
                                    e.target.value,
                                  )
                                }
                                rows={Math.max(
                                  2,
                                  comp.capacidades.split("\n")
                                    .length,
                                )}
                                placeholder="Capacidades (una por línea)"
                              />
                            </td>

                            {/* Criterios */}
                            <td className="ec">
                              <textarea
                                value={comp.criterios}
                                onChange={(e) =>
                                  updateProposito(
                                    aIdx,
                                    cIdx,
                                    "criterios",
                                    e.target.value,
                                  )
                                }
                                rows={Math.max(
                                  2,
                                  comp.criterios.split("\n")
                                    .length,
                                )}
                                placeholder="Criterios (uno por línea)"
                              />
                            </td>

                            {/* Actividades */}
                            <td className="ec">
                              <textarea
                                value={comp.actividades}
                                onChange={(e) =>
                                  updateProposito(
                                    aIdx,
                                    cIdx,
                                    "actividades",
                                    e.target.value,
                                  )
                                }
                                rows={Math.max(
                                  2,
                                  comp.actividades.split("\n")
                                    .length,
                                )}
                                placeholder="Actividades (una por línea)"
                              />
                            </td>

                            {/* Instrumento */}
                            <td className="ec">
                              <textarea
                                value={comp.instrumento}
                                onChange={(e) =>
                                  updateProposito(
                                    aIdx,
                                    cIdx,
                                    "instrumento",
                                    e.target.value,
                                  )
                                }
                                rows={1}
                                style={{ textAlign: "center" }}
                                placeholder="Instrumento"
                              />
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </>
            )}

            {/* ── III. ENFOQUES TRANSVERSALES ── */}
            {enfoquesEdit.length > 0 && (
              <>
                <h3 className="section-title" style={{ marginTop: "0.5rem" }}>
                  III. &nbsp;&nbsp;ENFOQUES TRANSVERSALES VALORES Y
                  ACTITUDES
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>
                        ENFOQUES TRANSVERSALES
                      </th>
                      <th style={{ width: "20%" }}>VALOR</th>
                      <th style={{ width: "55%" }}>
                        ACTITUDES O ACCIONES OBSERVABLES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {enfoquesEdit.map((e, i) => (
                      <tr key={i}>
                        <td className="ec">
                          <textarea
                            value={e.enfoque}
                            onChange={(ev) =>
                              updateEnfoque(
                                i,
                                "enfoque",
                                ev.target.value,
                              )
                            }
                            rows={1}
                            style={{
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                            placeholder="Enfoque"
                          />
                        </td>
                        <td className="ec">
                          <textarea
                            value={e.valor}
                            onChange={(ev) =>
                              updateEnfoque(
                                i,
                                "valor",
                                ev.target.value,
                              )
                            }
                            rows={1}
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                            placeholder="Valor"
                          />
                        </td>
                        <td className="ec">
                          <textarea
                            value={e.actitudes}
                            onChange={(ev) =>
                              updateEnfoque(
                                i,
                                "actitudes",
                                ev.target.value,
                              )
                            }
                            rows={2}
                            placeholder="Actitudes observables"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* ── IV. SECUENCIA DE ACTIVIDADES ── */}
            {semanasEdit.length > 0 && (
              <>
                <h3 className="section-title" style={{ marginTop: "0.5rem" }}>
                  IV. &nbsp;&nbsp;SECUENCIA DE ACTIVIDADES
                </h3>
                {secuenciaHilo && (
                  <div className="ec" style={{ marginBottom: "0.3rem" }}>
                    <p style={{ fontSize: "9pt" }}>
                      <strong>Hilo conductor:</strong>
                    </p>
                    <textarea
                      value={secuenciaHilo}
                      onChange={(e) =>
                        setSecuenciaHilo(e.target.value)
                      }
                      rows={2}
                      style={{
                        width: "100%",
                        fontSize: "9pt",
                        fontStyle: "italic",
                      }}
                      placeholder="Hilo conductor"
                    />
                  </div>
                )}
                {semanasEdit.map((sem, si) => {
                  const maxHoras = Math.max(
                    ...sem.dias.map(
                      (d) => d.horas?.length ?? 0,
                    ),
                    0,
                  );
                  return (
                    <div
                      key={si}
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <div
                        style={{
                          backgroundColor: "#FDE68A",
                          padding: "0.2rem 0.4rem",
                          fontWeight: "bold",
                          fontSize: "9pt",
                          textAlign: "center",
                          border: "1px solid #555",
                          borderBottom: "none",
                        }}
                      >
                        Semana {sem.semana}
                      </div>
                      <table>
                        <tbody>
                          {/* Fila de días */}
                          <tr>
                            <td
                              style={{
                                fontWeight: "bold",
                                width: "10%",
                                backgroundColor: "#FDE68A",
                                textAlign: "center",
                              }}
                            >
                              HORA
                            </td>
                            {sem.dias.map((dia, di) => (
                              <td
                                key={di}
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#FEF3C7",
                                  textAlign: "center",
                                  fontSize: "8pt",
                                  width: `${90 / Math.max(sem.dias.length, 1)}%`,
                                }}
                              >
                                {dia.dia?.toUpperCase() || ""}
                                {dia.fecha
                                  ? ` ${dia.fecha.split("-")[2] || ""}`
                                  : ""}
                              </td>
                            ))}
                          </tr>
                          {/* Filas por hora */}
                          {Array.from({
                            length: maxHoras,
                          }).map((_, hIdx) => (
                            <tr key={hIdx}>
                              <td
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#FDE68A",
                                  textAlign: "center",
                                  fontSize: "8pt",
                                }}
                              >
                                H{hIdx + 1}
                              </td>
                              {sem.dias.map((dia, di) => {
                                const hora =
                                  dia.horas?.[hIdx];
                                if (!hora) {
                                  return (
                                    <td
                                      key={di}
                                      style={{
                                        textAlign:
                                          "center",
                                      }}
                                    />
                                  );
                                }
                                const aHex = hora.area
                                  ? getAreaColor(
                                      hora.area,
                                    ).hex
                                  : null;
                                return (
                                  <td
                                    key={di}
                                    className="ec"
                                    style={{
                                      textAlign:
                                        "center",
                                      backgroundColor:
                                        aHex?.light ||
                                        "transparent",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight:
                                          "bold",
                                        fontSize:
                                          "7pt",
                                      }}
                                    >
                                      {hora.area?.toUpperCase() ||
                                        ""}
                                    </div>
                                    <textarea
                                      value={
                                        hora.actividad
                                      }
                                      onChange={(
                                        e,
                                      ) =>
                                        updateSecuenciaActividad(
                                          si,
                                          di,
                                          hIdx,
                                          e.target
                                            .value,
                                        )
                                      }
                                      style={{
                                        fontSize:
                                          "7pt",
                                        textAlign:
                                          "center",
                                      }}
                                      placeholder="Actividad"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </>
            )}

            {/* ── V. MATERIALES Y RECURSOS ── */}
            <h3 className="section-title" style={{ marginTop: "0.5rem" }}>
              V. &nbsp;&nbsp;MATERIALES Y RECURSOS A UTILIZAR:
            </h3>
            <div
              style={{
                border: "1.5px solid #000",
                borderRadius: "4px",
                padding: "0.35rem 0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: "1.4em", listStyleType: "disc" }}>
                {(materialesEdit || "\n").split("\n").map((line, idx, arr) => (
                  <li key={idx} style={{ marginBottom: "2px" }}>
                    <input
                      type="text"
                      className="ec-inline"
                      value={line}
                      onChange={(e) => {
                        const lines = materialesEdit.split("\n");
                        lines[idx] = e.target.value;
                        setMaterialesEdit(lines.join("\n"));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const lines = materialesEdit.split("\n");
                          lines.splice(idx + 1, 0, "");
                          setMaterialesEdit(lines.join("\n"));
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
                          const lines = materialesEdit.split("\n");
                          lines.splice(idx, 1);
                          setMaterialesEdit(lines.join("\n"));
                        }
                      }}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "1px dashed transparent",
                        borderRadius: "2px",
                        padding: "2px 4px",
                        fontFamily: "inherit",
                        fontSize: "8.5pt",
                        outline: "none",
                      }}
                      placeholder="Escribir..."
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* ── VI. REFLEXIONES ── */}
            <h3 className="section-title">
              VI. &nbsp;&nbsp;REFLEXIONES SOBRE EL APRENDIZAJE:
            </h3>
            {reflexionesEdit.map((r, i) => (
              <div
                key={i}
                style={{ marginBottom: "0.4rem" }}
                className="ec"
              >
                <textarea
                  value={r.pregunta}
                  onChange={(e) =>
                    setReflexionesEdit((prev) =>
                      prev.map((rr, ri) =>
                        ri === i
                          ? { ...rr, pregunta: e.target.value }
                          : rr,
                      ),
                    )
                  }
                  rows={1}
                  style={{
                    width: "100%",
                    fontSize: "9pt",
                    fontWeight: "bold",
                  }}
                  placeholder="Pregunta de reflexión"
                />
                <div
                  style={{
                    borderBottom: "1px solid #999",
                    marginTop: "0.3rem",
                    marginBottom: "0.2rem",
                  }}
                />
                <div
                  style={{
                    borderBottom: "1px solid #999",
                    marginBottom: "0.2rem",
                  }}
                />
              </div>
            ))}

            {/* ── Botón guardar ── */}
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
            Modo VISTA PREVIA — Renderiza el documento de unidad
        ══════════════════════════════════════════════════════════════════ */}
        {view === "preview" && (
          <div ref={documentRef}>
            <Document size="A4" orientation="landscape" margin="0.5in">
              <UnidadDocStyles />
              <UnidadDocHeader
                titulo={titulo}
                numeroUnidad={rawUnidad.numeroUnidad}
                grado={gradoLabel}
                seccion={seccionLabel}
              />
              <UnidadDocDatosGenerales
                institucion={institucionLabel}
                directivo={usuario?.nombreDirectivo || ""}
                subdirectora={usuario?.nombreSubdirectora || ""}
                docente={docenteNombre}
                grado={gradoLabel}
                seccion={seccionLabel}
                nivel={rawUnidad.nivel?.nombre ?? ""}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                areas={areasNombres}
              />
              <UnidadDocSituacion
                situacionSignificativa={
                  contenidoPreview.situacionSignificativa
                }
                evidencias={contenidoPreview.evidencias}
                grado={gradoLabel}
                imagenSituacionUrl={
                  contenidoPreview.imagenSituacionUrl
                }
              />
              <UnidadDocPropositos
                propositos={contenidoPreview.propositos}
                areasComplementarias={
                  contenidoPreview.areasComplementarias
                }
              />
              <UnidadDocEnfoques
                enfoques={contenidoPreview.enfoques}
              />
              <UnidadDocSecuencia
                secuencia={contenidoPreview.secuencia}
              />
              <UnidadDocMaterialesReflexiones
                materiales={contenidoPreview.materiales}
                reflexiones={contenidoPreview.reflexiones}
              />
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
                      Unidad de Aprendizaje N°{" "}
                      {rawUnidad.numeroUnidad} — {titulo}
                    </span>
                  </div>
                )}
              </Footer>
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditarUnidad;
