import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AI_LEVELS } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";
import heroImg from "@/assets/hero-aly-1.jpg";

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
        alt="Työyhteisö kehittää tekoälyn käyttöä yhdessä"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
        style={{ objectPosition: "center 35%" }}
      />
      <div className="relative keuda-container py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-background/70 mb-3">
            KeudaPRO ÄLY
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-background mb-4 leading-tight">
            Tekoälypätevyydet työelämään
          </h1>
          <p className="text-lg md:text-2xl font-semibold text-background/90 mb-4">
            Opi käyttämään, kehittämään ja johtamaan tekoälyä.
          </p>
          <p className="text-sm md:text-base text-background/75 leading-relaxed max-w-2xl">
            Tekoälyosaaminen ei tarkoita enää vain yksittäisten työkalujen käyttöä. Työelämä
            tarvitsee ihmisiä, jotka osaavat hyödyntää tekoälyä omassa työssään, rakentaa uusia
            toimintatapoja ja johtaa tekoälyn käyttöönottoa.
          </p>
        </div>

        {/* Polku: Coordinator → Manager → Director */}
        <ol className="mt-8 grid gap-3 sm:grid-cols-3 max-w-4xl">
          {AI_LEVELS.map((level, i) => (
            <li key={level.id} className="relative">
              <button
                type="button"
                onClick={() => scrollToId(level.anchor)}
                className="w-full h-full text-left rounded-xl border border-background/25 bg-background/10 hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background p-4 transition-colors"
              >
                <span className="block text-[11px] font-semibold text-background/60 mb-1">
                  Taso {i + 1}
                </span>
                <span className="block text-base md:text-lg font-bold text-background">
                  {level.name}
                </span>
                <span className="block text-sm text-background/75">{level.promise}</span>
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

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            variant="cta"
            size="lg"
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
            className="border-background/50 text-background hover:bg-background/15 hover:text-background bg-transparent"
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
