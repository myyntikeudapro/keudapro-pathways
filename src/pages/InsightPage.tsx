import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AlyHeroCarousel } from "@/components/aly/AlyHeroCarousel";
import { AlySolutionCategories } from "@/components/aly/AlySolutionCategories";
import { ArrowDown } from "lucide-react";

// Audience images
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
          </div>
        </div>
      </section>

      <AlySolutionCategories />
    </Layout>
  );
};

export default InsightPage;
