import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";
import coachReitti from "@/assets/coach-reitti.png";

export const PKS_COACH_ID = "tyonhakijan-yksilovalmennus-pks";
// Separate activation gate: registering this member must not activate public AI.
export function isPksPreviewOrigin(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "id-preview--372569a7-94e8-4660-8a21-6fa94be31047.lovable.app";
}
export const PKS_COACH_ENABLED: boolean = typeof window !== "undefined" && isPksPreviewOrigin(window.location.hostname);

export const coachRegistry = {
  ana: {
    name: "Ana", role: "Työhönvalmentaja", image: coachAna,
    description: "Auttaa sinua löytämään suunnan, tunnistamaan osaamisesi ja etenemään kohti työtä.",
    greeting: "Hei! Olen Ana, työhönvalmentajasi. Kerro – missä tilanteessa olet juuri nyt?",
    endpoint: "coach-chat", color: "border-pink-400", allowBooking: true,
  },
  veli: {
    name: "Veli", role: "Osaamisen kehittämisen valmentaja", image: coachVeli,
    description: "Sparraa tekoäly- ja digitaalisen osaamisen kehittämisessä ja ohjelmavalinnoissa.",
    greeting: "Hei! Olen Veli, osaamisen kehittämisen valmentajasi. Mikä osaamiseen liittyvä asia mietityttää sinua juuri nyt?",
    endpoint: "veli-coach-chat", color: "border-amber-400", allowBooking: true,
  },
  reitti: {
    name: "Reittivalmentaja", role: "Ura- ja opinto-ohjaaja", image: coachReitti,
    description: "Auttaa löytämään oikean koulutus- tai urapolun sinun tilanteestasi käsin.",
    greeting: "Hei! Olen reittivalmentajasi – autan sinua löytämään oikean koulutus- tai urapolun. Kerro, missä tilanteessa olet?",
    endpoint: "route-coach-chat", color: "border-teal-400", allowBooking: true,
  },
  [PKS_COACH_ID]: {
    name: "Työnhakijan palveluneuvoja", role: "Tekoälyavusteinen palveluneuvonta", image: null,
    description: "Auttaa ymmärtämään Työnhakijan yksilövalmennusta, sen käytäntöjä ja palveluun hakeutumista.",
    greeting: "Hei! Autan sinua tutustumaan Työnhakijan yksilövalmennukseen. Mistä haluaisit tietää?",
    endpoint: "pks-service-adviser", color: "border-primary", allowBooking: false,
  },
} as const;

export type CoachType = keyof typeof coachRegistry;
export function canOpenCoach(id: CoachType) {
  return id !== PKS_COACH_ID || PKS_COACH_ENABLED;
}
export function canBookCoach(id: CoachType) {
  return coachRegistry[id].allowBooking;
}
export function getAvailableCoaches() {
  return (Object.keys(coachRegistry) as CoachType[]).filter(canOpenCoach);
}