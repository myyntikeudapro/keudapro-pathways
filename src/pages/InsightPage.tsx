import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { AlyHeroCarousel } from "@/components/aly/AlyHeroCarousel";
import { AlySolutionCategories } from "@/components/aly/AlySolutionCategories";
import { ArrowRight, ChevronRight } from "lucide-react";

// Audience images
import audienceExpert from "@/assets/audience-expert.jpg";
import audienceSupervisor from "@/assets/audience-supervisor.jpg";
import audienceLeader from "@/assets/audience-leader.jpg";
import audienceRenewal from "@/assets/audience-renewal.jpg";

const audiences = [
  { image: audienceExpert, label: "Asiantuntijoille" },
  { image: audienceSupervisor, label: "Esihenkilöille" },
  { image: audienceLeader, label: "Johtajille" },
  { image: audienceRenewal, label: "Uudistumista pohtiville osaajille" },
];

const benefits = [
  "Kirkastetun osaamis- ja roolisuunnan",
  "Ymmärryksen tekoälyn ja työn muutoksesta",
  "Konkreettisen etenemispolun",
];

const steps = [
  "Tilannekuva ja tavoite",
  "Reittikartoitus ja suositukset",
  "Toteutus Keudan ja kumppanien kanssa",
];

const InsightPage = () => {
  return (
    <Layout>
      {/* Hero Carousel */}
      <AlyHeroCarousel />

      {/* Kenelle tämä on? */}
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

      {/* Ratkaisut */}
      <AlySolutionCategories />

      {/* Miten edetään? */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Miten edetään?" />
          <div className="mt-8">
            <div className="hidden md:flex items-center justify-center gap-0">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`
                      relative flex items-center min-w-[300px] h-28
                      bg-gradient-to-br from-primary/5 to-primary/15 
                      border-2 border-primary/30
                      ${index === 0 ? 'rounded-l-2xl' : 'rounded-l-none'}
                      ${index === steps.length - 1 ? 'rounded-r-2xl' : 'rounded-r-none'}
                      ${index > 0 ? '-ml-2' : ''}
                    `}
                    style={{
                      clipPath: index < steps.length - 1 
                        ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)'
                        : index === 0 
                          ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)'
                          : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)'
                    }}
                  >
                    <div className="flex items-center gap-4 px-8 pl-10">
                      <span className="text-5xl font-bold text-primary/80">{index + 1}</span>
                      <p className="text-foreground font-semibold text-base leading-tight">{step}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center -mx-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                        <ChevronRight className="w-5 h-5 text-secondary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="md:hidden flex flex-col items-center gap-0">
              {steps.map((step, index) => (
                <div key={index} className="w-full">
                  <div 
                    className={`
                      bg-gradient-to-br from-primary/5 to-primary/15 
                      border-2 border-primary/30 p-6
                      ${index === 0 ? 'rounded-t-2xl' : 'rounded-t-none border-t-0'}
                      ${index === steps.length - 1 ? 'rounded-b-2xl' : 'rounded-b-none'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-bold text-primary/80">{index + 1}</span>
                      <p className="text-foreground font-semibold">{step}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex justify-center -my-3 z-10 relative">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
                        <ChevronRight className="w-5 h-5 text-secondary-foreground rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </Layout>
  );
};

export default InsightPage;
