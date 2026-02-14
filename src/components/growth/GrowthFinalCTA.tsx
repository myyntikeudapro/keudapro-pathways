import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ctaImg1 from "@/assets/cta-kasvu-1.jpg";
import ctaImg2 from "@/assets/cta-kasvu-2.jpg";

const slides = [ctaImg1, ctaImg2];

export function GrowthFinalCTA() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[520px] md:h-[560px] overflow-hidden">
      {/* Background images with fade */}
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="keuda-container max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
            Kasvu
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Haluatko tietää yrityksesi seuraavan askeleen?
          </h2>

          <p className="text-white/80 text-lg md:text-xl mb-8">
            Kasvukartoitus antaa nopeasti selkeyden siihen, mitä kannattaa tehdä nyt.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button size="lg" asChild>
              <a href="/kasvukartoitus">Varaa kasvukartoitus</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              Liity mukaan pilottiin
            </Button>
          </div>

          <p className="text-sm text-white/50">
            Kartoitus ei sido mihinkään. Se voi kuitenkin avata uuden suunnan.
          </p>
        </div>
      </div>
    </section>
  );
}
