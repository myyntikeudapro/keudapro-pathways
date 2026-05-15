import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
  label: string;
  href: string;
  description: string;
  image: string;
  cta: string;
  isInternal?: boolean;
  comingSoon?: boolean;
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
        label: "Johtamisen ja esihenkilötyön valmennukset",
        href: "#esihenkilotyo",
        description:
          "Käytännön työkalut esihenkilötyöhön – kehityt johtajana ja tiimisi kehittyy kanssasi.",
        image: progJohtaminen,
        cta: "Katso sisältö →",
      },
      {
        label: "Osaamisen johtamisen valmennusohjelma",
        href: "#osaamisen-johtaminen",
        description:
          "Rakenna oppimiskulttuuri ja johda osaamista strategisesti – tulokset näkyvät tiimin suorituskyvyssä.",
        image: progOsaaminen,
        cta: "Tutustu ohjelmaan →",
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
        label: "AI-Director – Strateginen tekoälyjohtaminen",
        href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
        description:
          "Johda organisaatiosi tekoälysiirtymää strategisesti – visio, päätöksenteko ja kilpailukyky tekoälyn varaan.",
        image: progAiDirector,
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "AI-Manager – Tekoäly johtamistyössä",
        href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
        description:
          "Ota tekoäly osaksi jokapäiväistä johtamistyötäsi – konkreettiset työkalut heti käyttöön.",
        image: progAiManager,
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "AI-Coordinator – Käyttöönotto ja koordinointi",
        href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
        description:
          "Vie tekoäly käytännön tasolle tiimissäsi – opit koordinoimaan käyttöönoton sujuvasti.",
        image: progAiCoordinator,
        cta: "Tutustu ohjelmaan →",
      },
      {
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
        label: "Turvallisuuspäällikön ja -asiantuntijan valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuuspaallikon-ja-asiantuntijan-valmennusohjelma/",
        description:
          "Kehitä turvallisuusosaamistasi ja vahvista roolisi organisaation turvallisuuskulttuurin rakentajana.",
        image: progTurvallisuusPaallikko,
        cta: "Tutustu ohjelmaan →",
      },
      {
        label: "Turvallisuusjohtaja 2.6 -valmennusohjelma",
        href: "https://www.keuda.fi/koulutus/turvallisuusjohtaja-2-6/",
        description:
          "Strategisen turvallisuusjohtamisen valmennus – kokonaisvaltainen turvallisuuskulttuuri osaksi liiketoiminnan johtamista.",
        image: progTurvallisuusJohtaja,
        cta: "Tutustu ohjelmaan →",
      },
      {
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
        label: "Tutkintotavoitteiset ratkaisut (EAT & AT)",
        href: "#tutkinnot",
        description:
          "Yhdistä käytännön osaaminen ja tunnustettu tutkinto – eteneminen mahdollista työn ohessa.",
        image: progTutkinnot,
        cta: "Tutustu tutkintoihin →",
      },
      {
        label: "Räätälöity valmennus organisaatiolle",
        href: "/yhteystiedot",
        description:
          "Suunnitellaan yhdessä koulutus tai valmennusohjelma, joka vastaa juuri organisaationne tarpeisiin.",
        image: progOsaaminen,
        cta: "Pyydä tarjous →",
        isInternal: true,
      },
      {
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

function ProgramCard({ program }: { program: Program }) {
  const isExternal = program.href.startsWith("http");
  const ctaClass =
    "inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold transition-colors mt-auto bg-foreground text-background hover:bg-foreground/85";

  const cta = program.isInternal ? (
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
    <div className="keuda-card-enhanced p-0 flex flex-col overflow-hidden">
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
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const match = categories.find((c) => c.id === hash);
    if (match) {
      setOpenCategory(match.id);
      setTimeout(() => {
        document.getElementById("aly-kategoriat")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);


  const toggle = (id: string) => setOpenCategory((prev) => (prev === id ? null : id));

  return (
    <section className="py-16 md:py-20 bg-[#E4F0EE]">
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
                          <ProgramCard key={p.label} program={p} />
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
