import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, Mail } from "lucide-react";

import progOsaaminen from "@/assets/prog-osaaminen.jpg";
import progJohtaminen from "@/assets/prog-johtaminen.jpg";
import progRaataloidyt from "@/assets/prog-raataloidyt.jpg";
import progPuitesopimukset from "@/assets/prog-puitesopimukset.jpg";
import progTutkinnot from "@/assets/prog-tutkinnot.jpg";
import progAiDirector from "@/assets/prog-ai-director.jpg";
import progAiManager from "@/assets/prog-ai-manager.jpg";
import progAiCoordinator from "@/assets/prog-ai-coordinator.jpg";
import progHyperEngineering from "@/assets/prog-hyper-engineering.jpg";
import progTurvallisuus from "@/assets/prog-turvallisuus.jpg";

/* ── Types ── */
type Role = "asiantuntija" | "esihenkilö" | "johtaja" | "uudistuja";

type Program = {
  label: string;
  href: string;
  description: string;
  image: string;
  roles: Role[];
};

type Category = {
  id: string;
  title: string;
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
    valueProposition:
      "Kehitä johtamisotettasi ja kasva esihenkilönä, joka saa tiimin kukoistamaan – käytännön valmennuksilla jotka näkyvät arjessa heti.",
    cta: "Tutustu johtamisen ohjelmiin →",
    hasComingSoon: false,
    programs: [
      {
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        description:
          "Rakenna organisaatiosi oppimiskulttuuri ja johda osaamista strategisesti – tulokset näkyvät tiimin suorituskyvyssä.",
        image: progOsaaminen,
        roles: ["esihenkilö", "johtaja"],
      },
      {
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        description:
          "Käytännön työkalut esihenkilötyöhön – kehityt johtajana ja tiimisi kehittyy kanssasi.",
        image: progJohtaminen,
        roles: ["esihenkilö", "uudistuja"],
      },
      {
        label: "Räätälöidyt valmennukset kunnille ja yrityksille",
        href: "#raataloidyt",
        description:
          "Räätälöimme valmennuksen juuri teidän organisaationne tarpeisiin – ota yhteyttä niin suunnitellaan yhdessä.",
        image: progRaataloidyt,
        roles: ["esihenkilö", "johtaja"],
      },
      {
        label: "Puitesopimukset",
        href: "#puitesopimukset",
        description:
          "Pitkäjänteinen kumppanuus osaamisen kehittämiseen – joustava ja kustannustehokas ratkaisu organisaatioille.",
        image: progPuitesopimukset,
        roles: ["johtaja"],
      },
      {
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
        description:
          "Yhdistä käytännön osaaminen ja tunnustettu tutkinto – eteneminen on mahdollista työn ohessa.",
        image: progTutkinnot,
        roles: ["johtaja"],
      },
    ],
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-koulutukset",
    valueProposition:
      "Opi hyödyntämään tekoälyä omalla tasollasi – strategisesta johtamisesta käytännön käyttöönottoon. Valitse roolisi ja ala rakentaa tekoälyosaamista tänään.",
    cta: "Löydä oma tasosi →",
    hasComingSoon: true,
    programs: [
      {
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        description:
          "Johda organisaatiosi tekoälysiirtymää strategisesti – rakennat vision, päätöksenteon ja kilpailukyvyn tekoälyn varaan.",
        image: progAiDirector,
        roles: ["johtaja"],
      },
      {
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        description:
          "Ota tekoäly osaksi jokapäiväistä johtamistyötäsi – konkreettiset työkalut ja tavat heti käyttöön.",
        image: progAiManager,
        roles: ["asiantuntija", "esihenkilö", "uudistuja"],
      },
      {
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
        description:
          "Viet tekoälyn käytännön tasolle tiimissäsi – opit koordinoimaan käyttöönoton sujuvasti.",
        image: progAiCoordinator,
        roles: ["asiantuntija", "uudistuja"],
      },
      {
        label: "Hyper Engineering (FI)",
        href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
        description:
          "Rakennat syvän teknisen tekoälyosaamisen ja opit soveltamaan sitä vaativissa asiantuntijatehtävissä.",
        image: progHyperEngineering,
        roles: ["asiantuntija", "uudistuja"],
      },
      {
        label: "Hyper Engineering (EN)",
        href: "https://www.keuda.fi/en/training/hyper-engineering-program-en/",
        description:
          "Build deep technical AI competence and learn to apply it in demanding expert roles.",
        image: progHyperEngineering,
        roles: ["asiantuntija", "uudistuja"],
      },
    ],
  },
  {
    id: "turvallisuus",
    title: "Turvallisuus- ja vastuullisuus-johtamisen koulutukset",
    valueProposition:
      "Tee turvallisuudesta kilpailuetu ja vastuullisuudesta johtamisen ydin – ohjelmilla jotka on rakennettu turvallisuuspäälliköille, asiantuntijoille ja johtajille.",
    cta: "Tutustu turvallisuusohjelmiin →",
    hasComingSoon: true,
    programs: [
      {
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        description:
          "Kehitä turvallisuusosaamistasi ja vahvista roolisi organisaation turvallisuuskulttuurin rakentajana.",
        image: progTurvallisuus,
        roles: ["asiantuntija"],
      },
      {
        label: "Turvallisuusjohtaja 2.6 -valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuusjohtaja-2-6/",
        description:
          "Strategisen turvallisuusjohtamisen valmennus johtajille – rakennat kokonaisvaltaisen turvallisuuskulttuurin ja viet sen osaksi liiketoiminnan johtamista.",
        image: progTurvallisuus,
        roles: ["johtaja", "uudistuja"],
      },
    ],
  },
];

/* ── Coming Soon Box (light style) ── */
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
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium text-foreground">
          Kiitos! Saat tiedon heti kun ohjelma avautuu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-muted/50 p-5">
      <p className="text-sm font-semibold text-foreground mb-1">
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
            className="pl-9 h-9 text-sm bg-background border-border"
            required
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-9 text-xs whitespace-nowrap border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          Ilmoittaudu →
        </Button>
      </form>
    </div>
  );
}

/* ── Program Card (light, with photo) ── */
function ProgramCard({ program }: { program: Program }) {
  const isExternal = program.href.startsWith("http");

  return (
    <a
      href={program.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md"
    >
      {/* Photo */}
      <div className="relative h-[160px] overflow-hidden flex-shrink-0">
        <img
          src={program.image}
          alt={program.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          width={768}
          height={512}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h4 className="text-sm font-bold text-card-foreground mb-2 leading-snug">
          {program.label}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
          {program.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline mt-auto">
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
    <section className="py-8 md:py-12">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
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
                  : "bg-foreground text-background border-primary/30 hover:border-primary/50"
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
                    : "bg-foreground text-background border-primary/30 hover:border-primary/50"
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
                {/* Category header */}
                <div
                  className="rounded-xl p-5 border-l-4 border-primary bg-foreground"
                >
                  <h3 className="text-xl font-bold text-background">{cat.title}</h3>
                  <p className="text-xs italic text-background/60 mt-1">
                    {cat.valueProposition}
                  </p>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filtered.map((prog) => (
                      <ProgramCard key={prog.label} program={prog} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground italic mt-6 mb-2">
                    Ei ohjelmia tälle roolille tässä kategoriassa – kokeile toista roolia tai selaa kaikkia.
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
