import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ctaVideoAly from "@/assets/cta-video-aly.mp4";
import ctaVideoNoste from "@/assets/cta-video-noste.mp4";
import ctaVideoKasvu from "@/assets/cta-video-kasvu.mp4";

const ctaVideos = [
  { src: ctaVideoAly, label: "ÄLY" },
  { src: ctaVideoNoste, label: "NOSTE" },
  { src: ctaVideoKasvu, label: "KASVU" },
];

const CtaVideoCarousel = () => {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % ctaVideos.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === current) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current]);

  return (
    <section className="relative w-full overflow-hidden">
      {ctaVideos.map((v, i) => (
        <div
          key={v.label}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100 z-0" : "opacity-0 z-0"
          )}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={v.src}
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="relative z-10 py-20 md:py-32">
        <div className="keuda-container text-center">
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Yksi keskustelu voi muuttaa suunnan.
          </h3>
          <Button variant="cta" size="xl" asChild>
            <a href="https://calendar.google.com/calendar/embed?src=myynti%40keudapro.com&ctz=Europe%2FHelsinki" target="_blank" rel="noopener noreferrer">Varaa aika nyt</a>
          </Button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {ctaVideos.map((v, i) => (
          <button
            key={v.label}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={v.label}
          />
        ))}
      </div>
    </section>
  );
};

export default CtaVideoCarousel;
