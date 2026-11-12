import { readFileSync, writeFileSync } from "node:fs";

// Explicit field allowlist, not a copy of the full service or team materials.
const service = JSON.parse(readFileSync(new URL("../src/data/tyohonvalmennusPks.json", import.meta.url), "utf8"));
const linksSource = readFileSync(new URL("../src/data/pksEmploymentLinks.ts", import.meta.url), "utf8");
const links = [...linksSource.matchAll(/https:\/\/[^"\s]+/g)].map(match => match[0]);
const publicKnowledge = {
  memberId: "tyonhakijan-yksilovalmennus-pks",
  contentVersion: service.version,
  source: `https://keudapro.fi${service.path}`,
  service: {
    title: service.title, description: service.description, intro: service.intro,
    cities: service.cities, languages: service.languages, facts: service.facts,
    audience: service.audience, examples: service.examples, examplesNote: service.examplesNote,
    everyday: service.everyday, ownCoach: service.ownCoach, providers: service.providers,
    faq: service.faq, steps: service.steps,
    entry: { intro: service.entry.intro, message: service.entry.message, help: service.entry.help,
      requirementText: service.entry.requirementText, city: service.entry.city,
      other: service.entry.other, unknown: service.entry.unknown, notCustomer: service.entry.notCustomer },
  },
  approvedLinks: links,
};
writeFileSync(new URL("../supabase/functions/pks-service-adviser/public-knowledge.json", import.meta.url), JSON.stringify(publicKnowledge, null, 2) + "\n");