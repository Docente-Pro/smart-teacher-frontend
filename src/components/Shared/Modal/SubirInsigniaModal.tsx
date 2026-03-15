import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  AlertCircle,
  ImageIcon,
  CheckCircle2,
  Trash2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import ReusableModal from "./ReusableModal";
import {
  solicitarInsigniaUploadUrl,
  subirInsigniaAS3,
  confirmarInsignia,
} from "@/services/insignia.service";

interface SubirInsigniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInsigniaUrl?: string | null;
  onUploaded?: (url: string) => void;
  onRemoved?: () => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

function SubirInsigniaModal({
  isOpen,
  onClose,
  currentInsigniaUrl,
  onUploaded,
  onRemoved,
}: SubirInsigniaModalProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setErrorMessage(null);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("La imagen no debe superar los 5 MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const contentType = selectedFile.type || "image/jpeg";
      const { data } = await solicitarInsigniaUploadUrl(contentType);
      await subirInsigniaAS3(data.uploadUrl, selectedFile, data.contentType);
      const confirmRes = await confirmarInsignia(data.key);

      setUploadedUrl(confirmRes.data.insigniaUrl);
      setStatus("success");
      toast.success("Insignia subida correctamente");
      onUploaded?.(confirmRes.data.insigniaUrl);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al subir la insignia.";
      setErrorMessage(msg);
      setStatus("error");
      toast.error("Error al subir la insignia");
    }
  }

  function handleRemove() {
    onRemoved?.();
    toast.success("Insignia eliminada");
    handleClose();
  }

  function handleClose() {
    setStatus("idle");
    setSelectedFile(null);
    setPreview(null);
    setErrorMessage(null);
    setUploadedUrl(null);
    onClose();
  }

  const displayUrl = uploadedUrl || currentInsigniaUrl;

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      gradient="purple-pink"
      showCloseButton
      closeOnOverlayClick
    >
      <div className="flex flex-col items-center text-center px-2 py-4">
        {/* Icono */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Insignia del colegio
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
          Sube la foto de la insignia de tu institución educativa. Se mostrará
          en tus documentos generados.
        </p>

        {/* Preview actual / subida */}
        {status === "success" && uploadedUrl ? (
          <div className="flex flex-col items-center gap-4 mb-5">
            <div className="w-28 h-28 rounded-xl border-2 border-emerald-300 overflow-hidden shadow-lg">
              <img
                src={uploadedUrl}
                alt="Insignia subida"
                className="w-full h-full object-contain bg-white"
              />
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Insignia guardada correctamente</span>
            </div>
            <Button onClick={handleClose} className="w-full max-w-xs">
              Listo
            </Button>
          </div>
        ) : (
          <>
            {/* Insignia actual */}
            {displayUrl && !selectedFile && (
              <div className="flex flex-col items-center gap-3 mb-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Insignia actual
                </p>
                <div className="w-24 h-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 overflow-hidden shadow">
                  <img
                    src={displayUrl}
                    alt="Insignia actual"
                    className="w-full h-full object-contain bg-white"
                  />
                </div>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar insignia
                </button>
              </div>
            )}

            {/* Zona de carga */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 mb-4 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    {selectedFile?.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Haz clic para seleccionar una imagen
                  </span>
                  <span className="text-xs text-slate-400">
                    JPG, PNG o WEBP — máx. 5 MB
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || status === "uploading"}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {displayUrl ? "Cambiar insignia" : "Subir insignia"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                disabled={status === "uploading"}
                className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </ReusableModal>
  );
}

export default SubirInsigniaModal;
