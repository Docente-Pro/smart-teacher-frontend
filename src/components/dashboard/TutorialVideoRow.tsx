import { useState } from "react";
import { ChevronRight, Clock, ExternalLink, Play } from "lucide-react";
import type { DashboardTutorial } from "@/data/dashboardTutorials";
import {
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/utils/youtube";

interface TutorialVideoRowProps {
  tutorial: DashboardTutorial;
  onPlay: (tutorial: DashboardTutorial) => void;
  focusRing: string;
  pressable: string;
  cardShadow: string;
  showPremiumBadge?: boolean;
}

function TutorialVideoRow({
  tutorial,
  onPlay,
  focusRing,
  pressable,
  cardShadow,
  showPremiumBadge = true,
}: TutorialVideoRowProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState(
    youtubeThumbnailUrl(tutorial.videoId, "sddefault"),
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <button
        type="button"
        onClick={() => onPlay(tutorial)}
        className={`${focusRing} ${pressable} flex min-h-[76px] flex-1 items-center gap-3 rounded-[20px] border border-[#E6EBF2] bg-white px-3 py-3 text-left ${cardShadow}`}
      >
        <span className="relative h-[52px] w-[92px] shrink-0 overflow-hidden rounded-[14px] bg-[#EAF2FC]">
          <img
            src={thumbnailSrc}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => {
              setThumbnailSrc((current) =>
                current.includes("hqdefault")
                  ? current
                  : youtubeThumbnailUrl(tutorial.videoId, "hqdefault"),
              );
            }}
          />
          <span className="absolute inset-0 grid place-items-center bg-[#3B6CB5]/20">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#3B6CB5] shadow-sm">
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
            </span>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="block text-base font-extrabold text-[#1F2937]">
              {tutorial.title}
            </span>
            {showPremiumBadge && tutorial.premiumOnly && (
              <span className="inline-flex rounded-full bg-[#FFF7ED] px-2 py-0.5 text-xs font-extrabold text-[#9A3412]">
                Premium
              </span>
            )}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#6B7280]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {tutorial.duration}
          </span>
        </span>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-[#9CA3AF]"
          aria-hidden="true"
        />
      </button>
      <a
        href={youtubeWatchUrl(tutorial.videoId)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${focusRing} ${pressable} inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-[16px] border border-[#E6EBF2] bg-white px-3 text-sm font-bold text-[#3B6CB5] hover:bg-[#EAF2FC] sm:min-h-0 sm:w-[52px] sm:px-0`}
        aria-label={`Abrir en YouTube: ${tutorial.title}`}
        title="Abrir en YouTube"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sm:hidden">YouTube</span>
      </a>
    </div>
  );
}

export default TutorialVideoRow;
