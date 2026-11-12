import { describe, it, expect } from "vitest";
import { getPksContent, getPksLanguage, pksLanguages, pksPath } from "./pksContent";
import { canOpenCoach, PKS_COACH_ID } from "./coachRegistry";
import { parseAdviserLanguage } from "../../supabase/functions/pks-service-adviser/languages";
import { scopeRefusal } from "../../supabase/functions/pks-service-adviser/scope";

describe.each(pksLanguages)("PKS-palvelun kieliversio %s", language => {
  it("säilyttää maksuttomuuden", () => expect(getPksContent(language).priceEuros).toBe(0));
  it("säilyttää keston 1–9 kuukautta", () => expect(getPksContent(language).durationMonths).toEqual({ min: 1, max: 9 }));
  it("säilyttää asiakkuusalueen", () => expect(getPksContent(language).cities).toEqual(["Helsinki", "Espoo", "Vantaa"]));
  it("edellyttää oman asiantuntijan ohjausta", () => expect(getPksContent(language).registrationChannel).toBe("employment_expert"));
  it("ei lisää etäosallistumislupausta tai aikarajoja", () => {
    expect(getPksContent(language).participation).toEqual({ fullyRemoteGuaranteed: false, fixedWeeklyHours: null, fixedMeetingFrequency: null, supportAfterEmploymentMonths: null });
    expect(getPksContent(language).contactWithinBusinessDays).toBeNull();
  });
  it("avaa Alisan vain hyväksytyllä kieliversion sivulla", () => {
    expect(getPksLanguage(pksPath(language))).toBe(language);
    expect(canOpenCoach(PKS_COACH_ID, true, pksPath(language))).toBe(true);
    expect(canOpenCoach(PKS_COACH_ID, true, "/aly")).toBe(false);
    expect(canOpenCoach(PKS_COACH_ID, true, "/tyohonvalmennus-pks/de")).toBe(false);
  });
  it("säilyttää muiden palvelujen ohjauksen vain asiantuntijalle", () => expect(scopeRefusal("other-keudapro", language).actions).toEqual(["keudapro-contact"]));
  it("tunnistaa vain kolme hyväksyttyä keskustelukieltä", () => {
    expect(parseAdviserLanguage(language)).toBe(language);
    expect(parseAdviserLanguage("de")).toBeNull();
    expect(parseAdviserLanguage({ language })).toBeNull();
  });
});