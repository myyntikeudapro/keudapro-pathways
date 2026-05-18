import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";

import { GrowthHeroCarousel } from "@/components/growth/GrowthHeroCarousel";
import { GrowthAnchorNav } from "@/components/growth/GrowthAnchorNav";
import { GrowthRoutes } from "@/components/growth/GrowthRoutes";
import { KasvuCategoryAccordion } from "@/components/growth/KasvuCategoryAccordion";
import { GrowthIndustries } from "@/components/growth/GrowthIndustries";
import { GrowthFAQ } from "@/components/growth/GrowthFAQ";
import { GrowthMotivationBanner } from "@/components/growth/GrowthMotivationBanner";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { question: "Miten tiedän, mille tasolle kuulun?", answer: "Helpoin tapa on tehdä 15 minuutin reittikartoitus – käymme yhdessä läpi yrityksesi liikevaihdon, tilanteen ja tavoitteet. Tason valinta ei ole pysyvä: voit siirtyä tasolta toiselle joustavasti sopimusvuoden aikana." },
    { question: "Mitä kasvukartoitus sisältää?", answer: "Kasvukartoitus on maksuton 15 minuutin keskustelu jossa tunnistetaan yrityksesi nykytaso, pullonkaulat ja sopivin reitti eteenpäin. Saat selkeän suosituksen – ei yleistä, vaan juuri sinulle." },
    { question: "Onko tämä koulutusta vai käytännön tekemistä?", answer: "Molempia – mutta paino on käytännössä. Valmennukset, sparraussessiot ja tekoälytyökalut on suunniteltu niin että opit soveltamaan heti omassa arjessasi. Ei luentoja vaan tekemistä." },
    { question: "Miten tekoälypolku toimii?", answer: "Tekoälypolku alkaa yrityksesi nykytason kartoituksesta. Sen jälkeen rakennetaan vaiheittainen suunnitelma – asiakasviestinnästä automaatioon ja BI-integraatioihin. Vauhti ja syvyys määräytyvät tason mukaan." },
    { question: "Voiko pienyritys osallistua ilman suurta budjettia?", answer: "Kyllä. Paketteihin voi hakea ELY-tukea tai yritysrahoitusta josta kysytään reittikartoituksessa." },
    { question: "Miten osaamiskoulutukset liittyvät kasvuun?", answer: "Osaaminen on kasvun perusta – ilman sitä prosessit ja työkalut jäävät hyödyntämättä. Osaaminen käytäntöön -polku varmistaa että tiimisi pysyy kasvun vauhdissa mukana." },
  ].map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

const GrowthPage = () => {
  return (
    <Layout>
      <SEO title={"KASVU – Yrityksen kasvuohjelmat ja kehittäminen | KeudaPRO"} description={"Yrittäjille ja pk-yrityksille: myynnin, skaalauksen, tekoälyn käyttöönoton ja osaamisen kehittämisen ohjelmat KUUMA-seudulla."} path="/kasvu" jsonLd={faqJsonLd} />
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
