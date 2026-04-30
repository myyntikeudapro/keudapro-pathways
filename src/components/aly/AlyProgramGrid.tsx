import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

import progOsaaminen from "@/assets/prog-osaaminen.jpg";
import progJohtaminen from "@/assets/prog-johtaminen.jpg";
import progTutkinnot from "@/assets/prog-tutkinnot.jpg";
import progAiDirector from "@/assets/prog-ai-director.jpg";
import progAiManager from "@/assets/prog-ai-manager.jpg";
import progAiCoordinator from "@/assets/prog-ai-coordinator.jpg";
import progHyperEngineering from "@/assets/prog-hyper-engineering.jpg";
import progTurvallisuus from "@/assets/prog-turvallisuus.jpg";

/* ── Types ── */
type Role = "asiantuntija" | "esihenkilö" | "johtaja" | "uudistuja";
type LeadershipTag = "Ajattelu" | "Taidot" | "Työkalut" | "Kulttuuri";

type Program = {
  label: string;
  href: string;
  description: string;
  image: string;
  roles: Role[];
  cta: string;
  isInternal?: boolean;
  leadershipTags?: LeadershipTag[];
  alsoAvailable?: string;
  comingSoon?: boolean;
};

type Category = {
  id: string;
  title: string;
  valueProposition: string;
  programs: Program[];
  comingSoonCard?: {
    title: string;
    description: string;
    cta: string;
  };
};

/* ── Roles ── */
const roles: { id: Role; label: string }[] = [
  { id: "asiantuntija", label: "Asiantuntija" },
  { id: "esihenkilö", label: "Esihenkilö" },
  { id: "johtaja", label: "Johtaja" },
  { id: "uudistuja", label: "Uudistuja" },
];

/* ── Leadership sub-filter ── */
const leadershipTags: LeadershipTag[] = ["Ajattelu", "Taidot", "Työkalut", "Kulttuuri"];

