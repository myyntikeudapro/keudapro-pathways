import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AI_LEVELS } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";
import heroImg from "@/assets/hero-ai-coaches.jpg";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function AlyAiHero() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      <img
        src={heroImg}
        alt="Ana ja Veli, KeudaPROn tekoälyvalmentajat"
        className="absolute inset-0 w-full h-full object-cover opacity-70 md:opacity-100"
        style={{ objectPosition: "center 25%" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/85 to-foreground md:bg-gradient-to-r md:from-foreground/95 md:via-foreground/80 md:to-foreground/45"
      />
      <div className="relative keuda-container py-8 sm:py-12 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-background/60 mb-3">
            KeudaPRO ÄLY
          </span>
          <h1 className="text-[34px] md:text-5xl lg:text-6xl font-extrabold text-background mb-3 md:mb-5 leading-[1.05] tracking-tight">
            Tekoälypätevyydet{" "}
            <span style={{ color: "hsl(var(--keuda-orange))" }}>työelämään</span>
          </h1>
          <p className="text-base md:text-2xl text-background/80 md:text-background/90 leading-relaxed max-w-[300px] md:max-w-2xl">
            Opi käyttämään, kehittämään ja johtamaan tekoälyä.
          </p>
          <p className="hidden md:block mt-4 text-base text-background/75 leading-relaxed max-w-2xl">
            Tekoälyosaaminen ei tarkoita enää vain yksittäisten työkalujen käyttöä. Työelämä
            tarvitsee ihmisiä, jotka osaavat hyödyntää tekoälyä omassa työssään, rakentaa uusia
            toimintatapoja ja johtaa tekoälyn käyttöönottoa.
          </p>
        </div>

        {/* Polku: Coordinator → Manager → Director */}
        <ol className="relative mt-8 md:mt-12 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 max-w-4xl">
          <span
            aria-hidden="true"
            className="md:hidden absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary via-primary/40 to-background/10"
          />
          {AI_LEVELS.map((level, i) => (
            <li key={level.id} className="relative flex items-center gap-4 md:block">
              <span
                className={`relative z-10 shrink-0 inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full text-sm md:text-base font-extrabold md:mb-3 ${
                  i === 0
                    ? "bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.45)]"
                    : "bg-foreground border border-background/25 text-background/70"
                }`}
              >
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => scrollToId(level.anchor)}
                className="group flex-1 md:w-full text-left rounded-xl border border-background/15 bg-background/5 hover:bg-background/10 hover:border-background/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background py-3 px-4 md:p-5 transition-all duration-300"
              >
                <span className="block text-[11px] md:text-xs font-medium uppercase tracking-wider text-background/45">
                  Taso {i + 1} · {level.promise}
                </span>
                <span className="block text-base md:text-lg font-bold text-background leading-tight">
                  {level.name}
                </span>
                <span className="hidden md:inline-flex mt-3 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-background/70 group-hover:text-background transition-colors">
                  Lue lisää
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
          <Button
            variant="cta"
            size="lg"
            className="w-full md:w-auto shadow-lg shadow-black/20"
            onClick={() => {
              trackEvent("ai_assessment_start", { source: "hero" });
              scrollToId("loyda-oma-tasosi");
            }}
          >
            Löydä oma tasosi
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full md:w-auto border border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
            onClick={() => scrollToId("tekoalypatevyydet")}
          >
            Katso tekoälypätevyydet
          </Button>
          <button
            type="button"
            className="w-full md:w-auto py-2 text-sm font-medium text-background/60 hover:text-background transition-colors underline-offset-4 hover:underline"
            onClick={() => {
              trackEvent("organization_ai_cta", { source: "hero" });
              scrollToId("organisaatioille");
            }}
          >
            Rakennetaan tekoälyosaaminen organisaatiollesi
          </button>
        </div>
      </div>
    </section>
  );
}


