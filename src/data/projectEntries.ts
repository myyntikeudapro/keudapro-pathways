// Hankekohtainen sisältö white-label-sisääntulosivuille (/hub/<project>).
// Uusi asiakas = uusi objekti tähän + rivi arproEntries.ts:ään. ARPRO-ydin ei muutu.
import heroTyoelamaverkko from "@/assets/hub-arpro-2.jpg";

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
  organizations: string[];
  logoSlots: string[]; // virallisten tunnusten paikat, oikeat tiedostot lisätään myöhemmin
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
    audience: "Maksuton palvelu hankkeen työnhakijoille ja valmentajille",
    heroImage: heroTyoelamaverkko,
    heroImageAlt: "Ihmisiä keskustelemassa työstä ja osaamisesta",
    organizations: ["Jyväskylän kaupunki", "Gradia", "Jyväskylän yliopisto", "Muuramen kunta"],
    logoSlots: ["ESR+ -tunnus", "EU-tunnus", "Rahoittajan tunnus"],
    privacyUrl: null,
    seoTitle: "Työelämäverkko – Osaaminen näkyväksi | Jyväskylä ja Muurame",
    seoDescription:
      "Työelämäverkko auttaa tunnistamaan osaamisesi ja löytämään työmahdollisuuksia Jyväskylän ja Muuramen alueelta.",
  },
};
