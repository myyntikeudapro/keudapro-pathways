import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";
import coachReitti from "@/assets/coach-reitti.png";
import alisa from "@/assets/alisa-palveluneuvoja.png.asset.json";

export const PKS_COACH_ID = "tyonhakijan-yksilovalmennus-pks";
export const PKS_COACH_AVAILABLE: boolean = true;
// Public activation approved only for the dedicated service page.
export function isPksAllowedOrigin(hostname: string) {
  return ["localhost", "127.0.0.1", "id-preview--372569a7-94e8-4660-8a21-6fa94be31047.lovable.app", "keudapro.fi", "www.keudapro.fi", "keudapro.lovable.app"].includes(hostname);
}
export const PKS_COACH_ENABLED: boolean = PKS_COACH_AVAILABLE && typeof window !== "undefined" && isPksAllowedOrigin(window.location.hostname);
export function isPksPage(pathname: string) {
  return /^\/tyohonvalmennus-pks(?:\/(?:en|sv))?\/?$/.test(pathname);
}

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
    name: "Alisa", role: "Tekoälyavusteinen palveluneuvonta", image: alisa.url,
    description: "Auttaa ymmärtämään Työnhakijan yksilövalmennusta, sen käytäntöjä ja palveluun hakeutumista.",
    greeting: "Hei! Olen Alisa, tekoälyavusteinen palveluneuvojasi. Autan sinua tutustumaan Työnhakijan yksilövalmennukseen. Mistä haluaisit tietää?",
    endpoint: "pks-service-adviser", color: "border-primary", allowBooking: false,
  },
} as const;

export type CoachType = keyof typeof coachRegistry;
export function canOpenCoach(id: CoachType, pksEnabled = PKS_COACH_ENABLED, pathname = typeof window !== "undefined" ? window.location.pathname : "") {
  return id !== PKS_COACH_ID || (pksEnabled && isPksPage(pathname));
}
export function canBookCoach(id: CoachType) {
  return coachRegistry[id].allowBooking;
}
export function getAvailableCoaches() {
  return (Object.keys(coachRegistry) as CoachType[]).filter(id => id !== PKS_COACH_ID && canOpenCoach(id));
}