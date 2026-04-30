const faqs = [
  {
    question: "Miten tiedän, mille tasolle kuulun?",
    answer: "Helpoin tapa on tehdä 15 minuutin reittikartoitus – käymme yhdessä läpi yrityksesi liikevaihdon, tilanteen ja tavoitteet. Tason valinta ei ole pysyvä: voit siirtyä tasolta toiselle joustavasti sopimusvuoden aikana.",
  },
  {
    question: "Mitä kasvukartoitus sisältää?",
    answer: "Kasvukartoitus on maksuton 15 minuutin keskustelu jossa tunnistetaan yrityksesi nykytaso, pullonkaulat ja sopivin reitti eteenpäin. Saat selkeän suosituksen – ei yleistä, vaan juuri sinulle.",
  },
  {
    question: "Onko tämä koulutusta vai käytännön tekemistä?",
    answer: "Molempia – mutta paino on käytännössä. Valmennukset, sparraussessiot ja tekoälytyökalut on suunniteltu niin että opit soveltamaan heti omassa arjessasi. Ei luentoja vaan tekemistä.",
  },
  {
    question: "Miten tekoälypolku toimii?",
    answer: "Tekoälypolku alkaa yrityksesi nykytason kartoituksesta. Sen jälkeen rakennetaan vaiheittainen suunnitelma – asiakasviestinnästä automaatioon ja BI-integraatioihin. Vauhti ja syvyys määräytyvät tason mukaan.",
  },
  {
    question: "Voiko pienyritys osallistua ilman suurta budjettia?",
    answer: "Kyllä. Paketteihin voi hakea ELY-tukea tai yritysrahoitusta josta kysytään reittikartoituksessa.",
  },
  {
    question: "Miten osaamiskoulutukset liittyvät kasvuun?",
    answer: "Osaaminen on kasvun perusta – ilman sitä prosessit ja työkalut jäävät hyödyntämättä. Osaaminen käytäntöön -polku varmistaa että tiimisi pysyy kasvun vauhdissa mukana.",
  },
];

export function GrowthFAQ() {
  return (
    <section id="faq" className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all hover:shadow-lg"
            >
              <p className="font-semibold text-foreground text-sm leading-snug mb-2">
                {faq.question}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
