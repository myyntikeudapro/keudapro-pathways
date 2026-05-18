/**
 * Curated, AI-rankable index of KeudaPRO destinations.
 * Each entry is sent to the smart-search edge function for semantic ranking.
 * Keep titles + keywords in Finnish. Add new entries when new pages/programs ship.
 */
export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
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
    category: "Reitti",
    keywords: ["johtaminen", "johtaja", "esihenkilö", "asiantuntija", "tekoäly", "ai", "muutos", "strategia"],
  },
  {
    id: "route-noste",
    title: "NOSTE – Siirtymät työelämässä",
    description:
      "Työnhakuun, yrittäjyyteen, kotoutumiseen, muutosturvaan ja uudelleenkoulutukseen.",
    href: "/noste",
    category: "Reitti",
    keywords: ["työnhaku", "työllistyminen", "muutosturva", "yrittäjyys", "kotoutuminen", "uudelleenkoulutus", "valmennus", "irtisanottu"],
  },
  {
    id: "route-kasvu",
    title: "KASVU – Yrityksen kasvu ja uudistuminen",
    description:
      "Yrityksille: osaamisen kehittäminen, rekrytointi, digiloikka ja liiketoiminnan uudistuminen.",
    href: "/kasvu",
    category: "Reitti",
    keywords: ["kasvu", "yritys", "skaalaus", "myynti", "rekrytointi", "digiloikka", "uudistuminen", "kasvukartoitus"],
  },

  // ─── ÄLY-ohjelmat ───
  {
    id: "aly-ai-director",
    title: "AI-Director",
    description: "Strateginen tekoälyjohtaminen ja organisaation uudistaminen.",
    href: "/aly#ai-ohjelmat",
    category: "Ohjelma",
    keywords: ["ai", "johtaja", "strategia", "director", "tekoäly", "johto"],
  },
  {
    id: "aly-ai-manager",
    title: "AI-Manager",
    description: "Tekoälyn käyttöönotto esihenkilötyössä ja tiiminvedossa.",
    href: "/aly#ai-ohjelmat",
    category: "Ohjelma",
    keywords: ["ai", "esihenkilö", "manager", "tiimi", "tekoäly"],
  },
  {
    id: "aly-ai-coordinator",
    title: "AI-Coordinator",
    description: "Tekoälyn käytännön hyödyntäminen asiantuntijatyössä.",
    href: "/aly#ai-ohjelmat",
    category: "Ohjelma",
    keywords: ["ai", "asiantuntija", "coordinator", "tekoäly", "työkalut"],
  },
  {
    id: "aly-valmennusohjelmat",
    title: "Johtamisen valmennusohjelmat",
    description: "Johtamisen ja esihenkilötyön valmennukset eri rooleille.",
    href: "/aly#valmennusohjelmat",
    category: "Ohjelma",
    keywords: ["johtaminen", "valmennus", "esihenkilö", "leadership", "tiimi"],
  },
  {
    id: "aly-turvallisuus",
    title: "Turvallisuusjohtaminen",
    description: "Työturvallisuuden ja organisaation turvallisuuden kehittäminen.",
    href: "/aly#turvallisuus",
    category: "Ohjelma",
    keywords: ["turvallisuus", "johtaminen", "riskienhallinta", "työturvallisuus"],
  },

  // ─── Pätevyydet & osaamiskortit ───
  {
    id: "pat-tyoturvallisuus",
    title: "Työturvallisuuskortti",
    description: "Lakisääteinen kortti yhteisille työpaikoille.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["työturvallisuus", "kortti", "rakennus", "teollisuus"],
  },
  {
    id: "pat-tulityo",
    title: "Tulityökortti",
    description: "Tulitöiden tekemiseen vaadittava pätevyys.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["tulityö", "kortti", "hitsaus"],
  },
  {
    id: "pat-sahkotyo",
    title: "Sähkötyöturvallisuus SFS 6002",
    description: "Sähkötöiden turvallisuuspätevyys.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["sähkö", "sfs 6002", "sähkötyö"],
  },
  {
    id: "pat-ea",
    title: "EA1 & EA2 Ensiapukoulutukset",
    description: "Ensiavun perus- ja jatkokurssit.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["ensiapu", "ea1", "ea2", "first aid"],
  },
  {
    id: "pat-hygienia",
    title: "Hygieniapassi",
    description: "Elintarviketyössä vaadittava osaamistodistus.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["hygienia", "passi", "ravintola", "elintarvike"],
  },
  {
    id: "pat-anniskelu",
    title: "Anniskelupassi",
    description: "Anniskeluravintolan vastaavan hoitajan pätevyys.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["anniskelu", "passi", "ravintola", "baari"],
  },
  {
    id: "pat-laakehoito",
    title: "Lääkehoitopassi",
    description: "Lääkehoidon osaamisen todentaminen.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["lääkehoito", "passi", "hoiva", "sote"],
  },
  {
    id: "pat-tyohyvinvointi",
    title: "Työhyvinvointikortti",
    description: "Työhyvinvoinnin perusteet työyhteisöille.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["työhyvinvointi", "kortti", "jaksaminen"],
  },
  {
    id: "pat-3t",
    title: "3T-kortti & Tekoälyn ammattiosaaja",
    description: "AI- ja digitaitojen perusosaamiskortit työelämään.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["3t", "tekoäly", "ai", "digitaidot", "kortti"],
  },
  {
    id: "pat-suomi",
    title: "Suomi työkielenä & Selkosuomi",
    description: "Suomen kielen koulutukset työelämään.",
    href: "/osaaminen",
    category: "Pätevyys",
    keywords: ["suomi", "kieli", "selkosuomi", "kotoutuminen", "maahanmuuttaja"],
  },

  // ─── KASVU-palvelut ───
  {
    id: "kasvu-kartoitus",
    title: "Kasvukartoitus",
    description: "15 min itsearviointi yrityksen kasvun nykytilasta ja seuraavista askeleista.",
    href: "/kasvu#aloita",
    category: "Palvelu",
    keywords: ["kasvukartoitus", "arviointi", "yritys", "kasvu", "kartoitus"],
  },
  {
    id: "kasvu-paths",
    title: "Kasvupolut",
    description: "Räätälöidyt kasvupolut myynnille, skaalaukselle ja uudistumiselle.",
    href: "/kasvu#tilanteet",
    category: "Palvelu",
    keywords: ["kasvupolut", "myynti", "skaalaus", "kasvu"],
  },
  {
    id: "kasvu-ratkaisuperheet",
    title: "Ratkaisuperheet ja digiloikka",
    description: "Tekoälyn ja digitalisaation käyttöönotto yrityksessä.",
    href: "/kasvu#ratkaisuperheet",
    category: "Palvelu",
    keywords: ["digiloikka", "ai", "tekoäly", "ratkaisut", "yritys"],
  },

  // ─── NOSTE-palvelut ───
  {
    id: "noste-muutosturva",
    title: "Muutosturva",
    description: "Tuki ja palvelut irtisanotuille sekä muutostilanteissa.",
    href: "/noste",
    category: "Palvelu",
    keywords: ["muutosturva", "irtisanottu", "lomautus", "ely"],
  },
  {
    id: "noste-yrittajyys",
    title: "Yrittäjyysvalmennus",
    description: "Tuki yrittäjäksi ryhtyville ja kevytyrittäjille.",
    href: "/noste",
    category: "Palvelu",
    keywords: ["yrittäjyys", "yrittäjä", "starttiraha"],
  },
  {
    id: "noste-kotoutuminen",
    title: "Kotoutuminen ja KV-osaajat",
    description: "Suomen kielen ja työelämävalmiuksien tuki maahanmuuttajille.",
    href: "/noste",
    category: "Palvelu",
    keywords: ["kotoutuminen", "maahanmuuttaja", "kv", "kansainvälinen"],
  },

  // ─── Kumppanuus ───
  {
    id: "kumppanit",
    title: "Kumppaniyritykset & UNIIKKI-verkosto",
    description: "Tarjoa koulutuksia tai liity KeudaPROn verkostoon.",
    href: "/kumppanit",
    category: "Kumppanuus",
    keywords: ["kumppani", "uniikki", "yhteistyö", "verkosto", "kouluttaja"],
  },
  {
    id: "verkosto",
    title: "Verkosto ja yhteistyö",
    description: "KUUMA-seudun ja Uudenmaan toimijaverkosto.",
    href: "/verkosto",
    category: "Kumppanuus",
    keywords: ["verkosto", "kuuma", "yhteistyö", "alueellinen"],
  },
  {
    id: "operaattori",
    title: "Operaattori-malli",
    description: "Miten KeudaPRO toimii osaamisen ja siirtymien operaattorina.",
    href: "/operaattori",
    category: "Kumppanuus",
    keywords: ["operaattori", "malli", "rakenne", "toiminta"],
  },

  // ─── Yhteys ───
  {
    id: "yhteys-lomake",
    title: "Yhteydenottolomake",
    description: "Jätä viesti tiimille – vastaamme arkisin.",
    href: "/yhteystiedot#lomake",
    category: "Yhteys",
    keywords: ["yhteydenotto", "lomake", "viesti", "kysymys"],
  },
];
