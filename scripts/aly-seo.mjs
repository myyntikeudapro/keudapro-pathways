// Crawlable static content block + JSON-LD for the /aly route.
// Baked into dist/aly/index.html by scripts/prerender-meta.mjs so that
// Googlebot, Bingbot and OAI-SearchBot see the full core content of the page
// without executing client-side JavaScript.

const BASE = "https://keudapro.fi";

export const alyLevels = [
  {
    name: "AI Coordinator",
    fi: "tekoälykoordinaattori",
    promise: "Käytä ja sovella",
    href: "https://www.keuda.fi/koulutus/ai-coordinator-tekoalykoordinaattori-koulutusohjelma/",
    audience:
      "Kenelle: asiantuntijat, esihenkilöt ja kehittäjät sekä kaikki, jotka haluavat hyödyntää tekoälyä käytännössä ja tukea muita sen käyttöönotossa.",
    intro:
      "AI Coordinator eli tekoälykoordinaattori rakentaa tekoälyosaamista oman työn näkökulmasta: tunnistaa käyttökohteet, rakentaa AI-apureita ja agentteja, kehittää työnkulkuja ja auttaa myös muita. Teknistä taustaa ei edellytetä.",
  },
  {
    name: "AI Manager",
    fi: "tekoälypäällikkö",
    promise: "Kehitä ja johda käyttöönottoa",
    href: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
    audience:
      "Kenelle: kehittäjät, päälliköt, liiketoiminnasta vastaavat sekä digitalisaation ja kehittämisen vastuuhenkilöt.",
    intro:
      "AI Manager eli tekoälypäällikkö vie tekoälyn käytön yksittäisistä kokeiluista osaksi toimintaa: kehittää prosesseja, johtaa käyttöönottoa, rakentaa automaatioita ja agentteja sekä kehittää osaamista organisaatiossa.",
  },
  {
    name: "AI Director",
    fi: "tekoälyjohtaja",
    promise: "Johda strategisesti",
    href: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
    audience:
      "Kenelle: toimitusjohtajat, johtoryhmän jäsenet, liiketoimintajohto ja muut organisaation strategisista linjauksista vastaavat.",
    intro:
      "AI Director keskittyy tekoälyn strategiseen johtamiseen: miten tekoäly muuttaa liiketoimintaa, mihin investoidaan, millaista osaamista tarvitaan sekä millaisia riskejä ja vastuita syntyy.",
  },
];

const orgTiers = [
  ["AI-perusosaaminen", "Koko henkilöstö", "Riittävä ymmärrys tekoälyn tarkoituksenmukaisesta ja turvallisesta käytöstä."],
  ["AI Coordinator", "Asiantuntijat / esihenkilöt", "Käytännön soveltajat ja organisaation sisäiset edistäjät."],
  ["AI Manager", "Kehittäjät / päälliköt", "Käyttöönoton, prosessien ja kehittämisen vastuuhenkilöt."],
  ["AI Director", "Johto / johtoryhmä", "Strateginen johto: linjaukset, investoinnit ja vastuut."],
];

