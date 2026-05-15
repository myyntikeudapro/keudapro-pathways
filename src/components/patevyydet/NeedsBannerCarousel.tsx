import { useState, useEffect, useCallback, useRef, useId } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { useWizard } from "@/contexts/WizardContext";

import bannerKortit from "@/assets/banner-osaaminen-kortit.jpg";
import bannerSuunta from "@/assets/banner-osaaminen-suunta.jpg";
import bannerAi from "@/assets/banner-osaaminen-ai.jpg";
import bannerRatkaisee from "@/assets/banner-osaaminen-ratkaisee.jpg";
import coachReitti from "@/assets/coach-reitti.png";
import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";

type CoachKey = "reitti" | "ana" | "veli";

const coachImages: Record<CoachKey, string> = {
  reitti: coachReitti,
  ana: coachAna,
  veli: coachVeli,
};

type Slide = {
  image: string;
  coach: CoachKey | null;
  tag: string;
  title: string;
  desc: string;
  cta: string;
  action: "coach" | "wizard";
};

const slides: Slide[] = [
  {
    image: bannerKortit,
    coach: "reitti",
    tag: "Reitti — kortit & pätevyydet",
    title: "Tarvitsen kortin tai pätevyyden",
    desc: "Työturvallisuus, ensiapu, hygienia tai muu virallinen pätevyys itselleni tai tiimilleni.",
    cta: "Keskustele Reitin kanssa",
    action: "coach",
  },
  {
    image: bannerSuunta,
    coach: "ana",
    tag: "Ana — uusi suunta",
    title: "Etsin uutta suuntaa",
    desc: "Uramuutos, työnhaku tai uusi ammatillinen polku — Ana auttaa kirkastamaan suunnan.",
    cta: "Keskustele Anan kanssa",
    action: "coach",
  },
  {
    image: bannerAi,
    coach: "veli",
    tag: "Veli — AI & osaaminen",
    title: "Kehitän osaamista",
    desc: "Tekoäly, digitaaliset taidot tai tiimin osaamisen kehittäminen — Veli näyttää reitin.",
    cta: "Keskustele Velin kanssa",
    action: "coach",
  },
  {
    image: bannerRatkaisee,
    coach: null,
    tag: "Osaaminen ratkaisee työssä",
    title: "Tiedätkö mikä työelämän osaaminen kannattaa hankkia juuri nyt?",
    desc: "Tee 15 min reittikartoitus — saat suosituksen sinulle parhaiten sopivasta poluista ja koulutuksista.",
    cta: "Aloita reittikartoitus",
    action: "wizard",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export function NeedsBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const { openPanel } = useCoachPanel();
  const { openWizard } = useWizard();
  const reducedMotion = usePrefersReducedMotion();
  const baseId = useId();
  const slideIds = slides.map((_, i) => `${baseId}-slide-${i}`);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Reduced motion → pause autoplay by default; user can press play.
  const autoplayPaused = userPaused || hoverPaused || reducedMotion;

  const goTo = useCallback((i: number) => setCurrent((i + slides.length) % slides.length), []);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (autoplayPaused) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 9000);
    return () => clearInterval(t);
  }, [autoplayPaused]);

  const handleAction = (slide: Slide) => {
    if (slide.action === "wizard") openWizard();
    else if (slide.coach) openPanel(slide.coach);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "Home") { e.preventDefault(); goTo(0); }
    else if (e.key === "End") { e.preventDefault(); goTo(slides.length - 1); }
    else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); setUserPaused((p) => !p); }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
    setHoverPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchStartX.current - touchEndX.current;
      if (Math.abs(dx) > 50) {
        dx > 0 ? next() : prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setHoverPaused(false);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Mistä tarpeesta liikkeelle"
      tabIndex={0}
      className="relative w-full overflow-hidden rounded-2xl h-[420px] md:h-[460px] lg:h-[500px] shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-teal-400 touch-pan-y select-none"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      {/* Live region announcing current slide */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Dia ${current + 1} / ${slides.length}: ${slides[current].title}`}
      </div>

      {slides.map((slide, i) => {
        const isCurrent = i === current;
        return (
          <div
            key={i}
            id={slideIds[i]}
            role="group"
            aria-roledescription="dia"
            aria-label={`${i + 1} / ${slides.length}: ${slide.title}`}
            aria-hidden={!isCurrent}
            className={cn(
              "absolute inset-0",
              reducedMotion ? "" : "transition-opacity duration-700 ease-in-out",
              isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? "eager" : "lazy"}
              width={1280}
              height={896}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {slide.coach && (
              <img
                src={coachImages[slide.coach]}
                alt=""
                aria-hidden="true"
                className="absolute top-5 right-5 md:top-6 md:right-6 w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/80 shadow-lg z-20"
              />
            )}

            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-3xl">
              <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-teal-300 mb-3">
                {slide.tag}
              </p>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {slide.title}
              </h3>
              <p className="text-base md:text-lg text-white/85 mb-5 leading-relaxed max-w-2xl">
                {slide.desc}
              </p>
              <button
                type="button"
                onClick={() => handleAction(slide)}
                tabIndex={isCurrent ? 0 : -1}
                className="inline-flex items-center gap-2 self-start bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6 py-3 rounded-lg shadow-md transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 min-h-11"
              >
                {slide.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Edellinen dia"
        aria-controls={slideIds.join(" ")}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Seuraava dia"
        aria-controls={slideIds.join(" ")}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Play / pause */}
      <button
        type="button"
        onClick={() => setUserPaused((p) => !p)}
        className="absolute top-3 left-3 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label={userPaused || reducedMotion ? "Käynnistä automaattinen vaihto" : "Pysäytä automaattinen vaihto"}
        aria-pressed={userPaused || reducedMotion}
      >
        {autoplayPaused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
      </button>

      {/* Dots */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2"
        role="tablist"
        aria-label="Diat"
      >
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`Dia ${i + 1} / ${slides.length}: ${slide.title}`}
            aria-controls={slideIds[i]}
            tabIndex={i === current ? 0 : -1}
            onClick={() => goTo(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
              i === current ? "w-8 bg-teal-300" : "w-2.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
