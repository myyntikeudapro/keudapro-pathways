import { useState, useEffect, useRef, useCallback } from "react";

import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Handshake, Rocket, ChevronDown } from "lucide-react";

import { HeroCarousel } from "@/components/noste/HeroCarousel";
import { useWizard } from "@/contexts/WizardContext";
import { MuutosturvaFormModal } from "@/components/noste/MuutosturvaFormModal";
import { Panel1, Panel2, Panel3, Panel4, Panel5 } from "@/components/noste/PathPanels";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import nostePathDirection from "@/assets/noste-path-direction.jpg";
import nostePathBranding from "@/assets/noste-path-branding.jpg";
import nostePathEmployment from "@/assets/noste-path-employment.jpg";
import nostePathTransition from "@/assets/noste-path-transition.jpg";
import nostePathOwnwork from "@/assets/noste-path-ownwork.jpg";
import nosteCTABg from "@/assets/noste-cta-bg.jpg";

/* ────────────── Data ────────────── */

const situations = [
  { id: "polku1", label: "En tiedä suuntaani", tooltip: "Tarvitset selkeyttä ja apua seuraaviin askeliin." },
  { id: "polku2", label: "Haluan erottua", tooltip: "Tiedät mitä haluat mutta et saa sitä näkyväksi." },
  { id: "polku3", label: "Haluan töihin nopeasti", tooltip: "Tarvitset konkreettisia väyliä ja tukea työllistymiseen." },
  { id: "polku4", label: "Tilanteeni muuttuu", tooltip: "Työtilanteesi muuttuu tai ala ei tunnu enää oikealta." },
  { id: "polku5", label: "Haluan luoda oman työn", tooltip: "Haluat projekteja, toimeksiantoja tai yrittäjyyttä." },
];

