import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

import solutionAi from "@/assets/solution-ai.jpg";
import solutionPath from "@/assets/solution-path.jpg";
import solutionSafety from "@/assets/solution-safety.jpg";

type ModuleItem = {
  label: string;
  href: string;
  badge?: { text: string; emoji: string };
  comingSoon?: boolean;
};

const programs = [
  {
    id: "valmennusohjelmat",
    title: "Johtamisen koulutukset",
    image: solutionPath,
    valueProposition:
      "Kehitä johtamisotettasi ja kasva esihenkilönä, joka saa tiimin kukoistamaan – käytännön valmennuksilla jotka näkyvät arjessa heti.",
    description:
      "Valmennusohjelmat strategiseen johtamiseen, esihenkilötyöhön ja osaamisen kehittämiseen – räätälöitynä tai avoimena.",
    modules: [
      {
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        badge: { text: "Ajankohtainen", emoji: "🔥" },
      },
      {
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        badge: { text: "Suosituin", emoji: "🏅" },
      },
      {
        label: "Räätälöidyt valmennukset kunnille ja yrityksille",
        href: "#raataloidyt",
      },
      { label: "Puitesopimukset", href: "#puitesopimukset" },
      {
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
      },
    ] as ModuleItem[],
    ctaText: "Tutustu johtamisen ohjelmiin →",
    ctaHref: "#ota-yhteytta",
    featuredCount: 2,
    hasComingSoon: false,
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-koulutukset",
    image: solutionAi,
    valueProposition:
      "Opi hyödyntämään tekoälyä omalla tasollasi – strategisesta johtamisesta käytännön käyttöönottoon. Valitse roolisi ja ala rakentaa tekoälyosaamista tänään.",
    description:
      "Rakennettu eri rooleille – strategiasta käyttöönottoon. Valitse oma tasosi ja kehitä tekoälyosaamista.",
    modules: [
      {
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        badge: { text: "Ajankohtainen", emoji: "🔥" },
      },
      {
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        badge: { text: "Suosituin", emoji: "🏅" },
      },
      {
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
      },
      {
        label: "AI-Kaksonen – Johtajan ja asiantuntijan AI",
        href: "https://www.keuda.fi/koulutus/ai-kaksonen-osaamisperinto-ja-digiloikka/",
        comingSoon: true,
      },
      {
        label: "Hyper Engineering (FI)",
        href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
      },
      {
        label: "Hyper Engineering (EN)",
        href: "https://www.keuda.fi/en/training/hyper-engineering-program-en/",
      },
      {
        label: "Yrittäjä AI -ohjelma",
        href: "#yrittaja-ai",
        comingSoon: true,
      },
    ] as ModuleItem[],
    ctaText: "Löydä oma tasosi →",
    ctaHref: "#ai-ohjelmat",
    featuredCount: 2,
    hasComingSoon: true,
  },
  {
    id: "turvallisuus",
    title: "Turvallisuus- ja vastuullisuus-johtamisen koulutukset",
    image: solutionSafety,
    valueProposition:
      "Tee turvallisuudesta kilpailuetu ja vastuullisuudesta johtamisen ydin – ohjelmilla jotka on rakennettu turvallisuuspäälliköille, asiantuntijoille ja johtajille.",
    description:
      "Turvallisuus osaksi johtamista ja vastuullista organisaatiota. Ohjelmat turvallisuuspäälliköille, -asiantuntijoille ja -johtajille.",
    modules: [
      {
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        badge: { text: "Suosituin", emoji: "🏅" },
      },
      {
        label: "Turvallisuusjohtajan valmennusohjelma ml. AI",
        href: "#turvallisuusjohtaja",
        comingSoon: true,
      },
    ] as ModuleItem[],
    ctaText: "Tutustu turvallisuusohjelmiin →",
    ctaHref: "#turvallisuus-cta",
    featuredCount: 1,
    hasComingSoon: true,
  },
];

function ComingSoonBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium text-primary">
          Kiitos! Saat tiedon heti kun ohjelma avautuu.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs font-semibold text-foreground mb-1">
        Tulossa pian – ilmoittaudu kiinnostuneeksi
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Saat tiedon heti kun ohjelma avautuu.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Sähköpostiosoite"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 h-9 text-sm"
            required
          />
        </div>
        <Button type="submit" size="sm" variant="default" className="h-9 text-xs whitespace-nowrap">
          Ilmoittaudu →
        </Button>
      </form>
    </div>
  );
}

export function AlySolutionCategories() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        requestAnimationFrame(() => {
          const el = cardRefs.current[id];
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        });
      }
      return next;
    });
  };

  return (
    <section className="py-8 md:py-10 bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kolme kokonaisuutta erilaisiin tarpeisiin - valitse omasi ja löydä
            sopivat koulutus- ja valmennusratkaisut
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((prog) => {
            const isExpanded = expanded[prog.id] ?? false;
            const visibleModules = prog.modules.filter((m) => !m.comingSoon);
            const featured = visibleModules.slice(0, prog.featuredCount);
            const rest = visibleModules.slice(prog.featuredCount);
            const showToggle = rest.length > 0;

            return (
              <div
                key={prog.id}
                id={prog.id}
                ref={(el) => (cardRefs.current[prog.id] = el)}
                style={{ scrollMarginTop: 80 }}
                className="keuda-card-enhanced flex flex-col h-full"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mb-4">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {prog.title}
                </h3>

                {/* Value proposition */}
                <p className="text-sm italic text-muted-foreground mb-3 leading-relaxed">
                  {prog.valueProposition}
                </p>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-5">
                  {prog.description}
                </p>

                {/* Featured module links */}
                <div className="flex flex-col gap-2 mb-2 flex-1">
                  {featured.map((mod, idx) => (
                    <a
                      key={idx}
                      href={mod.href}
                      {...(mod.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      <span className="flex-1">{mod.label}</span>
                      {mod.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0"
                        >
                          {mod.badge.emoji} {mod.badge.text}
                        </Badge>
                      )}
                    </a>
                  ))}

                  {/* Expandable rest */}
                  {isExpanded &&
                    rest.map((mod, idx) => (
                      <a
                        key={`rest-${idx}`}
                        href={mod.href}
                        {...(mod.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span className="flex-1">{mod.label}</span>
                        {mod.badge && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0"
                          >
                            {mod.badge.emoji} {mod.badge.text}
                          </Badge>
                        )}
                      </a>
                    ))}

                  {showToggle && (
                    <button
                      onClick={() => toggleExpand(prog.id)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline py-2 transition-colors"
                    >
                      {isExpanded
                        ? "Piilota ohjelmat"
                        : `Näytä kaikki ohjelmat (${rest.length})`}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {/* Coming soon box */}
                {prog.hasComingSoon && <ComingSoonBox />}

                {/* CTA */}
                <Button variant="cta" size="lg" asChild className="w-full mt-4">
                  <a href={prog.ctaHref}>{prog.ctaText}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
