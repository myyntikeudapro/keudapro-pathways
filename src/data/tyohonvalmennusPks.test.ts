import { describe, it, expect } from "vitest";
import service from "./tyohonvalmennusPks.json";
import { getEmploymentRoute, pksEmploymentLinks } from "./pksEmploymentLinks";

describe("PKS-yksilövalmennuksen palveluehdot", () => {
  it("on maksuton", () => expect(service.priceEuros).toBe(0));
  it("kestää 1–9 kuukautta", () => expect(service.durationMonths).toEqual({ min: 1, max: 9 }));
  it("koskee Helsingin, Espoon ja Vantaan asiakkaita", () => expect(service.cities).toEqual(["Helsinki", "Espoo", "Vantaa"]));
  it("edellyttää oman asiantuntijan ohjausta", () => expect(service.registrationChannel).toBe("employment_expert"));
  it("ei lupaa vahvistamatonta yhteydenoton aikarajaa", () => expect(service.contactWithinBusinessDays).toBeNull());
  it("palvelee kolmella kielellä", () => expect(service.languages).toEqual(["suomi", "ruotsi", "englanti"]));
  it("ei takaa kaikille kokonaan etänä osallistumista", () => expect(service.participation.fullyRemoteGuaranteed).toBe(false));
  it("ei määritä yhteistä viikkotuntimäärää", () => expect(service.participation.fixedWeeklyHours).toBeNull());
  it("ei määritä yhteistä tapaamisrytmiä", () => expect(service.participation.fixedMeetingFrequency).toBeNull());
  it("ei lupaa tuen tarkkaa kestoa työn löytymisen jälkeen", () => expect(service.participation.supportAfterEmploymentMonths).toBeNull());
  it("Asioinnin yhteydenottopyyntö edellyttää voimassa olevaa työnhakua", () => expect(service.entry.asiointiRequirements.activeJobSearch).toBe(true));
  it("Asioinnin yhteydenottopyyntö edellyttää tallennettua puhelinnumeroa", () => expect(service.entry.asiointiRequirements.phoneInContactDetails).toBe(true));
});

describe("Työllisyyspalvelun mukaanpääsyreitit", () => {
  it.each(["Helsinki", "Espoo", "Vantaa"] as const)("%s saa Asioinnin, viestin ja oman kaupungin yhteystiedot", city => {
    expect(getEmploymentRoute(city)).toEqual({ city, showMessage: true, showAsiointi: true, showRegistration: false, showCityAlternatives: false, contactUrl: pksEmploymentLinks.cities[city] });
  });
  it("Muu ohjataan aluesivuille ilman viestiä tai Asiointia", () => {
    expect(getEmploymentRoute("Muu")).toEqual({ city: null, showMessage: false, showAsiointi: false, showRegistration: false, showCityAlternatives: false, contactUrl: "https://tyomarkkinatori.fi/aluesivu" });
  });
  it("En tiedä saa aluesivut ja kaupunkien vaihtoehdot ilman liittymisviestiä", () => {
    expect(getEmploymentRoute("En tiedä")).toEqual({ city: null, showMessage: false, showAsiointi: false, showRegistration: false, showCityAlternatives: true, contactUrl: "https://tyomarkkinatori.fi/aluesivu" });
  });
  it("En ole vielä asiakas saa aluesivut ja viranomaisen ilmoittautumisohjeen", () => {
    expect(getEmploymentRoute("En ole vielä asiakas")).toEqual({ city: null, showMessage: false, showAsiointi: false, showRegistration: true, showCityAlternatives: false, contactUrl: "https://tyomarkkinatori.fi/aluesivu" });
  });
  it("ennen valintaa tarjoaa yleisen aluesivureitin ilman viestipohjaa", () => {
    expect(getEmploymentRoute(null)).toEqual({ city: null, showMessage: false, showAsiointi: false, showRegistration: false, showCityAlternatives: false, contactUrl: "https://tyomarkkinatori.fi/aluesivu" });
  });
});