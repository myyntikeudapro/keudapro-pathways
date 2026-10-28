import { isPreviewHost } from "@/data/ilmastointiM1";

/** AI Talent pysyy piilossa keudapro.fi:ssä, kunnes Heikki hyväksyy julkaisun. */
export const AI_TALENT_PUBLISHED = true;

export type AiTalentRole = "participant" | "helsinki" | "partner" | "admin";

export const AI_TALENT_ROLES: { value: AiTalentRole; label: string }[] = [
  { value: "participant", label: "Osallistuja" },
  { value: "helsinki", label: "Helsingin työllisyyspalvelut" },
  { value: "partner", label: "Kumppaniyritys" },
  { value: "admin", label: "Ylläpitäjä" },
];

export function isAiTalentVisible(host = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  return AI_TALENT_PUBLISHED || isPreviewHost(host);
}

/** Myöhemmät välilehdet: Materiaalit kaikille, Projektit roolille helsinki/partner/admin, Portfoliot kaikille. */
export function canSeeProjects(role: AiTalentRole | null): boolean {
  return role === "helsinki" || role === "partner" || role === "admin";
}

export function normalizeMemberEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}

export const AI_TALENT_PATH_NAMES: Record<number, string> = {
  1: "AI + myynti ja kaupallinen työ",
  2: "AI + markkinointi ja sisältö",
  3: "AI + asiakaspalvelu ja asiakkuudet",
  4: "AI Operations / AI Project",
  5: "AI + liiketoiminnan uudistaminen ja ratkaisurakentaminen",
};

export const AI_TALENT_PROJECT_STATUSES = ["ehdotus", "avoin", "rajattu", "käynnissä", "valmis"] as const;
export type AiTalentProjectStatus = (typeof AI_TALENT_PROJECT_STATUSES)[number];

/** Partner ehdottaa, admin hallitsee; osallistuja näkee vain omat kiinnitetyt aihionsa (RLS). */
export function canProposeProject(role: AiTalentRole | null): boolean {
  return role === "partner" || role === "admin";
}
