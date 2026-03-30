import { Layout } from "@/components/layout/Layout";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { GrowthRoutes } from "@/components/growth/GrowthRoutes";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthPricing } from "@/components/growth/GrowthPricing";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthFinalCTA } from "@/components/growth/GrowthFinalCTA";
const GrowthPage = () => {
  return (
    <Layout>
      {/* 1) HERO CAROUSEL */}
      <GrowthHeroCarousel />

      {/* 2) KASVUREITIT (polut + ratkaisut) */}
      <GrowthRoutes />

      {/* 3) KASVUALAT */}
      <GrowthIndustries />

      {/* 4) FAQ */}
      <GrowthFAQ />

      {/* 5) FINAL CTA */}
      <GrowthFinalCTA />
    </Layout>
  );
};

export default GrowthPage;
