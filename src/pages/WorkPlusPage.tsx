import { useState, useEffect, useRef, useCallback } from "react";

import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Handshake, Rocket, ChevronDown, Wallet, ShieldCheck, Sparkles, Lock, MessageSquare, Clock, UserCheck } from "lucide-react";

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
import coachAna from "@/assets/coach-ana.png";
import nostePathBranding from "@/assets/noste-path-branding.jpg";
import nostePathEmployment from "@/assets/noste-path-employment.jpg";
import nostePathTransition from "@/assets/noste-path-transition.jpg";
import nostePathOwnwork from "@/assets/noste-path-ownwork.jpg";
import nosteCTABg from "@/assets/noste-cta-bg.jpg";
import nosteTransition from "@/assets/noste-transition.jpg";

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
    title: "Hahmottele suunnitelmaa AI-valmentajan kanssa",
    text: "Anonyymi keskustelu joka antaa sinulle nopean kuvan vaihtoehdoista – omaan tahtiin, ilman kirjautumista.",
    badge: "n. 10 min",
    note: "Ei tallenna henkilötietoja",
  },
  {
    icon: Handshake,
    title: "Tarkenna suunnitelmia Reittivalmentajan kanssa",
    text: "Ihminen sparraa kanssasi tilanteen läpi ja yhdistää sinut oikeaan asiantuntijaan tai palveluun.",
    badge: "45 min",
    note: "Maksuton ja luottamuksellinen",
  },
  {
    icon: Rocket,
    title: "Aloitat oman polkusi",
    text: "Saat konkreettisen suunnitelman ja tuen matkan varrella – etenet omassa tahdissasi.",
    badge: "Heti",
    note: "Voit jatkaa milloin haluat",
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
      <section className="py-16 md:py-20 bg-[#E4F0EE]">
        <div className="keuda-container">
          {/* Tilannevalinta */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Missä tilanteessa olet nyt?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Valitse tilanteeseesi sopivin – näet suoraan oikeat ratkaisut.
            </p>

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


      {/* Muutosturva-nosto – huomiota herättävä budjettiframing */}
      <section className="py-16 md:py-24 bg-foreground">
        <div className="keuda-container">
          <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-primary/20 grid md:grid-cols-2 bg-card">
            {/* Vasen: kuva + overlay */}
            <div className="relative min-h-[280px] md:min-h-[460px]">
              <img
                src={nosteTransition}
                alt="Muutosturvaan oikeutettu henkilö keskustelemassa valmentajan kanssa"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                width={1024}
                height={576}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/85 via-foreground/55 to-primary/40" />
              <div className="relative z-10 h-full flex flex-col justify-between p-7 md:p-10 text-background">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vain muutosturvan piirissä oleville
                </span>
                <div>
                  <div className="text-5xl md:text-7xl font-black leading-none mb-2 text-secondary">
                    € 0
                  </div>
                  <p className="text-sm md:text-base text-background/85 max-w-[280px]">
                    Sinulle maksuton – kustannukset katetaan muutosturvan koulutusbudjetista.
                  </p>
                </div>
              </div>
            </div>

            {/* Oikea: viesti + CTA */}
            <div className="p-7 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 self-start mb-4 text-xs font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="w-4 h-4" />
                Muutosturva
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-foreground mb-4 leading-tight">
                Mihin aiot käyttää <span className="text-primary">koulutusbudjettisi?</span>
              </h3>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                Jos työsuhteesi on päättymässä tai päättynyt tuotannollisista syistä, sinulla on lakisääteinen oikeus muutosturvakoulutukseen – jopa <strong className="text-foreground">enintään 2 kk palkkaa vastaavan</strong> arvosta. Älä jätä sitä käyttämättä.
              </p>

              <ul className="space-y-2.5 mb-7">
                {[
                  { icon: Wallet, text: "Koulutuksen rahoittaa työnantajasi tai TE-palvelut – ei sinun lompakkosi" },
                  { icon: Rocket, text: "Valitset itse polun: uudelleenkoulutus, sertifikaatti tai uravalmennus" },
                  { icon: ShieldCheck, text: "Käytettävissä 12 kk irtisanomisesta – me autamme hakemuksessa" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </span>
                    <span className="pt-1">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="cta" size="lg" onClick={() => setMuutosturvaOpen(true)} className="flex-1">
                  Selvitä oikeutesi ilmaiseksi →
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Vastaat muutamaan kysymykseen – saat henkilökohtaisen ehdotuksen 24 h sisällä.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Miten pääset alkuun – tumma osio */}
      <section
        ref={stepsReveal.ref}
        className="py-16 md:py-24 bg-foreground overflow-hidden relative"
        style={{
          opacity: stepsReveal.visible ? 1 : 0,
          transform: stepsReveal.visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 600ms ease-out, transform 600ms ease-out",
        }}
      >
        {/* Subtle background accent */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0%, transparent 50%)" }}
        />

        <div className="keuda-container relative">
          <div className="text-center mb-12 md:mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Kolme askelta
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">Miten pääset alkuun?</h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: "hsl(210 15% 70%)" }}>
              Etene omassa tahdissasi – aloita anonyymisti, jatka ihmisen kanssa kun siltä tuntuu.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto mb-12">
            {gettingStartedSteps.map((step, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-primary/20 p-6 md:p-7 flex flex-col"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
              >
                {/* Step number */}
                <span className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/10 text-background text-[11px] font-semibold">
                    <Clock className="w-3 h-3" />
                    {step.badge}
                  </span>
                </div>

                <h4 className="text-base md:text-lg font-bold text-background mb-2 leading-snug">{step.title}</h4>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "hsl(210 15% 70%)" }}>{step.text}</p>

                <div className="mt-4 pt-4 border-t border-primary/15 flex items-center gap-2 text-xs" style={{ color: "hsl(210 15% 65%)" }}>
                  <Lock className="w-3.5 h-3.5 text-primary/70" />
                  <span>{step.note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI-valmentaja: hyödyt + tietosuoja */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-primary/20 p-6 md:p-8 mb-10"
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <img
                src={coachAna}
                alt="Ana – AI-valmentaja"
                className="w-24 h-24 md:w-40 md:h-40 rounded-2xl object-cover flex-shrink-0 border border-primary/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-background mb-1">Miksi aloittaa AI-valmentajan kanssa?</h3>
                    <p className="text-sm" style={{ color: "hsl(210 15% 70%)" }}>
                      Ei kynnystä, ei kalenteria, ei tuomiota. Saat ensiviipaleen suunnitelmasta omassa tahdissasi.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  {[
                    { icon: Clock, title: "Käytettävissä 24/7", text: "Aloita silloin kun sinulle sopii – yöllä, työmatkalla, sohvalla." },
                    { icon: MessageSquare, title: "Auttaa sanoittamaan", text: "Saat selkeät kysymykset jotka jäsentävät tilanteen." },
                    { icon: UserCheck, title: "Saumaton siirto ihmiselle", text: "Kun olet valmis, jatkat Reittivalmentajan kanssa." },
                  ].map((b, i) => (
                    <div key={i} className="flex flex-col">
                      <b.icon className="w-4 h-4 text-primary mb-2" />
                      <h5 className="text-sm font-bold text-background mb-1">{b.title}</h5>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(210 15% 65%)" }}>{b.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/5 border border-primary/10">
                  <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(210 15% 75%)" }}>
                    <strong className="text-background">Tietosuoja:</strong> Voit keskustella ilman kirjautumista. Emme tallenna henkilötietoja keskustelusta, emmekä jaa sisältöä työnantajalle tai viranomaisille. Ihmiselle siirrytään vain sinun luvallasi.
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* CTAt */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
            <Button variant="cta" size="lg" onClick={openWizard} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Hahmottele AI-valmentajan kanssa
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex-1 bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground"
            >
              <a href="/yhteystiedot">
                <Handshake className="w-4 h-4 mr-2" />
                Varaa aika Reittivalmentajalle
              </a>
            </Button>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "hsl(210 15% 60%)" }}>
            Molemmat ovat maksuttomia ja sinua ei sidota mihinkään.
          </p>
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
