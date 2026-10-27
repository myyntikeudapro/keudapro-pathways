import { describe, it, expect } from "vitest";
import { isSessionOpen, prefillDate, isPreviewHost } from "./ilmastointiM1";

describe("M1-ilmoittautuminen", () => {
  it("on auki tasan 14 vuorokautta ennen koulutuspäivää", () => {
    expect(isSessionOpen({ date: "2026-12-01", status: "avoinna" }, new Date("2026-11-17T10:00:00Z"))).toBe(true);
  });
  it("sulkeutuu 13 vuorokautta ennen koulutuspäivää", () => {
    expect(isSessionOpen({ date: "2026-12-01", status: "avoinna" }, new Date("2026-11-18T10:00:00Z"))).toBe(false);
  });
  it("täyttä toteutusta ei voi valita", () => {
    expect(isSessionOpen({ date: "2027-05-04", status: "taynna" }, new Date("2026-10-27T10:00:00Z"))).toBe(false);
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
