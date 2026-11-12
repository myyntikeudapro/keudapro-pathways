import { describe, expect, it } from "vitest";
import { searchIndex } from "@/data/searchIndex";
import { mergeSearchMatches } from "./smartSearch";

describe("Valmennusten suorat hakutulokset", () => {
  it.each(["yksilövalmennus", "työhönvalmennus", "Työnhakijan yksilövalmennus", "työnhakuvalmennus", "työhönvalmennus Helsinki", "yksilövalmennus Espoo", "yksilövalmennus Vantaa"])("löytää PKS-palvelun haulla %s ilman tekoälyosumia", query => {
    expect(mergeSearchMatches(query, searchIndex, []).map(entry => entry.href)).toContain("/tyohonvalmennus-pks");
  });
  it("tarjoaa yleisellä valmennushaulla PKS-palvelun ja muitakin valmennuksia", () => {
    expect(mergeSearchMatches("valmennus", searchIndex, []).map(entry => entry.id)).toEqual(expect.arrayContaining([
      "noste-tyohonvalmennus-pks", "aly-valmennusohjelmat", "route-noste",
    ]));
  });
  it("säilyttää yrittäjyysvalmennuksen omana hakutuloksenaan", () => {
    expect(mergeSearchMatches("yrittäjyysvalmennus", searchIndex, [])[0]?.id).toBe("noste-yrittajyys");
  });
  it("säilyttää semanttiset osumat ilman päällekkäisiä tuloksia", () => {
    const pks = searchIndex.find(entry => entry.id === "noste-tyohonvalmennus-pks");
    const entrepreneurship = searchIndex.find(entry => entry.id === "noste-yrittajyys");
    if (!pks || !entrepreneurship) throw new Error("Missing catalog entries");
    const results = mergeSearchMatches("valmennus", searchIndex, [pks, entrepreneurship]);
    expect(results.filter(entry => entry.id === pks.id)).toHaveLength(1);
    expect(results.map(entry => entry.id)).toContain(entrepreneurship.id);
  });
});