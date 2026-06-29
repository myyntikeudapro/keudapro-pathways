/**
 * Curated, AI-rankable index of KeudaPRO destinations.
 * Each entry is sent to the smart-search edge function for semantic ranking.
 * Keep titles + keywords in Finnish. Add new entries when new pages/programs ship.
 */
import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";
import progAiDirector from "@/assets/prog-ai-director.jpg";
import progAiManager from "@/assets/prog-ai-manager.jpg";
import progAiCoordinator from "@/assets/prog-ai-coordinator.jpg";
import progJohtaminen from "@/assets/prog-johtaminen.jpg";
import progTurvallisuus from "@/assets/prog-turvallisuus.jpg";
import courseTyoturvallisuus from "@/assets/course-tyoturvallisuus.jpg";
import courseTulityo from "@/assets/course-tulityo.jpg";
import courseEa1 from "@/assets/course-ea1.jpg";
import courseHygienia from "@/assets/course-hygienia.jpg";
import courseAnniskelu from "@/assets/course-anniskelu.jpg";
import courseTyohyvinvointi from "@/assets/course-tyohyvinvointi.jpg";
import course3t from "@/assets/course-3t.jpg";
import courseKieli from "@/assets/course-kieli.jpg";
import kasvuKirkastus from "@/assets/kasvu-kirkastus.jpg";
import kasvuSprintit from "@/assets/kasvu-sprintit.jpg";
import kasvuDigi from "@/assets/kasvu-digi.jpg";
import nosteTransition from "@/assets/noste-transition.jpg";
import nosteEntrepreneur from "@/assets/noste-entrepreneur.jpg";
import nosteKv from "@/assets/course-kv.jpg";
import partnerNetwork from "@/assets/partner-network.jpg";
import operatorNetwork from "@/assets/operator-network.jpg";
import operatorKuuma from "@/assets/operator-kuuma.jpg";
import contactHero from "@/assets/contact-hero-1.jpg";

export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Optional external (e.g. keuda.fi) info page for the product/course. */
  externalHref?: string;
  image: string;
  category:
    | "Reitti"
    | "Ohjelma"
    | "Pätevyys"
    | "Palvelu"
    | "Kumppanuus"
    | "Yhteys";
  keywords: string[];
};


