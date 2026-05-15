import { useEffect, useRef, useState } from "react";
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
        const eased = 1 - Math.pow(1 - progress, 3);
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
      className="relative py-14 md:py-20 bg-foreground overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      <div className="keuda-container flex flex-col items-center gap-10">
        {/* Heading */}
        <h2 className="text-2xl md:text-4xl font-bold text-background text-center tracking-tight">
          Luotettu kumppani osaamisen kehittämisessä
        </h2>

        {/* Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl">
          {counters.map((c, i) => (
            <CounterCard key={c.label} {...c} index={i} trigger={visible} />
          ))}
        </div>


        {/* Testimonial */}
        <figure className="relative max-w-3xl mx-auto mt-4 px-6 md:px-10">
          {/* Large decorative opening quote */}
          <Quote
            className="absolute -top-4 -left-2 md:-top-6 md:-left-4 w-16 h-16 md:w-24 md:h-24 text-primary/30"
            strokeWidth={1}
            aria-hidden="true"
          />
          {/* Accent line */}
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden="true" />

          <blockquote className="relative z-10 text-center">
            <p className="text-xl md:text-3xl font-light leading-snug text-background tracking-tight">
              Koulutus toi heti käytännön hyötyjä — pystyimme ottamaan opit käyttöön{" "}
              <span className="font-semibold text-primary">saman tien</span>.
            </p>
          </blockquote>

          <figcaption className="mt-6 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-background/50">
            <span className="h-px w-8 bg-background/30" aria-hidden="true" />
            Asiakaspalaute
            <span className="h-px w-8 bg-background/30" aria-hidden="true" />
          </figcaption>
        </figure>
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
      <div className="text-4xl md:text-5xl font-bold text-background mb-1">
        {formatNumber(value)}{suffix}
      </div>
      <div className="text-sm text-background/50">{label}</div>
    </div>
  );
}
