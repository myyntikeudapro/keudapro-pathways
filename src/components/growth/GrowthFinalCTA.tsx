import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import ctaImg1 from "@/assets/cta-kasvu-1.jpg";
import ctaImg2 from "@/assets/cta-kasvu-2.jpg";

const slides = [ctaImg1, ctaImg2];

const bullets = [
  "Tunnistetaan nykytaso ja pullonkaulat",
  "Valitaan sopiva reitti (Mindset + Toolset + Verkostot)",
  "Selkeä seuraava askel — ei yleistä, vaan juuri sinulle",
];

export function GrowthFinalCTA() {
  const [current, setCurrent] = useState(0);
  const { openWizard } = useWizard();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[580px] md:h-[620px] overflow-hidden">
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

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 h-full flex items-center">
        <div className="keuda-container">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
            Kasvu
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Haluatko tietää yrityksesi seuraavan askeleen?
          </h2>

          <p className="text-white/80 text-lg md:text-xl mb-6 max-w-2xl">
            Selvitä 15 minuutissa missä tasolla yrityksesi on — ja mikä reitti vie seuraavalle tasolle.
          </p>

          <ul className="space-y-2 mb-8">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-white/90 text-sm md:text-base">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button variant="cta" size="lg" onClick={openWizard}>
              Tee 15 min reittikartoitus
            </Button>
            <Button
              size="lg"
              variant="outline-primary"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
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
