// Yksi tietolähde M1-ilmastointipätevyyskoulutuksen päiville, hinnalle ja paikkatilanteelle.
export type SeatStatus = "avoinna" | "vahaan_paikkoja" | "taynna" | "peruttu";

export const ILMASTOINTI_M1 = {
  slug: "ilmastointipatevyys-m1-mantsala",
  path: "/koulutukset/ilmastointipatevyys-m1-mantsala",
  name: "Ajoneuvojen ilmastointipätevyyskoulutus M1 – Mäntsälä",
  shortName: "M1-ilmastointipätevyys",
  category: "Pätevyyskoulutukset",
  duration: "1 päivä",
  hours: "8.00–16.00",
  place: "Keuda, Mäntsälä",
  priceText: "320 € + alv / osallistuja",
  minParticipants: 5,
  maxParticipants: 12,
  closesDaysBefore: 14,
  seoTitle: "Ilmastointipätevyyskoulutus M1 Mäntsälä | KeudaPRO",
  seoDescription:
    "Yhden päivän M1-ilmastointipätevyyskoulutus ajoneuvoalan ammattilaisille Mäntsälässä. 320 € + alv. Kuusi toteutusta 12/2026–5/2027. Valitse päivä ja ilmoittaudu.",
  sessions: [
    { id: 1, date: "2026-12-01", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 2, date: "2027-01-12", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 3, date: "2027-02-02", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 4, date: "2027-03-02", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 5, date: "2027-04-06", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 6, date: "2027-05-04", weekday: "tiistai", status: "avoinna" as SeatStatus },
  ],
};

/** Julkaisulupa: pidä false, kunnes Heikki on hyväksynnyt sivun ja [täydennä]-kohdat. */
export const ILMASTOINTI_M1_PUBLISHED = false;

/** Sivu näkyy julkaisemattomana vain esikatselussa ja paikallisesti. */
export function isPreviewHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host.includes("lovableproject.com") || host.startsWith("id-preview--") || host.includes("preview--");
}

export function isIlmastointiVisible(host = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  return ILMASTOINTI_M1_PUBLISHED || isPreviewHost(host);
}

export const STATUS_LABEL: Record<SeatStatus, string> = {
  avoinna: "Paikkoja vapaana",
  vahaan_paikkoja: "Muutama paikka jäljellä",
  taynna: "Täynnä",
  peruttu: "Peruttu",
};

export function formatFiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}`;
}

/** Helsingin kalenteripäivä muodossa YYYY-MM-DD. */
export function helsinkiToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(now);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

/** Ilmoittautuminen päättyy 14 vuorokautta ennen koulutuspäivää; täydet ja perutut eivät ole valittavissa. */
export function isSessionOpen(session: { date: string; status: SeatStatus }, now = new Date()): boolean {
  if (session.status === "taynna" || session.status === "peruttu") return false;
  return daysBetween(helsinkiToday(now), session.date) >= ILMASTOINTI_M1.closesDaysBefore;
}

/** URL-parametrin ?pvm= esitäyttö hyväksytään vain avoimelle toteutukselle. */
export function prefillDate(param: string | null, now = new Date()): string {
  if (!param) return "";
  const s = ILMASTOINTI_M1.sessions.find((x) => x.date === param);
  return s && isSessionOpen(s, now) ? s.date : "";
}
