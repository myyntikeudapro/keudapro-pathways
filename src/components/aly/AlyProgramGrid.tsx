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
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium text-primary">
          Kiitos! Saat tiedon heti kun ohjelma avautuu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
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

/* ── Program Card ── */
function ProgramCard({ program, categoryIcon: Icon }: { program: Program; categoryIcon: typeof BookOpen }) {
  const [hovered, setHovered] = useState(false);
  const isExternal = program.href.startsWith("http");

  return (
    <a
      href={program.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="relative block rounded-xl border border-border bg-card overflow-hidden h-44 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Mobile: first tap shows hover, second tap follows link
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
        <p className="text-sm font-semibold text-foreground leading-snug px-2">{program.label}</p>
        {program.badge && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 mt-2">
            {program.badge.emoji} {program.badge.text}
          </Badge>
        )}
      </div>

      {/* Hover state */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-4 bg-primary/5 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div>
          <p className="text-sm font-bold text-foreground mb-2 leading-snug">{program.label}</p>
          <div className="w-8 h-px bg-border mb-2" />
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
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
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Kolme kokonaisuutta erilaisiin tarpeisiin – suodata roolisi mukaan tai selaa kaikkia
          </p>

          {/* Role filter bar */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveRole(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activeRole === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
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
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                )}
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
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{cat.title}</h3>
                    <p className="text-xs italic text-muted-foreground">{cat.valueProposition}</p>
                  </div>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filtered.map((prog) => (
                      <ProgramCard key={prog.label} program={prog} categoryIcon={cat.icon} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4 italic">
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