/* ── Data ── */
const categories: Category[] = [
  {
    id: "valmennusohjelmat",
    title: "Johtamisen koulutukset",
    valueProposition:
      "Kehitä johtamisotettasi ja kasva esihenkilönä, joka saa tiimin kukoistamaan – käytännön valmennuksilla jotka näkyvät arjessa heti.",
    programs: [
      {
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        description:
          "Käytännön työkalut esihenkilötyöhön – kehityt johtajana ja tiimisi kehittyy kanssasi.",
        image: progJohtaminen,
        roles: ["esihenkilö", "uudistuja"],
        cta: "Katso sisältö →",
        leadershipTags: ["Ajattelu", "Taidot"],
        alsoAvailable: "Räätälöity valmennus · Puitesopimus",
      },
      {
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        description:
          "Rakenna organisaatiosi oppimiskulttuuri ja johda osaamista strategisesti – tulokset näkyvät tiimin suorituskyvyssä.",
        image: progOsaaminen,
        roles: ["esihenkilö", "johtaja"],
        cta: "Tutustu ohjelmaan →",
        leadershipTags: ["Kulttuuri", "Taidot"],
      },
      {
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
        description:
          "Yhdistä käytännön osaaminen ja tunnustettu tutkinto – eteneminen on mahdollista työn ohessa.",
        image: progTutkinnot,
        roles: ["asiantuntija", "uudistuja"],
        cta: "Tutustu tutkintoihin →",
        leadershipTags: ["Taidot", "Ajattelu"],
      },
    ],
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-koulutukset",
    valueProposition:
      "Opi hyödyntämään tekoälyä omalla tasollasi – strategisesta johtamisesta käytännön käyttöönottoon. Valitse roolisi ja ala rakentaa tekoälyosaamista tänään.",
    programs: [
      {
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        description:
          "Johda organisaatiosi tekoälysiirtymää strategisesti – rakennat vision, päätöksenteon ja kilpailukyvyn tekoälyn varaan.",
        image: progAiDirector,
        roles: ["johtaja"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        description:
          "Ota tekoäly osaksi jokapäiväistä johtamistyötäsi – konkreettiset työkalut ja tavat heti käyttöön.",
        image: progAiManager,
        roles: ["esihenkilö", "johtaja"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
        description:
          "Viet tekoälyn käytännön tasolle tiimissäsi – opit koordinoimaan käyttöönoton sujuvasti.",
        image: progAiCoordinator,
        roles: ["asiantuntija", "esihenkilö"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "Hyper Engineering (FI)",
        href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
        description:
          "Rakennat syvän teknisen tekoälyosaamisen ja opit soveltamaan sitä vaativissa asiantuntijatehtävissä.",
        image: progHyperEngineering,
        roles: ["asiantuntija", "uudistuja"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "Hyper Engineering (EN)",
        href: "https://www.keuda.fi/en/training/hyper-engineering-program-en/",
        description:
          "Build deep technical AI competence and learn to apply it in demanding expert roles.",
        image: progHyperEngineering,
        roles: ["asiantuntija", "uudistuja"],
        cta: "Learn more →",
      },
    ],
    comingSoonCard: {
      title: "Uusi AI-ohjelma tulossa 2026",
      description: "Ilmoittaudu kiinnostuneeksi — saat tiedon ensimmäisten joukossa.",
      cta: "Ilmoittaudu kiinnostuneeksi →",
    },
  },
  {
    id: "turvallisuus",
    title: "Turvallisuusjohtamisen koulutukset",
    valueProposition:
      "Tee turvallisuudesta kilpailuetu ja vastuullisuudesta johtamisen ydin – ohjelmilla jotka on rakennettu turvallisuuspäälliköille, asiantuntijoille ja johtajille.",
    programs: [
      {
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        description:
          "Kehitä turvallisuusosaamistasi ja vahvista roolisi organisaation turvallisuuskulttuurin rakentajana.",
        image: progTurvallisuus,
        roles: ["asiantuntija", "esihenkilö"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "Turvallisuusjohtaja 2.6 -valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuusjohtaja-2-6/",
        description:
          "Strategisen turvallisuusjohtamisen valmennus johtajille – rakennat kokonaisvaltaisen turvallisuuskulttuurin ja viet sen osaksi liiketoiminnan johtamista.",
        image: progTurvallisuus,
        roles: ["johtaja", "esihenkilö"],
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "Luotettavuuspäällikkö (AI)",
        href: "/yhteystiedot",
        description:
          "Johda tekoälyjärjestelmien luotettavuutta, läpinäkyvyyttä ja eettistä käyttöä organisaatiossasi – uusi erikoisohjelma tulossa 2026.",
        image: progTurvallisuus,
        roles: ["johtaja", "asiantuntija"],
        cta: "Ilmoittaudu kiinnostuneeksi →",
        isInternal: true,
        comingSoon: true,
      },
    ],
  },
];

/* ── Brand colors (from spec) ── */
const C = {
  ink: "#00232B",
  paper: "#FFFFFA",
  accent: "#FFBC3C",
  surface: "#F1F3F3",
  border: "#D9DEDE",
  subtle: "#5A6A6E",
};

/* ── Coming Soon Card (AI category) ── */
function ComingSoonCard({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div
      className="flex flex-col rounded-lg p-6"
      style={{ border: `1px dashed ${C.accent}`, background: C.surface }}
    >
      <p className="text-base font-bold mb-2" style={{ color: C.ink }}>
        {title}
      </p>
      <p className="text-sm mb-4" style={{ color: C.subtle }}>
        {description}
      </p>
      {submitted ? (
        <p className="text-sm font-medium" style={{ color: C.ink }}>
          Kiitos! Saat tiedon heti kun ohjelma avautuu.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-auto">
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: C.subtle }}
            />
            <Input
              type="email"
              placeholder="Sähköpostiosoite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-10 text-sm"
              style={{ background: C.paper, borderColor: C.border, color: C.ink }}
              required
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-md text-sm font-semibold transition-colors"
            style={{ background: C.ink, color: C.paper }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.accent;
              e.currentTarget.style.color = C.ink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.ink;
              e.currentTarget.style.color = C.paper;
            }}
          >
            {cta}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Program Card ── */
function ProgramCard({ program }: { program: Program }) {
  const isExternal = program.href.startsWith("http");
  const cardClass =
    "group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md";
  const cardStyle: React.CSSProperties = {
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    background: C.paper,
  };

  const ctaClass =
    "inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold transition-colors mt-auto aly-cta";

  const ctaInner = program.isInternal ? (
    <Link
      to={program.href}
      className={ctaClass}
      style={{ background: C.ink, color: C.paper }}
    >
      {program.cta}
    </Link>
  ) : (
    <a
      href={program.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={ctaClass}
      style={{ background: C.ink, color: C.paper }}
    >
      {program.cta}
    </a>
  );

  return (
    <div className={cardClass} style={cardStyle}>
      <div className="relative h-[160px] overflow-hidden flex-shrink-0">
        <img
          src={program.image}
          alt={program.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          width={768}
          height={512}
        />
        {program.comingSoon && (
          <span
            className="absolute top-3 left-3 px-2 py-1 text-[11px] font-bold rounded"
            style={{ background: C.accent, color: C.ink }}
          >
            Tulossa 2026
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1" style={{ padding: 24 }}>
        <h4 className="text-base font-bold mb-2 leading-snug" style={{ color: C.ink }}>
          {program.label}
        </h4>
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: C.subtle }}>
          {program.description}
        </p>

        {program.alsoAvailable && (
          <div
            className="rounded px-3 py-2 mb-3"
            style={{ background: C.surface, color: C.subtle, fontSize: 13 }}
          >
            <span className="font-medium">Saatavilla myös:</span> {program.alsoAvailable}
          </div>
        )}

        {ctaInner}
      </div>
    </div>
  );
}

/* ── Pill button (filters) ── */
function Pill({
  active,
  onClick,
  children,
  variant = "role",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "role" | "leadership";
}) {
  const baseStyle: React.CSSProperties =
    variant === "role"
      ? active
        ? { background: C.accent, color: C.ink, border: `1px solid ${C.accent}` }
        : { background: C.surface, color: C.ink, border: `1px solid ${C.border}` }
      : active
      ? { background: C.accent, color: C.ink, border: `1px solid ${C.accent}` }
      : { background: "transparent", color: C.ink, border: `1px solid ${C.border}` };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
      )}
      style={baseStyle}
    >
      {children}
    </button>
  );
}

/* ── Main Component ── */
export function AlyProgramGrid() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeLeadershipTag, setActiveLeadershipTag] = useState<LeadershipTag | null>(null);

  return (
    <section className="py-8 md:py-12" style={{ fontFamily: "'Titillium Web', Inter, system-ui, sans-serif" }}>
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.ink }}>
            Valitse koulutus kokonaisuudesta
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: C.subtle }}>
            Kolme kokonaisuutta erilaisiin tarpeisiin – suodata roolisi mukaan tai selaa kaikkia
          </p>

          {/* Role filter bar */}
          <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <Pill active={activeRole === null} onClick={() => setActiveRole(null)}>
              Kaikki
            </Pill>
            {roles.map((role) => (
              <Pill
                key={role.id}
                active={activeRole === role.id}
                onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
              >
                {role.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Category grids */}
        <div className="space-y-10">
          {categories.map((cat) => {
            let filtered = activeRole
              ? cat.programs.filter((p) => p.roles.includes(activeRole))
              : cat.programs;

            // Apply leadership sub-filter only to the leadership category
            if (cat.id === "valmennusohjelmat" && activeLeadershipTag) {
              filtered = filtered.filter((p) =>
                p.leadershipTags?.includes(activeLeadershipTag)
              );
            }

            const showComingSoon = !!cat.comingSoonCard;

            if (filtered.length === 0 && !showComingSoon) return null;

            return (
              <div key={cat.id} id={cat.id}>
                {/* Category header */}
                <div
                  className="rounded-lg p-5"
                  style={{ borderLeft: `4px solid ${C.accent}`, background: C.ink }}
                >
                  <h3 className="text-xl font-bold" style={{ color: C.paper }}>
                    {cat.title}
                  </h3>
                  <p className="text-xs italic mt-1" style={{ color: "rgba(255,255,250,0.7)" }}>
                    {cat.valueProposition}
                  </p>
                </div>

                {/* Leadership sub-filter */}
                {cat.id === "valmennusohjelmat" && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Pill
                      active={activeLeadershipTag === null}
                      onClick={() => setActiveLeadershipTag(null)}
                      variant="leadership"
                    >
                      Kaikki
                    </Pill>
                    {leadershipTags.map((tag) => (
                      <Pill
                        key={tag}
                        active={activeLeadershipTag === tag}
                        onClick={() =>
                          setActiveLeadershipTag(activeLeadershipTag === tag ? null : tag)
                        }
                        variant="leadership"
                      >
                        {tag}
                      </Pill>
                    ))}
                  </div>
                )}

                {filtered.length > 0 || showComingSoon ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filtered.map((prog) => (
                      <ProgramCard key={prog.label} program={prog} />
                    ))}
                    {showComingSoon && cat.comingSoonCard && (
                      <ComingSoonCard
                        title={cat.comingSoonCard.title}
                        description={cat.comingSoonCard.description}
                        cta={cat.comingSoonCard.cta}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-center italic mt-6 mb-2" style={{ color: C.subtle }}>
                    Ei ohjelmia tälle roolille tässä kategoriassa – kokeile toista roolia tai selaa
                    kaikkia.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
