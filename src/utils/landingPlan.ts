export const LANDING_PLAN_STORAGE_KEY = "landing_pending_plan";

export type LandingPlanId =
  | "premium_personal"
  | "premium_personal_secundaria"
  | "premium_equipo";

const LANDING_PLAN_IDS: LandingPlanId[] = [
  "premium_personal",
  "premium_personal_secundaria",
  "premium_equipo",
];

export function isLandingPlanId(value: string): value is LandingPlanId {
  return LANDING_PLAN_IDS.includes(value as LandingPlanId);
}

export function savePendingLandingPlan(planId: LandingPlanId): void {
  sessionStorage.setItem(LANDING_PLAN_STORAGE_KEY, planId);
}

export function readPendingLandingPlan(): LandingPlanId | null {
  const stored = sessionStorage.getItem(LANDING_PLAN_STORAGE_KEY);
  if (stored && isLandingPlanId(stored)) return stored;
  return null;
}

export function clearPendingLandingPlan(): void {
  sessionStorage.removeItem(LANDING_PLAN_STORAGE_KEY);
}

/** Plan de checkout del backend (precio secundaria lo ajusta el servidor por nivel). */
export function landingPlanToCheckoutPlan(_planId: LandingPlanId): "premium_mensual" {
  return "premium_mensual";
}
