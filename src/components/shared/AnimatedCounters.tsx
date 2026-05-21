import { useEffect, useRef, useState, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const counters = [
  { target: 1700, suffix: "+", label: "Osallistujaa eri koulutuksissa vuosittain" },
  { target: 78, suffix: "", label: "NPS (asiakastyytyväisyys)" },
  { target: 150, suffix: "+", label: "Koulutus- ja valmennustoteutusta vuosittain" },
  { target: 70, suffix: "+", label: "Asiantuntijaa verkostossamme" },
];

const testimonials = [
  {
    quote: "Hyvää käytännönläheisyyttä alusta alkaen! Loistava kouluttaja, joka jaksaa innostaa ja jota on mukava kuunnella.",
    program: "AI-Manageri",
  },
  {
    quote: "Hyvä ja selkeä materiaali. Johdonmukainen eteneminen. Oli helppo seurata verkonvälitykselläkin opetusta. Ei tullut 'kuolleita' kohtia eikä hetkiä, milloin olisi kadonnut punainen lanka.",
    program: "Akkuturvallisuuskoulutus",
  },
  {
    quote: "Hyvä koulutus, hidas tahti ja kertausta, case-esimerkkejä — kaikin puolin loistava kokonaisuus!",
    program: "Ensiapukoulutus",
  },
  {
    quote: "Mahtava porukka ja hyvät kouluttajat. Paljon hyötyä omassa työssäni. Suosittelen koulutusta, kokonaisuus erinomainen!",
    program: "Turvallisuuspäällikköohjelma",
  },
  {
    quote: "Kattava tietopaketti ja asiantuntemus turvallisuudesta!",
    program: "Turvallisuuspäällikköohjelma",
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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


        {/* Testimonial Carousel */}
        <TestimonialCarousel />
      </div>
    </section>
  );
}

function TestimonialCarousel() {
  const [shuffled] = useState(() => shuffleArray(testimonials));
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => {
      const nextIdx = (prev + 1) % shuffled.length;
      goTo(nextIdx);
      return nextIdx;
    });
  }, [goTo, shuffled.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => {
      const nextIdx = (prev - 1 + shuffled.length) % shuffled.length;
      goTo(nextIdx);
      return nextIdx;
    });
  }, [goTo, shuffled.length]);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrent((prev) => (prev + 1) % shuffled.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [shuffled.length]);

  const active = shuffled[current];

  return (
    <div className="relative max-w-3xl mx-auto mt-4 px-6 md:px-10 w-full">
      {/* Large decorative opening quote */}
      <Quote
        className="absolute -top-4 -left-2 md:-top-6 md:-left-4 w-16 h-16 md:w-24 md:h-24 text-primary/30"
        strokeWidth={1}
        aria-hidden="true"
      />
      {/* Accent line */}
      <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden="true" />

      {/* Quote + source */}
      <div className="relative z-10 min-h-[140px] md:min-h-[120px] flex flex-col items-center justify-center">
        <blockquote className="text-center w-full">
          <p
            className={cn(
              "text-xl md:text-2xl lg:text-3xl font-light leading-snug text-background tracking-tight transition-all duration-500",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            {active.quote}
          </p>
        </blockquote>

        <figcaption
          className={cn(
            "mt-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-primary/80 transition-all duration-500",
            isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
          {active.program}
          <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
        </figcaption>
      </div>

      {/* Navigation: arrows + dots */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          aria-label="Edellinen palaute"
          className="p-2 rounded-full text-background/40 hover:text-background hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {shuffled.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Palaute ${i + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === current ? "bg-primary w-6" : "bg-background/30 hover:bg-background/50"
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Seuraava palaute"
          className="p-2 rounded-full text-background/40 hover:text-background hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
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