export const searchIndex: SearchEntry[] = [
  // ─── Reitit ───
  {
    id: "route-aly",
    title: "ÄLY – Johtaminen, asiantuntijuus ja tekoäly",
    description:
      "Johtajille, esihenkilöille ja asiantuntijoille: johtamiskoulutukset, AI-ohjelmat ja muutosvalmennukset.",
    href: "/aly",
    image: routeAly,
    category: "Reitti",
    keywords: ["johtaminen", "johtaja", "esihenkilö", "asiantuntija", "tekoäly", "ai", "muutos", "strategia"],
  },
  {
    id: "route-noste",
    title: "NOSTE – Siirtymät työelämässä",
    description:
      "Työnhakuun, yrittäjyyteen, kotoutumiseen, muutosturvaan ja uudelleenkoulutukseen.",
    href: "/noste",
    image: routeNoste,
    category: "Reitti",
    keywords: ["työnhaku", "työllistyminen", "muutosturva", "yrittäjyys", "kotoutuminen", "uudelleenkoulutus", "valmennus", "irtisanottu"],
  },
  {
    id: "route-kasvu",
    title: "KASVU – Yrityksen kasvu ja uudistuminen",
    description:
      "Yrityksille: osaamisen kehittäminen, rekrytointi, digiloikka ja liiketoiminnan uudistuminen.",
    href: "/kasvu",
    image: routeKasvu,
    category: "Reitti",
    keywords: ["kasvu", "yritys", "skaalaus", "myynti", "rekrytointi", "digiloikka", "uudistuminen", "kasvukartoitus"],
  },

  // ─── ÄLY-ohjelmat ───
  {
    id: "aly-ai-director",
    title: "AI-Director",
    description: "Strateginen tekoälyjohtaminen ja organisaation uudistaminen.",
    href: "/aly#prog-ai-director",
    externalHref: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
    image: progAiDirector,
    category: "Ohjelma",
    keywords: ["ai", "johtaja", "strategia", "director", "tekoäly", "johto", "ceo", "johtoryhmä"],
  },
  {
    id: "aly-ai-manager",
    title: "AI-Manager",
    description: "Tekoälyn käyttöönotto esihenkilötyössä ja tiiminvedossa.",
    href: "/aly#prog-ai-manager",
    externalHref: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
    image: progAiManager,
    category: "Ohjelma",
    keywords: ["ai", "esihenkilö", "manager", "tiimi", "tekoäly", "tekoälypäällikkö"],
  },
  {
    id: "aly-ai-coordinator",
    title: "AI-Coordinator",
    description: "Tekoälyn käytännön hyödyntäminen asiantuntijatyössä.",
    href: "/aly#prog-ai-coordinator",
    externalHref: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
    image: progAiCoordinator,
    category: "Ohjelma",
    keywords: ["ai", "asiantuntija", "coordinator", "tekoäly", "työkalut", "tekoälykoordinaattori"],
  },
  {
    id: "aly-hyper-engineering",
    title: "Hyper Engineering Program",
    description: "Insinöörien ja teknisen alan ammattilaisten tekoälyvalmennus.",
    href: "/aly#prog-hyper-engineering",
    externalHref: "https://www.keuda.fi/koulutus/hyper-engineering-program-fi/",
    image: progAiCoordinator,
    category: "Ohjelma",
    keywords: ["hyper", "engineering", "insinööri", "tekninen", "ai", "tekoäly", "tuotekehitys"],
  },

  {
    id: "aly-valmennusohjelmat",
    title: "Johtamisen valmennusohjelmat",
    description: "Johtamisen ja esihenkilötyön valmennukset eri rooleille.",
    href: "/aly#esihenkilo-johtaminen",
    image: progJohtaminen,
    category: "Ohjelma",
    keywords: ["johtaminen", "valmennus", "esihenkilö", "leadership", "tiimi"],
  },
  {
    id: "aly-turvallisuus",
    title: "Turvallisuusjohtaminen",
    description: "Työturvallisuuden ja organisaation turvallisuuden kehittäminen.",
    href: "/aly#turvallisuusjohtaminen",
    image: progTurvallisuus,
    category: "Ohjelma",
    keywords: ["turvallisuus", "johtaminen", "riskienhallinta", "työturvallisuus"],
  },

  // ─── Pätevyydet & osaamiskortit ───
  {
    id: "pat-tyoturvallisuus",
    title: "Työturvallisuuskortti",
    description: "Lakisääteinen kortti yhteisille työpaikoille.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/tyoturvallisuuskortti-koulutus/",
    image: courseTyoturvallisuus,
    category: "Pätevyys",
    keywords: ["työturvallisuus", "kortti", "rakennus", "teollisuus"],
  },
  {
    id: "pat-tulityo",
    title: "Tulityökortti",
    description: "Tulitöiden tekemiseen vaadittava pätevyys.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/tulityokortti-koulutus/",
    image: courseTulityo,
    category: "Pätevyys",
    keywords: ["tulityö", "kortti", "hitsaus"],
  },
  {
    id: "pat-sahkotyo",
    title: "Sähkötyöturvallisuus SFS 6002",
    description: "Sähkötöiden turvallisuuspätevyys.",
    href: "/osaaminen",
    image: courseTyoturvallisuus,
    category: "Pätevyys",
    keywords: ["sähkö", "sfs 6002", "sähkötyö"],
  },
  {
    id: "pat-ea",
    title: "EA1 & EA2 Ensiapukoulutukset",
    description: "Ensiavun perus- ja jatkokurssit.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/spr-ensiapukurssi-ea-1/",
    image: courseEa1,
    category: "Pätevyys",
    keywords: ["ensiapu", "ea1", "ea2", "first aid"],
  },
  {
    id: "pat-hygienia",
    title: "Hygieniapassi",
    description: "Elintarviketyössä vaadittava osaamistodistus.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/hygieniapassitestit-ja-koulutukset/",
    image: courseHygienia,
    category: "Pätevyys",
    keywords: ["hygienia", "passi", "ravintola", "elintarvike"],
  },
  {
    id: "pat-anniskelu",
    title: "Anniskelupassi",
    description: "Anniskeluravintolan vastaavan hoitajan pätevyys.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/anniskelupassikoulutukset-ja-testit/",
    image: courseAnniskelu,
    category: "Pätevyys",
    keywords: ["anniskelu", "passi", "ravintola", "baari"],
  },
  {
    id: "pat-laakehoito",
    title: "Lääkehoitopassi",
    description: "Lääkehoidon osaamisen todentaminen.",
    href: "/osaaminen",
    image: courseEa1,
    category: "Pätevyys",
    keywords: ["lääkehoito", "passi", "hoiva", "sote"],
  },
  {
    id: "pat-tyohyvinvointi",
    title: "Työhyvinvointikortti",
    description: "Työhyvinvoinnin perusteet työyhteisöille.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/tyohyvinvointikortti-koulutus/",
    image: courseTyohyvinvointi,
    category: "Pätevyys",
    keywords: ["työhyvinvointi", "kortti", "jaksaminen"],
  },
  {
    id: "pat-3t",
    title: "3T-kortti & Tekoälyn ammattiosaaja",
    description: "AI- ja digitaitojen perusosaamiskortit työelämään.",
    href: "/osaaminen",
    externalHref: "https://www.keuda.fi/koulutus/3t-kortti/",
    image: course3t,
    category: "Pätevyys",
    keywords: ["3t", "tekoäly", "ai", "digitaidot", "kortti"],
  },
  {
    id: "pat-suomi",
    title: "Suomi työkielenä & Selkosuomi",
    description: "Suomen kielen koulutukset työelämään.",
    href: "/osaaminen",
    image: courseKieli,
    category: "Pätevyys",
    keywords: ["suomi", "kieli", "selkosuomi", "kotoutuminen", "maahanmuuttaja"],
  },


  // ─── KASVU-palvelut ───
  {
    id: "kasvu-kartoitus",
    title: "Kasvukartoitus",
    description: "15 min itsearviointi yrityksen kasvun nykytilasta ja seuraavista askeleista.",
    href: "/kasvu#aloita",
    image: kasvuKirkastus,
    category: "Palvelu",
    keywords: ["kasvukartoitus", "arviointi", "yritys", "kasvu", "kartoitus"],
  },
  {
    id: "kasvu-paths",
    title: "Kasvupolut",
    description: "Räätälöidyt kasvupolut myynnille, skaalaukselle ja uudistumiselle.",
    href: "/kasvu#tilanteet",
    image: kasvuSprintit,
    category: "Palvelu",
    keywords: ["kasvupolut", "myynti", "skaalaus", "kasvu"],
  },
  {
    id: "kasvu-ratkaisuperheet",
    title: "Ratkaisuperheet ja digiloikka",
    description: "Tekoälyn ja digitalisaation käyttöönotto yrityksessä.",
    href: "/kasvu#ratkaisuperheet",
    image: kasvuDigi,
    category: "Palvelu",
    keywords: ["digiloikka", "ai", "tekoäly", "ratkaisut", "yritys"],
  },

  // ─── NOSTE-palvelut ───
  {
    id: "noste-muutosturva",
    title: "Muutosturva",
    description: "Tuki ja palvelut irtisanotuille sekä muutostilanteissa.",
    href: "/noste",
    image: nosteTransition,
    category: "Palvelu",
    keywords: ["muutosturva", "irtisanottu", "lomautus", "ely"],
  },
  {
    id: "noste-yrittajyys",
    title: "Yrittäjyysvalmennus",
    description: "Tuki yrittäjäksi ryhtyville ja kevytyrittäjille.",
    href: "/noste",
    image: nosteEntrepreneur,
    category: "Palvelu",
    keywords: ["yrittäjyys", "yrittäjä", "starttiraha"],
  },
  {
    id: "noste-kotoutuminen",
    title: "Kotoutuminen ja KV-osaajat",
    description: "Suomen kielen ja työelämävalmiuksien tuki maahanmuuttajille.",
    href: "/noste",
    image: nosteKv,
    category: "Palvelu",
    keywords: ["kotoutuminen", "maahanmuuttaja", "kv", "kansainvälinen"],
  },

  // ─── Kumppanuus ───
  {
    id: "kumppanit",
    title: "Kumppaniyritykset & UNIIKKI-verkosto",
    description: "Tarjoa koulutuksia tai liity KeudaPROn verkostoon.",
    href: "/kumppanit",
    image: partnerNetwork,
    category: "Kumppanuus",
    keywords: ["kumppani", "uniikki", "yhteistyö", "verkosto", "kouluttaja"],
  },
  {
    id: "verkosto",
    title: "Verkosto ja yhteistyö",
    description: "KUUMA-seudun ja Uudenmaan toimijaverkosto.",
    href: "/verkosto",
    image: operatorKuuma,
    category: "Kumppanuus",
    keywords: ["verkosto", "kuuma", "yhteistyö", "alueellinen"],
  },
  {
    id: "operaattori",
    title: "Operaattori-malli",
    description: "Miten KeudaPRO toimii osaamisen ja siirtymien operaattorina.",
    href: "/operaattori",
    image: operatorNetwork,
    category: "Kumppanuus",
    keywords: ["operaattori", "malli", "rakenne", "toiminta"],
  },

  // ─── Yhteys ───
  {
    id: "yhteys-lomake",
    title: "Yhteydenottolomake",
    description: "Jätä viesti tiimille – vastaamme arkisin.",
    href: "/yhteystiedot#lomake",
    image: contactHero,
    category: "Yhteys",
    keywords: ["yhteydenotto", "lomake", "viesti", "kysymys"],
  },
];
