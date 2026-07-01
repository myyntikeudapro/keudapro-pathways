import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { AlyHeroCarousel } from "@/components/aly/AlyHeroCarousel";
import { AlyPhilosophySection } from "@/components/aly/AlyPhilosophySection";
import { AlyCategoryAccordion } from "@/components/aly/AlyCategoryAccordion";
import { AlyFAQ } from "@/components/aly/AlyFAQ";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

import audienceExpert from "@/assets/audience-expert.jpg";
import audienceSupervisor from "@/assets/audience-supervisor.jpg";
import audienceLeader from "@/assets/audience-leader.jpg";
import audienceRenewal from "@/assets/audience-renewal.jpg";

const audiences = [
  {
    image: audienceExpert,
    label: "Asiantuntijalle",
    description: "Syvennät osaamistasi ja opit hyödyntämään tekoälyä omassa työssäsi.",
    anchorLabel: "Katso Tekoälypätevyys-ohjelmat",
    href: "/aly#tekoalypatevyys",
  },
  {
    image: audienceSupervisor,
    label: "Esihenkilölle ja työnjohdolle",
    description: "Vahvistat johtamisotettasi ja kehität tiimiäsi käytännön valmennuksilla.",
    anchorLabel: "Katso Johtamisen koulutukset",
    href: "/aly#esihenkilo-johtaminen",
  },
  {
    image: audienceLeader,
    label: "Johtajalle",
    description: "Rakennat strategisen tekoälyosaamisen ja johdat organisaatiosi uudistumista.",
    anchorLabel: "Katso AI-Director & Johtamisen ohjelmat",
    href: "/aly#tekoalypatevyys",
  },
  {
    image: audienceRenewal,
    label: "Uudistumista pohtiville – etsitkö töitä tai uutta suuntaa työelämässä?",
    description: "Löydät suunnan ja työkalut seuraavaan askeleeseen.",
    anchorLabel: "Katso NOSTE-reitti",
    href: "/noste",
  },
];

const InsightPage = () => {
  const { openPanel } = useCoachPanel();

  return (
    <Layout>
      <SEO title={"ÄLY – Johtamisen, asiantuntijuuden ja tekoälyn koulutukset | KeudaPRO"} description={"Johtajille, esihenkilöille ja asiantuntijoille: johtamisen koulutukset, tekoälypätevyys-ohjelmat (AI-Director, AI-Manager, AI-Coordinator) ja turvallisuusjohtaminen."} path="/aly" />
      <AlyHeroCarousel />

      <section className="pt-16 md:pt-24 pb-6 md:pb-8">
        <div className="keuda-container">
          <SectionHeading title="Kenelle tämä on?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-4xl mx-auto">
            {audiences.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="keuda-card-enhanced overflow-hidden p-0 group block hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex gap-4 p-4 md:p-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
                      {item.anchorLabel}
                      <ArrowDown className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AlyCategoryAccordion />

      <AlyPhilosophySection />

      <AlyFAQ />

      <section className="py-16 md:py-20 bg-primary/5">
        <div className="keuda-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Valmis aloittamaan?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Valitse sinulle sopivin tapa edetä.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button variant="cta" size="lg" onClick={() => openPanel("veli")}>
              Kysy AI-valmentajalta
            </Button>
            <Button variant="outline-primary" size="lg" asChild>
              <Link to="/yhteystiedot">Ota yhteyttä</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Sopisiko yrityksen kehittäminen tilanteeseesi paremmin?{" "}
            <Link to="/kasvu" className="text-primary hover:underline font-medium">
              Tutustu Kasvu-reittiin →
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default InsightPage;
