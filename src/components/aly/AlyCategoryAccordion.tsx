import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { ProgramUpdateDialog } from "./ProgramUpdateDialog";

import progOsaaminen from "@/assets/prog-osaaminen.jpg";
import progJohtaminen from "@/assets/prog-johtaminen.jpg";
import progTutkinnot from "@/assets/prog-tutkinnot.jpg";
import progAiDirector from "@/assets/prog-ai-director.jpg";
import progAiManager from "@/assets/prog-ai-manager.jpg";
import progAiCoordinator from "@/assets/prog-ai-coordinator.jpg";
import progHyperEngineering from "@/assets/prog-hyper-engineering.jpg";
import progTurvallisuus from "@/assets/prog-turvallisuus.jpg";
import progTurvallisuusPaallikko from "@/assets/prog-turvallisuus-paallikko.jpg";
import progTurvallisuusJohtaja from "@/assets/prog-turvallisuus-johtaja.jpg";
import progLuotettavuusAi from "@/assets/prog-luotettavuus-ai.jpg";

type Program = {
  slug: string;
  label: string;
  href: string;
  description: string;
  image: string;
  cta: string;
  isInternal?: boolean;
  comingSoon?: boolean;
  updateModal?: boolean;
};

type Category = {
  id: string;
  title: string;
  desc: string;
  intro: string;
  image: string;
  programs: Program[];
};

