import { useState } from "react";
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
  ChevronDown,
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Kuvat
import kasvuKirkastus from "@/assets/kasvu-kirkastus.jpg";
import kasvuSprintit from "@/assets/kasvu-sprintit.jpg";
import kasvuVerkosto from "@/assets/kasvu-verkosto.jpg";
import kasvuMyynti from "@/assets/kasvu-myynti.jpg";
import kasvuMarkkinointi from "@/assets/kasvu-markkinointi.jpg";
import kasvuProsessit from "@/assets/kasvu-prosessit.jpg";
import kasvuDigi from "@/assets/kasvu-digi.jpg";
import kasvuUusivaihe from "@/assets/kasvu-uusivaihe.jpg";

// 2️⃣ Ydinhyödyt
const ydinhyodyt = [
  {
    image: kasvuKirkastus,
    title: "Kasvun ja suunnan kirkastus",
    desc: "Mihin yritys on menossa ja mitä osaamista se vaatii"
  },
  {
    image: kasvuSprintit,
    title: "Valmiit ratkaisut ja sprintit",
    desc: "Ei pitkiä projekteja, vaan konkreettisia kokonaisuuksia"
  },
  {
    image: kasvuVerkosto,
    title: "Toteutus ja verkosto",
    desc: "Koulutus, valmennus ja käytännön tuki samasta kokonaisuudesta"
  }
];

// 3️⃣ Kasvupolut
const kasvupolut = [
  {
    id: "myynti",
    image: kasvuMyynti,
    title: "Myynti kasvuun",
    bullets: [
      "Asiakashankinta ja myyntimallit",
      "Myyntiosaaminen arjessa",
      "Tekeminen tuloksiksi"
    ],
    cta: "Katso ratkaisut"
  },
  {
    id: "markkinointi",
    image: kasvuMarkkinointi,
    title: "Markkinointi ja näkyvyys",
    bullets: [
      "Viestin kirkastaminen",
      "Diginäkyvyys",
      "Markkinointiosaaminen tiimissä"
    ],
    cta: "Katso ratkaisut"
  },
  {
    id: "prosessit",
    image: kasvuProsessit,
    title: "Prosessit ja kannattavuus",
    bullets: [
      "Tekemisen selkeytys",
      "Tuottavuus ja roolit",
      "Osaaminen osaksi arkea"
    ],
    cta: "Katso ratkaisut"
  },
  {
    id: "digi",
    image: kasvuDigi,
    title: "Digiloikka ja tekoäly käyttöön",
    bullets: [
      "Liiketoiminnan tuki",
      "Ei teknologiaa teknologian vuoksi",
      "Kyvykkyydet, ei työkalulistoja"
    ],
    cta: "Katso ratkaisut"
  },
  {
    id: "uusivaihe",
    image: kasvuUusivaihe,
    title: "Osaaminen, henkilöstö ja uusi vaihe",
    bullets: [
      "Kieli ja turvallisuus työpaikalla",
      "Osaamisen siirto ja jatkuvuus",
      "Yrityksen uusi suunta tai omistajanvaihdos"
    ],
    cta: "Ratkaisut yrityksen uuteen vaiheeseen"
  }
];

// 4️⃣ Ratkaisukategoriat
const ratkaisukategoriat = [
  { id: "kartoitus", title: "Kasvukartoitus ja suunnitelma" },
  { id: "myynti", title: "Myynti ja asiakashankinta" },
  { id: "markkinointi", title: "Markkinointi ja näkyvyys" },
  { id: "digi", title: "Digiloikka ja tekoäly yritykselle" },
  { id: "tuotteistus", title: "Tuotteistus ja palvelukehitys" },
  { id: "kv", title: "Kansainvälisyys ja KV-rekrytointi", desc: "Kansainväliset osaajat ja toimintamallit" },
  { id: "kieli", title: "Kieli työpaikalla" },
  { id: "turvallisuus", title: "Turvallisuus ja lakisääteiset kortit" },
  { id: "vastuullisuus", title: "Vastuullisuus ja vihreä siirtymä" },
  { id: "toimiala", title: "Toimialakohtaiset lyhytkoulutukset" },
  { id: "uusisuunta", title: "Uusi suunta ja omistajanvaihdos", desc: "Osaamisen, vastuiden ja johtamisen siirtymä" }
];

