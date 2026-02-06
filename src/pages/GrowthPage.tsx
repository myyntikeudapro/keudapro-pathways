import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { 
  Factory, 
  Building2, 
  Truck, 
  ShoppingBag, 
  Briefcase, 
  Heart, 
  Monitor, 
  UtensilsCrossed, 
  Leaf,
  Rocket,
  TrendingUp,
  RefreshCw,
  Zap,
  Brain,
  Package,
  Globe,
  Compass,
  ChevronRight,
  Quote,
  CheckCircle2,
  BarChart3,
  Target,
  Users
} from "lucide-react";

const pullonkaulat = [
  "päätöksenteon varovaisuus ja epävarmuus investoinneista",
  "myynnin ja markkinoinnin käytännön osaamisvaje",
  "digitaaliset työkalut ja tekoäly jäävät hyödyntämättä arjessa",
  "talous- ja rahoitusosaamisen puutteet epävarmoina aikoina",
  "kasvun johtamisen ja prosessien puutteet",
  "vaikeus muuttaa kehitysideoita teoiksi",
];

const osaamistarpeetNyt = [
  "liiketoiminnan perusymmärrys ja talouden hallinta",
  "asiakaspalvelu ja vuorovaikutus",
  "palveluliiketoiminnan kehittäminen",
  "aloitteellisuus, vastuu ja yrittäjämäinen ajattelu",
  "osaaminen aloilla, joilla osaajapula kasvaa (sote, ICT, palvelut)",
];

const osaamistarpeet1to2 = [
  "tekoälyn hyödyntäminen käytännön työssä",
  "digitaalinen myynti ja markkinointi",
  "asiakaskokemuksen johtaminen",
  "talous- ja rahoitusosaaminen epävarmuuden keskellä",
  "tuki alanvaihtajille ja uusille kasvualoille siirtyville",
];

const osaamistarpeet3to5 = [
  "kestävä liiketoiminta ja vastuullisuus",
  "TKI-osaaminen ja kehittämiskyvykkyys",
  "ekosysteemit ja verkostomainen yhteistyö",
  "omistajanvaihdokset ja yritysjärjestelyt",
  "kansainvälistymisen valmiudet",
];

const steps = [
  {
    number: 1,
    title: "Kartoitus ja tilannekuva",
    description: "Tunnistamme kasvun esteet, osaamisvajeet ja kasvupotentiaalin.",
  },
  {
    number: 2,
    title: "Kehityspolku ja kokeilu",
    description: "Rakennetaan selkeä etenemissuunnitelma ja käynnistetään konkreettinen kokeilu.",
  },
  {
    number: 3,
    title: "Ratkaisut ja toteutus",
    description: "Kun suunta on selvä, viemme kehittämisen käytäntöön oikeilla työkaluilla ja osaajilla.",
  },
];

const teknologiahubiItems = [
  "tunnistaa ilmiöt, kasvualat ja kehitystarpeet",
  "muodostaa alueellisen tilannekuvan ja yritysanalyysin",
  "ohjaa yritykset oikeille kasvupoluille",
  "yhdistää verkostot ja kehitystoimijat",
];

const keudaproItems = [
  "toteuttaa kehittämisen käytännössä",
  "rakentaa osaamista ja toimintamalleja",
  "tuottaa valmennukset, pilotit ja sparrauksen",
  "mahdollistaa kehitysprojektit ja kokeilut",
  "auttaa yritystä ottamaan digitalisaation ja tekoälyn käyttöön",
];

const kasvualat = [
  { icon: Factory, label: "Teollisuus ja tuotanto" },
  { icon: Building2, label: "Rakentaminen ja kiinteistöpalvelut" },
  { icon: Truck, label: "Logistiikka ja kuljetus" },
  { icon: ShoppingBag, label: "Kauppa ja palvelut" },
  { icon: Briefcase, label: "Asiantuntija- ja yrityspalvelut" },
  { icon: Heart, label: "Hyvinvointi- ja sote-palvelut" },
  { icon: Monitor, label: "ICT ja digipalvelut" },
  { icon: UtensilsCrossed, label: "Ruoka- ja elintarvikeala" },
  { icon: Leaf, label: "Energia ja vihreä siirtymä" },
];