const categories: Category[] = [
  {
    id: "esihenkilo-johtaminen",
    title: "Esihenkilö- ja johtamiskoulutukset",
    desc: "Esihenkilötyö · Osaamisen johtaminen · Itsensä johtaminen",
    intro:
      "Käytännönläheisiä valmennuksia esihenkilöille ja johtajille — kehitä johtamisotetta ja vahvista tiimin suorituskykyä.",
    image: progJohtaminen,
    programs: [
      {
        slug: "johtamisen-valmennukset",
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        description:
          "Käytännön työkalut esihenkilötyöhön – kehityt johtajana ja tiimisi kehittyy kanssasi.",
        image: progJohtaminen,
        cta: "Katso sisältö →",
        updateModal: true,
      },
      {
        slug: "osaamisen-johtaminen",
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        description:
          "Rakenna oppimiskulttuuri ja johda osaamista strategisesti – tulokset näkyvät tiimin suorituskyvyssä.",
        image: progOsaaminen,
        cta: "Tutustu ohjelmaan →",
        updateModal: true,
      },
    ],
  },
  {
    id: "tekoalypatevyys",
    title: "Tekoälypätevyys-koulutukset",
    desc: "AI-Director · AI-Manager · AI-Coordinator · Hyper Engineering",
    intro:
      "Tekoälyosaaminen rooliisi sopivalla tasolla — strategisesta johtamisesta käytännön käyttöönottoon ja syvälliseen tekniseen osaamiseen.",
    image: progAiManager,
    programs: [
      {
        slug: "ai-director",
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        description:
          "Johda organisaatiosi tekoälysiirtymää strategisesti – visio, päätöksenteko ja kilpailukyky tekoälyn varaan.",
        image: progAiDirector,
        cta: "Tutustu ohjelmaan →",
      },
      {
        slug: "ai-manager",
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        description:
          "Ota tekoäly osaksi jokapäiväistä johtamistyötäsi – konkreettiset työkalut heti käyttöön.",
        image: progAiManager,
        cta: "Tutustu ohjelmaan →",
      },
      {
        slug: "ai-coordinator",
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
        description:
          "Vie tekoäly käytännön tasolle tiimissäsi – opit koordinoimaan käyttöönoton sujuvasti.",
        image: progAiCoordinator,
        cta: "Tutustu ohjelmaan →",
      },
      {
        slug: "hyper-engineering",
        label: "Hyper Engineering (FI / EN)",
        href: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
        description:
          "Rakennat syvän teknisen tekoälyosaamisen ja sovellat sitä vaativissa asiantuntijatehtävissä.",
        image: progHyperEngineering,
        cta: "Tutustu ohjelmaan →",
      },
    ],
  },
  {
    id: "turvallisuusjohtaminen",
    title: "Turvallisuusjohtamisen koulutukset",
    desc: "Turvallisuuspäällikkö · Turvallisuusjohtaja 2.6 · Luotettavuuspäällikkö (AI)",
    intro:
      "Turvallisuudesta kilpailuetu ja vastuullisuudesta johtamisen ydin — ohjelmat turvallisuuspäälliköille, asiantuntijoille ja johtajille.",
    image: progTurvallisuus,
    programs: [
      {
        slug: "turvallisuuspaallikko",
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        description:
          "Kehitä turvallisuusosaamistasi ja vahvista roolisi organisaation turvallisuuskulttuurin rakentajana.",
        image: progTurvallisuusPaallikko,
        cta: "Tutustu ohjelmaan →",
      },
      {
        slug: "turvallisuusjohtaja-26",
        label: "Turvallisuusjohtaja 2.6 -valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuusjohtaja-2-6/",
        description:
          "Strategisen turvallisuusjohtamisen valmennus – kokonaisvaltainen turvallisuuskulttuuri osaksi liiketoiminnan johtamista.",
        image: progTurvallisuusJohtaja,
        cta: "Tutustu ohjelmaan →",
      },
      {
        slug: "luotettavuuspaallikko-ai",
        label: "Luotettavuuspäällikkö (AI)",
        href: "/yhteystiedot",
        description:
          "Johda tekoälyjärjestelmien luotettavuutta, läpinäkyvyyttä ja eettistä käyttöä – uusi erikoisohjelma tulossa 2026.",
        image: progLuotettavuusAi,
        cta: "Ilmoittaudu kiinnostuneeksi →",
        isInternal: true,
        comingSoon: true,
      },
    ],
  },
  {
    id: "muut-asiantuntija",
    title: "Muut asiantuntija- ja osaajakoulutukset",
    desc: "Tutkintotavoitteiset ratkaisut · Räätälöidyt ohjelmat · Puitesopimukset",
    intro:
      "Pidempiä ammatillisia polkuja, tutkintoja ja räätälöityjä ratkaisuja organisaation osaamistarpeisiin.",
    image: progTutkinnot,
    programs: [
      {
        slug: "tutkinnot",
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
        description:
          "Yhdistä käytännön osaaminen ja tunnustettu tutkinto – eteneminen mahdollista työn ohessa.",
        image: progTutkinnot,
        cta: "Tutustu tutkintoihin →",
        updateModal: true,
      },
      {
        slug: "raataloity-valmennus",
        label: "Räätälöity valmennus organisaatiolle",
        href: "/yhteystiedot",
        description:
          "Suunnitellaan yhdessä koulutus tai valmennusohjelma, joka vastaa juuri organisaationne tarpeisiin.",
        image: progOsaaminen,
        cta: "Pyydä tarjous →",
        isInternal: true,
      },
      {
        slug: "puitesopimus",
        label: "Puitesopimuskoulutukset",
        href: "/yhteystiedot",
        description:
          "Pitkäjänteinen kumppanuus osaamisen kehittämiseen — toistuvat valmennukset ja jatkuva tuki.",
        image: progJohtaminen,
        cta: "Kysy lisää →",
        isInternal: true,
      },
    ],
  },
];

