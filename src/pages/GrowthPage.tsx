import { Layout } from "@/components/layout/Layout";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { GrowthAnchorNav } from "@/components/growth/GrowthAnchorNav";
import { GrowthRoutes } from "@/components/growth/GrowthRoutes";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthMotivationBanner } from "@/components/growth/GrowthMotivationBanner";

const GrowthPage = () => {
  return (
    <Layout>
      {/* 1) HERO CAROUSEL */}
      <GrowthHeroCarousel />

      {/* ANCHOR NAV */}
      <GrowthAnchorNav />

      {/* 2) KASVUREITIT (polut + ratkaisut) */}
      <GrowthRoutes />

      {/* 3) KASVUALAT */}
      <GrowthIndustries />

      {/* ELY-TUKI INFO */}
      <GrowthElyInfo />

      {/* 4) KASVUPAKETIT */}
      <div id="paketit">
        <GrowthPricing />
      </div>

      {/* 5) FAQ */}
      <GrowthFAQ />

    </Layout>
  );
};

export default GrowthPage;
