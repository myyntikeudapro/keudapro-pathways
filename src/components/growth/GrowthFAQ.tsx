const faqs = [
  {
    question: "Mille tasolle yritykseni kuuluu?",
    answer: "Avaa Älykäs tilannekatsaus sivun alusta – syötä liikevaihto, tiimin koko, kasvuvauhti ja painopisteet. Saat suosituksen sopivasta kasvuvaiheesta (Käynnistys, Vakiintunut, Skaalaus tai Skaalattava). Taso ei ole pysyvä, vaan voit liikkua niiden välillä tilanteen mukaan.",
  },
  {
    question: "Mitä Älykäs tilannekatsaus sisältää?",
    answer: "Tilannekatsaus on muutaman minuutin sähköinen kartoitus, joka tunnistaa nykytasosi, mahdolliset pullonkaulat ja sopivimman kasvupolun. Saat heti suosituksen ja voit halutessasi varata jatkokeskustelun.",
  },
  {
    question: "Onko KeudaPRO koulutusta vai käytännön tekemistä?",
    answer: "Molempia – mutta paino on käytännössä. Valmennukset, sparraukset ja tekoälytyökalut on rakennettu niin, että opit soveltamaan heti omassa arjessasi. Ei luentoja vaan tekemistä yrityksesi kanssa.",
  },
  {
    question: "Miten tekoäly (Äly-polku) toimii kasvun tukena?",
    answer: "Äly-polku alkaa nykytason kartoituksesta ja etenee vaiheittain: asiakasviestinnän automaatiosta prosesseihin ja BI-integraatioihin. Syvyys ja vauhti määräytyvät kasvuvaiheesi ja tavoitteidesi mukaan.",
  },
  {
    question: "Sopiiko KeudaPRO myös isommalle yritykselle?",
    answer: "Kyllä. Skaalattava-taso on suunnattu yli 7 M€ liikevaihdon organisaatioille, joissa painopiste on osaamisen johtamisessa, johdon kehittämisessä ja osaajien lisäämisessä. Tilannekatsaus tunnistaa tämän automaattisesti.",
  },
  {
    question: "Entä jos olen muuttamassa alueelle tai etsin työtä?",
    answer: "KeudaPRO palvelee myös perheitä, osaajia ja työnhakijoita sekä alueen päättäjiä. Valitse 'Kuka olet?' -kohdasta sopiva polku – saat tietoa oman talousalueen elämästä, koulutuksista ja työmahdollisuuksista.",
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
