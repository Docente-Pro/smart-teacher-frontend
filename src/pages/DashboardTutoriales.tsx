import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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

function DashboardTutoriales() {
  const navigate = useNavigate();
  const ctx = useTutorialVisibilityContext();
  const groups = getTutorialsGroupedByCategory(ctx);
  const visibleCount = getVisibleTutorials(ctx).length;
  const [activeTutorial, setActiveTutorial] =
    useState<DashboardTutorial | null>(null);

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]";
  const pressable = "dp-press";
  const cardShadow = "shadow-[0_8px_28px_rgba(31,41,55,0.05)]";

  return (
    <div
      className="dp-canvas-dots min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <header className="sticky top-0 z-30 border-b border-[#E6EBF2]/70 bg-[#F5F7FA]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className={`${focusRing} ${pressable} inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base font-extrabold text-[#3B6CB5] hover:bg-[#EAF2FC]`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Inicio
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="dp-enter">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#3B6CB5]">
            Tutoriales en video
          </p>
          <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
            Aprende a usar Docente Pro
          </h1>
          <p className="mt-3 max-w-[42ch] text-base font-semibold leading-7 text-[#6B7280] sm:text-lg">
            {ctx.isPremium
              ? "Unidades, sesiones premium y descargas. Toca un video para verlo aquí."
              : "Completar tu cuenta, crear sesiones gratis, gráficos y descargas."}
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="mt-8 text-base font-semibold text-[#6B7280]">
            No hay tutoriales disponibles para tu plan en este momento.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
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
                      cardShadow={cardShadow}
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
      </main>

      <TutorialVideoModal
        isOpen={activeTutorial !== null}
        onClose={() => setActiveTutorial(null)}
        videoId={activeTutorial?.videoId ?? null}
        title={activeTutorial?.title ?? ""}
      />
    </div>
  );
}

export default DashboardTutoriales;
