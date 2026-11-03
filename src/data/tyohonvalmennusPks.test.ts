import { describe, it, expect } from "vitest";
import service from "./tyohonvalmennusPks.json";

describe("PKS-yksilövalmennuksen palveluehdot", () => {
  it("on maksuton", () => expect(service.priceEuros).toBe(0));
  it("kestää 1–9 kuukautta", () => expect(service.durationMonths).toEqual({ min: 1, max: 9 }));
  it("koskee Helsingin, Espoon ja Vantaan asiakkaita", () => expect(service.cities).toEqual(["Helsinki", "Espoo", "Vantaa"]));
  it("edellyttää oman asiantuntijan ohjausta", () => expect(service.registrationChannel).toBe("employment_expert"));
  it("valmentaja ottaa yhteyttä seuraavana arkipäivänä", () => expect(service.contactWithinBusinessDays).toBe(1));
  it("palvelee kolmella kielellä", () => expect(service.languages).toEqual(["suomi", "ruotsi", "englanti"]));
});