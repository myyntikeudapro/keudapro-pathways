import { describe, expect, it } from "vitest";
import { AI_TALENT_PUBLISHED, canSeeProjects, isAiTalentVisible, normalizeMemberEmail } from "./aiTalent";

describe("AI Talent", () => {
  it("pysyy piilossa keudapro.fi:ssä ennen hyväksyntää", () => {
    expect(AI_TALENT_PUBLISHED).toBe(false);
    expect(isAiTalentVisible("keudapro.fi")).toBe(false);
    expect(isAiTalentVisible("localhost")).toBe(true);
  });
  it("Projektit näkyvät vain helsinki-, partner- ja admin-rooleille", () => {
    expect(canSeeProjects("participant")).toBe(false);
    expect(canSeeProjects("helsinki")).toBe(true);
    expect(canSeeProjects("partner")).toBe(true);
  });
  it("normalisoi jäsenen sähköpostin", () => {
    expect(normalizeMemberEmail("  Heikki.Kallunki@Keuda.fi ")).toBe("heikki.kallunki@keuda.fi");
    expect(normalizeMemberEmail("ei-osoite")).toBeNull();
  });
});
