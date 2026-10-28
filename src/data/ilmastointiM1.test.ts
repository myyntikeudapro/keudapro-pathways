import { describe, it, expect } from "vitest";
import { ILMASTOINTI_M1, M1_LYYTI_ENABLED, M1_LYYTI_URL, isSessionOpen, prefillDate, isPreviewHost } from "./ilmastointiM1";

describe("M1-ilmoittautuminen", () => {
  it("sisältää lounaan ja kahvit", () => {
    expect(ILMASTOINTI_M1.mealsIncluded).toEqual({ lunch: true, coffee: true });
  });
  it("noudattaa Lyytin linkittämiä Keudan peruutusehtoja", () => {
    expect(ILMASTOINTI_M1.cancellationTermsUrl).toBe("https://www.keuda.fi/lyhytkoulutuksen-peruutusehdot/");
  });
  it("käyttää Lyytissä ilmoitettua laskutuslisää", () => {
    expect(ILMASTOINTI_M1.invoiceFeeEuros).toBe(6.5);
  });
  it("käyttää väliaikaisesti Lyyti-ilmoittautumista", () => {
    expect(M1_LYYTI_ENABLED).toBe(true);
    expect(M1_LYYTI_URL).toBe("https://www.lyyti.fi/reg/Ajoneuvojen_ilmastointipatevyyskoulutus_M1landing_page_2645");
  });
  it.each([
    ["2026-12-01", "2026-11-23", "2881"],
    ["2027-01-12", "2027-01-04", "5134"],
    ["2027-02-02", "2027-01-25", "0324"],
    ["2027-03-02", "2027-02-23", "4424"],
    ["2027-04-06", "2027-03-29", "9970"],
    ["2027-05-04", "2027-04-26", "0810"],
  ])("päivällä %s on Lyytin määräpäivä %s ja oikea linkki", (date, deadline, id) => {
    const session = ILMASTOINTI_M1.sessions.find(s => s.date === date);
    expect(session?.deadline).toBe(deadline);
    expect(session?.registrationUrl).toBe(`https://www.lyyti.in/Ajoneuvojen_ilmastointipatevyyskoulutus_M1_Mantsala_${id}`);
  });
  it("on auki määräpäivän loppuun ja sulkeutuu Helsingin keskiyöllä", () => {
    const session = ILMASTOINTI_M1.sessions[0];
    expect(isSessionOpen(session, new Date("2026-11-23T21:59:59Z"))).toBe(true);
    expect(isSessionOpen(session, new Date("2026-11-23T22:00:00Z"))).toBe(false);
  });
  it("täyttä toteutusta ei voi valita", () => {
    expect(isSessionOpen({ date: "2027-05-04", deadline: "2027-04-26", status: "taynna" }, new Date("2026-10-27T10:00:00Z"))).toBe(false);
    expect(isSessionOpen({ date: "2027-05-04", deadline: "2027-04-26", status: "peruttu" }, new Date("2026-10-27T10:00:00Z"))).toBe(false);
  });
  it("esitäyttää päivän URL-parametrista vain avoimelle toteutukselle", () => {
    const now = new Date("2026-10-27T10:00:00Z");
    expect(prefillDate("2027-02-02", now)).toBe("2027-02-02");
    expect(prefillDate("2027-02-03", now)).toBe("");
  });
  it("julkaisematon sivu ei näy keudapro.fi-osoitteessa", () => {
    expect(isPreviewHost("keudapro.fi")).toBe(false);
    expect(isPreviewHost("keudapro.lovable.app")).toBe(false);
  });
});
