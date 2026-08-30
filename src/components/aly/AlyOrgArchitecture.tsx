import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

const tiers = [
  {
    name: "AI Director",
    who: "Johto / johtoryhmä",
    text: "Strateginen johto: linjaukset, investoinnit ja vastuut.",
  },
  {
    name: "AI Manager",
    who: "Kehittäjät / päälliköt",
    text: "Käyttöönoton, prosessien ja kehittämisen vastuuhenkilöt.",
  },
  {
    name: "AI Coordinator",
    who: "Asiantuntijat / esihenkilöt",
    text: "Käytännön soveltajat ja organisaation sisäiset edistäjät.",
  },
  {
    name: "AI-perusosaaminen",
    who: "Koko henkilöstö",
    text: "Riittävä ymmärrys tekoälyn tarkoituksenmukaisesta ja turvallisesta käytöstä. Rakennetaan osana organisaation omaa kokonaisuutta.",
  },
];

export function AlyOrgArchitecture() {
  return (
    <section
      id="organisaatioille"
      style={{ scrollMarginTop: 110 }}
      className="py-14 md:py-20 bg-foreground"
    >
      <div className="keuda-container">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
            Entä jos tekoälyosaamista pitää rakentaa koko organisaatioon?
          </h2>
          <p className="text-background/75 leading-relaxed">
            Kaikkien ei tarvitse osata samoja asioita. Olennaista on määritellä, millaista
            tekoälyosaamista eri roolit tarvitsevat ja kuka organisaatiossa käyttää, kehittää ja
            johtaa tekoälyä.
          </p>
        </div>

        <ol className="mt-8 flex flex-col gap-3 max-w-3xl">
          {tiers.map((t, i) => (
            <li
              key={t.name}
              className="rounded-xl border border-background/20 bg-background/10 p-4 md:p-5"
              style={{ marginLeft: `${i * 0}px` }}
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-base md:text-lg font-bold text-background">{t.name}</span>
                <span className="text-sm text-background/60">{t.who}</span>
              </div>
              <p className="text-sm text-background/75 mt-1 leading-relaxed">{t.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Button variant="cta" size="lg" asChild>
            <Link
              to="/yhteystiedot"
              onClick={() => trackEvent("organization_ai_cta", { source: "architecture" })}
            >
              Rakennetaan tekoälyosaaminen organisaatiollesi →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function AlyHowLearning() {
  return (
    <section className="py-12 md:py-16">
      <div className="keuda-container max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Tekoälyä opitaan tekemällä
        </h2>
        <p className="text-muted-foreground mb-5 leading-relaxed">
          Ohjelmissa työskennellään oman organisaation todellisten tilanteiden kanssa. Osaaminen
          syntyy tekemällä, ei kuuntelemalla.
        </p>
        <ul className="space-y-3">
          {[
            "Omaan työhön rakennettavat AI-ratkaisut",
            "AI-apurit ja agentit",
            "Todellisten prosessien kehittäminen",
            "Oman organisaation käyttötapaukset",
            "Tekoälyn käyttöönottoon liittyvät kehittämistehtävät",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-foreground">
              <span aria-hidden="true" className="text-primary font-bold">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AlyToolsVsQualification() {
  return (
    <section className="py-10 md:py-14 bg-muted/40">
      <div className="keuda-container max-w-3xl">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          Tekoälykoulutus vai tekoälypätevyys?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Yksittäinen ChatGPT-, Copilot- tai muu työkalukoulutus voi ratkaista tietyn
          osaamistarpeen. Tekoälypätevyydessä tavoite on laajempi: opit ymmärtämään, mitä
          tekoälyllä kannattaa tehdä, soveltamaan sitä omassa työssäsi ja toimimaan omalla
          vastuutasollasi myös työkalujen muuttuessa.
        </p>
      </div>
    </section>
  );
}
