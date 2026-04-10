import { useEffect, useRef, useState, useCallback } from "react";
import { Quote } from "lucide-react";

const counters = [
  { target: 1700, suffix: "+", label: "Osallistujaa eri koulutuksissa vuosittain" },
  { target: 72, suffix: "", label: "NPS (asiakastyytyväisyys)" },
  { target: 150, suffix: "+", label: "Koulutus- ja valmennustoteutusta vuosittain" },
  { target: 70, suffix: "+", label: "Asiantuntijaa verkostossamme" },
];

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

function useCountUp(target: number, duration: number, delay: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!trigger || started.current) return;
    started.current = true;

    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, target, duration, delay]);

  return value;
}

export function AnimatedCounters() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20 bg-primary/5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      <div className="keuda-container flex flex-col items-center gap-10">
        <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center tracking-tight">
          Luotettu kumppani osaamisen kehittämisessä
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl">
          {counters.map((c, i) => (
            <CounterCard key={c.label} {...c} index={i} trigger={visible} />
          ))}
        </div>

        <p className="text-sm md:text-base text-muted-foreground text-center">
          Valtakunnalliset ja kansainväliset verkostot
        </p>

        <blockquote className="max-w-2xl text-center bg-muted/40 border border-border/60 rounded-xl px-6 py-5">
          <Quote className="w-5 h-5 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-base md:text-lg italic text-muted-foreground leading-relaxed">
            "Koulutus toi heti käytännön hyötyjä – pystyimme ottamaan opit käyttöön saman tien."
          </p>
        </blockquote>
      </div>
    </section>
  );
}

function CounterCard({ target, suffix, label, index, trigger }: {
  target: number; suffix: string; label: string; index: number; trigger: boolean;
}) {
  const value = useCountUp(target, 1800, index * 150, trigger);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
        {formatNumber(value)}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
