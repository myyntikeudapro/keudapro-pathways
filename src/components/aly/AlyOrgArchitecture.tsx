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
      className="relative py-16 md:py-24 bg-foreground"
    >
      <div className="keuda-container">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/60 mb-3">
            Organisaatioille
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
            Entä jos tekoälyosaamista pitää rakentaa koko organisaatioon?
          </h2>
          <p className="text-background/75 leading-relaxed md:text-lg">
            Kaikkien ei tarvitse osata samoja asioita. Olennaista on määritellä, millaista
            tekoälyosaamista eri roolit tarvitsevat ja kuka organisaatiossa käyttää, kehittää ja
            johtaa tekoälyä.
          </p>
        </div>

        <ol className="mt-10 flex flex-col gap-3 max-w-3xl">
          {tiers.map((t, i) => (
            <li
              key={t.name}
              className="rounded-xl border-2 border-background/20 bg-background/10 p-5 md:p-6 hover:bg-background/15 hover:border-background/40 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-x-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-background text-foreground text-sm font-extrabold">
                  {i + 1}
                </span>
                <span className="text-base md:text-lg font-bold text-background">{t.name}</span>
                <span className="text-sm text-background/60">{t.who}</span>
              </div>
              <p className="text-sm text-background/75 mt-2 leading-relaxed">{t.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Button variant="cta" size="lg" className="shadow-lg shadow-black/25" asChild>
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
    <section className="py-14 md:py-20">
      <div className="keuda-container">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keuda-orange mb-3">
            Oppimistapa
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Tekoälyä opitaan tekemällä
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed md:text-lg">
            Ohjelmissa työskennellään oman organisaation todellisten tilanteiden kanssa. Osaaminen
            syntyy tekemällä, ei kuuntelemalla.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Omaan työhön rakennettavat AI-ratkaisut",
            "AI-apurit ja agentit",
            "Todellisten prosessien kehittäminen",
            "Oman organisaation käyttötapaukset",
            "Tekoälyn käyttöönottoon liittyvät kehittämistehtävät",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-border bg-card p-4 text-foreground shadow-[var(--shadow-card)] hover:border-primary/30 transition-colors"
            >
              <span aria-hidden="true" className="text-primary font-bold">
                —
              </span>
              <span className="text-sm md:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AlyToolsVsQualification() {
  return (
    <section className="py-12 md:py-16 bg-muted/40 border-y border-border/60">
      <div className="keuda-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Tekoälykoulutus vai tekoälypätevyys?
          </h2>
          <p className="text-muted-foreground leading-relaxed md:text-lg">
            Yksittäinen ChatGPT-, Copilot- tai muu työkalukoulutus voi ratkaista tietyn
            osaamistarpeen. Tekoälypätevyydessä tavoite on laajempi: opit ymmärtämään, mitä
            tekoälyllä kannattaa tehdä, soveltamaan sitä omassa työssäsi ja toimimaan omalla
            vastuutasollasi myös työkalujen muuttuessa.
          </p>
        </div>
      </div>
    </section>
  );
}

