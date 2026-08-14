import { useState } from "react";
import { Play } from "lucide-react";
import {
  LANDING_TUTORIAL_TITLE,
  LANDING_TUTORIAL_VIDEO_ID,
} from "@/utils/landingCopy";

/** YouTube devuelve un PNG minúsculo en maxresdefault cuando no existe — no dispara onError. */
const TUTORIAL_THUMBNAIL = `https://i.ytimg.com/vi/${LANDING_TUTORIAL_VIDEO_ID}/sddefault.jpg`;
const TUTORIAL_THUMBNAIL_FALLBACK = `https://i.ytimg.com/vi/${LANDING_TUTORIAL_VIDEO_ID}/hqdefault.jpg`;

function LandingTutorialSection() {
  const [playing, setPlaying] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(TUTORIAL_THUMBNAIL);

  return (
    <section
      id="tutorial"
      className="scroll-mt-[5.5rem] overflow-hidden bg-[#EAF2FC] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      aria-labelledby="tutorial-heading"
    >
      <div className="dp-enter mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#3B6CB5]">
            Tutorial en video
          </p>
          <h2
            id="tutorial-heading"
            className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-4xl lg:text-5xl"
          >
            Te lo muestro paso a paso
          </h2>
          <p className="mx-auto mt-4 max-w-[42ch] text-lg font-semibold leading-8 text-[#6B7280] sm:text-xl">
            Registro, tus 2 sesiones gratis y descarga en Word o PDF.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border-[6px] border-white bg-[#6B9FE8] shadow-[0_32px_80px_rgba(60,88,128,0.2)] sm:border-[10px]">
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${LANDING_TUTORIAL_VIDEO_ID}?autoplay=1&rel=0`}
                title={LANDING_TUTORIAL_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="dp-press group relative block size-full overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAF2FC]"
                aria-label={`Reproducir video: ${LANDING_TUTORIAL_TITLE}`}
              >
                <img
                  src={thumbnailSrc}
                  alt=""
                  className="absolute inset-0 size-full scale-[1.02] object-cover object-center"
                  loading="eager"
                  decoding="async"
                  onError={() => {
                    setThumbnailSrc((current) =>
                      current === TUTORIAL_THUMBNAIL_FALLBACK
                        ? current
                        : TUTORIAL_THUMBNAIL_FALLBACK,
                    );
                  }}
                />
                <span
                  className="absolute inset-0 bg-[#3B6CB5]/15 transition-colors duration-200 group-hover:bg-[#3B6CB5]/25"
                  aria-hidden="true"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-[#FF8B5C] text-white shadow-[0_20px_48px_rgba(255,139,92,0.45)] transition-transform duration-200 group-hover:scale-105 sm:h-24 sm:w-24">
                    <Play
                      className="ml-1 h-9 w-9 fill-current sm:h-10 sm:w-10"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingTutorialSection;
