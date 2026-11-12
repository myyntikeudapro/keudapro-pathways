import { describe, expect, it } from "vitest";
import { searchIndex } from "./searchIndex";

describe("Yhteydenottosivun valmennushakemisto", () => {
  it("tarjoaa PKS-yksilövalmennuksen omana palvelukohteenaan", () => {
    const pks = searchIndex.find(entry => entry.id === "noste-tyohonvalmennus-pks");
    expect(pks?.href).toBe("/tyohonvalmennus-pks");
    expect(pks?.category).toBe("Palvelu");
  });

  it("sisällyttää työnhakijan hakusanat palvelimelle välitettävään 20 hakusanan joukkoon", () => {
    const pks = searchIndex.find(entry => entry.id === "noste-tyohonvalmennus-pks");
    expect(pks?.keywords.slice(0, 20)).toEqual(expect.arrayContaining([
      "yksilövalmennus", "työhönvalmennus", "valmennus", "työnhaku", "työnhakuvalmennus",
      "Helsinki", "Espoo", "Vantaa",
    ]));
  });

  it("säilyttää muut valmennukset erillisinä hakuvaihtoehtoina", () => {
    expect(searchIndex.map(entry => entry.id)).toEqual(expect.arrayContaining([
      "noste-tyohonvalmennus-pks", "noste-yrittajyys", "noste-kotoutuminen",
      "noste-muutosturva", "aly-valmennusohjelmat", "aly-ai-coordinator",
      "aly-ai-manager", "aly-ai-director",
    ]));
    expect(new Set(searchIndex.map(entry => entry.id)).size).toBe(searchIndex.length);
  });
});