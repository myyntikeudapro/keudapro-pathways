import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { SolutionFamilies } from "@/components/growth/SolutionFamilies";
import { EntryProducts } from "@/components/growth/EntryProducts";
import { HubiKeudapro } from "@/components/growth/HubiKeudapro";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthFinalCTA } from "@/components/growth/GrowthFinalCTA";

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
      <GrowthFinalCTA />
    </Layout>
  );
};

export default GrowthPage;