const pathsData = [
  {
    id: "polku1",
    image: nostePathDirection,
    title: "Selkeytä suuntasi ja ota ensimmäiset askeleet",
    ingressi: "Kun et vielä tiedä mihin suuntaan mennä, tärkeintä on päästä liikkeelle. Saat rinnallesi valmentajan joka auttaa sinua hahmottamaan vaihtoehdot.",
    practice: [
      "Tunnistat mitä osaat ja mikä sinua kiinnostaa",
      "Hahmotat realistiset uravaihtoehdot",
      "Rakennat ensimmäiset askeleet työnhakuun",
      "Saat tukea ja sparrausta matkan varrella",
    ],
    result: "Saat selkeän suunnan ja suunnitelman jonka pohjalta etenet eteenpäin.",
    ctaText: "Aloita valmennus →",
  },
  {
    id: "polku2",
    image: nostePathBranding,
    title: "Tee osaamisestasi näkyvää ja erottuvaa",
    ingressi: "Hyvä osaaminen ei riitä jos sitä ei ymmärretä. Rakennat profiilin jonka avulla työnantaja näkee nopeasti mitä tuot mukanasi.",
    practice: [
      "Rakennat selkeän CV:n ja LinkedIn-profiilin",
      "Kiteytät osaamisesi ja vahvuutesi",
      "Hyödynnät tekoälyä työnhaussa",
      "Harjoittelet kertomaan osaamisestasi vakuuttavasti",
    ],
    result: "Erotut hakijoiden joukosta ja lisäät mahdollisuuksiasi päästä haastatteluihin.",
    ctaText: "Kirkasta profiilisi →",
  },
  {
    id: "polku3",
    image: nostePathEmployment,
    title: "Etene nopeasti kohti työtä",
    ingressi: "Kun tavoitteena on nopea työllistyminen, keskitytään siihen mikä vie sinut suoraan työelämään.",
    practice: [
      "Päivität CV:si nopeasti kuntoon (jopa 30 min)",
      "Hyödynnät tekoälyä hakemuksissa ja työnhaussa",
      "Saat sparrausta haastatteluihin",
      "Pääset kiinni työmahdollisuuksiin ja rekrykanaviin",
      "Vahvistat työkielen osaamistasi (suomi, ruotsi, englanti)",
    ],
    result: "Lyhennät matkaa työnhaku → työ ja pääset nopeammin kiinni työelämään.",
    ctaText: "Tavoittele työtä nyt →",
  },
  {
    id: "polku4",
    image: nostePathTransition,
    title: "Löydä uusi suunta muuttuvassa tilanteessa",
    ingressi: "Kun työtilanne muuttuu, tarvitset enemmän kuin työnhakuvinkkejä. Autamme sinua rakentamaan uuden toimivan suunnan.",
    practice: [
      "Arvioit vaihtoehtosi realistisesti",
      "Tunnistat siirrettävän osaamisesi",
      "Suunnittelet uuden urapolun tai koulutusvaihtoehdot",
      "Saat tukea muutostilanteeseen",
    ],
    result: "Löydät suunnan joka toimii myös pitkällä aikavälillä – ei vain seuraavaa työpaikkaa.",
    ctaText: "Rakenna uusi polku →",
  },
  {
    id: "polku5",
    image: nostePathOwnwork,
    title: "Rakenna oma tapasi tehdä työtä",
    ingressi: "Työ ei synny enää vain valmiista paikoista. Voit myös rakentaa sen itse – projekteista, toimeksiannoista tai yrittäjyydestä.",
    practice: [
      "Sanoitat osaamisesi uudella tavalla",
      "Tunnistat mahdollisuuksia ympärilläsi",
      "Rakennat omaa profiilia ja näkyvyyttä",
      "Saat sparrausta ja verkostoja",
    ],
    result: "Voit luoda työtä omilla ehdoillasi – ei vain hakea sitä.",
    ctaText: "Luo oma profiilisi →",
    badge: "HAASTE",
  },
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

/* ────────────── Hooks ────────────── */

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

/* ────────────── Page ────────────── */

const WorkPlusPage = () => {
  const { openWizard } = useWizard();
  const [muutosturvaOpen, setMuutosturvaOpen] = useState(false);
  const [activeSituation, setActiveSituation] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const stepsReveal = useScrollReveal();
  const pathRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSituationClick = useCallback((id: string) => {
    setActiveSituation(id);
    setOpenPanel(null);
    // Scroll to the path
    setTimeout(() => {
      pathRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleCtaClick = useCallback((id: string) => {
    setOpenPanel((prev) => (prev === id ? null : id));
  }, []);

  return (
    <Layout>
      <SEO title={"NOSTE – Työhönvalmennus ja uramuutos KUUMA-seudulla | KeudaPRO"} description={"Työnhakijoille ja siirtymävaiheessa oleville: viisi polkua, ARPRO AI-työnhaku, LinkedIn- ja 3T-kortti, alueellinen työhönvalmennus – maksuton työttömille."} path="/noste" />
      {/* HERO CAROUSEL */}
      <HeroCarousel onSituationActivate={handleSituationClick} />

      {/* Empaattinen avauslause */}
      <section className="py-12 md:py-16">
        <div className="keuda-container">
          <p className="text-base md:text-lg text-muted-foreground text-center max-w-[640px] mx-auto leading-relaxed">
            Muutos voi tuntua sekavalta – oli kyse sitten uuden suunnan etsimisestä, työelämään palaamisesta tai oman polun rakentamisesta. Me autamme sinua löytämään seuraavan askeleen, juuri sinun tilanteestasi käsin.
          </p>
        </div>
      </section>

      {/* TILANNEVALINTA + POLUT */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          {/* Tilannevalinta */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Missä tilanteessa olet nyt?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Valitse tilanteeseesi sopivin – näet suoraan oikeat ratkaisut.
            </p>

            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap justify-center gap-3">
                {situations.map((s) => (
                  <Tooltip key={s.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSituationClick(s.id)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200",
                          activeSituation === s.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-primary/30 hover:bg-primary/10 hover:border-primary/60"
                        )}
                      >
                        {s.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-center">
                      <p className="text-xs">{s.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Viisi polkua */}
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {pathsData.map((path) => {
              const isExpanded = activeSituation === path.id || activeSituation === null;
              const isActive = activeSituation === path.id;

              return (
                <div
                  key={path.id}
                  ref={(el) => { pathRefs.current[path.id] = el; }}
                  className={cn(
                    "rounded-xl border overflow-hidden bg-card transition-all duration-300",
                    isActive ? "border-primary shadow-lg" : "border-border",
                    !isExpanded && "opacity-60"
                  )}
                >
                  {/* Compact header (always visible) */}
                  <button
                    onClick={() => handleSituationClick(path.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {path.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                          {path.badge}
                        </span>
                      )}
                      <span className="font-bold text-foreground">{situations.find(s => s.id === path.id)?.label}</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300",
                      isActive && "rotate-180"
                    )} />
                  </button>

                  {/* Expanded content */}
                  {isActive && (
                    <div className="animate-accordion-down">
                      {/* Image */}
                      <div className="relative h-[140px] overflow-hidden">
                        <img
                          src={path.image}
                          alt={path.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={576}
                        />
                        <div className="absolute inset-0 bg-black/25" />
                      </div>

                      {/* Content */}
                      <div className="p-5 md:p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{path.title}</h3>
                        <p className="italic text-muted-foreground text-sm mb-5">{path.ingressi}</p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="font-bold text-foreground text-sm mb-2">Mitä teet käytännössä?</h4>
                            <ul className="space-y-1.5">
                              {path.practice.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm mb-2">Mitä tämä mahdollistaa?</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{path.result}</p>
                          </div>
                        </div>

                        <Button
                          variant="cta"
                          size="lg"
                          className="w-full"
                          onClick={() => handleCtaClick(path.id)}
                        >
                          {path.ctaText}
                        </Button>

                        {/* Panel */}
                        {path.id === "polku1" && <Panel1 open={openPanel === "polku1"} onClose={() => setOpenPanel(null)} onOpenMuutosturva={() => setMuutosturvaOpen(true)} />}
                        {path.id === "polku2" && <Panel2 open={openPanel === "polku2"} onClose={() => setOpenPanel(null)} onOpenMuutosturva={() => setMuutosturvaOpen(true)} />}
                        {path.id === "polku3" && <Panel3 open={openPanel === "polku3"} onClose={() => setOpenPanel(null)} onOpenMuutosturva={() => setMuutosturvaOpen(true)} />}
                        {path.id === "polku4" && <Panel4 open={openPanel === "polku4"} onClose={() => setOpenPanel(null)} onOpenMuutosturva={() => setMuutosturvaOpen(true)} />}
                        {path.id === "polku5" && <Panel5 open={openPanel === "polku5"} onClose={() => setOpenPanel(null)} onOpenMuutosturva={() => setMuutosturvaOpen(true)} />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Ristiin-nosto ÄLY */}
      <div className="py-6 text-center">
        <span className="text-sm text-muted-foreground">Kiinnostaisiko myös osaamisen kehittäminen, johtaminen tai tekoäly? </span>
        <a href="/aly" className="text-sm font-medium text-primary hover:underline">Tutustu ÄLY-reittiin →</a>
      </div>

      <MuutosturvaFormModal open={muutosturvaOpen} onOpenChange={setMuutosturvaOpen} />
      
    </Layout>
  );
};

export default WorkPlusPage;
