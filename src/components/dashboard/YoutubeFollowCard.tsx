import { Youtube } from "lucide-react";
import { DOCENTE_PRO_YOUTUBE_CHANNEL } from "@/data/dashboardTutorials";

interface YoutubeFollowCardProps {
  focusRing: string;
  pressable: string;
  cardShadow: string;
}

function YoutubeFollowCard({
  focusRing,
  pressable,
  cardShadow,
}: YoutubeFollowCardProps) {
  return (
    <section
      aria-labelledby="youtube-follow-heading"
      className={`dp-enter mt-8 rounded-[24px] border border-[#E6EBF2] bg-white p-5 sm:p-6 ${cardShadow}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#FEE2E2] text-[#DC2626]"
            aria-hidden="true"
          >
            <Youtube className="h-7 w-7" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <h2
              id="youtube-follow-heading"
              className="text-xl font-extrabold text-[#1F2937]"
            >
              Síguenos en YouTube
            </h2>
            <p className="mt-1 max-w-[36ch] text-sm font-semibold leading-6 text-[#6B7280] sm:text-base">
              Publicamos tutoriales nuevos cuando lanzamos funciones. Así no te
              pierdes ningún paso a paso.
            </p>
          </div>
        </div>

        <a
          href={DOCENTE_PRO_YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${focusRing} ${pressable} inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] border border-[#E6EBF2] bg-[#EAF2FC] px-5 text-base font-extrabold text-[#3B6CB5] hover:bg-[#DCE9FA] sm:min-w-[11rem] ${cardShadow}`}
        >
          <Youtube className="h-5 w-5 text-[#DC2626]" aria-hidden="true" />
          Ir al canal
        </a>
      </div>
    </section>
  );
}

export default YoutubeFollowCard;
