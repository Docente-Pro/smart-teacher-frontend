import { useState, useCallback } from "react";
import type { IAlumno } from "@/interfaces/IAula";
import { extraerAlumnosDesdeImagen } from "@/services/aula.service";

// ============================================
// HOOK — Extraer alumnos desde imagen (OCR)
// ============================================

export type ExtraerStatus = "idle" | "uploading" | "success" | "error";

interface UseExtraerAlumnosReturn {
  /** Estado actual del proceso */
  status: ExtraerStatus;
  /** Lista de alumnos extraídos (editable) */
  alumnos: IAlumno[];
  /** Mensaje de error (si lo hay) */
  errorMessage: string | null;
  /** Archivo seleccionado actualmente */
  selectedFile: File | null;
  /** Selecciona un archivo sin subirlo todavía */
  selectFile: (file: File | null) => void;
  /** Sube el archivo seleccionado y extrae alumnos */
  extraer: () => Promise<void>;
  /** Actualiza un alumno en la lista (para edición inline) */
  updateAlumno: (index: number, alumno: IAlumno) => void;
  /** Elimina un alumno de la lista */
  removeAlumno: (index: number) => void;
  /** Agrega un alumno vacío al final */
  addAlumno: () => void;
  /** Setter directo de la lista completa */
  setAlumnos: React.Dispatch<React.SetStateAction<IAlumno[]>>;
  /** Resetea todo al estado inicial */
  reset: () => void;
}

export function useExtraerAlumnos(): UseExtraerAlumnosReturn {
  const [status, setStatus] = useState<ExtraerStatus>("idle");
  const [alumnos, setAlumnos] = useState<IAlumno[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    setErrorMessage(null);
  }, []);

  const extraer = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage("Selecciona una imagen primero.");
      return;
    }

    // Validar tamaño (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("El archivo no debe superar los 10 MB.");
      return;
    }

    // Validar formato
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Formato no soportado. Usa JPG, PNG, WEBP o PDF.");
      return;
    }

    try {
      setStatus("uploading");
      setErrorMessage(null);

      const response = await extraerAlumnosDesdeImagen(selectedFile);
      setAlumnos(response.alumnos);
      setStatus("success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al extraer alumnos desde la imagen.";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, [selectedFile]);

  const updateAlumno = useCallback((index: number, alumno: IAlumno) => {
    setAlumnos((prev) => prev.map((a, i) => (i === index ? alumno : a)));
  }, []);

  const removeAlumno = useCallback((index: number) => {
    setAlumnos((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, orden: i + 1 })),
    );
  }, []);

  const addAlumno = useCallback(() => {
    setAlumnos((prev) => [
      ...prev,
      {
        orden: prev.length + 1,
        apellidos: "",
        nombres: "",
        sexo: "M" as const,
        dni: "",
      },
    ]);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setAlumnos([]);
    setErrorMessage(null);
    setSelectedFile(null);
  }, []);

  return {
    status,
    alumnos,
    errorMessage,
    selectedFile,
    selectFile,
    extraer,
    updateAlumno,
    removeAlumno,
    addAlumno,
    setAlumnos,
    reset,
  };
}
