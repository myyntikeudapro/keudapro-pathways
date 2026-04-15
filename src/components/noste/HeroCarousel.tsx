import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import heroImg1 from "@/assets/hero-noste-1.jpg";
import heroImg2 from "@/assets/hero-noste-2.jpg";
import heroImg3 from "@/assets/hero-noste-3.jpg";
import heroImg4 from "@/assets/hero-noste-4.jpg";
import heroImg5 from "@/assets/hero-noste-5.jpg";

const slides = [
  {
    image: heroImg1,
    tag: "LÖYDÄ SUUNTA",
    title: "Et tiedä vielä minne.\nSe on ihan ok.",
    subtitle: "Autamme sinua hahmottamaan vaihtoehdot ja tekemään ensimmäiset askeleet.",
    cta: "Aloita valmennus →",
    situationId: "polku1",
  },
  {
    image: heroImg2,
    tag: "KIRKASTA PROFIILI",
    title: "Osaamisesi on jo olemassa.\nTehdään siitä näkyvää.",
    subtitle: "CV, LinkedIn ja oman osaamisen sanoittaminen – tekoälyn avulla.",
    cta: "Kirkasta profiilisi →",
    situationId: "polku2",
  },
  {
    image: heroImg3,
    tag: "TÖIHIN NYT",
    title: "Nopein reitti\ntyöelämään on tässä.",
    subtitle: "Konkreettiset väylät, oikeat kontaktit ja tuki joka vie sinut eteenpäin.",
    cta: "Tavoittele työtä nyt →",
    situationId: "polku3",
  },
  {
    image: heroImg4,
    tag: "UUSI POLKU",
    title: "Muutos ei ole este.\nSe voi olla alku.",
    subtitle: "Autamme sinua rakentamaan uuden suunnan – tilanteestasi riippumatta.",
    cta: "Rakenna uusi polku →",
    situationId: "polku4",
  },
  {
    image: heroImg5,
    tag: "HAASTE",
    tagPill: true,
    title: "Työ syntyy siitä\nmitä itse rakennat.",
    subtitle: "Projekteja, toimeksiantoja tai yrittäjyyttä – omilla ehdoillasi.",
    cta: "Luo oma profiilisi →",
    situationId: "polku5",
  },
];

interface HeroCarouselProps {
  onSituationActivate?: (id: string) => void;
}

export function HeroCarousel({ onSituationActivate }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  const handleCtaClick = (situationId: string) => {
    if (onSituationActivate) {
      onSituationActivate(situationId);
    }
  };

  // Keyboard nav
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [prev, next]);

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-[70vh] min-h-[420px] max-h-[700px] overflow-hidden outline-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-all duration-[400ms] ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title.replace("\n", " ")}
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            {...(i === 0 ? {} : { loading: "lazy" as const })}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-3xl mx-auto">
          <span
            className={cn(
              "inline-block text-xs md:text-sm font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full",
              "bg-secondary text-secondary-foreground"
            )}
          >
            {slides[current].tag}
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 whitespace-pre-line leading-tight">
            {slides[current].title}
          </h1>

          <p className="text-base md:text-lg text-white/80 mb-8 max-w-xl mx-auto">
            {slides[current].subtitle}
          </p>

          <Button
            variant="cta"
            size="xl"
            onClick={() => handleCtaClick(slides[current].situationId)}
          >
            {slides[current].cta}
          </Button>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors duration-200"
        aria-label="Edellinen"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors duration-200"
        aria-label="Seuraava"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-secondary"
                : "w-2.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Dia ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
