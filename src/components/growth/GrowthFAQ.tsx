import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Mitä kasvukartoitus sisältää?",
    answer: "Kasvukartoitus on 60–90 minuutin keskustelu, jossa käymme läpi yrityksesi nykytilan, tunnistamme kasvun pullonkaulat ja määrittelemme konkreettisen seuraavan askeleen. Saat selkeän toimenpide-ehdotuksen."
  },
  {
    question: "Paljonko tämä vie aikaa?",
    answer: "Alkukartoitus vie noin tunnin. Varsinaiset toteutukset ovat tyypillisesti 2–8 viikon sprinttejä, jotka suunnitellaan yrityksesi aikataulun mukaan. Emme vie aikaa turhaan – keskitymme tekemiseen."
  },
  {
    question: "Onko tämä koulutusta vai käytännön tekemistä?",
    answer: "Molempia. KeudaPRO:n malli yhdistää osaamisen kehittämisen ja käytännön toteutuksen. Emme tarjoa irrallisia kursseja, vaan ratkaisuja jotka viedään osaksi arkea."
  },
  {
    question: "Miten tekoälypolku toimii?",
    answer: "Tekoälypolku alkaa kartoituksella, jossa tunnistamme AI:n käyttömahdollisuudet juuri teidän liiketoiminnassanne. Sen jälkeen toteutamme käytännön pilotin ja varmistamme, että osaaminen siirtyy tiimille."
  },
  {
    question: "Voiko pienyritys osallistua ilman suurta budjettia?",
    answer: "Kyllä. Suurin osa ratkaisuistamme on suunniteltu pk-yrityksille. Lisäksi hyödynnämme aktiivisesti erilaisia rahoitusinstrumentteja ja tukia, jotka madaltavat osallistumiskynnystä."
  }
];

export function GrowthFAQ() {
  return (
    <section className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Usein kysyttyä
        </h2>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
