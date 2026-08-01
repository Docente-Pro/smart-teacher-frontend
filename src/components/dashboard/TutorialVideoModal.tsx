import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { youtubeEmbedUrl } from "@/utils/youtube";

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  title: string;
}

function TutorialVideoModal({
  isOpen,
  onClose,
  videoId,
  title,
}: TutorialVideoModalProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPlaying(false);
    }
  }, [isOpen, videoId]);

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      gradient="blue-orange"
      showCloseButton
      closeOnOverlayClick
    >
      <div className="w-full">
        <h3 className="text-balance text-xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-2xl">
          {title}
        </h3>
        {videoId && (
          <div className="mt-4 overflow-hidden rounded-[20px] border border-[#E6EBF2] bg-[#1F2937]">
            <div className="relative aspect-video w-full">
              {playing ? (
                <iframe
                  className="absolute inset-0 h-full w-full border-0"
                  src={youtubeEmbedUrl(videoId, true)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="dp-press flex size-full flex-col items-center justify-center gap-3 bg-[#EAF2FC] px-4 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[#6B9FE8] text-white shadow-[0_12px_28px_rgba(107,159,232,0.28)]">
                    <Play
                      className="ml-1 h-7 w-7 fill-current"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-base font-extrabold text-[#3B6CB5]">
                    Tocar para reproducir
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </ReusableModal>
  );
}

export default TutorialVideoModal;
