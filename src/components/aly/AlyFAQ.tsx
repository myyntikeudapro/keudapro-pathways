const faqs = [
  {
    question: "Mistä esihenkilö saa tekoälykoulutusta KUUMA-seudulla?",
    answer:
      "KeudaPRO tarjoaa esihenkilöille ja johdolle tekoälypätevyys-ohjelmat AI-Director, AI-Manager ja AI-Coordinator KUUMA-seudulla (Hyvinkää, Järvenpää, Kerava, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula). Koulutukset yhdistävät johtamisen kehittämisen ja käytännön tekoälytyökalut. Voit aloittaa yksittäisellä esihenkilöllä tai kouluttaa koko johtoryhmän.",
  },
  {
    question: "Miten tekoälyn saa osaksi johtamista ja päätöksentekoa?",
    answer:
      "Tekoäly tuodaan johtamiseen vaiheittain: ensin tunnistetaan päätöksenteon pullonkaulat ja tietolähteet, sitten rakennetaan käytännön työnkulut esimerkiksi raportointiin, viestintään ja resursointiin. AI-Manager-ohjelmassa harjoitellaan konkreettisia työkaluja omassa työssä – ei teoriaa. Kesto on tyypillisesti 3–6 kuukautta ja etenee omassa organisaatiossasi.",
  },
  {
    question: "Sopiiko tekoälykoulutus asiantuntijalle ilman teknistä taustaa?",
    answer:
      "Kyllä. AI-Coordinator ja alakohtainen Tekoälyn ammattiosaaja on suunnattu asiantuntijoille, jotka käyttävät tekoälyä työssään ilman koodaustaustaa. Painopiste on työn arjen käyttötapauksissa: kirjoittaminen, analyysi, tiedonhaku, asiakasviestintä. Aiempaa teknistä osaamista ei vaadita.",
  },
  {
    question: "Kuinka pitkä ÄLY-koulutus on ja miten se etenee?",
    answer:
      "ÄLY-ohjelmat rakentuvat neljästä osasta: ajattelu, taidot, työkalut ja kulttuuri. Lyhyet valmennukset kestävät 1–2 päivää, laajemmat pätevyyspolut 3–9 kuukautta. Toteutus tapahtuu KUUMA-seudulla, hybridinä tai kokonaan verkossa, ja jokainen osallistuja soveltaa oppeja omaan työhönsä valmennusten välillä.",
  },
  {
    question: "Voiko työnantaja tilata tekoälykoulutuksen koko tiimille?",
    answer:
      "Kyllä. KeudaPRO räätälöi tekoäly- ja johtamiskoulutuksia yrityksille, kunnille ja julkishallinnon organisaatioille KUUMA-seudulla, Uudellamaalla ja koko Suomessa. Tyypillinen tilausvalmennus alkaa nykytilan kartoituksesta ja päättyy mitattaviin käyttötapauksiin. Ota yhteyttä yhden yhteyshenkilön kautta – teemme kokonaisehdotuksen.",
  },
  {
    question: "Mitä turvallisuusjohtaminen tarkoittaa ÄLY-kokonaisuudessa?",
    answer:
      "Turvallisuusjohtamisen koulutukset kattavat tietoturvan, tekoälyn vastuullisen käytön sekä muutosjohtamisen turvallisuusnäkökulmat. Ne on suunnattu erityisesti julkisen sektorin ja kriittisten alojen johdolle Uudellamaalla. Sisältö täyttää suomalaisen ja EU-lainsäädännön (esim. AI Act) vaatimukset.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export function AlyFAQ() {
  return (
    <section id="faq" className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          Yleisimmät kysymykset johtamisen, asiantuntijuuden ja tekoälyn koulutuksista.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all hover:shadow-lg"
            >
              <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">
                {faq.question}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </div>
    </section>
  );
}
