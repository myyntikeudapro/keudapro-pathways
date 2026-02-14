import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { SolutionFamilies } from "@/components/growth/SolutionFamilies";
import { EntryProducts } from "@/components/growth/EntryProducts";
import { HubiKeudapro } from "@/components/growth/HubiKeudapro";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthFinalCTA } from "@/components/growth/GrowthFinalCTA";

import situationKasvu from "@/assets/situation-kasvu.jpg";
import situationDigi from "@/assets/situation-digi.jpg";
import situationJatkuvuus from "@/assets/situation-jatkuvuus.jpg";
import situationUudistuminen from "@/assets/situation-uudistuminen.jpg";

const situations = [
  { image: situationKasvu, title: "Kasvu ja skaalaus", href: "#ratkaisuperheet" },
  { image: situationDigi, title: "Digiloikka ja tekoäly", href: "#ratkaisuperheet" },
  { image: situationJatkuvuus, title: "Jatkuvuus ja omistajanvaihdos", href: "#ratkaisuperheet" },
  { image: situationUudistuminen, title: "Uudistuminen ja suunnanmuutos", href: "#ratkaisuperheet" },
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
                className="keuda-card-enhanced overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="w-full h-[140px] md:h-[170px] overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-foreground text-lg mb-4">{s.title}</h3>
                  <span className="text-sm font-medium text-primary">Näytä ratkaisut →</span>
                </div>
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
