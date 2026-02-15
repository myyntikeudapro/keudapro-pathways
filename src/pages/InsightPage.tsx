import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AlyHeroCarousel } from "@/components/aly/AlyHeroCarousel";
import { AlySolutionCategories } from "@/components/aly/AlySolutionCategories";

// Audience images
import audienceExpert from "@/assets/audience-expert.jpg";
import audienceSupervisor from "@/assets/audience-supervisor.jpg";
import audienceLeader from "@/assets/audience-leader.jpg";
import audienceRenewal from "@/assets/audience-renewal.jpg";

const audiences = [
  { image: audienceExpert, label: "Asiantuntijoille" },
  { image: audienceSupervisor, label: "Esihenkilöille ja työnjohdolle" },
  { image: audienceLeader, label: "Johtajille" },
  { image: audienceRenewal, label: "Uudistumista pohtiville osaajille" },
];

const InsightPage = () => {
  return (
    <Layout>
      <AlyHeroCarousel />

      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Kenelle tämä on?" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {audiences.map((item) => (
              <div key={item.label} className="keuda-card-enhanced overflow-hidden p-0">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AlySolutionCategories />
    </Layout>
  );
};

export default InsightPage;
