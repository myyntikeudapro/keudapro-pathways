import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AI_LEVELS } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";
import heroImg from "@/assets/contact-team-bg.jpg";

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
        alt="Tiimi kehittää työtään yhdessä"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 35%" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/40"
      />
      <div className="relative keuda-container py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-foreground/40 px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-background/85 mb-5">
            KeudaPRO ÄLY
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-background mb-5 leading-[1.05] tracking-tight">
            Tekoälypätevyydet työelämään
          </h1>
          <p className="text-lg md:text-2xl font-semibold text-background/95 mb-4">
            Opi käyttämään, kehittämään ja johtamaan tekoälyä.
          </p>
          <p className="text-sm md:text-base text-background/80 leading-relaxed max-w-2xl">
            Tekoälyosaaminen ei tarkoita enää vain yksittäisten työkalujen käyttöä. Työelämä
            tarvitsee ihmisiä, jotka osaavat hyödyntää tekoälyä omassa työssään, rakentaa uusia
            toimintatapoja ja johtaa tekoälyn käyttöönottoa.
          </p>
        </div>

        {/* Polku: Coordinator → Manager → Director */}
        <ol className="mt-10 grid gap-3 sm:grid-cols-3 max-w-4xl">
          {AI_LEVELS.map((level, i) => (
            <li key={level.id} className="relative">
              <button
                type="button"
                onClick={() => scrollToId(level.anchor)}
                className="group w-full h-full text-left rounded-xl border-2 border-background/25 bg-foreground/50 hover:bg-foreground/70 hover:border-background/60 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background p-5 transition-all duration-300 shadow-lg shadow-black/20"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background text-foreground text-base font-extrabold mb-3 shadow-md">
                  {i + 1}
                </span>
                <span className="block text-base md:text-lg font-bold text-background">
                  {level.name}
                </span>
                <span className="block text-sm text-background/85 mt-0.5">{level.promise}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-background/70 group-hover:text-background transition-colors">
                  Lue lisää
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              {i < AI_LEVELS.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 text-background/50"
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            variant="cta"
            size="lg"
            className="shadow-lg shadow-black/20"
            onClick={() => {
              trackEvent("ai_assessment_start", { source: "hero" });
              scrollToId("loyda-oma-tasosi");
            }}
          >
            Löydä oma tasosi
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => scrollToId("tekoalypatevyydet")}
          >
            Katso tekoälypätevyydet
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-background/50 text-background hover:bg-background hover:text-foreground bg-foreground/30 h-auto whitespace-normal py-3 text-center"
            onClick={() => {
              trackEvent("organization_ai_cta", { source: "hero" });
              scrollToId("organisaatioille");
            }}
          >
            Rakennetaan tekoälyosaaminen organisaatiollesi
          </Button>
        </div>
      </div>
    </section>
  );
}

