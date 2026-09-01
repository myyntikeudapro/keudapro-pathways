import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import heroImg1 from "@/assets/hero-aly-1.jpg";
import heroImg2 from "@/assets/hero-aly-2.jpg";
import heroImg3 from "@/assets/hero-aly-3.jpg";

const slides = [
  {
    image: heroImg1,
    title: "Tekoäly johtamiseen ja uudistumiseen",
    cta: "Katso AI-ohjelmat",
    href: "#tekoalypatevyys",
  },
  {
    image: heroImg2,
    title: "Osaamisen ja johtamisen valmennukset",
    cta: "Katso AI-ohjelmat",
    href: "#tekoalypatevyys",
  },
  {
    image: heroImg3,
    title: "Johtaminen, asiantuntijuus ja tekoäly",
    cta: "Katso AI-ohjelmat",
    href: "#tekoalypatevyys",
  },
];

export function AlyHeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[70vh] min-h-[420px] max-h-[700px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm md:text-base font-semibold tracking-widest uppercase text-white/80 mb-3">
            ÄLY
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {slides[current].title}
          </h1>
          <p className="text-white/90 text-base md:text-lg max-w-[620px] mx-auto mb-8 leading-relaxed">
            Johtamista, asiantuntijuutta ja tekoälyä — yhdeksi kokonaisuudeksi johtajille ja asiantuntijoille.
          </p>
          <Button
            variant="cta"
            size="xl"
            asChild
            className="keuda-cta-wrap max-w-full"
          >
            <a
              href={slides[current].href}
              onClick={(e) => {
              e.preventDefault();
              const id = slides[current].href.replace("#", "");
                window.history.pushState(null, "", slides[current].href);
                window.dispatchEvent(
                  new CustomEvent("aly-category-open", { detail: { id } })
                );
              }}
            >
              {slides[current].cta}
            </a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
