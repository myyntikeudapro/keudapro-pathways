import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import solutionAi from "@/assets/solution-ai.jpg";
import solutionPath from "@/assets/solution-path.jpg";
import solutionSkills from "@/assets/solution-skills.jpg";

const programs = [
  {
    id: "valmennusohjelmat",
    title: "Johtamisen koulutukset",
    image: solutionPath,
    description:
      "Valmennusohjelmat strategiseen johtamiseen, esihenkilötyöhön ja osaamisen kehittämiseen – räätälöitynä tai avoimena.",
    modules: [
      { label: "Osaamisen johtamisen valmennusohjelma", href: "#osaamisen-johtaminen" },
      { label: "Johtamisen ja esihenkilötyön valmennukset", href: "#esihenkilotyo" },
      { label: "Räätälöidyt valmennukset kunnille ja yrityksille", href: "#raataloidyt" },
      { label: "Puitesopimukset", href: "#puitesopimukset" },
      { label: "Tutkintotavoitteiset ratkaisut (EAT & AT)", href: "#tutkinnot" },
    ],
    ctaText: "Kysy lisää",
    ctaHref: "#ota-yhteytta",
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-koulutukset",
    image: solutionAi,
    description:
      "Rakennettu eri rooleille – strategiasta käyttöönottoon. Valitse oma tasosi ja kehitä tekoälyosaamista.",
    modules: [
      { label: "AI-Director – Strateginen tekoälyjohtaminen", href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/" },
      { label: "AI-Manager – Tekoäly johtamistyössä", href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/" },
      { label: "AI-Coordinator – Käyttöönotto ja koordinointi", href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/" },
      { label: "AI-Kaksonen – Johtajan ja asiantuntijan AI", href: "#ai-kaksonen" },
      { label: "Hyper Engineering (FI)", href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/" },
      { label: "Hyper Engineering (EN)", href: "https://www.keuda.fi/en/training/hyper-engineering-program-en/" },
      { label: "Yrittäjä AI -ohjelma (tulossa)", href: "#yrittaja-ai" },
    ],
    ctaText: "Katso ohjelmat",
    ctaHref: "#ai-ohjelmat",
  },
  {
    id: "turvallisuus",
    title: "Turvallisuus- ja vastuullisuus-johtamisen koulutukset",
    image: solutionSkills,
    description:
      "Turvallisuus osaksi johtamista ja vastuullista organisaatiota. Ohjelmat turvallisuuspäälliköille, -asiantuntijoille ja -johtajille.",
    modules: [
      { label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma", href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/" },
      { label: "Turvallisuusjohtajan valmennusohjelma ml. AI (tulossa)", href: "#turvallisuusjohtaja" },
    ],
    ctaText: "Tutustu ohjelmiin",
    ctaHref: "#turvallisuus-cta",
  },
];

export function AlySolutionCategories() {
  return (
    <section className="py-8 md:py-10 bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kolme kokonaisuutta erilaisiin tarpeisiin - valitse omasi ja löydä sopivat koulutus- ja valmennusratkaisut
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((prog) => (
            <div
              key={prog.id}
              id={prog.id}
              className="keuda-card-enhanced flex flex-col h-full"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mb-4">
                <img src={prog.image} alt={prog.title} className="w-full h-full object-cover" />
              </div>

              {/* Title & description */}
              <h3 className="text-xl font-bold text-foreground mb-2">{prog.title}</h3>
              <p className="text-muted-foreground text-sm mb-5">{prog.description}</p>

              {/* Module links */}
              <div className="flex flex-col gap-2 mb-6 flex-1">
                {prog.modules.map((mod, idx) => (
                  <a
                    key={idx}
                    href={mod.href}
                    {...(mod.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {mod.label}
                  </a>
                ))}
              </div>

              {/* CTA */}
              <Button variant="cta" size="lg" asChild className="w-full">
                <a href={prog.ctaHref}>{prog.ctaText}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
