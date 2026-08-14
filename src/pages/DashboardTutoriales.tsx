import { useState } from "react";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import {
  getTutorialsGroupedByCategory,
  getVisibleTutorials,
} from "@/data/dashboardTutorials";
import type { DashboardTutorial } from "@/data/dashboardTutorials";
import { useTutorialVisibilityContext } from "@/hooks/useTutorialVisibilityContext";
import TutorialVideoModal from "@/components/dashboard/TutorialVideoModal";
import TutorialVideoRow from "@/components/dashboard/TutorialVideoRow";
import YoutubeFollowCard from "@/components/dashboard/YoutubeFollowCard";
import TeacherAppShell from "@/components/layout/TeacherAppShell";
import TeacherHubPage from "@/components/layout/TeacherHubPage";
import TeacherHubPageHeader from "@/components/layout/TeacherHubPageHeader";
import {
  dpCardShadow,
  dpFocusRing,
  dpPressable,
} from "@/styles/dpTokens";

function DashboardTutoriales() {
  const ctx = useTutorialVisibilityContext();
  const groups = getTutorialsGroupedByCategory(ctx);
  const visibleCount = getVisibleTutorials(ctx).length;
  const [activeTutorial, setActiveTutorial] =
    useState<DashboardTutorial | null>(null);

  const focusRing = dpFocusRing;
  const pressable = dpPressable;
  const cardShadow = dpCardShadow;

  return (
    <TeacherAppShell activeNav="tutoriales">
      <TeacherHubPage maxWidth="3xl">
        <TeacherHubPageHeader
          title="Aprende a usar Docente Pro"
          description={
            ctx.isPremium
              ? "Unidades, sesiones premium y descargas. Toca un video para verlo aquí."
              : "Completar tu cuenta, crear sesiones gratis, gráficos y descargas."
          }
        />

        {groups.length === 0 ? (
          <p className="text-base font-semibold text-[#6B7280]">
            No hay tutoriales disponibles para tu plan en este momento.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section
                key={group.category}
                aria-labelledby={`tutorial-group-${group.category}`}
                className="dp-enter"
              >
                <h2
                  id={`tutorial-group-${group.category}`}
                  className="text-xl font-extrabold text-[#1F2937]"
                >
                  {group.label}
                </h2>
                <div className="mt-3 flex flex-col gap-2.5">
                  {group.items.map((tutorial) => (
                    <TutorialVideoRow
                      key={tutorial.videoId}
                      tutorial={tutorial}
                      onPlay={setActiveTutorial}
                      focusRing={focusRing}
                      pressable={pressable}
                      showPremiumBadge={!ctx.isPremium}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!ctx.isPremium && visibleCount < 9 && (
          <p className="mt-8 rounded-[20px] border border-[#E6EBF2] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#6B7280]">
            Con Premium verás también tutoriales de unidades, sesiones dentro de
            tu unidad y flujos avanzados.
          </p>
        )}

        <YoutubeFollowCard
          focusRing={focusRing}
          pressable={pressable}
          cardShadow={cardShadow}
        />
      </TeacherHubPage>

      <TutorialVideoModal
        isOpen={activeTutorial !== null}
        onClose={() => setActiveTutorial(null)}
        videoId={activeTutorial?.videoId ?? null}
        title={activeTutorial?.title ?? ""}
      />
    </TeacherAppShell>
  );
}

export default DashboardTutoriales;
