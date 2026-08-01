import { useState } from "react";

import { useNavigate } from "react-router";

import { ChevronRight } from "lucide-react";

import {

  getFeaturedTutorials,

  getVisibleTutorials,

} from "@/data/dashboardTutorials";

import type { DashboardTutorial } from "@/data/dashboardTutorials";

import { useTutorialVisibilityContext } from "@/hooks/useTutorialVisibilityContext";

import TutorialVideoModal from "@/components/dashboard/TutorialVideoModal";

import TutorialVideoRow from "@/components/dashboard/TutorialVideoRow";



interface DashboardTutorialsTeaserProps {

  focusRing: string;

  pressable: string;

  cardShadow: string;

  enterDelayClass?: string;

}



function DashboardTutorialsTeaser({

  focusRing,

  pressable,

  cardShadow,

  enterDelayClass = "dp-enter-delay-5",

}: DashboardTutorialsTeaserProps) {

  const navigate = useNavigate();

  const ctx = useTutorialVisibilityContext();

  const visible = getVisibleTutorials(ctx);

  const featured = getFeaturedTutorials(ctx);

  const [activeTutorial, setActiveTutorial] =

    useState<DashboardTutorial | null>(null);



  if (visible.length === 0) {

    return null;

  }



  const totalLabel =

    visible.length === 1

      ? "Ver el tutorial"

      : `Ver los ${visible.length} tutoriales`;



  return (

    <>

      <section

        id="tutoriales"

        aria-labelledby="tutoriales-heading"

        className={`mb-8 dp-enter ${enterDelayClass}`}

      >

        <div className="flex flex-wrap items-end justify-between gap-3">

          <div>

            <h2

              id="tutoriales-heading"

              className="text-lg font-extrabold text-[#1F2937]"

            >

              Aprende a usar Docente Pro

            </h2>

            <p className="mt-1 text-sm font-semibold text-[#6B7280]">

              {ctx.isPremium

                ? "Unidades, sesiones y descargas en video."

                : "Tus primeros pasos y sesiones gratis."}

            </p>

          </div>

          {visible.length > featured.length && (

            <button

              type="button"

              onClick={() => navigate("/tutoriales")}

              className={`${focusRing} ${pressable} inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-extrabold text-[#3B6CB5] hover:bg-[#EAF2FC]`}

            >

              {totalLabel}

              <ChevronRight className="h-4 w-4" aria-hidden="true" />

            </button>

          )}

        </div>



        <div className="mt-3 flex flex-col gap-2.5">

          {featured.map((tutorial) => (

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



        {visible.length > featured.length && featured.length > 0 && (

          <button

            type="button"

            onClick={() => navigate("/tutoriales")}

            className={`${focusRing} ${pressable} mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-[#3B6CB5] hover:underline`}

          >

            {totalLabel}

            <ChevronRight className="h-4 w-4" aria-hidden="true" />

          </button>

        )}

      </section>



      <TutorialVideoModal

        isOpen={activeTutorial !== null}

        onClose={() => setActiveTutorial(null)}

        videoId={activeTutorial?.videoId ?? null}

        title={activeTutorial?.title ?? ""}

      />

    </>

  );

}



export default DashboardTutorialsTeaser;

