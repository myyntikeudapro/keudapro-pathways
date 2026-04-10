import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Brain, Shield, Mail } from "lucide-react";

import solutionAi from "@/assets/solution-ai.jpg";
import solutionPath from "@/assets/solution-path.jpg";
import solutionSafety from "@/assets/solution-safety.jpg";

/* ── Types ── */
type Role = "asiantuntija" | "esihenkilö" | "johtaja" | "uudistuja";

type Program = {
  label: string;
  href: string;
  description: string;
  badge?: { text: string; emoji: string };
  roles: Role[];
};

type Category = {
  id: string;
  title: string;
  image: string;
  icon: typeof BookOpen;
  valueProposition: string;
  cta: string;
  programs: Program[];
  hasComingSoon: boolean;
};

/* ── Roles ── */
const roles: { id: Role; label: string }[] = [
  { id: "asiantuntija", label: "Asiantuntija" },
  { id: "esihenkilö", label: "Esihenkilö" },
  { id: "johtaja", label: "Johtaja" },
  { id: "uudistuja", label: "Uudistuja" },
];

/* ── Data ── */
const categories: Category[] = [
  {
    id: "valmennusohjelmat",
    title: "Johtamisen koulutukset",
    image: solutionPath,
    icon: BookOpen,
    valueProposition:
      "Kehitä johtamisotettasi ja kasva esihenkilönä, joka saa tiimin kukoistamaan – käytännön valmennuksilla jotka näkyvät arjessa heti.",
    cta: "Tutustu johtamisen ohjelmiin →",
    hasComingSoon: false,
    programs: [
      {
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        description: "Rakenna organisaatiosi oppimiskulttuuri ja johda osaamista strategisesti – tulokset näkyvät tiimin suorituskyvyssä.",
        badge: { text: "Ajankohtainen", emoji: "🔥" },
        roles: ["esihenkilö", "johtaja"],
      },
      {
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        description: "Käytännön työkalut esihenkilötyöhön – kehityt johtajana ja tiimisi kehittyy kanssasi.",
        badge: { text: "Suosituin", emoji: "🏅" },
        roles: ["esihenkilö", "uudistuja"],
      },
      {
        label: "Räätälöidyt valmennukset kunnille ja yrityksille",
        href: "#raataloidyt",
        description: "Räätälöimme valmennuksen juuri teidän organisaationne tarpeisiin – ota yhteyttä niin suunnitellaan yhdessä.",
        roles: ["esihenkilö", "johtaja"],
      },
      {
        label: "Puitesopimukset",
        href: "#puitesopimukset",
        description: "Pitkäjänteinen kumppanuus osaamisen kehittämiseen – joustava ja kustannustehokas ratkaisu organisaatioille.",
        roles: ["johtaja"],
      },
      {
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
        description: "Yhdistä käytännön osaaminen ja tunnustettu tutkinto – eteneminen on mahdollista työn ohessa.",
        roles: ["johtaja"],
      },
    ],
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-koulutukset",
    image: solutionAi,
    icon: Brain,
    valueProposition:
      "Opi hyödyntämään tekoälyä omalla tasollasi – strategisesta johtamisesta käytännön käyttöönottoon. Valitse roolisi ja ala rakentaa tekoälyosaamista tänään.",
    cta: "Löydä oma tasosi →",
    hasComingSoon: true,
    programs: [
      {
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        description: "Johda organisaatiosi tekoälysiirtymää strategisesti – rakennat vision, päätöksenteon ja kilpailukyvyn tekoälyn varaan.",
        badge: { text: "Ajankohtainen", emoji: "🔥" },
        roles: ["johtaja"],
      },
      {
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        description: "Ota tekoäly osaksi jokapäiväistä johtamistyötäsi – konkreettiset työkalut ja tavat heti käyttöön.",
        badge: { text: "Suosituin", emoji: "🏅" },
        roles: ["asiantuntija", "esihenkilö", "uudistuja"],
      },
      {
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
        description: "Viet tekoälyn käytännön tasolle tiimissäsi – opit koordinoimaan käyttöönoton sujuvasti.",
        roles: ["asiantuntija", "uudistuja"],
      },
      {
        label: "Hyper Engineering (FI)",
        href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
        description: "Rakennat syvän teknisen tekoälyosaamisen ja opit soveltamaan sitä vaativissa asiantuntijatehtävissä.",
        roles: ["asiantuntija", "uudistuja"],
      },
      {
        label: "Hyper Engineering (EN)",
        href: "https://www.keuda.fi/en/training/hyper-engineering-program-en/",
        description: "Build deep technical AI competence and learn to apply it in demanding expert roles.",
        roles: ["asiantuntija", "uudistuja"],
      },
    ],
  },
  {
    id: "turvallisuus",
    title: "Turvallisuus- ja vastuullisuus-johtamisen koulutukset",
    image: solutionSafety,
    icon: Shield,
    valueProposition:
      "Tee turvallisuudesta kilpailuetu ja vastuullisuudesta johtamisen ydin – ohjelmilla jotka on rakennettu turvallisuuspäälliköille, asiantuntijoille ja johtajille.",
    cta: "Tutustu turvallisuusohjelmiin →",
    hasComingSoon: true,
    programs: [
      {
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        description: "Kehitä turvallisuusosaamistasi ja vahvista roolisi organisaation turvallisuuskulttuurin rakentajana.",
        badge: { text: "Suosituin", emoji: "🏅" },
        roles: ["asiantuntija"],
      },
    ],
  },
];

