import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Rocket, 
  Cog,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

// Components
import { SituationSelector } from "@/components/growth/SituationSelector";
import { GrowthPaths } from "@/components/growth/GrowthPaths";
import { SolutionFamilies } from "@/components/growth/SolutionFamilies";
import { EntryProducts } from "@/components/growth/EntryProducts";
import { HubiKeudapro } from "@/components/growth/HubiKeudapro";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { TransitionsSection } from "@/components/growth/TransitionsSection";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { ProofPoints } from "@/components/growth/ProofPoints";
import { StickyGrowthCTA } from "@/components/growth/StickyGrowthCTA";

// Credibility bar items
const credibilityItems = [
  { icon: BarChart3, text: "KUUMA-alueen yritysanalyysi" },
  { icon: Rocket, text: "Käytännön pilotit ja projektit" },
  { icon: Cog, text: "Osaamisen ja kasvun toteutus" }
];

// KUUMA reality bullets
const kuumaReality = [
  "osaamisen kehittäminen on usein hajanaista",
  "aikaa ei ole, eikä HR-organisaatiota ole",
  "digitalisaatio ja tekoäly jäävät hyödyntämättä",
  "myynti ja markkinointi eivät skaalaudu",
  "siirtymät ja eläköityminen uhkaavat jatkuvuutta"
];

const GrowthPage = () => {
  return (
    <Layout>
      {/* 1️⃣ HERO SECTION */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kasvu, uudistuminen vai siirtymä?
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              KUUMA-alueen pienyrityksissä kasvu ei pysähdy idean puutteeseen – vaan siihen, ettei aikaa, osaamista tai toteutustukea ole riittävästi.
              <br />
              <span className="font-medium text-foreground">KeudaPRO auttaa tunnistamaan tilanteen ja rakentamaan seuraavan askeleen.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button size="lg" asChild>
                <a href="/kasvukartoitus">Aloita kasvukartoitus</a>
              </Button>
              <Button size="lg" variant="outline">
                Tunnista yrityksesi polku (2 min)
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              KeudaPRO toimii osaamisen operaattorina: reitittää, kokoaa ja vie toteutukseen.
            </p>

            {/* Credibility bar */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {credibilityItems.map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ TILANNEVALITSIN */}
      <SituationSelector />

      {/* 3️⃣ WHY THIS MATTERS IN KUUMA */}
      <section className="keuda-section">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
              KUUMA-alueen kasvu ei ratkea palvelulistalla
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              KUUMA-alueen yrityskanta painottuu palvelu- ja pk-yrityksiin. Monella on kasvupotentiaalia, mutta kehittäminen jää arjen jalkoihin.
            </p>

            <ul className="space-y-3 mb-8">
              {kuumaReality.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3 text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="p-6 bg-accent/50 border-l-4 border-primary rounded-r-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground font-medium">
                Kasvun suurin riski ei ole kilpailija – vaan se, ettei kehittämistä ehditä johtaa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ KASVU-POLUT */}
      <GrowthPaths />

      {/* 5️⃣ RATKAISUPERHEET */}
      <SolutionFamilies />

      {/* 6️⃣ ALOITA TÄSTÄ (KÄRKITUOTTEET) */}
      <EntryProducts />

      {/* 7️⃣ HUBI + KEUDAPRO */}
      <HubiKeudapro />

      {/* PROOF POINTS */}
      <ProofPoints />

      {/* 8️⃣ KUUMA GROWTH INDUSTRIES */}
      <GrowthIndustries />

      {/* 9️⃣ TRANSITIONS SECTION */}
      <TransitionsSection />

      {/* FAQ */}
      <GrowthFAQ />

      {/* 🔟 FINAL CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Haluatko nähdä, mikä on yrityksesi seuraava askel?
            </h2>
            <p className="text-muted-foreground mb-6">
              Kasvukartoitus antaa nopeasti selkeyden siihen, mitä kannattaa tehdä nyt – ja mitä kannattaa jättää tekemättä.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button size="lg" asChild>
                <a href="/kasvukartoitus">Varaa kasvukartoitus</a>
              </Button>
              <Button size="lg" variant="outline">
                Liity mukaan pilottiin
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kartoitus ei sido mihinkään. Se voi kuitenkin avata uuden suunnan.
            </p>
          </div>
        </div>
      </section>

      {/* STICKY CTA */}
      <StickyGrowthCTA />
    </Layout>
  );
};

export default GrowthPage;
