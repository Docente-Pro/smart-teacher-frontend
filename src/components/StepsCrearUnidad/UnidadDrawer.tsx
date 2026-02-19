import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MapPin,
  Target,
  Compass,
  CalendarDays,
  BookOpen,
  Package,
  HelpCircle,
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";

export const UnidadDrawer = () => {
  const { datosBase, contenido } = useUnidadStore();

  if (!datosBase) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="fixed top-20 right-4 z-50 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Resumen
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Resumen de la Unidad
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-4">
          {/* Título */}
          {datosBase.titulo && (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 p-4 rounded-lg border border-violet-200 dark:border-violet-800">
              <h3 className="font-bold text-xl text-center text-violet-700 dark:text-violet-400">
                {datosBase.titulo}
              </h3>
              <p className="text-center text-sm text-slate-500 mt-1">
                Unidad N° {datosBase.numeroUnidad}
              </p>
            </div>
          )}

          {/* Datos Generales */}
          <DrawerSection
            icon={<MapPin className="h-5 w-5 text-blue-600" />}
            title="Datos Generales"
            gradient="from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
            border="border-blue-200 dark:border-blue-800"
          >
            <p><strong>Nivel:</strong> {datosBase.nivel}</p>
            <p><strong>Grado:</strong> {datosBase.grado}</p>
            <p><strong>Duración:</strong> {datosBase.duracion} semanas</p>
            <p><strong>Fecha inicio:</strong> {datosBase.fechaInicio}</p>
            <p><strong>Fecha fin:</strong> {datosBase.fechaFin}</p>
            <p><strong>Problemática:</strong> {datosBase.problematicaNombre}</p>
            <div>
              <strong>Áreas:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {datosBase.areas.map((a) => (
                  <span
                    key={a.nombre}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {a.nombre}
                  </span>
                ))}
              </div>
            </div>
          </DrawerSection>

          {/* Situación Significativa */}
          {contenido.situacionSignificativa && (
            <DrawerSection
              icon={<Target className="h-5 w-5 text-emerald-600" />}
              title="Situación Significativa"
              gradient="from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950"
              border="border-emerald-200 dark:border-emerald-800"
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {contenido.situacionSignificativa.slice(0, 300)}
                {contenido.situacionSignificativa.length > 300 && "..."}
              </p>
            </DrawerSection>
          )}

          {/* Evidencias */}
          {contenido.evidencias && (
            <DrawerSection
              icon={<BookOpen className="h-5 w-5 text-orange-600" />}
              title="Evidencias"
              gradient="from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950"
              border="border-orange-200 dark:border-orange-800"
            >
              <p><strong>Propósito:</strong> {contenido.evidencias.proposito}</p>
              <p><strong>Producto Integrador:</strong> {contenido.evidencias.productoIntegrador}</p>
              <p><strong>Instrumento:</strong> {contenido.evidencias.instrumentoEvaluacion}</p>
            </DrawerSection>
          )}

          {/* Propósitos */}
          {contenido.propositos && (
            <DrawerSection
              icon={<Target className="h-5 w-5 text-purple-600" />}
              title="Propósitos de Aprendizaje"
              gradient="from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
              border="border-purple-200 dark:border-purple-800"
            >
              <p className="text-xs text-slate-500">
                {contenido.propositos.areasPropositos?.length || 0} áreas con propósitos definidos
              </p>
              {contenido.propositos.competenciasTransversales?.length > 0 && (
                <p className="text-xs text-slate-500">
                  {contenido.propositos.competenciasTransversales.length} competencias transversales
                </p>
              )}
            </DrawerSection>
          )}

          {/* Enfoques */}
          {contenido.enfoques && contenido.enfoques.length > 0 && (
            <DrawerSection
              icon={<Compass className="h-5 w-5 text-cyan-600" />}
              title="Enfoques Transversales"
              gradient="from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950"
              border="border-cyan-200 dark:border-cyan-800"
            >
              {contenido.enfoques.map((e, i) => (
                <p key={i} className="text-sm">
                  <strong>{e.enfoque}:</strong> {e.valor}
                </p>
              ))}
            </DrawerSection>
          )}

          {/* Secuencia */}
          {contenido.secuencia && (
            <DrawerSection
              icon={<CalendarDays className="h-5 w-5 text-indigo-600" />}
              title="Secuencia de Actividades"
              gradient="from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950"
              border="border-indigo-200 dark:border-indigo-800"
            >
              <p className="text-sm italic">{contenido.secuencia.hiloConductor}</p>
              <p className="text-xs text-slate-500 mt-1">
                {contenido.secuencia.semanas?.length || 0} semanas planificadas
              </p>
            </DrawerSection>
          )}

          {/* Materiales */}
          {contenido.materiales && contenido.materiales.length > 0 && (
            <DrawerSection
              icon={<Package className="h-5 w-5 text-amber-600" />}
              title="Materiales y Recursos"
              gradient="from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950"
              border="border-amber-200 dark:border-amber-800"
            >
              <ul className="list-disc list-inside text-sm space-y-1">
                {contenido.materiales.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </DrawerSection>
          )}

          {/* Reflexiones */}
          {contenido.reflexiones && contenido.reflexiones.length > 0 && (
            <DrawerSection
              icon={<HelpCircle className="h-5 w-5 text-rose-600" />}
              title="Reflexiones"
              gradient="from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950"
              border="border-rose-200 dark:border-rose-800"
            >
              <ul className="list-decimal list-inside text-sm space-y-1">
                {contenido.reflexiones.map((r, i) => (
                  <li key={i}>{r.pregunta}</li>
                ))}
              </ul>
            </DrawerSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* ─── Sección reutilizable del drawer ─── */

function DrawerSection({
  icon,
  title,
  gradient,
  border,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} p-4 rounded-lg border ${border}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}
