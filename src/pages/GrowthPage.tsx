import { Layout } from "@/components/layout/Layout";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { GrowthRoutes } from "@/components/growth/GrowthRoutes";
import { EntryProducts } from "@/components/growth/EntryProducts";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthFinalCTA } from "@/components/growth/GrowthFinalCTA";

const GrowthPage = () => {
  return (
    <Layout>
      {/* 1) HERO CAROUSEL */}
      <GrowthHeroCarousel />

      {/* 2) KASVUREITIT (polut + ratkaisut) */}
      <GrowthRoutes />

      {/* 3) ALOITA KEVYESTI */}
      <div id="aloita">
        <EntryProducts />
      </div>

      {/* 4) KASVUALAT */}
      <GrowthIndustries />

      {/* 5) FAQ */}
      <GrowthFAQ />

      {/* 6) FINAL CTA */}
      <GrowthFinalCTA />
    </Layout>
  );
};

export default GrowthPage;
