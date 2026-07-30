import { Check } from "lucide-react";
import { Button } from "../ui/button";

interface PricingProps {
  onUpgradeClick: (planId: string) => void;
  isLoading?: boolean;
}

const sharedBenefits = [
  "Sesiones y unidades listas para clase",
  "Alineado al Currículo Nacional",
  "Descarga en Word y PDF",
  "Cancela cuando quieras",
];

const plans = [
  {
    name: "Primaria",
    who: "Si enseñas primaria",
    price: "20",
    planId: "premium_personal",
    highlighted: false,
  },
  {
    name: "Secundaria",
    who: "Si enseñas secundaria",
    price: "25",
    planId: "premium_personal_secundaria",
    highlighted: true,
  },
  {
    name: "Equipo",
    who: "Tú + 1 docente más",
    price: "30",
    planId: "premium_equipo",
    highlighted: false,
  },
];

function Pricing({ onUpgradeClick, isLoading = false }: PricingProps) {
  return (
    <section id="pricing" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="dp-enter dp-enter-delay-1 mb-8">
          <h2 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937]">
            Elige tu plan
          </h2>
          <p className="mt-2 max-w-[42ch] text-lg font-semibold leading-8 text-[#6B7280]">
            Todos incluyen lo mismo. Solo cambia el nivel o si eres más de uno.
          </p>
        </div>

        <ul className="dp-enter dp-enter-delay-1 mb-8 grid gap-3 sm:grid-cols-2">
          {sharedBenefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 text-base font-semibold text-[#1F2937]"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E3F8EC] text-[#15803D]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.planId}
              className={`dp-enter flex flex-col rounded-[28px] border bg-white p-6 shadow-[0_8px_28px_rgba(31,41,55,0.05)] ${
                plan.highlighted
                  ? "border-[#6B9FE8] ring-2 ring-[#6B9FE8]/25"
                  : "border-[#E6EBF2]"
              } ${
                index === 1
                  ? "dp-enter-delay-2"
                  : index === 2
                    ? "dp-enter-delay-3"
                    : ""
              }`}
            >
              {plan.highlighted && (
                <p className="mb-3 text-sm font-extrabold text-[#3B6CB5]">
                  Más elegido
                </p>
              )}
              <h3 className="text-2xl font-extrabold text-[#1F2937]">
                {plan.name}
              </h3>
              <p className="mt-1 text-base font-semibold text-[#6B7280]">
                {plan.who}
              </p>

              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#9CA3AF]">S/</span>
                <span className="text-4xl font-extrabold text-[#1F2937]">
                  {plan.price}
                </span>
                <span className="text-base font-semibold text-[#6B7280]">
                  / mes
                </span>
              </p>

              <Button
                type="button"
                onClick={() => onUpgradeClick(plan.planId)}
                disabled={isLoading}
                className={
                  plan.highlighted
                    ? "dp-press dp-lift dp-cta-soft-pattern mt-6 h-14 w-full rounded-[20px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316]"
                    : "dp-press mt-6 h-14 w-full rounded-[20px] border border-[#E6EBF2] bg-white text-base font-extrabold text-[#1F2937] hover:border-[#6B9FE8]/40 hover:bg-[#EAF2FC]"
                }
              >
                {isLoading ? "Un momento..." : `Elegir ${plan.name}`}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
