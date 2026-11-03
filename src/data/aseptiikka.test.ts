import { describe, expect, it } from "vitest";
import training from "./aseptiikka.json";

describe("Aseptiikan vahvistetut koulutustiedot", () => {
  it("kestää kaksi tuntia", () => expect(training.durationHours).toBe(2));
  it("ei rajoita osallistujamäärää", () => expect(training.participantLimit).toBeNull());
  it("ei julkaise toteutusten hintatietoja", () => {
    expect(training).not.toHaveProperty("firstDeliveryEuros");
    expect(training).not.toHaveProperty("additionalDeliveryEuros");
  });
  it("ottaa tilaukset vain tarjouspyynnön kautta", () => expect(training.orderingChannel).toBe("quote-request"));
  it("käyttää 14 päivän maksuehtoa", () => expect(training.paymentDays).toBe(14));
  it("antaa tallenteen kolmeksi kuukaudeksi", () => expect(training.recordingMonths).toBe(3));
  it("käyttää kahta kouluttajaa", () => expect(training.trainerCount).toBe(2));
  it("mahdollistaa ensimmäisen toteutuksen noin kolmessa viikossa", () => expect(training.earliestDeliveryWeeks).toBe(3));
  it("vastaa tarjouksella kahdessa arkipäivässä", () => expect(training.quoteResponseBusinessDays).toBe(2));
});