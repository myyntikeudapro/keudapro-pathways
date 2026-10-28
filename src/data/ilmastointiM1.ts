// Yksi tietolähde M1-ilmastointipätevyyskoulutuksen päiville, hinnalle ja paikkatilanteelle.
export type SeatStatus = "avoinna" | "vahaan_paikkoja" | "taynna" | "peruttu";
export const M1_LYYTI_ENABLED = true;
export const M1_LYYTI_URL = "https://www.lyyti.fi/reg/Ajoneuvojen_ilmastointipatevyyskoulutus_M1landing_page_2645";

export const ILMASTOINTI_M1 = {
  slug: "ilmastointipatevyys-m1-mantsala",
  path: "/koulutukset/ilmastointipatevyys-m1-mantsala",
  name: "Ajoneuvojen ilmastointipätevyyskoulutus M1 – Mäntsälä",
  shortName: "M1-ilmastointipätevyys",
  category: "Pätevyyskoulutukset",
  sisaltaa_kokeen: true,
  todistuksen_myontaja: "Keuda",
  mealsIncluded: { lunch: true, coffee: true },
  invoiceFeeEuros: 6.5,
  cancellationTermsUrl: "https://www.keuda.fi/lyhytkoulutuksen-peruutusehdot/",
  duration: "1 päivä",
  hours: "8.00–16.00",
  place: "Keuda, Mäntsälä",
  priceText: "320 € + alv / osallistuja",
  minParticipants: 5,
  maxParticipants: 12,
  seoTitle: "Ilmastointipätevyyskoulutus M1 Mäntsälä | KeudaPRO",
  seoDescription:
    "Yhden päivän M1-ilmastointipätevyyskoulutus Mäntsälässä, sisältää M1-pätevyyskokeen. 320 € + alv. Kuusi toteutusta 12/2026–5/2027. Valitse päivä ja ilmoittaudu.",
  sessions: [
    { id: 1, date: "2026-12-01", deadline: "2026-11-23", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_2881", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 2, date: "2027-01-12", deadline: "2027-01-04", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_5134", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 3, date: "2027-02-02", deadline: "2027-01-25", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_0324", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 4, date: "2027-03-02", deadline: "2027-02-23", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_4424", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 5, date: "2027-04-06", deadline: "2027-03-29", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_9970", weekday: "tiistai", status: "avoinna" as SeatStatus },
    { id: 6, date: "2027-05-04", deadline: "2027-04-26", registrationUrl: "https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_0810", weekday: "tiistai", status: "avoinna" as SeatStatus },
  ],
};

/** Julkaisulupa: pidä false, kunnes Heikki on hyväksynnyt sivun ja [täydennä]-kohdat. */
export const ILMASTOINTI_M1_PUBLISHED = true;

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

/** Lyytin ilmoittautumispäivä on mukana Helsingin kalenteripäivän loppuun asti. */
export function isSessionOpen(session: { date: string; deadline: string; status: SeatStatus }, now = new Date()): boolean {
  if (session.status === "taynna" || session.status === "peruttu") return false;
  return helsinkiToday(now) <= session.deadline && helsinkiToday(now) < session.date;
}

/** URL-parametrin ?pvm= esitäyttö hyväksytään vain avoimelle toteutukselle. */
export function prefillDate(param: string | null, now = new Date()): string {
  if (!param) return "";
  const s = ILMASTOINTI_M1.sessions.find((x) => x.date === param);
  return s && isSessionOpen(s, now) ? s.date : "";
}
