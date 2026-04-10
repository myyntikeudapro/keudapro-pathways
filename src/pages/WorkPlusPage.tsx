import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Map, Handshake, Rocket, ArrowLeftRight } from "lucide-react";
import { PartnersSection } from "@/components/shared/PartnersSection";
import { HeroCarousel } from "@/components/noste/HeroCarousel";
import { useWizard } from "@/contexts/WizardContext";
import { MuutosturvaFormModal } from "@/components/noste/MuutosturvaFormModal";
import { RegionalServices } from "@/components/noste/RegionalServices";

import nosteDirectionImg from "@/assets/noste-direction.jpg";
import nosteClarityImg from "@/assets/noste-clarity.jpg";
import nosteEmploymentImg from "@/assets/noste-employment.jpg";
import nosteEntrepreneurImg from "@/assets/noste-entrepreneur.jpg";
import nosteChallengeImg from "@/assets/noste-challenge.jpg";
import nosteCTABg from "@/assets/noste-cta-bg.jpg";

const paths = [
  {
    id: "polku1",
    title: "Etsin suuntaa",
    image: nosteDirectionImg,
    description: "Etsitkö selkeää suuntaa työelämällesi ja kaipaat valmentajan tukea työnhakuun? Tämä reitti sopii, kun haluat sparrausta ja rinnalla kulkevan tuen.",
    modules: [
      { label: "Valmentajan tuki", href: "#valmentajan-tuki" },
      { label: "Työelämätaidot", href: "#tyoelamataidot" },
      { label: "Uraohjaus ja suunnan selkeytys", href: "#uraohjaus" },
      { label: "Osaamisen tunnistaminen ja sanoittaminen", href: "#osaaminen" },
      { label: "Työnhakutaidot (CV, työhaastattelu, piilotyöpaikat, työnhaku)", href: "#tyonhakutaidot" },
    ],
    crossLink: "HAASTE voi olla yksi suunta – tutustu ennen päätöstä. ↓",
    hasRegionalServices: true,
    ctaText: "Aloita valmennus",
    ctaHref: "#aloita-valmennus",
  },
  {
    id: "polku2",
    title: "Suunta kirkkaaksi",
    image: nosteClarityImg,
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
    image: nosteEmploymentImg,
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

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const WorkPlusPage = () => {
  const { openWizard } = useWizard();
  const [muutosturvaOpen, setMuutosturvaOpen] = useState(false);
  const stepsReveal = useScrollReveal();

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

          {/* Pääpolkukortit – etusivun reittivalintalaatikoiden tyyli */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {paths.map((path) => (
              <div
                key={path.id}
                className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors h-full"
              >
                {/* Valokuva */}
                <div className="relative h-[160px] overflow-hidden flex-shrink-0">
                  <img
                    src={path.image}
                    alt={path.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width={800}
                    height={512}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>

                {/* Sisältö */}
                <div className="flex flex-col flex-1 p-5">
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group/mod text-left"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover/mod:translate-x-0.5 transition-transform" />
                            {mod.label}
                          </button>
                        );
                      }
                      return (
                        <a
                          key={idx}
                          href={mod.href}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group/mod"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover/mod:translate-x-0.5 transition-transform" />
                          {mod.label}
                        </a>
                      );
                    })}
                  </div>

                  {/* Regional services (only for Etsin suuntaa) */}
                  {path.hasRegionalServices && <RegionalServices />}

                  {/* Kytkentälause */}
                  <a
                    href="#plus-polku"
                    className="text-sm italic text-primary/80 hover:text-primary mb-4 transition-colors"
                  >
                    {path.crossLink}
                  </a>

                  {/* CTA */}
                  <Button variant="cta" size="lg" asChild className="w-full mt-auto">
                    <a href={path.ctaHref}>{path.ctaText}</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Plus-polku – HAASTE */}
          <div id="plus-polku" className="mt-12 pt-10 border-t border-border/60">
            <div className="max-w-[860px] mx-auto rounded-xl border border-border bg-accent/5 overflow-hidden border-l-[8px] border-l-primary shadow-lg">
              {/* Valokuva */}
              <div className="relative h-[180px] md:h-[220px] overflow-hidden">
                <img
                  src={nosteChallengeImg}
                  alt="Rakenna oma profiilisi mahdollisuuksien tekijänä"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={1024}
                  height={576}
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>

              <div className="p-6 md:p-8">
                {/* HAASTE badge */}
                <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-4">
                  HAASTE
                </span>

                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  Rakenna oma profiilisi mahdollisuuksien tekijänä
                </h3>

                <p className="text-muted-foreground mb-3 leading-relaxed">
                  Työ ei synny enää vain valmiista paikoista. Se syntyy mahdollisuuksista – joihin joku tarttuu. Tai jotka joku näkee ennen muita.
                </p>

                <p className="italic text-foreground font-medium mb-6">
                  Tässä haasteessa sinä rakennat itsestäsi sen ihmisen.
                </p>

                <div className="border-t border-border/60 pt-5 mb-5">
                  <h4 className="font-bold text-foreground mb-2">Kenelle tämä on?</h4>
                  <p className="italic text-muted-foreground text-sm mb-3">Sinulle, alle 30-vuotias, joka:</p>
                  <ul className="space-y-2 text-sm text-foreground mb-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      haluat tehdä, et vain hakea
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      näet tai aavistat, että ympärillä on tekemätöntä työtä
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      mietit, miten oma osaaminen voisi muuttua keikoiksi, projekteiksi tai työksi
                    </li>
                  </ul>
                  <p className="italic text-primary text-sm font-medium">
                    Sinun ei tarvitse olla valmis. Riittää, että olet valmis liikkeelle.
                  </p>
                </div>

                <div className="border-t border-border/60 pt-5 mb-5">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-foreground mb-3">Mitä teet?</h4>
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          sanoitat mitä osaat – ja mitä haluat oppia
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          kerrot millaisiin mahdollisuuksiin haluat tarttua
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          tuot esiin millaisia mahdollisuuksia itse näet
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-3">Mitä saat?</h4>
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          sparrausta profiilin rakentamiseen
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          mentoreita ja verkostoja
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          konkreettisia toimeksiantoja ja kokeiluja
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          tukea idean viemiseen tekemiseksi
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Kaksisuuntainen liike */}
                <div className="border-t border-border/60 pt-5 mb-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-sm font-bold text-foreground">tekijä</span>
                    <ArrowLeftRight className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-foreground">mahdollisuus</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Et vain tartu valmiisiin mahdollisuuksiin – voit myös olla se joka huomaa ne ensimmäisenä.
                  </p>
                </div>

                <Button variant="cta" size="lg" className="w-full">
                  Luo oma profiilisi →
                </Button>
              </div>
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

      {/* Muutosturva-nosto */}
      <section className="py-12 md:py-16">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 text-center border-l-[5px] border-l-primary">
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

      {/* Miten pääset alkuun – tumma osio */}
      <section
        ref={stepsReveal.ref}
        className="py-16 md:py-20 bg-foreground overflow-hidden"
        style={{
          opacity: stepsReveal.visible ? 1 : 0,
          transform: stepsReveal.visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 600ms ease-out, transform 600ms ease-out",
        }}
      >
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">Miten pääset alkuun?</h2>
          </div>

          {/* Desktop: horizontal with arrows */}
          <div className="hidden md:flex items-start justify-center gap-0 max-w-4xl mx-auto mb-10">
            {gettingStartedSteps.map((step, i) => (
              <div key={i} className="flex items-start">
                <div className="flex flex-col items-center text-center w-56 rounded-xl border border-primary/20 p-6"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="text-base font-bold text-background mb-2">{step.title}</h4>
                  <p className="text-sm" style={{ color: "hsl(210 15% 65%)" }}>{step.text}</p>
                </div>
                {i < gettingStartedSteps.length - 1 && (
                  <div className="flex items-center pt-16 px-2">
                    <div className="w-8 h-px bg-primary/30" />
                    <ArrowRight className="w-4 h-4 text-primary/60 -ml-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: stacked */}
          <div className="flex md:hidden flex-col items-center gap-4 mb-10">
            {gettingStartedSteps.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 rounded-xl border border-primary/20 p-5"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-background">{step.title}</h4>
                    <p className="text-xs" style={{ color: "hsl(210 15% 65%)" }}>{step.text}</p>
                  </div>
                </div>
                {i < gettingStartedSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-5 bg-primary/30" />
                  </div>
                )}
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
