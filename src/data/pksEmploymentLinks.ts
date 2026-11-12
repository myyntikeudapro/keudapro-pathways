export const pksEmploymentLinks = {
  asiointi: "https://tyomarkkinatori.fi/henkiloasiakkaat/asiointi",
  regions: "https://tyomarkkinatori.fi/aluesivu",
  registration: "https://tyomarkkinatori.fi/ohjeet-ja-tuki/henkiloasiakkaat/asiointi-osion-ohjeet/tyonhaun-aloitus/nain-aloitat-tyonhaun",
  contactHelp: "https://tyomarkkinatori.fi/ohjeet-ja-tuki/henkiloasiakkaat/asiointi-osion-ohjeet/yhteydenotot-ja-tapaamiset/nain-jatat-yhteydenottopyynnon",
  cities: {
    Helsinki: "https://www.hel.fi/fi/yritykset-ja-tyo/tyonhakijat/ota-yhteytta-tyollisyyspalveluihin",
    Espoo: "https://www.espoo.fi/fi/tyoelama/tyollisyyspalvelut/tyollisyyspalvelut/espoon-tyollisyyspalvelujen-yhteystiedot",
    Vantaa: "https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/vantaan-tyollisyyden-ja-kansainvalisten-asiakkaiden-palveluiden-yhteystiedot",
  },
} as const;

export const employmentChoices = ["Helsinki", "Espoo", "Vantaa", "Muu", "En tiedä", "En ole vielä asiakas"] as const;
export type EmploymentChoice = typeof employmentChoices[number];

export function getEmploymentRoute(choice: EmploymentChoice | null) {
  const city = choice === "Helsinki" || choice === "Espoo" || choice === "Vantaa" ? choice : null;
  return {
    city,
    showMessage: city !== null,
    showAsiointi: city !== null,
    showRegistration: choice === "En ole vielä asiakas",
    showCityAlternatives: choice === "En tiedä",
    contactUrl: city ? pksEmploymentLinks.cities[city] : pksEmploymentLinks.regions,
  };
}