/* ── Coming Soon Box ── */
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
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
        <p className="text-sm font-medium text-primary-foreground">
          Kiitos! Saat tiedon heti kun ohjelma avautuu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-primary/30 p-4" style={{ background: "hsl(215 25% 18% / 0.6)" }}>
      <p className="text-xs font-semibold text-background mb-1">
        Tulossa pian – ilmoittaudu kiinnostuneeksi
      </p>
      <p className="text-xs mb-3" style={{ color: "hsl(210 15% 65%)" }}>
        Saat tiedon heti kun ohjelma avautuu.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(210 15% 55%)" }} />
          <Input
            type="email"
            placeholder="Sähköpostiosoite"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 h-9 text-sm bg-foreground border-primary/20 text-background placeholder:text-muted-foreground"
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

/* ── Program Card ── */
function ProgramCard({ program, categoryIcon: Icon }: { program: Program; categoryIcon: typeof BookOpen }) {
  const [hovered, setHovered] = useState(false);
  const isExternal = program.href.startsWith("http");

  return (
    <a
      href={program.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "relative block rounded-xl border overflow-hidden h-44 group transition-all duration-200",
        hovered ? "border-primary/50" : "border-primary/15"
      )}
      style={{ background: "hsl(215 25% 18%)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if ("ontouchstart" in window && !hovered) {
          e.preventDefault();
          setHovered(true);
        }
      }}
    >
      {/* Default state */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center text-center p-4 transition-opacity duration-200",
          hovered ? "opacity-0" : "opacity-100"
        )}
      >
        <Icon className="w-6 h-6 text-primary/60 mb-3" />
        <p className="text-sm font-semibold text-background leading-snug px-2">{program.label}</p>
        {program.badge && (
          <Badge className="text-[10px] px-2 py-0.5 h-5 mt-2 bg-primary/20 text-primary-foreground border-primary/30">
            {program.badge.emoji} {program.badge.text}
          </Badge>
        )}
      </div>

      {/* Hover state */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
        style={{ background: "hsl(215 25% 15%)" }}
      >
        <div>
          <p className="text-sm font-bold text-background mb-2 leading-snug">{program.label}</p>
          <div className="w-8 h-px bg-primary/30 mb-2" />
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "hsl(210 15% 65%)" }}>
            {program.description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          Lue lisää <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

/* ── Main Component ── */
export function AlyProgramGrid() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  return (
    <section className="py-8 md:py-12 bg-foreground">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "hsl(210 15% 65%)" }}>
            Kolme kokonaisuutta erilaisiin tarpeisiin – suodata roolisi mukaan tai selaa kaikkia
          </p>

          {/* Role filter bar */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <button
              onClick={() => setActiveRole(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activeRole === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-primary/30 hover:border-primary/50 hover:text-background"
              )}
              style={activeRole !== null ? { color: "hsl(210 15% 65%)" } : undefined}
            >
              Kaikki
            </button>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  activeRole === role.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent border-primary/30 hover:border-primary/50 hover:text-background"
                )}
                style={activeRole !== role.id ? { color: "hsl(210 15% 65%)" } : undefined}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category grids */}
        <div className="space-y-10">
          {categories.map((cat) => {
            const filtered = activeRole
              ? cat.programs.filter((p) => p.roles.includes(activeRole))
              : cat.programs;

            if (filtered.length === 0 && !cat.hasComingSoon) return null;

            return (
              <div key={cat.id} id={cat.id}>
                {/* Category header - dark card with accent left border */}
                <div className="rounded-xl p-5 border-l-4 border-primary" style={{ background: "hsl(215 25% 13%)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-background">{cat.title}</h3>
                      <p className="text-xs italic" style={{ color: "hsl(210 15% 60%)" }}>{cat.valueProposition}</p>
                    </div>
                  </div>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filtered.map((prog) => (
                      <ProgramCard key={prog.label} program={prog} categoryIcon={cat.icon} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm mt-4 italic" style={{ color: "hsl(210 15% 55%)" }}>
                    Ei ohjelmia valitulla roolilla tässä kategoriassa.
                  </p>
                )}

                {cat.hasComingSoon && (
                  <div className="mt-4 max-w-md">
                    <ComingSoonBox />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