// 5️⃣ Kärkiratkaisut
const karkiratkaisut = [
  {
    nimi: "Kasvukartoitus",
    kesto: "90 min",
    bullets: ["Nykytilan ja pullonkaulojen tunnistus", "Kasvupotentiaalin arviointi", "Konkreettinen toimenpidesuunnitelma"]
  },
  {
    nimi: "Myyntisprintti",
    kesto: "2 viikkoa",
    bullets: ["Myyntiprosessin rakentaminen", "Ensimmäiset uudet asiakkaat", "Työkalut ja mallit käyttöön"]
  },
  {
    nimi: "Markkinoinnin selkeytys",
    kesto: "1 kk",
    bullets: ["Kohderyhmän ja viestien kirkastus", "Kanavavalinnat ja sisältösuunnitelma", "Mittarit ja seuranta"]
  },
  {
    nimi: "AI-pilotti yritykselle",
    kesto: "4 viikkoa",
    bullets: ["Tekoälyn käyttömahdollisuuksien kartoitus", "Käytännön pilotti valittuun prosessiin", "Osaamisen siirto tiimille"]
  },
  {
    nimi: "KV-rekrytoinnin startti",
    kesto: "2–4 viikkoa",
    bullets: ["Kansainvälisen rekrytoinnin suunnitelma", "Perehdytys ja kulttuuriosaaminen", "KV-kortti ja lakisääteiset vaatimukset"]
  },
  {
    nimi: "Työpaikkasuomi",
    kesto: "4–8 viikkoa",
    bullets: ["Räätälöity kielikoulutus työpaikalle", "Ammattisanasto ja arjen tilanteet", "Joustavat toteutustavat"]
  },
  {
    nimi: "Turvallisuuskortit ja akkuturva",
    kesto: "1–2 päivää",
    bullets: ["Työturvallisuuskortti", "Tulityökortti", "Akkuturvallisuuskoulutus"]
  },
  {
    nimi: "Uusi suunta -kartoitus",
    kesto: "90 min",
    bullets: ["Yrityksen tilanteen arviointi", "Omistajanvaihdoksen vaihtoehdot", "Etenemissuunnitelma"]
  }
];

// 7️⃣ Toimialat
const karkitoimialat = [
  { icon: Factory, label: "Teollisuus" },
  { icon: Building2, label: "Rakentaminen" },
  { icon: Truck, label: "Logistiikka" },
  { icon: ShoppingBag, label: "Kauppa" }
];

const muutToimialat = [
  { icon: Briefcase, label: "Yrityspalvelut" },
  { icon: Heart, label: "Sote ja hyvinvointi" },
  { icon: Monitor, label: "ICT" },
  { icon: UtensilsCrossed, label: "Ruoka-ala" },
  { icon: Leaf, label: "Energia" }
];

// 8️⃣ Toteutusmallit
const toteutusmallit = [
  {
    id: "sprintit",
    title: "Sprintit (2–4 viikkoa)",
    content: "Tiiviit toteutuskokonaisuudet, joissa keskitytään yhteen teemaan ja viedään asia maaliin nopeasti."
  },
  {
    id: "tyopajat",
    title: "Työpajat, valmennukset, korttikoulutukset",
    content: "Osallistavat ja käytännönläheiset toteutukset, joissa opitaan tekemällä ja saadaan valmiudet arkeen."
  },
  {
    id: "ryhma",
    title: "Ryhmä / yksilö",
    content: "Toteutukset voidaan räätälöidä yrityskohtaisesti tai toteuttaa avoimissa ryhmissä."
  },
  {
    id: "mittaus",
    title: "Mitattavuus",
    content: "Jokaiselle toteutukselle asetetaan selkeät tavoitteet ja mittarit, joilla edistymistä seurataan."
  }
];

const toimijat = ["Keuda", "KeudaPRO", "Wolf Pro", "RTK"];

