import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Compass, Map, Handshake, Rocket } from "lucide-react";
import { PartnersSection } from "@/components/shared/PartnersSection";
import { HeroCarousel } from "@/components/noste/HeroCarousel";
import { useWizard } from "@/contexts/WizardContext";
import { MuutosturvaFormModal } from "@/components/noste/MuutosturvaFormModal";

import pathDirectionImg from "@/assets/noste-path-direction.jpg";
import pathClarityImg from "@/assets/noste-path-clarity.jpg";
import pathWorkImg from "@/assets/noste-path-work.jpg";
import nosteCTABg from "@/assets/noste-cta-bg.jpg";

const paths = [
  {
    id: "polku1",
    title: "Etsin suuntaa",
    image: pathDirectionImg,
    description: "Etsitkö selkeää suuntaa työelämällesi ja kaipaat valmentajan tukea työnhakuun? Tämä reitti sopii, kun haluat sparrausta ja rinnalla kulkevan tuen.",
    modules: [
      { label: "Valmentajan tuki", href: "#valmentajan-tuki" },
      { label: "Työelämätaidot", href: "#tyoelamataidot" },
      { label: "Uraohjaus ja suunnan selkeytys", href: "#uraohjaus" },
      { label: "Osaamisen tunnistaminen ja sanoittaminen", href: "#osaaminen" },
      { label: "Työnhakutaidot (CV, työhaastattelu, piilotyöpaikat, työnhaku)", href: "#tyonhakutaidot" },
    ],
    crossLink: "Yrittäjyys voi olla yksi suunta – tutustu ennen päätöstä. ↓",
    ctaText: "Aloita valmennus",
    ctaHref: "#aloita-valmennus",
  },
  {
    id: "polku2",
    title: "Suunta kirkkaaksi",
    image: pathClarityImg,
    description: "Tarvitsetko apua osaamisesi sanoittamiseen ja profiilin kirkastamiseen? Tämä polku auttaa sinua erottumaan ja hyödyntämään tekoälyä työnhaussa.",
    modules: [
      { label: "CV, LinkedIn ja oman osaamisen hissipuhe", href: "#cv-linkedin" },
      { label: "AI-avusteinen työnhaku", href: "#ai-tyonhaku" },
      { label: "Valmentajan tuki tarvittaessa", href: "#valmentaja" },
    ],
    crossLink: "Sama osaaminen voidaan tuotteistaa myös toimeksiannoiksi. ↓",
    ctaText: "Kirkasta profiilisi",
    ctaHref: "#kirkasta-profiili",
  },
  {
    id: "polku3",
    title: "Suoraan työelämään",
    image: pathWorkImg,
    description: "Onko tavoitteenasi nopea työllistyminen? Tämä reitti tarjoaa käytännön työkalut ja väylät työelämään.",
    modules: [
      { label: "AI-avusteinen osaamiskartoitus", href: "#ai-kartoitus" },
      { label: "CV:n ja työhakemuksen pikapäivitys (30 min)", href: "#cv-pikapaivitys" },
      { label: "Henkilöstövuokrausyhteistyö", href: "#henkilostovuokraus" },
      { label: "Haastattelusparraus", href: "#haastattelusparraus" },
      { label: "Muutosturvakoulutuksella takaisin työelämään", href: "#muutosturva-tyoelamaan" },
    ],
    crossLink: "Tai suoraan töihin – omalla tavallasi. ↓",
    ctaText: "Tavoittele työtä nyt",
    ctaHref: "#tavoittele-tyota",
  },
];

const plusPathModules = [
  "Kevytyrittäjyyden pelisäännöt ja käytännöt",
  "Oman osaamisen tuotteistaminen ja hinnoittelu",
  "Toimeksiantojen hankinta ja asiakasviestintä",
  "Verkostot ja alustat jotka yhdistävät tekijät ja tilaajat",
  "AI-avusteinen oman brändin rakentaminen",
  "Muutosturvasta yrittäjyyspolulle – miten se onnistuu",
];

const gettingStartedSteps = [
  {
    icon: Map,
    title: "Tee 15 min reittikartoitus",
    text: "Selvitetään yhdessä tilanteesi ja sopiva polku.",
  },
  {
    icon: Handshake,
    title: "Tapaat oikean asiantuntijan",
    text: "Sinut yhdistetään tilanteesi kannalta sopivaan toimijaan.",
  },
  {
    icon: Rocket,
    title: "Aloitat oman polkusi",
    text: "Konkreettinen suunnitelma ja tuki matkan varrella.",
  },
];

