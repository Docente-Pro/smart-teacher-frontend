import { Check, Minus } from "lucide-react";
import { Link } from "react-router";
import {
  LANDING_CTA_HEADER_CLASSES,
  LANDING_CTA_SOFT_CLASSES,
  LANDING_CTA_SUBLINE,
  LANDING_PAYMENT_NOTE,
  LANDING_PRIMARY_CTA,
} from "@/utils/landingCopy";
type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  free: CellValue;
  premium: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  {
    label: "Sesiones alineadas al CNEB",
    free: "2 de prueba",
    premium: "Ilimitadas",
  },
  {
    label: "Unidades de aprendizaje completas",
    free: false,
    premium: true,
  },
  {
    label: "Sesión individual (sin unidad)",
    free: false,
    premium: true,
  },
  {
    label: "Descarga en Word y PDF",
    free: true,
    premium: true,
  },
  {
    label: "Compartir unidad con colegas",
    free: false,
    premium: true,
  },
];

const testimonials = [
  {
    quote:
      "Antes me llevaba el domingo armando la sesión. Ahora la tengo lista en minutos y solo ajusto detalles antes de clase.",
    name: "María L.",
    role: "Primaria · Lima",
    accent: "bg-[#EAF2FC] text-[#3B6CB5]",
  },
  {
    quote:
      "Lo que más valoro es que la secuencia de la unidad ya viene ordenada por semanas. Me quitó el estrés del inicio de bimestre.",
    name: "Carlos R.",
    role: "Secundaria · Arequipa",
    accent: "bg-[#EAF8F3] text-[#15803D]",
  },
  {
    quote:
      "Probé con las dos sesiones gratis y enseguida supe que valía pasarme a Premium. El Word llega listo para imprimir.",
    name: "Lucía V.",
    role: "Primaria · Trujillo",
    accent: "bg-[#FFF0E9] text-[#C75F38]",
  },
];

