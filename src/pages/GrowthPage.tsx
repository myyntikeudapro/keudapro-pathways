import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { GrowthAnchorNav } from "@/components/growth/GrowthAnchorNav";
import { GrowthRoutes } from "@/components/growth/GrowthRoutes";
import { KasvuCategoryAccordion } from "@/components/growth/KasvuCategoryAccordion";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthMotivationBanner } from "@/components/growth/GrowthMotivationBanner";

const GrowthPage = () => {
  return (
    <Layout>
      <SEO title={"KASVU – Yrityksen kasvuohjelmat ja kehittäminen | KeudaPRO"} description={"Yrittäjille ja pk-yrityksille: myynnin, skaalauksen, tekoälyn käyttöönoton ja osaamisen kehittämisen ohjelmat KUUMA-seudulla."} path="/kasvu" />
      {/* 1) HERO CAROUSEL */}
      <GrowthHeroCarousel />

      {/* ANCHOR NAV */}
      <GrowthAnchorNav />

      {/* 2) KASVUREITIT (polut + ratkaisut) */}
      <GrowthRoutes />

      {/* 2b) VALITSE KASVUREITTI – kategoriat */}
      <KasvuCategoryAccordion />

      {/* 3) KASVUALAT */}
      <GrowthIndustries />


      {/* 5) FAQ */}
      <GrowthFAQ />

    </Layout>
  );
};

export default GrowthPage;