const yrittajyysPolut = [
  { icon: Rocket, title: "Aloittava yrittäjä", description: "Perustukset, rohkeus ja ensimmäiset asiakkaat." },
  { icon: TrendingUp, title: "Pk-yrityksen kasvu (5–25 hlö)", description: "Skaalaus, prosessit, johtaminen ja myynnin vahvistaminen." },
  { icon: RefreshCw, title: "Omistajanvaihdos / sukupolvenvaihdos", description: "Uusi suunta ja jatkuvuuden varmistaminen." },
  { icon: Zap, title: "Digiloikka", description: "Työkalut, automaatio ja toiminnan tehostaminen." },
  { icon: Brain, title: "Tekoälypolku (AI käyttöön arjessa)", description: "Käytännön pilotit ja tekoälyn hyödyntäminen liiketoiminnassa." },
  { icon: Package, title: "Tuote- ja palvelukehitys", description: "Uusi palvelu, konseptointi ja markkinatestit." },
  { icon: Globe, title: "Kansainvälistyminen", description: "Verkostot, markkinat ja myynnin kanavat." },
  { icon: Compass, title: "Uudistuminen ja suunnanmuutos", description: "Kasvun uudelleen rakentaminen murroksessa." },
];

const dataAnalyysiItems = [
  "yrityskanta kunnittain ja toimialoittain",
  "yritysten kokoluokat (henkilöstömäärä)",
  "kasvupotentiaaliluokitukset",
  "ammattisiirtymien ja osaajapulan suuntaviivat",
  "toimialojen kehityssuunnat ja tarpeet",
];

const mitaYritysSaaItems = [
  "selkeä kasvutilannekuva ja päätöksenteon tuki",
  "konkreettinen kehityspolku ja prioriteetit",
  "käytännön sparraus ja rohkeuden vahvistaminen",
  "tuki myynnin, markkinoinnin ja asiakaskokemuksen kehittämiseen",
  "digitalisaation ja tekoälyn käyttöönoton käytännön apu",
  "mahdollisuus pilotteihin, projekteihin ja verkostoyhteistyöhön",
  "tuki vastuullisuuteen, TKI-kehittämiseen ja omistajanvaihdoksiin",
];

const GrowthPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Kasvu ei synny sattumalta.<br />
              <span className="text-primary">Se rakennetaan.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              KUUMA-alueen pienyrityksissä kasvun este ei ole halun puute – vaan rohkeuden, osaamisen ja käytännön toteutuksen puute.
              Me autamme tunnistamaan kasvun mahdollisuudet ja viemään ne käytäntöön.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-base">
                Aloita kasvukartoitus
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Katso kasvun polut
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Dataan perustuva tilannekuva – osaamisen vahvistaminen – konkreettiset ratkaisut
            </p>
          </div>
        </div>
      </section>

      {/* Miksi kasvu tarvitsee tukea? */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Miksi kasvu tarvitsee tukea?" />
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
              Kasvun pullonkaulat ovat tunnistettavissa – ja ratkaistavissa
            </h3>
            <p className="text-muted-foreground mb-6">
              Keski-Uudenmaan yrityskanta painottuu vahvasti palvelualoihin. Tämä tarkoittaa, että kasvu syntyy usein asiakaskokemuksesta, myynnistä, vuorovaikutuksesta ja liiketoiminnan kehittämisestä – ei vain tuotteista.
            </p>
            <ul className="space-y-3 mb-8">
              {pullonkaulat.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
              <Quote className="w-8 h-8 text-primary/40 mb-2" />
              <p className="text-lg font-medium text-foreground italic">
                "Kasvu ei kaadu idean puutteeseen. Se kaatuu siihen, ettei kukaan auta toteuttamaan."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Osaamistarpeiden kartta */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Yritysten osaamistarpeet nyt ja tulevaisuudessa" />
          <p className="text-center text-muted-foreground mt-4 mb-10 max-w-2xl mx-auto">
            Kasvun tukeminen ei ole yksi palvelu – se on kyky vastata oikeisiin osaamistarpeisiin oikealla hetkellä.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Nyt */}
            <div className="keuda-card-enhanced p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Tärkeimmät osaamiset juuri nyt</h4>
              <ul className="space-y-2">
                {osaamistarpeetNyt.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* 1-2 vuotta */}
            <div className="keuda-card-enhanced p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Kasvavat osaamistarpeet (1–2 vuotta)</h4>
              <ul className="space-y-2">
                {osaamistarpeet1to2.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* 3-5 vuotta */}
            <div className="keuda-card-enhanced p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Tulevaisuuden osaamistarpeet (3–5 vuotta)</h4>
              <ul className="space-y-2">
                {osaamistarpeet3to5.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-lg font-semibold text-primary mt-10">
            Kasvu syntyy, kun osaaminen ja toteutus kohtaavat.
          </p>
        </div>
      </section>

      {/* Miten Kasvu-reitti toimii? */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Kasvu-reitti etenee kolmessa vaiheessa" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {steps.map((step) => (
              <div key={step.number} className="keuda-card-enhanced p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">{step.number}</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg">Varaa kasvukartoitus</Button>
          </div>
        </div>
      </section>

      {/* Hubi + KeudaPro */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Hubi kartoittaa. KeudaPro toteuttaa." />
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* Teknologiahubi */}
            <div className="keuda-card-enhanced p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Teknologiahubi</h4>
              </div>
              <ul className="space-y-3">
                {teknologiahubiItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* KeudaPro */}
            <div className="keuda-card-enhanced p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">KeudaPro (Pro-polku)</h4>
              </div>
              <ul className="space-y-3">
                {keudaproItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-lg font-semibold text-foreground mt-10 max-w-3xl mx-auto">
            Kaikkea ei tarvitse tehdä itse. Mutta jotain pitää tehdä – ja me autamme aloittamaan.
          </p>
        </div>
      </section>

      {/* KUUMA-alueen kasvualat */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Kasvun kartta: KUUMA-alueen kasvualat" />
          <p className="text-center text-muted-foreground mt-4 mb-10 max-w-3xl mx-auto">
            Kasvu ei jakaudu tasaisesti. Tietyillä toimialoilla on enemmän yrityksiä, enemmän murrosta ja enemmän kasvupotentiaalia.
            Siksi kohdistamme kehittämisen sinne, missä vaikutus on suurin.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kasvualat.map((ala) => (
              <div key={ala.label} className="keuda-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ala.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{ala.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-primary font-semibold mt-8">
            Kasvuala ei ole trendisana – se on dataan perustuva suunta.
          </p>
        </div>
      </section>

      {/* Yrittäjyyden polut */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Yrittäjyyden polut – kasvu ei tarkoita kaikille samaa" />
          <p className="text-center text-muted-foreground mt-4 mb-10 max-w-2xl mx-auto">
            Yritykset ovat eri vaiheissa. Siksi kasvun tukeminen rakennetaan eri poluiksi.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {yrittajyysPolut.map((polku) => (
              <div key={polku.title} className="keuda-card-enhanced p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <polku.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2">{polku.title}</h4>
                <p className="text-sm text-muted-foreground">{polku.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-lg font-semibold text-foreground mt-10">
            Kasvu ei ole yksi reitti. Siksi meillä on polkuja.
          </p>
        </div>
      </section>

      {/* Data-analyysi */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Emme arvaa – analysoimme yrityskannan" />
          <p className="text-center text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
            Rakennamme KUUMA-alueen yrityksistä jatkuvasti päivittyvää tilannekuvaa, jotta kasvu voidaan kohdistaa oikein.
          </p>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-3 mb-8">
              {dataAnalyysiItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 keuda-card p-4">
                  <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-foreground">
                Tämä tekee kasvusta mitattavaa, kohdennettua ja realistista.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mitä yritys saa? */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Tuloksena ei ole raportti – vaan eteneminen" />
          <div className="max-w-3xl mx-auto mt-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {mitaYritysSaaItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 keuda-card p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Haluatko nähdä, missä kasvusi oikeasti piilee?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Aloita kasvukartoituksella. Saat nopeasti selkeyden siihen, mikä estää kasvua, mitä osaamista tarvitaan ja mitä kannattaa tehdä seuraavaksi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button size="lg" className="text-base">
                Varaa kasvukartoitus
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Liity mukaan pilottiin
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kartoitus ei sido mihinkään – mutta se voi avata uuden suunnan.
            </p>
          </div>
        </div>
      </section>

      {/* Footer mission line */}
      <section className="py-8 bg-muted/50 border-t border-border">
        <div className="keuda-container">
          <p className="text-center text-muted-foreground">
            <span className="font-semibold text-foreground">KeudaPro</span> – käytännön kasvua, osaamista ja ratkaisuja KUUMA-alueen yrityksille.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default GrowthPage;
