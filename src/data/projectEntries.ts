// Hankekohtainen sisältö white-label-sisääntulosivuille (/hub/<project>).
// Uusi asiakas = uusi objekti tähän + rivi arproEntries.ts:ään. ARPRO-ydin ei muutu.
import heroTyoelamaverkko from "@/assets/hub-arpro-2.jpg";
import logoEu from "@/assets/logos/eu.svg";
import logoJyvaskyla from "@/assets/logos/jyvaskyla.svg";
import logoGradia from "@/assets/logos/gradia.svg";
import logoJyu from "@/assets/logos/jyu.svg";
import logoMuurame from "@/assets/logos/muurame.png";

export interface Logo { name: string; src: string; tall?: boolean }

export interface ProjectEntry {
  project: string; // sama tunniste kuin arproEntries.ts
  name: string;
  region: string;
  period: string;
  funding: string;
  heroTitle: string;
  heroLead: string;
  audience: string;
  heroImage: string;
  heroImageAlt: string;
  organizations: Logo[];
  funderLogos: Logo[];
  privacyUrl: string | null;
  seoTitle: string;
  seoDescription: string;
}

export const projectEntries: Record<string, ProjectEntry> = {
  tyoelamaverkko: {
    project: "tyoelamaverkko",
    name: "Työelämäverkko",
    region: "Jyväskylä ja Muurame",
    period: "1.8.2026–31.7.2028",
    funding: "ESR+",
    heroTitle: "Osaaminen näkyväksi. Oikeat mahdollisuudet esiin.",
    heroLead:
      "Työelämäverkko auttaa tunnistamaan osaamisesi ja löytämään työmahdollisuuksia Jyväskylän ja Muuramen alueelta.",
    audience: "Hankkeen palvelu työnhakijoille ja valmentajille",
    heroImage: heroTyoelamaverkko,
    heroImageAlt: "Ihmisiä keskustelemassa työstä ja osaamisesta",
    organizations: [
      { name: "Jyväskylän kaupunki", src: logoJyvaskyla },
      { name: "Gradia", src: logoGradia },
      { name: "Jyväskylän yliopisto", src: logoJyu },
      { name: "Muuramen kunta", src: logoMuurame },
    ],
    funderLogos: [{ name: "Euroopan unionin osarahoittama", src: logoEu, tall: true }],
    privacyUrl: null,
    seoTitle: "Työelämäverkko – Osaaminen näkyväksi | Jyväskylä ja Muurame",
    seoDescription:
      "Työelämäverkko auttaa tunnistamaan osaamisesi ja löytämään työmahdollisuuksia Jyväskylän ja Muuramen alueelta.",
  },
};