function ComparisonCell({
  value,
  compact = false,
}: {
  value: CellValue;
  compact?: boolean;
}) {
  if (value === true) {
    return (
      <span
        className={`inline-flex items-center gap-2 font-extrabold text-[#15803D] ${
          compact ? "flex-col gap-1.5 text-center text-sm" : "text-base"
        }`}
      >
        <span
          className={`grid place-items-center rounded-full bg-[#E3F8EC] ${
            compact ? "h-9 w-9" : "h-7 w-7"
          }`}
        >
          <Check className={compact ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
        </span>
        Incluido
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className={`inline-flex items-center gap-2 font-semibold text-[#9CA3AF] ${
          compact ? "flex-col gap-1.5 text-center text-sm" : "text-base"
        }`}
      >
        <span
          className={`grid place-items-center rounded-full bg-[#F3F4F6] ${
            compact ? "h-9 w-9" : "h-7 w-7"
          }`}
        >
          <Minus className={compact ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
        </span>
        {compact ? "No" : "No incluido"}
      </span>
    );
  }

  return (
    <span
      className={`font-extrabold text-[#1F2937] ${
        compact ? "text-center text-base leading-snug" : "text-base"
      }`}
    >
      {value}
    </span>
  );
}

function MobileComparisonTable() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E6EBF2] bg-white shadow-[0_16px_48px_rgba(60,88,128,0.08)] lg:hidden">
      <div className="grid grid-cols-2 border-b border-[#E6EBF2]">
        <div className="bg-[#F9FAFB] px-4 py-4 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Plan
          </p>
          <p className="mt-1 text-lg font-extrabold text-[#6B7280]">Gratis</p>
        </div>
        <div className="border-l border-[#E6EBF2] bg-[#EAF2FC]/70 px-4 py-4 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#3B6CB5]">
            Plan
          </p>
          <p className="mt-1 text-lg font-extrabold text-[#3B6CB5]">Premium</p>
        </div>
      </div>

      <ul className="divide-y divide-[#E6EBF2]">
        {comparisonRows.map((row) => (
          <li key={row.label} className="p-4">
            <p className="mb-4 text-base font-extrabold leading-snug text-[#1F2937]">
              {row.label}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex min-h-[5.5rem] items-center justify-center rounded-[18px] border border-[#E6EBF2] bg-[#FAFBFC] px-3 py-4">
                <ComparisonCell value={row.free} compact />
              </div>
              <div className="flex min-h-[5.5rem] items-center justify-center rounded-[18px] border border-[#6B9FE8]/25 bg-[#EAF2FC]/45 px-3 py-4">
                <ComparisonCell value={row.premium} compact />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopComparisonTable() {
  return (
    <div className="hidden overflow-hidden rounded-[28px] border border-[#E6EBF2] bg-white shadow-[0_16px_48px_rgba(60,88,128,0.08)] lg:block">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[#E6EBF2] bg-[#F9FAFB]">
        <div className="p-5 text-sm font-extrabold uppercase tracking-wide text-[#9CA3AF]">
          Qué incluye
        </div>
        <div className="border-l border-[#E6EBF2] p-5 text-center text-lg font-extrabold text-[#6B7280]">
          Gratis
        </div>
        <div className="border-l border-[#E6EBF2] bg-[#EAF2FC]/60 p-5 text-center text-lg font-extrabold text-[#3B6CB5]">
          Premium
        </div>
      </div>

      <ul>
        {comparisonRows.map((row, index) => (
          <li
            key={row.label}
            className={`grid grid-cols-[1.4fr_1fr_1fr] border-b border-[#E6EBF2] last:border-b-0 ${
              index % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white"
            }`}
          >
            <p className="p-5 text-base font-extrabold text-[#1F2937]">
              {row.label}
            </p>
            <div className="border-l border-[#E6EBF2] p-5">
              <ComparisonCell value={row.free} />
            </div>
            <div className="border-l border-[#E6EBF2] bg-[#EAF2FC]/40 p-5">
              <ComparisonCell value={row.premium} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandingDesire() {
  return (
    <section
      id="por-que-premium"
      className="relative scroll-mt-[5.5rem] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="desire-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* D — contraste dolor / ganancia */}
        <div className="dp-enter mb-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="rounded-[28px] border border-[#E6EBF2] bg-white p-8 shadow-[0_12px_40px_rgba(60,88,128,0.06)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Sin Docente Pro
            </p>
            <h2
              id="desire-heading"
              className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-4xl"
            >
              Horas copiando formatos y reescribiendo la misma sesión
            </h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-[#6B7280]">
              Domingo en la noche, cuaderno abierto, buscando competencias y armando
              actividades a mano.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#6B9FE8]/30 bg-gradient-to-br from-[#EAF2FC] to-white p-8 shadow-[0_16px_48px_rgba(107,159,232,0.12)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#3B6CB5]">
              Con Docente Pro
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-4xl">
              Tu sesión lista en minutos, en Word o PDF
            </h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-[#6B7280]">
              Describes tu clase, armamos la secuencia al CNEB y tú solo revisas
              antes de entrar al aula.
            </p>
            <p className="mt-6 inline-flex rounded-[14px] bg-[#FF8B5C]/15 px-4 py-2 text-base font-extrabold text-[#C75F38]">
              {LANDING_CTA_SUBLINE}
            </p>          </article>
        </div>

        {/* Comparativa Free vs Premium */}
        <div className="dp-enter dp-enter-delay-1 mb-16">
          <div className="mb-8 max-w-2xl">
            <h3 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-4xl">
              Free para probar. Premium para planificar todo el bimestre.
            </h3>
            <p className="mt-3 max-w-[48ch] text-lg font-semibold leading-8 text-[#6B7280]">
              Sin trucos: el límite del plan gratuito es real. Cuando lo superes,
              Premium desbloquea unidades y sesiones sin tope.
            </p>
          </div>

          <MobileComparisonTable />
          <DesktopComparisonTable />

          <div className="mt-8">
            <Link
              to="/signup"
              className={`${LANDING_CTA_SOFT_CLASSES} min-h-14 px-8 text-lg`}
            >
              {LANDING_PRIMARY_CTA}
            </Link>
            <p className="mt-3 max-w-[48ch] text-base font-semibold leading-7 text-[#6B7280]">
              {LANDING_PAYMENT_NOTE}
            </p>
          </div>
        </div>

        {/* Prueba social */}
        <div className="dp-enter dp-enter-delay-2">
          <div className="mb-8 max-w-2xl">
            <h3 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-4xl">
              Docentes que ya dejaron de armar todo a mano
            </h3>
            <p className="mt-3 text-lg font-semibold leading-8 text-[#6B7280]">
              Historias reales de quienes empezaron con las sesiones gratis y hoy
              planifican con más calma.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
            {testimonials.map((item) => (
              <li
                key={item.name}
                className="flex h-full min-h-[18rem] flex-col rounded-[28px] border border-[#E6EBF2] bg-white p-8 shadow-[0_12px_40px_rgba(60,88,128,0.08)] sm:p-9"
              >
                <blockquote className="flex flex-1 flex-col">
                  <p className="text-lg font-semibold leading-8 text-[#1F2937]">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-auto flex items-center gap-3 pt-8">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-sm font-extrabold ${item.accent}`}
                      aria-hidden="true"
                    >
                      {item.name.charAt(0)}
                    </span>
                    <div>
                      <cite className="not-italic text-base font-extrabold text-[#1F2937]">
                        {item.name}
                      </cite>
                      <p className="text-sm font-semibold text-[#6B7280]">
                        {item.role}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default LandingDesire;