function ProgramCard({
  program,
  highlighted,
}: {
  program: Program;
  highlighted?: boolean;
}) {
  const isExternal = program.href.startsWith("http");
  const ctaClass =
    "inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold transition-colors mt-auto bg-foreground text-background hover:bg-foreground/85";

  const cta = program.updateModal ? (
    <ProgramUpdateDialog
      programLabel={program.label}
      trigger={
        <button type="button" className={ctaClass}>
          {program.cta}
        </button>
      }
    />
  ) : program.isInternal ? (
    <Link to={program.href} className={ctaClass}>
      {program.cta}
    </Link>
  ) : (
    <a
      href={program.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={ctaClass}
    >
      {program.cta}
    </a>
  );

  return (
    <div
      id={`prog-${program.slug}`}
      style={{ scrollMarginTop: 100 }}
      className={cn(
        "keuda-card-enhanced p-0 flex flex-col overflow-hidden transition-shadow duration-500",
        highlighted && "ring-2 ring-primary ring-offset-2 shadow-xl"
      )}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={program.image}
          alt={program.label}
          loading="lazy"
          width={768}
          height={512}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {program.comingSoon && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[11px] font-bold rounded bg-secondary text-secondary-foreground">
            Tulossa 2026
          </span>
        )}
        {program.updateModal && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[11px] font-bold rounded bg-secondary text-secondary-foreground">
            Päivittyy
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h4 className="text-base font-bold text-foreground mb-2 leading-snug">{program.label}</h4>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
          {program.description}
        </p>
        {cta}
      </div>
    </div>
  );
}

export function AlyCategoryAccordion() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const location = useLocation();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToCategory = (id: string) => {
    requestAnimationFrame(() => {
      const el = categoryRefs.current[id];
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  };

  const scrollToProgram = (slug: string) => {
    const el = document.getElementById(`prog-${slug}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;

    // Specific program: #prog-<slug>
    if (hash.startsWith("prog-")) {
      const slug = hash.slice("prog-".length);
      const cat = categories.find((c) => c.programs.some((p) => p.slug === slug));
      if (cat) {
        setOpenCategory(cat.id);
        setHighlightedSlug(slug);
        // Wait for category to expand, then scroll to specific card
        setTimeout(() => scrollToProgram(slug), 250);
        const t = setTimeout(() => setHighlightedSlug(null), 2800);
        return () => clearTimeout(t);
      }
    }

    // Category-level hash
    const match = categories.find((c) => c.id === hash);
    if (match) {
      setOpenCategory(match.id);
      setTimeout(() => scrollToCategory(match.id), 100);
    }
  }, [location.hash]);

  useEffect(() => {
    const openFromCta = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      const id = detail?.id;
      if (!id || !categories.some((category) => category.id === id)) return;

      setOpenCategory(id);
      setTimeout(() => scrollToCategory(id), 100);
    };

    window.addEventListener("aly-category-open", openFromCta);
    return () => window.removeEventListener("aly-category-open", openFromCta);
  }, []);


  const toggle = (id: string) =>
    setOpenCategory((prev) => {
      const next = prev === id ? null : id;
      if (next) scrollToCategory(next);
      return next;
    });

  return (
    <section id="aly-kategoriat" className="py-16 md:py-20 bg-[#E4F0EE]">
      <div className="keuda-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mitä koulutusta etsit?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Valitse kategoria — näet siihen kuuluvat ohjelmat ja koulutukset.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {categories.map((cat) => {
            const isActive = openCategory === cat.id;
            const isExpanded = isActive || openCategory === null;
            return (
              <div
                key={cat.id}
                id={cat.id}
                ref={(el) => (categoryRefs.current[cat.id] = el)}
                style={{ scrollMarginTop: 80 }}
                className={cn(
                  "rounded-xl border overflow-hidden bg-card transition-all duration-300",
                  isActive ? "border-primary shadow-lg" : "border-border",
                  !isExpanded && "opacity-60"
                )}
              >
                <button
                  onClick={() => toggle(cat.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  aria-expanded={isActive}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{cat.title}</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {cat.desc}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0",
                      isActive && "rotate-180"
                    )}
                  />
                </button>

                {isActive && (
                  <div className="animate-accordion-down">
                    <div className="relative h-[140px] overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        width={1024}
                        height={576}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25" />
                    </div>
                    <div className="p-5 md:p-6">
                      <p className="italic text-muted-foreground text-sm mb-5">{cat.intro}</p>
                      <div className="grid md:grid-cols-2 gap-6">
                        {cat.programs.map((p) => (
                          <ProgramCard
                            key={p.label}
                            program={p}
                            highlighted={highlightedSlug === p.slug}
                          />
                        ))}
                      </div>
                    </div>
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
