import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AlyHeroCarousel } from "@/components/aly/AlyHeroCarousel";
import { AlyPhilosophySection } from "@/components/aly/AlyPhilosophySection";
import { AlyCategoryAccordion } from "@/components/aly/AlyCategoryAccordion";
import { ArrowDown } from "lucide-react";

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
    href: "#ai-ohjelmat",
  },
  {
    image: audienceSupervisor,
    label: "Esihenkilölle ja työnjohdolle",
    description: "Vahvistat johtamisotettasi ja kehität tiimiäsi käytännön valmennuksilla.",
    anchorLabel: "Katso Johtamisen koulutukset",
    href: "#valmennusohjelmat",
  },
  {
    image: audienceLeader,
    label: "Johtajalle",
    description: "Rakennat strategisen tekoälyosaamisen ja johdat organisaatiosi uudistumista.",
    anchorLabel: "Katso AI-Director & Johtamisen ohjelmat",
    href: "#ai-ohjelmat",
  },
  {
    image: audienceRenewal,
    label: "Uudistumista pohtiville",
    description: "Löydät suunnan ja työkalut seuraavaan askeleeseen.",
    anchorLabel: "Tee reittikartoitus",
    href: "#turvallisuus",
  },
];

const InsightPage = () => {
  return (
    <Layout>
      <SEO title={"ÄLY – Johtamisen, asiantuntijuuden ja tekoälyn koulutukset | KeudaPRO"} description={"Johtajille, esihenkilöille ja asiantuntijoille: johtamisen koulutukset, tekoälypätevyys-ohjelmat (AI-Director, AI-Manager, AI-Coordinator) ja turvallisuusjohtaminen."} path="/aly" />
      <AlyHeroCarousel />

      <section className="pt-16 md:pt-24 pb-6 md:pb-8">
        <div className="keuda-container">
          <SectionHeading title="Kenelle tämä on?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-4xl mx-auto">
            {audiences.map((item) => (
              <a
                key={item.label}
                href={item.href}
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
              </a>
            ))}
            <a
              href="/noste"
              className="keuda-card-enhanced overflow-hidden p-0 group block hover:border-primary/30 transition-all duration-200 md:col-span-2"
            >
              <div className="flex gap-4 p-4 md:p-5 items-center justify-center">
                <div className="flex-1 min-w-0 text-center">
                  <p className="text-sm md:text-base font-semibold text-foreground mb-1">
                    Etsitkö töitä tai uutta suuntaa työelämässä?
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
                    Katso NOSTE-reitti
                    <ArrowDown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <AlyPhilosophySection />

      <AlyCategoryAccordion />
    </Layout>
  );
};

export default InsightPage;
