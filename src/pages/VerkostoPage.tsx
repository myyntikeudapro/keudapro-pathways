import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Check, Users, Lightbulb, Handshake, Rocket, Network, GraduationCap, Sparkles, Leaf, Globe, Brain, Heart, Briefcase, Send, ClipboardList, ArrowRight, ChevronDown } from "lucide-react";

import partnerNetwork from "@/assets/operator-partner-network.jpg";
import kasvuVerkosto from "@/assets/kasvu-verkosto.jpg";
import imgRouteOpinnaytetyo from "@/assets/audience-expert.jpg";
import imgRouteIdea from "@/assets/dev-step-ajattelu.jpg";
import imgThemeHuman from "@/assets/audience-leader.jpg";
import imgThemeAi from "@/assets/banner-osaaminen-ai.jpg";
import imgThemeKestava from "@/assets/dev-step-kulttuuri.jpg";
import imgThemeKumppanit from "@/assets/audience-renewal.jpg";
import imgThemeKv from "@/assets/banner-osaaminen-suunta.jpg";
import imgThemeTyollisyys from "@/assets/audience-supervisor.jpg";
import imgThemeJohtaminen from "@/assets/dev-step-toiminta.jpg";
import imgFormatAamukahvit from "@/assets/banner-osaaminen-kortit.jpg";
import imgFormatTyopajat from "@/assets/dev-step-tyokalut.jpg";
import imgFormatWebinaarit from "@/assets/banner-osaaminen-ratkaisee.jpg";
import imgFormatVerkostot from "@/assets/kasvu-verkosto.jpg";
import imgBenefitHankkeet from "@/assets/cat-toimialakohtaiset.jpg";
import imgBenefitNakyvyys from "@/assets/banner-osaaminen-ratkaisee.jpg";
import imgBenefitAsiakkuudet from "@/assets/audience-supervisor.jpg";
import imgBenefitEkosysteemi from "@/assets/kasvu-verkosto.jpg";

const providerBenefits = [
  {
    id: "hankkeet",
    icon: Network,
    title: "Pääset mukaan oikeisiin hankkeisiin",
    desc: "Konkreettiset toimeksiannot, joissa osaamisesi pääsee käyttöön.",
    image: imgBenefitHankkeet,
    body: "Tarjoamme reitin koulutuksiin, valmennuksiin ja kehittämishankkeisiin yhdessä yritysten, oppilaitosten ja julkisten toimijoiden kanssa. Saat säännöllisesti tietoa tulevista hankkeista, kilpailutuksista ja yhteiskehittämisen mahdollisuuksista.",
  },
  {
    id: "nakyvyys",
    icon: Users,
    title: "Rakennat näkyvyyttä ja vaikuttavuutta",
    desc: "Osana KUUMA-seudun tunnistettua osaamisen operaattoria.",
    image: imgBenefitNakyvyys,
    body: "Toimit osana KUUMA-seudun tunnistettua osaamisen operaattoria ja saat näkyvyyttä luotettavassa verkostossa. Tulet esiin KeudaPRO:n viestinnässä, tilaisuuksissa ja palveluvalikoimassa – niin yritysten kuin julkisten ostajien suuntaan.",
  },
  {
    id: "asiakkuudet",
    icon: Handshake,
    title: "Saat uusia asiakkuuksia",
    desc: "Yhdistämme tarpeet ja osaajat ohjatusti.",
    image: imgBenefitAsiakkuudet,
    body: "Yhdistämme palveluntuottajat yritysten ja organisaatioiden tarpeisiin – jatkuvasti ja ohjatusti. Hub-tiimi tunnistaa kysyntää, käy keskustelut asiakkaiden kanssa ja kokoaa juuri sopivan toteuttajakokoonpanon.",
  },
  {
    id: "ekosysteemi",
    icon: Rocket,
    title: "Olet osa toimivaa ekosysteemiä",
    desc: "Verkosto, jossa ideat viedään käytäntöön yhdessä.",
    image: imgBenefitEkosysteemi,
    body: "KeudaPRO ei ole pelkkä tuottajalista – se on toimiva ekosysteemi, jossa yhteiskehittäminen on arkea. Saat tukea, sparrausta ja kumppanuuksia muiden asiantuntijoiden ja oppilaitosten kanssa.",
  },
];

