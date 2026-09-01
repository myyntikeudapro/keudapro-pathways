import progAiCoordinator from "@/assets/prog-ai-coordinator.jpg";
import progAiManagerCard from "@/assets/prog-ai-manager-card.jpg";
import progAiDirector from "@/assets/prog-ai-director.jpg";

export type LevelId = "coordinator" | "manager" | "director";

export type AiLevel = {
  id: LevelId;
  anchor: string;
  name: string;
  fi: string;
  promise: string;
  image: string;
  intro: string;
  audience: string[];
  content: string[];
  quote: string;
  testimonial?: { quote: string; name: string; org: string };
  cta: string;
  href: string;
  event: string;
};

export const AI_LEVELS: AiLevel[] = [
  {
    id: "coordinator",
    anchor: "ai-coordinator",
    name: "AI Coordinator",
    fi: "tekoälykoordinaattori",
    promise: "Käytä ja sovella",
    image: progAiCoordinator,
    intro:
      "AI Coordinator eli tekoälykoordinaattori rakentaa tekoälyosaamista oman työn näkökulmasta: tunnistaa käyttökohteet, rakentaa käytännön ratkaisuja ja auttaa myös muita.",
    audience: [
      "asiantuntijat",
      "esihenkilöt",
      "kehittäjät",
      "henkilöt, jotka haluavat hyödyntää tekoälyä käytännössä ja tukea muita sen käyttöönotossa",
    ],
    content: [
      "tekoälyn hyödyntäminen omassa työssä",
      "käyttökohteiden tunnistaminen",
      "AI-apurit",
      "AI-agentit",
      "työnkulkujen kehittäminen",
      "vastuullinen tekoälyn käyttö",
      "muiden tukeminen",
    ],
    quote:
      "Haluan oppia käyttämään tekoälyä kunnolla omassa työssäni ja rakentamaan sen avulla käytännön ratkaisuja.",
    testimonial: {
      quote:
        "Hyvä, monipuolinen koulutus, jossa tehtiin käytännön parissa ja päivitettiin agentteja. Näimme kattavasti eri tekoälyratkaisuja – emme olleet pelkästään Copilot-tuubissa.",
      name: "Asiantuntijasuunnittelija",
      org: "Lahden kaupunki",
    },
    cta: "Tutustu AI Coordinatoriin",
    href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
    event: "coordinator_cta",
  },
  {
    id: "manager",
    anchor: "ai-manager",
    name: "AI Manager",
    fi: "tekoälypäällikkö",
    promise: "Kehitä ja johda käyttöönottoa",
    image: progAiManagerCard,
    intro:
      "AI Manager eli tekoälypäällikkö vie tekoälyn käytön yksittäisistä kokeiluista osaksi toimintaa: kehittää prosesseja, johtaa käyttöönottoa ja rakentaa osaamista.",
    audience: [
      "kehittäjät",
      "päälliköt",
      "liiketoiminnasta vastaavat",
      "digitalisaation tai kehittämisen vastuuhenkilöt",
    ],
    content: [
      "AI-kehityskohteiden tunnistaminen",
      "tekoälyn käyttöönoton johtaminen",
      "prosessien kehittäminen",
      "automaatiot ja agentit",
      "osaamisen kehittäminen",
      "muutosjohtaminen",
      "vastuullisuuden käytännöt",
    ],
    quote:
      "Meillä käytetään jo tekoälyä, mutta kokeilut pitäisi saada osaksi toimintaa ja kokonaisuutta pitäisi johtaa.",
    cta: "Tutustu AI Manageriin",
    href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
    event: "manager_cta",
  },
  {
    id: "director",
    anchor: "ai-director",
    name: "AI Director",
    fi: "tekoälyjohtaja",
    promise: "Johda strategisesti",
    image: progAiDirector,
    intro:
      "AI Director on tarkoitettu ylimmälle johdolle. Johtajan ei tarvitse olla organisaation paras tekninen tekoälyasiantuntija, mutta hänen pitää pystyä tekemään tekoälyä koskevia päätöksiä.",
    audience: [
      "toimitusjohtajat",
      "johtoryhmän jäsenet",
      "liiketoimintajohto",
      "muut organisaation strategisista linjauksista vastaavat",
    ],
    content: [
      "miten tekoäly muuttaa liiketoimintaa",
      "mihin kannattaa investoida",
      "mitä organisaation kannattaa tehdä itse",
      "millaista osaamista tarvitaan",
      "miten tekoälyä johdetaan",
      "millaisia riskejä ja vastuita syntyy",
      "miten tekoäly vaikuttaa kilpailukykyyn ja strategiaan",
    ],
    quote:
      "Minun pitää johtajana pystyä tekemään tekoälyä koskevia päätöksiä ja ymmärtämään, mihin organisaatiomme pitäisi seuraavaksi mennä.",
    cta: "Tutustu AI Directoriin",
    href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
    event: "director_cta",
  },
];

export const LEVEL_BY_ID = Object.fromEntries(
  AI_LEVELS.map((l) => [l.id, l]),
) as Record<LevelId, AiLevel>;
