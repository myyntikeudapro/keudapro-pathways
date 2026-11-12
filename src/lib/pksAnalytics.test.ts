import { describe, it, expect, vi, beforeEach } from "vitest";
const insert = vi.hoisted(() => vi.fn((_row: unknown) => Promise.resolve({ error: null })));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
import { trackPksAction } from "./pksAnalytics";

describe("PKS-toimintoseurannan suostumus ja tiedot", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); insert.mockClear(); });
  it("ei lähetä mitään ilman markkinointisuostumusta", () => {
    trackPksAction("message_copy", "success");
    expect(insert).not.toHaveBeenCalled();
  });
  it("lähettää vain kiinteän toiminnon ja palautearvon suostumuksen jälkeen", () => {
    localStorage.setItem("keudapro-cookie-consent", "accepted");
    trackPksAction("answer_feedback", "helpful");
    expect(insert).toHaveBeenCalledOnce();
    expect(insert.mock.calls[0]?.[0]).toMatchObject({ event: "pks_answer_feedback", props: { service: "tyonhakijan-yksilovalmennus-pks", value: "helpful" } });
  });
});