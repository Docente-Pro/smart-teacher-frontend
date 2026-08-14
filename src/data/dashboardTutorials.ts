export type TutorialCategory = "empezar" | "sesiones" | "unidades" | "descargas";

export interface DashboardTutorial {
  videoId: string;
  title: string;
  duration: string;
  category: TutorialCategory;
  /** Solo usuarios con plan Premium */
  premiumOnly?: boolean;
  /** Solo usuarios Free (p. ej. registro y 2 sesiones gratis) */
  freeOnly?: boolean;
  /**
   * Video de completar datos / cuenta nueva.
   * Se muestra si el perfil no está completo o aún no creó ninguna sesión.
   */
  profileSetupOnly?: boolean;
}

export interface TutorialVisibilityContext {
  isPremium: boolean;
  perfilCompleto: boolean;
  sesionesUsadas: number;
}

export const TUTORIAL_CATEGORY_LABELS: Record<TutorialCategory, string> = {
  empezar: "Primeros pasos",
  sesiones: "Sesiones",
  unidades: "Unidades",
  descargas: "Descargas",
};

export const TUTORIAL_CATEGORY_ORDER: TutorialCategory[] = [
  "empezar",
  "sesiones",
  "unidades",
  "descargas",
];

/** Canal @DocentePro-Peru */
export const DASHBOARD_TUTORIALS: DashboardTutorial[] = [
  {
    videoId: "Wyy7zcUfF8M",
    title: "Creación de cuenta — Completando nuestros datos",
    duration: "4:33",
    category: "empezar",
    profileSetupOnly: true,
  },
  {
    videoId: "VbRbbp37Weg",
    title: "Regístrate y obtén tus 2 sesiones gratis",
    duration: "16:03",
    category: "empezar",
    freeOnly: true,
  },
  {
    videoId: "PHKWbGtU_GU",
    title: "Crear sesiones de mi unidad primaria",
    duration: "2:53",
    category: "sesiones",
    premiumOnly: true,
  },
  {
    videoId: "Ozd7m20h5rY",
    title: "Creación de sesiones de nuestra unidad — Usuarios Premium",
    duration: "8:52",
    category: "sesiones",
    premiumOnly: true,
  },
  {
    videoId: "Ua3EC_tPfjc",
    title: "Generación de gráficos en Docente Pro",
    duration: "2:42",
    category: "sesiones",
  },
  {
    videoId: "z-0aSCaz2CE",
    title: "Crear unidad para primaria",
    duration: "15:11",
    category: "unidades",
    premiumOnly: true,
  },
  {
    videoId: "Wa0e-SfKzIk",
    title: "Creación de unidades para docentes de secundaria",
    duration: "10:23",
    category: "unidades",
    premiumOnly: true,
  },
  {
    videoId: "htjFkvmQSqo",
    title: "Finalizar unidad en Docente Pro",
    duration: "1:37",
    category: "unidades",
    premiumOnly: true,
  },
  {
    videoId: "ul2yE58yFdY",
    title: "Descargar tu PDF, Word y fichas de aplicación",
    duration: "8:38",
    category: "descargas",
  },
];

export const DOCENTE_PRO_YOUTUBE_CHANNEL =
  "https://www.youtube.com/@DocentePro-Peru/videos";

export function getTutorialByVideoId(
  videoId: string,
): DashboardTutorial | undefined {
  return DASHBOARD_TUTORIALS.find((tutorial) => tutorial.videoId === videoId);
}

export function isTutorialVisible(
  tutorial: DashboardTutorial,
  ctx: TutorialVisibilityContext,
): boolean {
  if (tutorial.premiumOnly && !ctx.isPremium) return false;
  if (tutorial.freeOnly && ctx.isPremium) return false;

  if (tutorial.profileSetupOnly) {
    const isNewAccount =
      !ctx.perfilCompleto || ctx.sesionesUsadas === 0;
    if (!isNewAccount) return false;
  }

  return true;
}

export function getVisibleTutorials(
  ctx: TutorialVisibilityContext,
): DashboardTutorial[] {
  return DASHBOARD_TUTORIALS.filter((tutorial) =>
    isTutorialVisible(tutorial, ctx),
  );
}

export function getFeaturedTutorials(
  ctx: TutorialVisibilityContext,
  limit = 3,
): DashboardTutorial[] {
  return getVisibleTutorials(ctx).slice(0, limit);
}

export function getTutorialsGroupedByCategory(
  ctx: TutorialVisibilityContext,
): {
  category: TutorialCategory;
  label: string;
  items: DashboardTutorial[];
}[] {
  const visible = getVisibleTutorials(ctx);

  return TUTORIAL_CATEGORY_ORDER.map((category) => ({
    category,
    label: TUTORIAL_CATEGORY_LABELS[category],
    items: visible.filter((tutorial) => tutorial.category === category),
  })).filter((group) => group.items.length > 0);
}