const providerCriteria = [
  "Asiantuntijuus koulutuksessa, valmennuksessa, kehittämisessä, tekoälyssä, työllistymisessä tai johtamisessa",
  "Halu tehdä yhteistyötä verkoston muiden toimijoiden kanssa",
  "Kyky toimia laadukkaasti ja asiakaslähtöisesti",
  "Sitoutuminen KeudaPRO:n yhteisiin pelisääntöihin ja laatukriteereihin",
];

const hubThemes = [
  {
    id: "inhimillisesti-alykas",
    icon: Heart,
    title: "Inhimillisesti älykäs ja turvallinen työelämä",
    desc: "Ihminen keskiössä – teknologia tukena.",
    image: imgThemeHuman,
    body: "Rakennamme työelämää, jossa turvallisuus, hyvinvointi ja inhimillisyys yhdistyvät tekoälyn ja datan tuomiin mahdollisuuksiin. Etsimme ideoita, jotka vahvistavat työyhteisöjen psykologista turvallisuutta, johtamiskulttuuria ja arjen jaksamista.",
  },
  {
    id: "tekoaly-data",
    icon: Brain,
    title: "Tekoäly, data ja uudistuminen",
    desc: "AI käyttöön koulutuksessa, johtamisessa ja palveluissa.",
    image: imgThemeAi,
    body: "Kehitämme tekoälyn ja datan käytäntöjä koulutuksen, asiakkuuksien ja palvelumuotoilun rajapinnoilla. Sopii opinnäytetöihin, piloteille ja yhteiskehittämiseen, jotka tuottavat mitattavaa hyötyä.",
  },
  {
    id: "kestava-osaaminen",
    icon: Leaf,
    title: "Kestävä ja vihreä osaaminen",
    desc: "Vihreä siirtymä ja kestävät käytännöt.",
    image: imgThemeKestava,
    body: "Vihreän siirtymän ja kestävän liiketoiminnan osaamistarpeet kasvavat. Etsimme malleja, koulutuksia ja työkaluja, joilla organisaatiot pääsevät kiinni kestävyysmuutokseen konkreettisesti.",
  },
  {
    id: "kumppanuudet",
    icon: Handshake,
    title: "Kumppanuudet ja yhteiskehittäminen",
    desc: "Yhdessä enemmän kuin yksin.",
    image: imgThemeKumppanit,
    body: "Hub yhdistää oppilaitokset, yritykset, julkiset toimijat ja asiantuntijat saman pöydän ääreen. Etsimme yhteiskehittämisen malleja, jotka tuottavat aitoja tuloksia – eivät vain tilaisuuksia.",
  },
  {
    id: "kansainvalisyys",
    icon: Globe,
    title: "Kansainvälinen ja monikielinen koulutus",
    desc: "Globaali osaaminen ja kielet.",
    image: imgThemeKv,
    body: "Suomalainen työelämä on yhä monikielisempi. Etsimme malleja, joilla työpaikkasuomi, kielelliset valmiudet ja kansainvälinen yhteistyö viedään käytäntöön.",
  },
  {
    id: "tyollisyys",
    icon: Briefcase,
    title: "Työllisyys ja jatkuva oppiminen",
    desc: "Polkuja työhön ja uuteen osaamiseen.",
    image: imgThemeTyollisyys,
    body: "Työn murros vaatii joustavia oppimispolkuja ja vahvaa yhteistyötä työllisyystoimijoiden kanssa. Etsimme käytännön ratkaisuja, jotka helpottavat siirtymiä työelämään ja uudelleenkouluttautumista.",
  },
  {
    id: "johtaminen",
    icon: Sparkles,
    title: "Johtaminen ja Human Future – inhimillinen kilpailuetu",
    desc: "Johtaminen on tulevaisuuden kilpailutekijä.",
    image: imgThemeJohtaminen,
    body: "Tulevaisuuden johtaminen rakentuu inhimillisyydelle, oppimiselle ja kyvylle uudistua. Hub kehittää johtamiskäytäntöjä, jotka tekevät ihmisestä organisaation suurimman vahvuuden.",
  },
];

