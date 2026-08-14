import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  dpModalFadeVariants,
  dpModalOverlayVariants,
  dpModalPanelDefaultVariants,
  dpModalPanelMaterialVariants,
  dpSpringUi,
} from "@/components/motion/dpSprings";

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
  /** Apple materialize: blur + scale con spring. Ideal para PDF / fullscreen. */
  presentation?: "default" | "material";
  /** Barra decorativa superior (estilo legacy). Off en modales Operate. */
  showGradientBar?: boolean;
  /** Sin barra de título; cierre flotante sobre el contenido. */
  headerless?: boolean;
}

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
  presentation = "default",
  showGradientBar = true,
  headerless = false,
}: ReusableModalProps) {
  const reduced = usePrefersReducedMotion();
  const isMaterial = presentation === "material";

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

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

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

  const overlayVariants = reduced ? dpModalFadeVariants : dpModalOverlayVariants;
  const panelVariants = reduced
    ? dpModalFadeVariants
    : isMaterial
      ? dpModalPanelMaterialVariants
      : dpModalPanelDefaultVariants;
  const panelTransition = reduced
    ? { duration: 0.2 }
    : dpSpringUi;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            isMaterial
              ? "bg-black/50 backdrop-blur-md"
              : "bg-black/60 backdrop-blur-sm"
          }`}
          onClick={handleOverlayClick}
          aria-labelledby={title ? "modal-title" : undefined}
          role="dialog"
          aria-modal="true"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          transition={panelTransition}
        >
          <motion.div
            className={`
              relative w-full ${sizeClasses[size]} m-4
              ${isMaterial ? "border border-[#E6EBF2] bg-white" : "bg-white dark:bg-slate-800"}
              rounded-[24px] shadow-[0_24px_64px_rgba(31,41,55,0.18)]
              max-h-[90vh] flex flex-col
            `}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={panelTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {showGradientBar && (
                <div
                  className={`h-2 rounded-t-[24px] bg-gradient-to-r ${gradientClasses[gradient]}`}
                />
              )}

              {!headerless && (
                <div
                  className={`flex items-center justify-between px-6 py-4 border-b ${
                    isMaterial
                      ? "border-[#E6EBF2]/80"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {title && (
                    <h2
                      id="modal-title"
                      className={
                        isMaterial
                          ? "text-xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-2xl"
                          : "text-2xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-dp-blue-600 to-dp-orange-600 bg-clip-text text-transparent"
                      }
                    >
                      {title}
                    </h2>
                  )}

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={
                        isMaterial
                          ? "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] ml-auto grid h-11 w-11 place-items-center rounded-[14px] text-[#6B7280] transition-colors hover:bg-[#EAF2FC] hover:text-[#1F2937]"
                          : "ml-auto p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dp-blue-500 focus:ring-offset-2"
                      }
                      aria-label="Cerrar modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {headerless && showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-[14px] text-[#6B7280] transition-colors hover:bg-[#EAF2FC] hover:text-[#1F2937]"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div
              className={`flex-1 overflow-y-auto ${headerless ? "px-6 pb-6 pt-14" : "px-6 py-6"}`}
            >
              <div
                className={
                  isMaterial
                    ? "text-[#1F2937]"
                    : "text-slate-700 dark:text-slate-300"
                }
              >
                {children}
              </div>
            </div>

            {footer && (
              <div
                className={`px-6 py-4 border-t rounded-b-[24px] ${
                  isMaterial
                    ? "border-[#E6EBF2]/80 bg-[#F5F7FA]/80"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-end gap-3">
                  {footer}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReusableModal;
