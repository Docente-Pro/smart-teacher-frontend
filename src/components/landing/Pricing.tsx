import { Button } from "../ui/button";
import type { LandingPlanId } from "@/utils/landingPlan";
import { LANDING_PAYMENT_NOTE, LANDING_PRIMARY_CTA } from "@/utils/landingCopy";

interface PricingProps {
  onStartFreeClick: (planId: LandingPlanId) => void;
  loadingPlanId?: LandingPlanId | null;
}

const plans = [
  {
    name: "Primaria",
    who: "Si enseñas primaria",
    price: "20",
    planId: "premium_personal" as const,
    badge: "1° a 6° primaria",
    cardClass:
      "border-[#86C8B0]/40 bg-white shadow-[0_16px_48px_rgba(57,122,104,0.1)]",
    badgeClass: "bg-[#E3F8EC] text-[#15803D]",
    priceClass: "text-[#15803D]",
    buttonClass:
      "dp-press dp-lift mt-6 h-14 w-full rounded-[20px] border-2 border-[#15803D] bg-white text-base font-extrabold text-[#15803D] hover:bg-[#E3F8EC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]",
  },
  {
    name: "Secundaria",
    who: "Si enseñas secundaria",
    price: "25",
    planId: "premium_personal_secundaria" as const,
    badge: "1° a 5° secundaria",
    cardClass:
      "border-[#6B9FE8]/40 bg-white shadow-[0_16px_48px_rgba(107,159,232,0.12)]",
    badgeClass: "bg-[#EAF2FC] text-[#3B6CB5]",
    priceClass: "text-[#3B6CB5]",
    buttonClass:
      "dp-press dp-lift mt-6 h-14 w-full rounded-[20px] border-2 border-[#3B6CB5] bg-white text-base font-extrabold text-[#3B6CB5] hover:bg-[#EAF2FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]",
  },
  {
    name: "Equipo",
    who: "Tú + 1 docente más",
    detail: "Dos cuentas Premium para planificar juntos en el mismo colegio o UGEL.",
    price: "30",
    planId: "premium_equipo" as const,
    badge: "2 docentes incluidos",
    cardClass:
      "border-[#E6EBF2] bg-white shadow-[0_12px_40px_rgba(60,88,128,0.08)]",
    badgeClass: "bg-[#FFF7ED] text-[#C2410C]",
    priceClass: "text-[#1F2937]",
    buttonClass:
      "dp-press dp-lift mt-6 h-14 w-full rounded-[20px] border-2 border-[#3B6CB5] bg-white text-base font-extrabold text-[#3B6CB5] hover:bg-[#EAF2FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]",
  },
];

function Pricing({ onStartFreeClick, loadingPlanId = null }: PricingProps) {
  return (
    <section
      id="pricing"
      className="scroll-mt-[5.5rem] bg-[#EAF2FC]/35 px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="dp-enter dp-enter-delay-1 mb-10 lg:mb-12">
          <h2
            id="pricing-heading"
            className="text-balance text-4xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-5xl"
          >
            Cuando quieras planificar sin límites
          </h2>
          <p className="mt-4 max-w-[52ch] text-xl font-semibold leading-8 text-[#6B7280]">
            Empieza con las 2 sesiones gratis. Estos son los precios Premium
            para cuando ya probaste y quieres unidades ilimitadas — eliges el
            nivel que enseñas.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8"
          role="group"
          aria-labelledby="pricing-heading"
        >
          {plans.map((plan, index) => {
            const isLoading = loadingPlanId === plan.planId;
            return (
              <article
                key={plan.planId}
                aria-labelledby={`plan-${plan.planId}-title`}
                className={`dp-enter flex flex-col rounded-[28px] border p-8 sm:p-9 ${plan.cardClass} ${
                  index === 1
                    ? "dp-enter-delay-2"
                    : index === 2
                      ? "dp-enter-delay-3"
                      : ""
                }`}
              >
                <div className="mb-4 min-h-7">
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-extrabold ${plan.badgeClass}`}
                  >
                    {plan.badge}
                  </p>
                </div>

                <h3
                  id={`plan-${plan.planId}-title`}
                  className="text-3xl font-extrabold text-[#1F2937]"
                >
                  {plan.name}
                </h3>
                <p className="mt-2 text-lg font-semibold text-[#6B7280]">
                  {plan.who}
                </p>
                {"detail" in plan && plan.detail && (
                  <p className="mt-2 text-base font-semibold leading-7 text-[#6B7280]">
                    {plan.detail}
                  </p>
                )}

                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-[#9CA3AF]">
                    desde S/
                  </span>
                  <span
                    className={`text-5xl font-extrabold tracking-tight ${plan.priceClass}`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-lg font-semibold text-[#6B7280]">
                    / mes
                  </span>
                </p>
                <p className="mt-2 text-sm font-semibold text-[#9CA3AF]">
                  Solo después de probar gratis
                </p>

                <Button
                  type="button"
                  onClick={() => onStartFreeClick(plan.planId)}
                  disabled={loadingPlanId !== null}
                  aria-busy={isLoading}
                  className={plan.buttonClass}
                >
                  {isLoading ? "Un momento..." : LANDING_PRIMARY_CTA}
                </Button>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-[52ch] text-center text-base font-semibold leading-7 text-[#6B7280]">
          {LANDING_PAYMENT_NOTE}
        </p>
      </div>
    </section>
  );
}

export default Pricing;
