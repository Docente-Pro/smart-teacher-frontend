import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { SubirListaAlumnosView } from "@/components/Shared/SubirListaAlumnosView";

interface SubirAlumnosModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradoId?: number;
  gradosDisponibles?: Array<{ id: number; nombre: string }>;
}

/**
 * Modal standalone para subir la lista de alumnos desde el dashboard.
 * Envuelve SubirListaAlumnosView en un ReusableModal.
 */
function SubirAlumnosModal({ isOpen, onClose, gradoId, gradosDisponibles }: SubirAlumnosModalProps) {
  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      gradient="blue-orange"
      showCloseButton
      closeOnOverlayClick
    >
      <SubirListaAlumnosView
        onContinue={onClose}
        continueLabel="Listo"
        gradoId={gradoId}
        gradosDisponibles={gradosDisponibles}
      />
    </ReusableModal>
  );
}

export default SubirAlumnosModal;