const WorkPlusPage = () => {
  const { openWizard } = useWizard();
  const [muutosturvaOpen, setMuutosturvaOpen] = useState(false);
  return (
    <Layout>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* TÄYDENNYS 1 – Empaattinen avauslause */}
      <section className="py-12 md:py-16">
        <div className="keuda-container">
          <p className="text-base md:text-lg text-muted-foreground text-center max-w-[640px] mx-auto leading-relaxed">
            Muutos voi tuntua sekavalta – oli kyse sitten uuden suunnan etsimisestä, työelämään palaamisesta tai oman polun rakentamisesta. Me autamme sinua löytämään seuraavan askeleen, juuri sinun tilanteestasi käsin.
          </p>
        </div>
      </section>

      {/* POLUT */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Valitse siirtymäreitti</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kolme polkua erilaisiin tilanteisiin – valitse omasi ja löydä sopivat ratkaisut.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {paths.map((path) => (
              <div
                key={path.id}
                className="keuda-card-enhanced flex flex-col h-full"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mb-4">
                  <img src={path.image} alt={path.title} className="w-full h-full object-cover" />
                </div>

                {/* Title & description */}
                <h3 className="text-xl font-bold text-foreground mb-2">{path.title}</h3>
                <p className="text-muted-foreground text-sm mb-5">{path.description}</p>

                {/* Module links */}
                <div className="flex flex-col gap-2 mb-4 flex-1">
                  {path.modules.map((mod, idx) => {
                    const isMuutosturva =
                      path.id === "polku3" && mod.href === "#muutosturva-tyoelamaan";
                    if (isMuutosturva) {
                      return (
                        <button
                          key={idx}
                          onClick={() => setMuutosturvaOpen(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group text-left"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          {mod.label}
                        </button>
                      );
                    }
                    return (
                      <a
                        key={idx}
                        href={mod.href}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        {mod.label}
                      </a>
                    );
                  })}
                </div>

                {/* TÄYDENNYS 5 – Kytkentä Plus-polkuun */}
                <a
                  href="#plus-polku"
                  className="text-sm italic text-primary/80 hover:text-primary mb-4 transition-colors"
                >
                  {path.crossLink}
                </a>

                {/* CTA */}
                <Button variant="cta" size="lg" asChild className="w-full">
                  <a href={path.ctaHref}>{path.ctaText}</a>
                </Button>
              </div>
            ))}
          </div>

          {/* TÄYDENNYS 4 – Plus-polku */}
          <div id="plus-polku" className="mt-12 pt-10 border-t border-border/60">
            <p className="text-sm text-muted-foreground text-center mb-6 italic">
              Tämä polku on auki kaikissa vaiheissa – yrittäjyys ei vaadi erillistä lähtölaukausta.
            </p>

            <div className="max-w-3xl mx-auto keuda-card-enhanced border-2 border-primary/20 bg-accent/20 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Tee työelämä omalla tavallasi</h3>
                  <p className="text-muted-foreground text-sm mt-1">Kevytyrittäjyys, toimeksiannot ja oma polku</p>
                </div>
              </div>

              <p className="text-sm italic text-muted-foreground mb-5">
                Sinulle, jos haluat tehdä töitä omilla ehdoillasi – ilman pakkoa valita perinteisen työsuhteen ja täyden yrittäjyyden välillä.
              </p>

              <div className="flex flex-col gap-2 mb-6">
                {plusPathModules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background/60 text-foreground text-sm font-medium border border-border/50"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {mod}
                  </div>
                ))}
              </div>

              <Button variant="cta" size="lg" className="w-full md:w-auto">
                Tutki yrittäjyyspolkua →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full">
        <div className="absolute inset-0">
          <img
            src={nosteCTABg}
            alt="Urasuunnittelu ja ohjaus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-20 md:py-32">
          <div className="keuda-container text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
              15 minuuttia
            </p>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Etkö tiedä mistä aloittaa?
            </h3>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-8 mx-auto">
              Tee nopea reittikartoitus ja löydä tilanteeseesi sopivat ratkaisut.
            </p>
            <Button variant="cta" size="lg" onClick={openWizard}>
              Tee 15 min reittikartoitus
            </Button>
          </div>
        </div>
      </section>

      {/* TÄYDENNYS 7 – Muutosturva-nosto */}
      <section className="py-12 md:py-16">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-3">Oletko muutosturvatilanteessa?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Muutosturva on oikeutesi – ja me autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin ja saat tuen seuraavan askeleen löytämiseen.
            </p>
            <Button variant="cta" size="lg" onClick={() => setMuutosturvaOpen(true)}>
              Lue lisää muutosturvasta →
            </Button>
          </div>
        </div>
      </section>

      {/* TÄYDENNYS 8 – Miten pääset alkuun */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Miten pääset alkuun?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {gettingStartedSteps.map((step, i) => (
              <div key={i} className="keuda-card-enhanced text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="cta" size="lg" onClick={openWizard}>
              Tee 15 min reittikartoitus
            </Button>
          </div>
        </div>
      </section>

      {/* TOIMIJAT */}
      <PartnersSection />
      <MuutosturvaFormModal open={muutosturvaOpen} onOpenChange={setMuutosturvaOpen} />
    </Layout>
  );
};

export default WorkPlusPage;
