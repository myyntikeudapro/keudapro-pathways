import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { SolutionFamilies } from "@/components/growth/SolutionFamilies";
import { EntryProducts } from "@/components/growth/EntryProducts";
import { HubiKeudapro } from "@/components/growth/HubiKeudapro";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";

import iconKasvuSkaalaus from "@/assets/icon-kasvu-skaalaus.png";
import iconDigiAi from "@/assets/icon-digi-ai.png";
import iconJatkuvuus from "@/assets/icon-jatkuvuus.png";
import iconUudistuminen from "@/assets/icon-uudistuminen.png";

const situations = [
  { image: iconKasvuSkaalaus, title: "Kasvu ja skaalaus", href: "#ratkaisuperheet" },
  { image: iconDigiAi, title: "Digiloikka ja tekoäly", href: "#ratkaisuperheet" },
  { image: iconJatkuvuus, title: "Jatkuvuus ja omistajanvaihdos", href: "#ratkaisuperheet" },
  { image: iconUudistuminen, title: "Uudistuminen ja suunnanmuutos", href: "#ratkaisuperheet" },
];

const GrowthPage = () => {
  return (
    <Layout>
      {/* 1) HERO CAROUSEL */}
      <GrowthHeroCarousel />

      {/* 2) VALITSE TILANNE */}
      <section id="tilanteet" className="keuda-section">
        <div className="keuda-container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Mikä kuvaa tilannettasi?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {situations.map((s) => (
              <a
                key={s.title}
                href={s.href}
                className="keuda-card-enhanced p-8 text-center hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-4">{s.title}</h3>
                <span className="text-sm font-medium text-primary">Näytä ratkaisut →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3) RATKAISUPERHEET */}
      <div id="ratkaisuperheet">
        <SolutionFamilies />
      </div>

      {/* 4) ALOITA KEVYESTI */}
      <div id="aloita">
        <EntryProducts />
      </div>

      {/* 5) HUBI + KEUDAPRO – poistettu */}

      {/* 6) KASVUALAT */}
      <GrowthIndustries />

      {/* 7) FAQ */}
      <GrowthFAQ />

      {/* 8) FINAL CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Haluatko tietää yrityksesi seuraavan askeleen?
            </h2>
            <p className="text-muted-foreground mb-6">
              Kasvukartoitus antaa nopeasti selkeyden siihen, mitä kannattaa tehdä nyt.
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
    </Layout>
  );
};

export default GrowthPage;