export const alyFaqs = [
  ["Mikä tekoälypätevyys sopii minulle?", "Oikea taso valitaan roolin, nykyisen tekoälyn käytön ja vastuun laajuuden perusteella. Jos työskentelet pääosin oman työsi ja tiimisi kanssa, AI Coordinator on tyypillinen lähtötaso. Jos vastaat useiden ihmisten tai prosessien kehittämisestä, AI Manager sopii paremmin, ja strategisista linjauksista vastaavalle AI Director."],
  ["Mikä on AI Coordinator eli tekoälykoordinaattori?", "Tekoälykoordinaattori hyödyntää tekoälyä käytännössä omassa työssään: tunnistaa käyttökohteita, rakentaa AI-apureita ja agentteja, kehittää työnkulkuja ja tukee muita tekoälyn käytössä vastuullisesti."],
  ["Tarvitseeko tekoälykoordinaattorin olla IT-asiantuntija?", "Ei tarvitse. Ohjelma on suunnattu asiantuntijoille, esihenkilöille ja kehittäjille, jotka haluavat hyödyntää tekoälyä oman työnsä näkökulmasta. Teknistä taustaa ei edellytetä."],
  ["Mitä eroa on AI Coordinatorilla ja AI Managerilla?", "Ero on vastuun laajuudessa. AI Coordinator käyttää ja soveltaa tekoälyä omassa työssään ja tiimissään. AI Manager vie tekoälyn käytön yksittäisistä kokeiluista osaksi toimintaa: kehittää prosesseja, johtaa käyttöönottoa ja rakentaa osaamista laajemmin organisaatiossa."],
  ["Kenelle AI Director sopii?", "AI Director on tarkoitettu ylimmälle johdolle: toimitusjohtajille, johtoryhmän jäsenille ja liiketoimintajohdolle. Näkökulma on strateginen."],
  ["Opiskellaanko koulutuksissa ChatGPT:tä?", "Työkaluja käytetään, mutta tavoite on laajempi kuin yksittäisen työkalun opettelu. Opit ymmärtämään, mitä tekoälyllä kannattaa tehdä ja soveltamaan sitä omassa työssäsi."],
  ["Rakennetaanko koulutuksissa AI-agentteja?", "Kyllä. AI Coordinator -tasolla harjoitellaan AI-apureiden ja agenttien käyttöä ja rakentamista omaan työhön. AI Manager -tasolla painopiste siirtyy automaatioihin ja agentteihin osana prosesseja."],
  ["Voiko tekoälypätevyyksistä rakentaa organisaation yhteisen osaamispolun?", "Kyllä. Tasot muodostavat mallin, jossa koko henkilöstöllä on riittävä perusymmärrys, asiantuntijat toimivat soveltajina, päälliköt ja kehittäjät vastaavat käyttöönotosta ja johto tekee strategiset linjaukset."],
];

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function alySeoBodyHtml() {
  const levels = alyLevels
    .map(
      (l) =>
        `<section><h2>${esc(l.name)} – ${esc(l.fi)}</h2>` +
        `<p>${esc(l.promise)}. ${esc(l.intro)}</p>` +
        `<p>${esc(l.audience)}</p>` +
        `<p><a href="${esc(l.href)}">${esc(l.name)} – ${esc(l.fi)} -koulutusohjelma</a></p></section>`,
    )
    .join("");

  const org =
    `<section><h2>Organisaation tekoälyosaamisen malli</h2>` +
    `<p>Kaikkien ei tarvitse osata samoja asioita. Olennaista on määritellä, millaista tekoälyosaamista eri roolit tarvitsevat ja kuka organisaatiossa käyttää, kehittää ja johtaa tekoälyä.</p><ul>` +
    orgTiers.map(([n, who, t]) => `<li><strong>${esc(n)}</strong> – ${esc(who)}: ${esc(t)}</li>`).join("") +
    `</ul></section>`;

  const faq =
    `<section><h2>Usein kysyttyä tekoälypätevyyksistä</h2>` +
    alyFaqs.map(([q, a]) => `<div><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join("") +
    `</section>`;

  const test =
    `<section><h2>Mikä tekoälyrooli sinulle sopii?</h2>` +
    `<p>Tasotesti: viisi kysymystä antaa suuntaa-antavan suosituksen lähtötasosta. Kyseessä ei ole sertifioiva osaamisen arviointi.</p></section>`;

  const about =
    `<p>KeudaPRO on Keski-Uudenmaan koulutuskuntayhtymä Keudan omistama yhtiö, joka rakentaa työelämän tekoälyosaamista yksilöille ja organisaatioille.</p>`;

  return levels + org + test + faq + about;

}

export function alyJsonLd() {
  const provider = {
    "@type": "EducationalOrganization",
    name: "KeudaPRO",
    legalName: "Keuda Koulutuspalvelut Oy",
    url: BASE,
  };
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "KeudaPRO", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Tekoälypätevyydet", item: `${BASE}/aly` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "KeudaPROn tekoälypätevyydet",
      itemListElement: alyLevels.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${l.name} – ${l.fi}`,
        url: l.href,
      })),
    },
    ...alyLevels.map((l) => ({
      "@context": "https://schema.org",
      "@type": "Course",
      name: `${l.name} – ${l.fi}`,
      description: l.intro,
      url: l.href,
      inLanguage: "fi",
      provider,
    })),
  ];
}
