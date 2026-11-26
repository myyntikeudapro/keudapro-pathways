import { describe, it, expect } from "vitest";
import { normalizeBusinessId, parseAmount, parseVat, parseBillingMode, normalizeExtraction, buildImportCommand, validateForm, IMPORT_FIELDS, IMPORT_RPC, IMPORT_FORBIDDEN_RPCS, type ImportForm } from "./offerImport";

const src = "Hinta 900 € + alv 25,5 %. Laskutus toteutuksen jälkeen. Emilia Pesonen, Rekrytointikoordinaattori. Y-tunnus 0109862-8";
const blank = Object.fromEntries(IMPORT_FIELDS.map((k) => [k, ""])) as ImportForm["values"];
const form = (over: Partial<ImportForm["values"]> = {}): ImportForm => ({
  leadId: null, expectedClose: "2027-01-31", serviceKey: null, sourceText: src,
  values: { ...blank, organization_name: "Esimerkki Oy", business_id: "0109862-8", service: "Aseptiikka", implementations: "1", unit_price: "900", vat_rate: "25,5", approved: "kyllä", ...over },
});

describe("kentän normalisointi", () => {
  it("Y-tunnus tarkistetaan tarkistenumerolla", () => {
    expect(normalizeBusinessId("01098628")).toBe("0109862-8");
    expect(normalizeBusinessId("0109862-7")).toBeNull();
    expect(normalizeBusinessId("Attendo")).toBeNull();
  });
  it("hinta ja alv suomalaisesta muodosta", () => {
    expect(parseAmount("900 €")).toBe(900);
    expect(parseAmount("1 200,50")).toBe(1200.5);
    expect(parseAmount("noin 900")).toBeNull();
    expect(parseVat("25,5 %")).toBe(25.5);
    expect(parseVat("250")).toBeNull();
  });
  it("laskutustapa tunnistetaan sanoista", () => {
    expect(parseBillingMode("Laskutus toteutuksen jälkeen")).toBe("end");
    expect(parseBillingMode("koko summa koulutuksen alkaessa")).toBe("start");
    expect(parseBillingMode("kahdessa erässä osissa")).toBe("installments");
    expect(parseBillingMode("sovitaan myöhemmin")).toBeNull();
  });
  it("puuttuva kenttä on null ja lähteestä löytymätön lainaus epävarma", () => {
    const f = normalizeExtraction({
      unit_price: { value: "900", confidence: "varma", quote: "Hinta 900 €" },
      contact_name: { value: "Emilia Pesonen", confidence: "varma", quote: "Keksitty lainaus" },
      business_id: { value: "123", confidence: "varma", quote: "123" },
    }, src);
    expect(f.unit_price).toEqual({ value: "900", confidence: "varma", quote: "Hinta 900 €" });
    expect(f.contact_name.confidence).toBe("epavarma");
    expect(f.business_id.value).toBeNull();
    expect(f.service.value).toBeNull();
  });
});

describe("tuonti ei vahvista tilausta", () => {
  it("käyttää vain tuontitoimintoa eikä tilausvahvistusta", () => {
    const cmd = buildImportCommand(form(), "op-12345678");
    expect(cmd.rpc).toBe(IMPORT_RPC);
    expect(IMPORT_FORBIDDEN_RPCS).toContain("crm_confirm_company_order");
    expect(IMPORT_FORBIDDEN_RPCS as readonly string[]).not.toContain(cmd.rpc);
  });
  it("hyväksyntä välitetään vain ehdotuksena, ei hyväksyntä- tai voittotietona", () => {
    const { p } = buildImportCommand(form(), "op-12345678").args;
    expect(p.approval_suggested).toBe(true);
    for (const k of ["approved_at", "approved_by", "approval_method", "status", "sale_closed_at", "deal_value"]) expect(p).not.toHaveProperty(k);
  });
  it("lomake vaatii Y-tunnuksen eikä tunnista asiakasta nimellä", () => {
    expect(validateForm(form({ business_id: "" })).ok).toBe(false);
    expect(validateForm(form()).ok).toBe(true);
  });
});