const GrowthPage = () => {
  const [openPolku, setOpenPolku] = useState<string | null>(null);

  return (
    <Layout>
      {/* 1️⃣ HERO */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kasvua yritykselle – myyntiin, markkinointiin ja osaamiseen{" "}
              <span className="text-primary">valmiilla ratkaisuilla.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Kun kasvu, uudistuminen tai yrityksen uusi vaihe vaatii uusia kyvykkyyksiä, autamme viemään osaamisen käytäntöön nopeasti ja hallitusti.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg">Katso kasvuratkaisut</Button>
              <Button size="lg" variant="outline">Keskustele asiantuntijan kanssa</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ MITÄ SAAT KASVU-REITILTÄ */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Mitä KASVU-reitti tarjoaa yritykselle?" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {ydinhyodyt.map((hyoty) => (
              <div key={hyoty.title} className="keuda-card-enhanced overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={hyoty.image} 
                    alt={hyoty.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-semibold text-foreground mb-2">{hyoty.title}</h3>
                  <p className="text-sm text-muted-foreground">{hyoty.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ VALITSE KASVUTAVOITE */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Mitä haluat saada aikaan seuraavaksi?" />
          <div className="max-w-4xl mx-auto mt-8 space-y-4">
            {kasvupolut.map((polku) => (
              <Collapsible
                key={polku.id}
                open={openPolku === polku.id}
                onOpenChange={(open) => setOpenPolku(open ? polku.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="keuda-card p-0 cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex items-center">
                      <div className="w-24 h-20 md:w-32 md:h-24 flex-shrink-0 overflow-hidden">
                        <img 
                          src={polku.image} 
                          alt={polku.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-between px-4 py-3">
                        <span className="font-semibold text-foreground">{polku.title}</span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${openPolku === polku.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="keuda-card mt-1 p-4 border-l-4 border-primary">
                    <ul className="space-y-2 mb-4">
                      {polku.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ArrowRight className="w-3 h-3 text-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" variant="outline">{polku.cta}</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ RATKAISUTARJOTIN */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Ratkaisut, joilla kasvu, uudistuminen ja jatkuvuus varmistetaan" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
            {ratkaisukategoriat.map((kat) => (
              <div 
                key={kat.id} 
                className="keuda-card p-4 hover:shadow-md hover:border-primary/30 transition-all text-center"
              >
                <span className="text-sm font-medium text-foreground block">{kat.title}</span>
                {kat.desc && (
                  <span className="text-xs text-muted-foreground mt-1 block">{kat.desc}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ KASVUN KÄRKIRATKAISUT */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Yritysten suosituimmat ratkaisut" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {karkiratkaisut.slice(0, 8).map((ratkaisu) => (
              <div key={ratkaisu.nimi} className="keuda-card-enhanced p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{ratkaisu.nimi}</h4>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  {ratkaisu.kesto}
                </div>
                <ul className="space-y-1 mb-4">
                  {ratkaisu.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">Lue lisää</Button>
                  <Button size="sm" className="flex-1 text-xs">Pyydä tarjous</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ OSAAMISEN JOHTAMISEN NOSTO */}
      <section className="keuda-section">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Kasvu ei ole yksittäinen koulutus
            </h2>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Kasvu vaatii oikeaa osaamista oikeaan aikaan
              </li>
              <li className="flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Ratkaisut rakentuvat vaiheittain
              </li>
              <li className="flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Yritys etenee omaan tahtiin
              </li>
            </ul>
            <Button variant="link" className="text-primary">
              Lue lisää osaamisen johtamisesta →
            </Button>
          </div>
        </div>
      </section>

      {/* 7️⃣ TOIMIALAT */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Toimialat" />
          <p className="text-center text-muted-foreground mb-6">
            Näille toimialoille meillä on valmiit mallit ja kumppanit.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium text-foreground mb-3 text-center">Kärkitoimialat</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {karkitoimialat.map((ala) => (
                <div key={ala.label} className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                  <ala.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{ala.label}</span>
                </div>
              ))}
            </div>
            
            <p className="text-sm font-medium text-foreground mb-3 text-center">Muut keskeiset alat</p>
            <div className="flex flex-wrap justify-center gap-3">
              {muutToimialat.map((ala) => (
                <div key={ala.label} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <ala.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{ala.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8️⃣ TOTEUTUSMALLI */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Näin toteutamme" />
          <div className="max-w-2xl mx-auto mt-8">
            <Accordion type="single" collapsible className="w-full">
              {toteutusmallit.map((malli) => (
                <AccordionItem key={malli.id} value={malli.id}>
                  <AccordionTrigger className="text-left font-semibold">
                    {malli.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {malli.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* 9️⃣ TOTEUTTAJAVERKOSTO */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Toteuttajaverkosto" />
          <p className="text-center text-muted-foreground mb-6">
            KeudaPRO kokoaa oikeat osaajat ja toteuttajat yrityksesi tarpeeseen.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {toimijat.map((nimi) => (
              <div key={nimi} className="bg-background border border-border rounded-lg px-6 py-3">
                <span className="font-semibold text-foreground">{nimi}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔟 FINAL CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Kasvua, joka kestää myös seuraavaan vaiheeseen.
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button size="lg">Keskustele kasvuratkaisusta</Button>
              <Button size="lg" variant="outline">Katso kaikki ratkaisut</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GrowthPage;
