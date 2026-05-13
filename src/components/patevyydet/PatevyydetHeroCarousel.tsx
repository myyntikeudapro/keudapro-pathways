import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

import heroImg1 from "@/assets/hero-noste-1.jpg";
import heroImg2 from "@/assets/hero-aly-2.jpg";
import heroImg3 from "@/assets/hero-kasvu-1.jpg";

const slides = [
  {
    image: heroImg1,
    title: "Pätevyydet ja osaamiskortit",
    subtitle: "Nopeat, tunnustetut kortit — ryhmille, tiimeille ja yksittäisille osallistujille",
  },
  {
    image: heroImg2,
    title: "Avoimet ryhmät ja Open Seats",
    subtitle: "Liity mukaan tuleviin toteutuksiin tai täytä tiimisi paikat",
  },
  {
    image: heroImg3,
    title: "UNIIKKI-kumppanuus",
    subtitle: "Tarjoa koulutuksiasi KeudaPRO Skills Hubin kautta",
  },
];

export function PatevyydetHeroCarousel() {
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
        <div className="text-center px-4 max-w-3xl">
          <p className="text-sm md:text-base font-semibold tracking-widest text-white/80 mb-3">
            KeudaPRO
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {slides[current].title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {slides[current].subtitle}
          </p>
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
