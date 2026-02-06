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
  TrendingUp,
  Megaphone,
  Settings,
  Brain,
  RefreshCw,
  ShoppingCart,
  Target,
  Package,
  Calculator,
  Users,
  Wrench,
  Cpu,
  UserPlus,
  ChevronDown,
  Quote,
  Clock,
  ArrowRight
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const kasvupolut = [
  {
    id: "myynti",
    icon: TrendingUp,
    title: "Myynti kasvuun",
    bullets: [
      "Myyntiprosessin rakentaminen",
      "Asiakashankinnan tehostaminen",
      "Tarjousten ja hinnoittelun kehittäminen",
      "CRM ja myyntityökalut"
    ]
  },
  {
    id: "markkinointi",
    icon: Megaphone,
    title: "Markkinointi ja näkyvyys",
    bullets: [
      "Digitaalinen markkinointi",
      "Brändin ja viestinnän selkeytys",
      "Sosiaalinen media ja sisällöt",
      "Liidien generointi"
    ]
  },
  {
    id: "toiminta",
    icon: Settings,
    title: "Toiminnan tehostaminen",
    bullets: [
      "Prosessien optimointi",
      "Tuotannon ja palvelun pullonkaulat",
      "Kustannustehokkuus",
      "Laadun varmistaminen"
    ]
  },
  {
    id: "digi",
    icon: Brain,
    title: "Digiloikka ja tekoäly käyttöön",
    bullets: [
      "Tekoälypilotit käytäntöön",
      "Automaatio ja työkalujen käyttöönotto",
      "Digitaalinen asiakaskokemus",
      "Data ja analytiikka"
    ]
  },
  {
    id: "uudistuminen",
    icon: RefreshCw,
    title: "Uusi suunta / omistajanvaihdos",
    bullets: [
      "Liiketoiminnan uudelleensuuntaus",
      "Omistajanvaihdoksen valmistelu",
      "Sukupolvenvaihdos",
      "Strategian kirkastaminen"
    ]
  }
];

const ratkaisukategoriat = [
  { id: "myynti", icon: ShoppingCart, title: "Myynti ja asiakashankinta" },
  { id: "markkinointi", icon: Target, title: "Markkinointi ja näkyvyys" },
  { id: "tuotteistus", icon: Package, title: "Tuotteistus ja palvelukehitys" },
  { id: "talous", icon: Calculator, title: "Talous ja kannattavuus" },
  { id: "johtaminen", icon: Users, title: "Johtaminen ja esihenkilötyö" },
  { id: "digi", icon: Wrench, title: "Digityökalut ja automaatio" },
  { id: "ai", icon: Cpu, title: "Tekoäly käytäntöön (AI-pilotit)" },
  { id: "rekry", icon: UserPlus, title: "Rekrytointi ja osaamisen varmistaminen" }
];

const valmiitRatkaisut = [
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
  }
];

const kasvualat = [
  { icon: Factory, label: "Teollisuus" },
  { icon: Building2, label: "Rakentaminen" },
  { icon: Truck, label: "Logistiikka" },
  { icon: ShoppingBag, label: "Kauppa ja palvelut" },
  { icon: Briefcase, label: "Yrityspalvelut" },
  { icon: Heart, label: "Sote ja hyvinvointi" },
  { icon: Monitor, label: "ICT" },
  { icon: UtensilsCrossed, label: "Ruoka-ala" },
  { icon: Leaf, label: "Energia" }
];

const toimijat = ["Keuda", "KeudaPro", "Wolf Pro", "RTK"];

const GrowthPage = () => {
  const [openPolku, setOpenPolku] = useState<string | null>(null);

  return (
    <Layout>
      {/* 1) HERO */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kasvu ei synny sattumalta.<br />
              <span className="text-primary">Se rakennetaan.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Autamme yrityksiä kasvattamaan myyntiä, näkyvyyttä ja toimintavarmuutta – käytännön ratkaisuilla.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button size="lg">Varaa kasvukartoitus</Button>
              <Button size="lg" variant="outline">Katso kasvupolut</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Tilannekuva → kasvureitti → toteutus.
            </p>
          </div>
        </div>
      </section>

      {/* 2) MIKSI KASVU JUMITTAA */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Miksi kasvu tarvitsee tukea?" />
          <div className="max-w-2xl mx-auto mt-6">
            <ul className="space-y-2 mb-6">
              {[
                "Myynti ei ole systemaattista",
                "Markkinointi ei tuota liidejä",
                "Tekeminen jää suunnitelmaksi",
                "Talouspäätökset epävarmoja",
                "Digi ja tekoäly jää hyödyntämättä"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
              <div className="flex gap-2">
                <Quote className="w-5 h-5 text-primary/50 flex-shrink-0" />
                <p className="text-foreground font-medium italic">
                  Kasvu kaatuu toteutukseen – ei ideaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) VALITSE KASVUREITTI */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Valitse kasvureitti" />
          <div className="max-w-3xl mx-auto mt-8 space-y-3">
            {kasvupolut.map((polku) => (
              <Collapsible
                key={polku.id}
                open={openPolku === polku.id}
                onOpenChange={(open) => setOpenPolku(open ? polku.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="keuda-card p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <polku.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{polku.title}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openPolku === polku.id ? 'rotate-180' : ''}`} />
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
                    <Button size="sm" variant="outline">Näytä ratkaisut</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* 4) RATKAISUTARJOTIN */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Ratkaisutarjotin – valitse mitä vahvistat" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {ratkaisukategoriat.map((kat) => (
              <Dialog key={kat.id}>
                <DialogTrigger asChild>
                  <div className="keuda-card p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <kat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{kat.title}</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <kat.icon className="w-5 h-5 text-primary" />
                      {kat.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {valmiitRatkaisut.map((ratkaisu) => (
                      <div key={ratkaisu.nimi} className="keuda-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{ratkaisu.nimi}</h4>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {ratkaisu.kesto}
                          </span>
                        </div>
                        <ul className="space-y-1 mb-3">
                          {ratkaisu.bullets.map((b, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                        <Button size="sm" className="w-full">Ota yhteyttä</Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* 5) VALMIIT RATKAISUT - 4 nostoa */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Suosituimmat ratkaisut" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {valmiitRatkaisut.map((ratkaisu) => (
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
                      <span className="text-primary mt-1">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant="outline" className="w-full">Varaa</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6) KASVUALAT */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Kasvualat KUUMA-alueella" />
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {kasvualat.map((ala) => (
              <div key={ala.label} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <ala.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{ala.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7) TOIMIJAVERKOSTO */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Toteuttajat ja asiantuntijat" />
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {toimijat.map((nimi) => (
              <div key={nimi} className="bg-background border border-border rounded-lg px-6 py-3">
                <span className="font-semibold text-foreground">{nimi}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) FINAL CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Haluatko tietää mistä teidän kasvu alkaa?
            </h2>
            <p className="text-muted-foreground mb-6">
              Aloita kasvukartoituksella ja saat selkeän etenemissuunnitelman.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button size="lg">Varaa kasvukartoitus</Button>
              <Button size="lg" variant="outline">Liity mukaan pilottiin</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kartoitus ei sido mihinkään.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GrowthPage;
