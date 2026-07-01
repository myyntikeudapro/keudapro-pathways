const faqs = [
  {
    question: "Mistä saan apua alanvaihtoon tai työllistymiseen Uudellamaalla?",
    answer:
      "KeudaPRO NOSTE-palvelu tarjoaa työhönvalmennusta, uraohjausta ja alakohtaisia koulutuksia työnhakijoille ja alaa vaihtaville Uudellamaalla, painopisteenä KUUMA-seutu (Hyvinkää, Järvenpää, Kerava, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula). Aloitat maksuttomasta reittikartoituksesta, jossa käydään läpi tilanteesi ja sopivat polut. Työttömille ja muutosturvan piirissä oleville palvelut ovat maksuttomia.",
  },
  {
    question: "Onko maahanmuuttajille ja kotoutujille suunnattua koulutusta?",
    answer:
      "Kyllä. NOSTE-polkuun kuuluu työelämän suomen kielen valmennus, kotoutumiskoulutukset ja alakohtainen ammatillinen osaaminen. Toteutamme koulutuksia KUUMA-seudulla suomeksi, ruotsiksi ja englanniksi, ja yhdistämme kielitaidon suoraan työelämään ja pätevyyksiin. Ohjaus tapahtuu yhden yhteyshenkilön kautta.",
  },
  {
    question: "Voiko KeudaPRO:n kautta löytää reitin yrittäjyyteen tai opintoihin?",
    answer:
      "Kyllä. NOSTE-polku 'Haluan luoda oman työn' on suunnattu itsensä työllistäjille, kevytyrittäjille ja yrittäjyyttä harkitseville. Autamme myös ohjautumaan Keudan ammatilliseen koulutukseen tai korkeakouluopintoihin, kun tarvitset uuden pätevyyden. Reitti valitaan yhdessä valmentajan kanssa – ei valmiiden pakettien mukaan.",
  },
  {
    question: "Kuka on oikeutettu muutosturvakoulutukseen?",
    answer:
      "Muutosturvakoulutukseen on oikeus, jos työsuhteesi on päättynyt tai päättymässä tuotannollisista tai taloudellisista syistä ja olet ollut työsuhteessa vähintään 5 vuotta. Koulutus on sinulle maksuton – rahoitus tulee työnantajalta ja TE-palveluista, arvo on enintään 2 kuukauden palkkaa vastaava. Oikeus on käytettävissä 12 kuukautta irtisanomisesta.",
  },
  {
    question: "Paljonko työhönvalmennus maksaa ja kuka sen maksaa?",
    answer:
      "Työttömille ja muutosturvan piirissä oleville NOSTE-palvelut ovat pääsääntöisesti maksuttomia – rahoitus tulee TE-palveluista, ELY-keskukselta, työnantajalta tai muutosturvan koulutusbudjetista. Yksityishenkilöille tarjoamme myös maksullisia lyhytvalmennuksia. Kustannukset selviävät ensimmäisessä kartoituskeskustelussa.",
  },
  {
    question: "Miten pääsen alkuun ja kuinka nopeasti?",
    answer:
      "Voit aloittaa anonyymisti AI-valmentaja Anan kanssa milloin tahansa – keskustelu antaa nopean kuvan vaihtoehdoista noin 10 minuutissa. Sen jälkeen varaat 45 minuutin maksuttoman ajan Reittivalmentajalle, ja henkilökohtainen suunnitelma syntyy tyypillisesti 1–2 viikossa. Toimimme KUUMA-seudulla ja koko Uudellamaalla.",
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

export function NosteFAQ() {
  return (
    <section id="faq" className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          Yleisimmät kysymykset työhönvalmennuksesta, muutosturvasta ja uramuutoksesta.
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