const hubFormats = [
  { title: "Aamukahvit ja Hub Live", text: "Lyhyet verkkokeskustelut ajankohtaisista teemoista – kahvi kädessä, ideat liikkeellä.", image: imgFormatAamukahvit },
  { title: "Työpajat ja Grab!-tapaamiset", text: "Osallistavat yhteiskehittämiset ja sparraukset, joissa ratkotaan oikeita haasteita yhdessä.", image: imgFormatTyopajat },
  { title: "Webinaarit ja asiantuntijakeskustelut", text: "Syventävät teemoihin liittyvät tilaisuudet – kuule ja kysy alan kärkinimiltä.", image: imgFormatWebinaarit },
  { title: "Verkostot ja uutiskirjeet", text: "Pysy mukana virrassa: kuukausittain koostettua tietoa, uusia avauksia ja kutsuja.", image: imgFormatVerkostot },
];

const hubProcess = [
  { title: "Ehdotuksen jättäminen", text: "Jätä opinnäyte- tai ideaehdotus verkkolomakkeella." },
  { title: "Arviointi", text: "Hub-tiimi arvioi ehdotukset kuukausittain ja luokittelee ne teemoittain." },
  { title: "Valinta ja yhteydenotto", text: "Valituista ehdotuksista otetaan yhteyttä ja sovitaan yhteinen tapaaminen." },
  { title: "Toteutus", text: "Yhteinen projekti, pilotti, opinnäytetyö tai koulutuskokeilu." },
  { title: "Tulokset ja näkyvyys", text: "Tulokset julkaistaan KeudaPRO Hubin kanavissa ja yhteisötilaisuuksissa." },
];

