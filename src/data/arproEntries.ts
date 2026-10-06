// Hankekohtaiset sisääntulot yhteiseen ARPRO-palveluun.
// Uusi asiakas/alue = uusi rivi tähän; ARPRO-ydin pysyy samana.
// Konteksti välitetään URL-parametreina (project, role, source). Parametri on vain
// tunniste – käyttöoikeudet ratkaisee aina ARPRO:n oma kirjautuminen ja roolimalli.

export type ArproRole = "jobseeker" | "coach";

export interface ArproEntry {
  project: string;
  displayName: string; // esim. "Työelämäverkko – ARPRO"
  loginUrls: Record<ArproRole, string>;
}

const ARPRO_BASE = "https://guide-to-awesome-86.lovable.app";

export const arproEntries: Record<string, ArproEntry> = {
  tyoelamaverkko: {
    project: "tyoelamaverkko",
    displayName: "Työelämäverkko – ARPRO",
    loginUrls: {
      // Molemmat näkymät avaavat saman ARPRO-palvelun etusivun, jossa kirjautuminen tapahtuu.
      jobseeker: ARPRO_BASE,
      coach: ARPRO_BASE,
    },
  },
};

export function arproLoginUrl(project: string, role: ArproRole): string {
  const entry = arproEntries[project];
  if (!entry) throw new Error(`Tuntematon ARPRO-hanke: ${project}`);
  const url = new URL(entry.loginUrls[role]);
  url.searchParams.set("project", entry.project);
  url.searchParams.set("role", role);
  url.searchParams.set("source", "keudapro-hub");
  return url.toString();
}
