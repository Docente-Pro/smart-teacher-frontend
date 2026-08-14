import LegalPageLayout from "@/pages/LegalPageLayout";

function PrivacidadPage() {
  return (
    <LegalPageLayout title="Política de privacidad">
      <p>
        Docente Pro trata tus datos personales (nombre, correo, institución y
        preferencias de planificación) únicamente para operar el servicio:
        crear tu cuenta, generar documentos pedagógicos y gestionar tu
        suscripción.
      </p>
      <p>
        No vendemos ni compartimos tu información con terceros con fines
        comerciales. Los proveedores que usamos (autenticación, hosting y
        pagos) procesan datos bajo contrato y solo para prestar el servicio.
      </p>
      <p>
        Puedes solicitar acceso, corrección o eliminación de tus datos
        escribiendo al equipo de soporte desde la cuenta registrada con tu
        correo institucional o personal.
      </p>
      <p className="text-sm font-semibold text-[#9CA3AF]">
        Última actualización: julio 2026
      </p>
    </LegalPageLayout>
  );
}

export default PrivacidadPage;