const VerkostoPage = () => {
  const location = useLocation();
  const [openTheme, setOpenTheme] = useState<string | null>(hubThemes[0].id);
  const [openBenefit, setOpenBenefit] = useState<string | null>(providerBenefits[0].id);
  useEffect(() => {
    if (location.hash === "#hub") {
      const el = document.getElementById("hub");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <Layout>
      <SEO
        title={"HUB-verkosto – Liity KeudaPRO:n verkostoon | KeudaPRO"}
        description={"HUB-verkosto kokoaa KeudaPRO:n palveluntuottajat, asiantuntijat, opiskelijat ja kehittäjät yhteen KUUMA-seudulla. Hae palveluntuottajaksi tai tule mukaan Hubiin."}
        path="/verkosto"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img src={partnerNetwork} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-teal-900/60" />
        <div className="relative z-10 keuda-container text-center">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-600 text-white text-xs font-semibold mb-5">
            HUB-verkosto
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
            HUB-verkosto – KUUMA-seudun osaamisen ekosysteemi
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            KeudaPRO yhdistää palveluntuottajat, asiantuntijat, opiskelijat ja kehittäjät yhdeksi toimivaksi ekosysteemiksi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild variant="cta" size="lg">
              <a href="#palveluntuottaja">Hae palveluntuottajaksi</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/40 text-white hover:bg-white hover:text-foreground">
              <a href="#hub">Tutustu Hubiin</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Palveluntuottajaverkosto */}
      <section id="palveluntuottaja" className="py-16 md:py-24 scroll-mt-24">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">
              Asiantuntijaverkosto
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hae KeudaPRO:n palveluntuottajaksi
            </h2>
            <p className="text-lg text-muted-foreground">
              Verkostomme asiantuntijat ja organisaatiot toteuttavat koulutuksia, valmennuksia ja
              kehittämishankkeita yhdessä. Mukana saat näkyvyyttä, vaikuttavuutta ja uusia asiakkuuksia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {providerBenefits.map((b) => (
              <div key={b.title} className="keuda-card-enhanced p-6 flex gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-muted/40 rounded-2xl p-6 md:p-8 border border-border">
            <h3 className="font-semibold text-foreground mb-4 text-lg">Kenelle verkosto sopii?</h3>
            <ul className="space-y-3 mb-6">
              {providerCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-teal-700" />
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
              <Link to="/yhteystiedot?aihe=palveluntuottaja">Jätä hakemus →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KeudaPRO Hub */}
      <section id="hub" className="py-16 md:py-24 bg-[#E4F0EE] scroll-mt-24">
        <div className="keuda-container">
          {/* Intro */}
          <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mb-14">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">
                KeudaPRO Hub
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Yhteisö tulevaisuuden työelämän rakentajille
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                KeudaPRO Hub on yhteisö ja kehittämisen alusta, jossa rakennamme tämän päivän ja
                huomisen työelämää yhdessä. Täällä opiskelijat, opettajat, yritykset ja
                asiantuntijat jakavat ideoita, kokeilevat uutta ja kehittävät ratkaisuja, jotka
                vahvistavat inhimillisesti älykästä ja turvallista työelämää.
              </p>
              <p className="text-base text-muted-foreground italic">
                Hubiin osallistuminen on avointa ja maksutonta – tämä on yhteisö, jossa annetaan ja saadaan.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={kasvuVerkosto} alt="KeudaPRO Hub" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Two routes */}
          <div className="max-w-6xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
              Miten voit osallistua?
            </h3>
            <p className="text-center text-muted-foreground mb-8">
              KeudaPRO Hubiin voi tulla mukaan kahdella pääreitillä.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={imgRouteOpinnaytetyo} alt="Opinnäytetyö- ja harjoittelureitti" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur">
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Reitti 1</span>
                  </div>
                  <h4 className="absolute bottom-4 left-5 right-5 text-xl font-bold text-white leading-tight">
                    Opinnäytetyö- ja harjoittelureitti
                  </h4>
                </div>
                <div className="flex flex-col flex-1 p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Korkeakouluopiskelijoille, jotka haluavat tehdä opinnäytetyön tai
                  kehittämisprojektin KeudaPRO:n teemoista.
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">Voit esimerkiksi</p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Tutkia tekoälyn hyödyntämistä koulutuksessa tai asiakkuuksissa</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Kehittää kestävän koulutuksen mallia tai uutta valmennuskonseptia</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Analysoida asiakaskokemusta, oppimisen vaikuttavuutta tai markkinadataa</li>
                  </ul>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">Hub tarjoaa</p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Ohjaavan KeudaPRO-tiimin tuen</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Todellisen työelämäkontekstin ja näkyvyyden tuloksille</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Mahdollisuuden verkostoitua ja jatkaa yhteistyötä</li>
                  </ul>
                </div>
                <Button asChild variant="cta" size="lg" className="mt-auto w-full sm:w-auto">
                  <a href="https://www.lyyti.in/Opinnaytetyoyhteistyon_lomake_1382" target="_blank" rel="noopener noreferrer">
                    Opinnäytetyö- ja harjoittelulomake <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={imgRouteIdea} alt="Idea- ja koulutuspalvelureitti" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur">
                    <Lightbulb className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Reitti 2</span>
                  </div>
                  <h4 className="absolute bottom-4 left-5 right-5 text-xl font-bold text-white leading-tight">
                    Idea- ja koulutuspalvelureitti
                  </h4>
                </div>
                <div className="flex flex-col flex-1 p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Sinulle, jolla on idea, koulutusaihio tai kehitysehdotus, jonka haluaisit
                  toteuttaa yhdessä KeudaPRO:n kanssa.
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">Voit esimerkiksi</p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Ehdottaa uutta koulutustuotetta tai valmennusta</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Tuoda esiin koulutusalan ongelman tai kehityskohteen</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Tarjota yhteistyötä tai asiantuntijapanosta Hubin teemoihin</li>
                  </ul>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">Hub tarjoaa</p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Mahdollisuuden arvioida ideasi osana yhteistä kehityssykliä</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Verkoston ja tuen idean pilotointiin</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" /> Palautteen ja jatkokehityksen mahdollisuuden</li>
                  </ul>
                </div>
                <Button asChild variant="cta" size="lg" className="mt-auto w-full sm:w-auto">
                  <a href="https://www.lyyti.in/Idea_ja_koulutuspalvelulomake_7893" target="_blank" rel="noopener noreferrer">
                    Idea- ja koulutuspalvelulomake <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className="max-w-5xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Näin prosessi etenee
            </h3>
            <ol className="grid md:grid-cols-5 gap-4">
              {hubProcess.map((s, i) => (
                <li key={s.title} className="bg-white rounded-xl p-5 border border-border shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-semibold mb-3 text-sm">
                    {i + 1}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1.5 text-sm">{s.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Themes */}
          <div className="max-w-5xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
              Hubin teemat
            </h3>
            <p className="text-center text-muted-foreground mb-8">
              Ideointi ja yhteistyö keskittyvät seuraaviin kehittämisen painopisteisiin.
            </p>
            <div className="flex flex-col gap-3">
              {hubThemes.map((t) => {
                const isOpen = openTheme === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-xl border bg-white overflow-hidden transition-all duration-300",
                      isOpen ? "border-teal-600 shadow-md" : "border-border"
                    )}
                  >
                    <button
                      onClick={() => setOpenTheme(isOpen ? null : t.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                        isOpen ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700"
                      )}>
                        <t.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground leading-snug">{t.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                      </div>
                      <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="animate-accordion-down grid md:grid-cols-[220px_1fr]">
                        <div className="relative h-40 md:h-full overflow-hidden">
                          <img src={t.image} alt={t.title} loading="lazy" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
                        </div>
                        <div className="p-5 md:p-6">
                          <p className="text-sm text-foreground leading-relaxed">{t.body}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participation formats */}
          <div className="max-w-6xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
              Osallistumisen muodot
            </h3>
            <p className="text-center text-muted-foreground mb-8">
              KeudaPRO Hub tarjoaa yhteisölleen erilaisia maksuttomia osallistumismuotoja.
            </p>
            <Carousel opts={{ align: "start", loop: true }} className="max-w-6xl mx-auto px-2">
              <CarouselContent className="-ml-4">
                {hubFormats.map((f) => (
                  <CarouselItem key={f.title} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="relative h-44 overflow-hidden">
                        <img src={f.image} alt={f.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <h4 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white leading-tight">
                          {f.title}
                        </h4>
                      </div>
                      <div className="p-5 flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-2" />
              <CarouselNext className="hidden sm:flex -right-2" />
            </Carousel>
          </div>

          {/* Values */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-border shadow-sm text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">
              Hubin arvoperusta
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Välitämme – Arvostamme – Uudistumme
            </p>
            <p className="text-muted-foreground">
              KeudaPRO Hub on yhteisö, jossa turvallisuus, inhimillisyys ja tekoäly kohtaavat.
              Yhdessä luomme kestävää ja älykästä työelämää – työpaikka kerrallaan.
            </p>
          </div>

          {/* CTA */}
          <div className="max-w-3xl mx-auto text-center flex flex-wrap gap-3 justify-center">
            <Button asChild variant="cta" size="lg">
              <a href="https://www.lyyti.in/Opinnaytetyoyhteistyon_lomake_1382" target="_blank" rel="noopener noreferrer">
                <ClipboardList className="w-4 h-4 mr-1" /> Opinnäytetyölomake
              </a>
            </Button>
            <Button asChild variant="cta" size="lg">
              <a href="https://www.lyyti.in/Idea_ja_koulutuspalvelulomake_7893" target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-1" /> Idealomake
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/yhteystiedot?aihe=hub">Kysy lisää Hubista</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VerkostoPage;
