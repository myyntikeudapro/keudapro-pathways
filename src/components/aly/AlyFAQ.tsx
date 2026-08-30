const faqs = [
  {
    question: "Mikä tekoälypätevyys sopii minulle?",
    answer:
      "Oikea taso valitaan roolin, nykyisen tekoälyn käytön ja vastuun laajuuden perusteella. Jos työskentelet pääosin oman työsi ja tiimisi kanssa, AI Coordinator on tyypillinen lähtötaso. Jos vastaat useiden ihmisten tai prosessien kehittämisestä, AI Manager sopii paremmin, ja strategisista linjauksista vastaavalle AI Director. Sivun testi ”Mikä tekoälyrooli sinulle sopii?” antaa suuntaa-antavan suosituksen.",
  },
  {
    question: "Mikä on AI Coordinator eli tekoälykoordinaattori?",
    answer:
      "Tekoälykoordinaattori hyödyntää tekoälyä käytännössä omassa työssään: tunnistaa käyttökohteita, rakentaa AI-apureita ja agentteja, kehittää työnkulkuja ja tukee muita tekoälyn käytössä vastuullisesti. Rooli on käytännön soveltaja ja organisaation sisäinen edistäjä.",
  },
  {
    question: "Tarvitseeko tekoälykoordinaattorin olla IT-asiantuntija?",
    answer:
      "Ei tarvitse. Ohjelma on suunnattu asiantuntijoille, esihenkilöille ja kehittäjille, jotka haluavat hyödyntää tekoälyä oman työnsä näkökulmasta. Teknistä taustaa ei edellytetä, vaan osaaminen rakennetaan omien työtehtävien kautta.",
  },
  {
    question: "Mitä eroa on AI Coordinatorilla ja AI Managerilla?",
    answer:
      "Ero on vastuun laajuudessa. AI Coordinator käyttää ja soveltaa tekoälyä omassa työssään ja tiimissään sekä rakentaa käytännön ratkaisuja. AI Manager vie tekoälyn käytön yksittäisistä kokeiluista osaksi toimintaa: kehittää prosesseja, johtaa käyttöönottoa ja rakentaa osaamista laajemmin organisaatiossa.",
  },
  {
    question: "Kenelle AI Director sopii?",
    answer:
      "AI Director on tarkoitettu ylimmälle johdolle: toimitusjohtajille, johtoryhmän jäsenille ja liiketoimintajohdolle. Näkökulma on strateginen – miten tekoäly muuttaa liiketoimintaa, mihin investoidaan, millaista osaamista tarvitaan sekä millaisia riskejä ja vastuita syntyy.",
  },
  {
    question: "Opiskellaanko koulutuksissa ChatGPT:tä?",
    answer:
      "Työkaluja käytetään, mutta tavoite on laajempi kuin yksittäisen työkalun opettelu. Opit ymmärtämään, mitä tekoälyllä kannattaa tehdä, soveltamaan sitä omassa työssäsi ja toimimaan omalla vastuutasollasi myös silloin kun työkalut muuttuvat.",
  },
  {
    question: "Rakennetaanko koulutuksissa AI-agentteja?",
    answer:
      "Kyllä. AI Coordinator -tasolla harjoitellaan AI-apureiden ja agenttien käyttöä ja rakentamista omaan työhön. AI Manager -tasolla painopiste siirtyy automaatioiden ja agenttien kehittämiseen osana prosesseja ja laajempia kokonaisuuksia.",
  },
  {
    question: "Voiko tekoälypätevyyksistä rakentaa organisaation yhteisen osaamispolun?",
    answer:
      "Kyllä. Tasot muodostavat mallin, jossa koko henkilöstöllä on riittävä perusymmärrys, asiantuntijat toimivat soveltajina, päälliköt ja kehittäjät vastaavat käyttöönotosta ja johto tekee strategiset linjaukset. Suunnittelemme kokonaisuuden yhdessä organisaationne kanssa.",
  },
];

export function AlyFAQ() {
  return (
    <section id="faq" className="keuda-section" style={{ scrollMarginTop: 110 }}>
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä tekoälypätevyyksistä
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          AI Coordinator, AI Manager ja AI Director – yleisimmät kysymykset ja vastaukset.
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
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
