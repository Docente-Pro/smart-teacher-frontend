import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
  gradient?: "blue-orange" | "purple-pink" | "cyan-blue" | "emerald-teal" | "amber-orange";
}

/**
 * Modal reutilizable con diseño vibrante y profesional estilo BBVA
 * 
 * @param isOpen - Controla la visibilidad del modal
 * @param onClose - Función que se ejecuta al cerrar el modal
 * @param title - Título del modal (opcional)
 * @param children - Contenido principal del modal
 * @param size - Tamaño del modal: sm (400px), md (500px), lg (600px), xl (800px), full (90%)
 * @param showCloseButton - Muestra el botón X de cerrar (default: true)
 * @param closeOnOverlayClick - Cierra el modal al hacer click fuera (default: true)
 * @param footer - Contenido personalizado del footer (botones de acción)
 * @param gradient - Gradiente del borde superior (default: blue-orange)
 * 
 * @example
 * ```tsx
 * <ReusableModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Confirmar acción"
 *   size="md"
 *   gradient="blue-orange"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsModalOpen(false)}>
 *         Cancelar
 *       </Button>
 *       <Button onClick={handleConfirm}>Confirmar</Button>
 *     </>
 *   }
 * >
 *   <p>¿Estás seguro de que deseas continuar?</p>
 * </ReusableModal>
 * ```
 */
function ReusableModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  gradient = "blue-orange",
}: ReusableModalProps) {
  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tamaños del modal
  const sizeClasses = {
    sm: "max-w-sm", // 400px
    md: "max-w-md", // 500px
    lg: "max-w-lg", // 600px
    xl: "max-w-4xl", // 800px
    full: "max-w-[90vw]", // 90% del viewport
  };

  // Gradientes disponibles (matching con el sistema de diseño)
  const gradientClasses = {
    "blue-orange": "from-dp-blue-500 via-dp-blue-600 to-dp-orange-500",
    "purple-pink": "from-purple-500 via-purple-600 to-pink-500",
    "cyan-blue": "from-cyan-500 via-blue-500 to-blue-600",
    "emerald-teal": "from-emerald-500 via-teal-500 to-teal-600",
    "amber-orange": "from-amber-500 via-orange-500 to-orange-600",
  };

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          relative w-full ${sizeClasses[size]} m-4
          bg-white dark:bg-slate-800 
          rounded-2xl shadow-2xl 
          animate-in zoom-in-95 duration-200
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header con gradiente */}
        <div className="relative">
          {/* Barra de gradiente superior */}
          <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${gradientClasses[gradient]}`} />

          {/* Contenido del header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            {title && (
              <h2
                id="modal-title"
                className="text-2xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-dp-blue-600 to-dp-orange-600 bg-clip-text text-transparent"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  ml-auto p-2 rounded-lg
                  text-slate-500 hover:text-slate-700 
                  dark:text-slate-400 dark:hover:text-slate-200
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-dp-blue-500 focus:ring-offset-2
                "
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body - Contenido principal con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </div>

        {/* Footer - Botones de acción */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
            <div className="flex items-center justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReusableModal;
