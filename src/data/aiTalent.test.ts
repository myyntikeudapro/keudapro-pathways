import { describe, expect, it } from "vitest";
import { AI_TALENT_PUBLISHED, canSeeProjects, isAiTalentVisible, normalizeMemberEmail } from "./aiTalent";

describe("AI Talent", () => {
  it("on hyväksytty ja näkyy keudapro.fi:ssä", () => {
    expect(AI_TALENT_PUBLISHED).toBe(true);
    expect(isAiTalentVisible("keudapro.fi")).toBe(true);
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

import { canProposeProject } from "./aiTalent";
describe("aihiopankki", () => {
  it("vain partner ja admin voivat ehdottaa aihiota", () => {
    expect(canProposeProject("partner")).toBe(true);
    expect(canProposeProject("admin")).toBe(true);
    expect(canProposeProject("helsinki")).toBe(false);
    expect(canProposeProject("participant")).toBe(false);
  });
});
