import LegalPageLayout from "@/pages/LegalPageLayout";

function TerminosPage() {
  return (
    <LegalPageLayout title="Términos de uso">
      <p>
        Al usar Docente Pro aceptas utilizar la plataforma para planificación
        docente legítima, respetando el currículo nacional y los derechos de
        autor de los materiales que subas (listas de alumnos, insignias, etc.).
      </p>
      <p>
        El plan gratuito incluye un número limitado de sesiones de prueba. Los
        planes Premium desbloquean funciones adicionales según se describe en
        la landing y en tu panel. Los precios y condiciones de cancelación se
        informan antes de confirmar el pago.
      </p>
      <p>
        Los documentos generados son borradores pedagógicos: tú, como docente,
        eres responsable de revisarlos y adaptarlos antes de aplicarlos en
        aula.
      </p>
      <p className="text-sm font-semibold text-[#9CA3AF]">
        Última actualización: julio 2026
      </p>
    </LegalPageLayout>
  );
}

export default TerminosPage;
