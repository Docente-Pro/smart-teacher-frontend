import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { SubirListaAlumnosView } from "@/components/Shared/SubirListaAlumnosView";

interface SubirAlumnosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal standalone para subir la lista de alumnos desde el dashboard.
 * Envuelve SubirListaAlumnosView en un ReusableModal.
 */
function SubirAlumnosModal({ isOpen, onClose }: SubirAlumnosModalProps) {
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
      />
    </ReusableModal>
  );
}

export default SubirAlumnosModal;
