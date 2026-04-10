import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import stepThinking from "@/assets/step-thinking.jpg";
import stepAction from "@/assets/step-action.jpg";
import stepTools from "@/assets/step-tools.jpg";
import stepCulture from "@/assets/step-culture.jpg";

const steps = [
  { image: stepThinking, title: "Ajattelu", text: "Näet ja johdat eri tavalla" },
  { image: stepAction, title: "Toiminta", text: "Viet opit suoraan omaan työhösi" },
  { image: stepTools, title: "Työkalut", text: "Otat modernit työkalut – myös tekoälyn – käyttöön" },
  { image: stepCulture, title: "Kulttuuri", text: "Vaikutat tiimiin ja koko organisaatioon" },
];

export function AlyPhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20 bg-foreground overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      <div className="keuda-container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            Näin kehität osaamistasi – ei vain opi uutta
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-[620px] mx-auto leading-relaxed" style={{ color: "hsl(210 15% 65%)" }}>
            Koulutuksemme eivät ole irrallisia kursseja. Ne rakentavat osaamista
            vaiheittain – ajattelusta käytäntöön ja kulttuuriin.
          </p>
        </div>

        {/* Desktop: horizontal process */}
        <div className="hidden md:flex items-start justify-center gap-0 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start">
              <div className="flex flex-col items-center text-center w-48">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-primary/40 ring-offset-2 ring-offset-foreground">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
                <h3 className="text-sm font-bold text-background mb-1">{step.title}</h3>
                <p className="text-xs leading-relaxed px-2" style={{ color: "hsl(210 15% 65%)" }}>{step.text}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-10 px-1">
                  <div className="w-8 h-px bg-primary/30" />
                  <ArrowRight className="w-4 h-4 text-primary/60 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: stacked */}
        <div className="flex md:hidden flex-col items-center gap-5 max-w-xs mx-auto">
          {steps.map((step, i) => (
            <div key={step.title}>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/40 ring-offset-2 ring-offset-foreground">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-background">{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(210 15% 65%)" }}>{step.text}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-px h-5 bg-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm italic mt-8" style={{ color: "hsl(210 15% 65%)" }}>
          Kehitys ei jää yksilötasolle – se näkyy tavassa toimia.
        </p>
      </div>
    </section>
  );
}
