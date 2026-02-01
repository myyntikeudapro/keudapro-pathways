import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { ArrowRight, ChevronRight } from "lucide-react";

// Audience images
import audienceExpert from "@/assets/audience-expert.jpg";
import audienceSupervisor from "@/assets/audience-supervisor.jpg";
import audienceLeader from "@/assets/audience-leader.jpg";
import audienceRenewal from "@/assets/audience-renewal.jpg";

// Solution images
import solutionSkills from "@/assets/solution-skills.jpg";
import solutionAi from "@/assets/solution-ai.jpg";
import solutionPath from "@/assets/solution-path.jpg";

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

const solutions = [
  {
    title: "Osaamisen kartoitus",
    description: "Tunnista nykyinen osaaminen ja seuraava kehitysharppaus.",
    image: solutionSkills,
    buttonText: "Lue lisää",
  },
  {
    title: "Tekoäly ja uusi työ",
    description: "Käytännön ymmärrys tekoälyn vaikutuksista työhön.",
    image: solutionAi,
    buttonText: "Katso palvelu",
  },
  {
    title: "Roolipäivitys ja kehityspolku",
    description: "Rakenna eteneminen osaamisesta vaikuttavaan rooliin.",
    image: solutionPath,
    buttonText: "Ota yhteyttä",
  },
];

const steps = [
  "Tilannekuva ja tavoite",
  "Reittikartoitus ja suositukset",
  "Toteutus Keudan ja kumppanien kanssa",
];

const InsightPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <HeroSection
        tagline="Osaaminen ja rooli uuteen vaiheeseen"
        title="ÄLY"
        description="Kun työ muuttuu nopeammin kuin roolisi – ÄLY auttaa kirkastamaan suunnan."
      />

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

      {/* Mitä saat? - Arrow boxes */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Mitä saat?" />
          <div className="flex flex-col md:flex-row items-stretch gap-4 mt-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="relative flex-1 bg-primary/10 border-2 border-primary/30 rounded-xl p-6 pr-10">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-foreground font-medium">{benefit}</p>
                  </div>
                  {/* Arrow connector */}
                  {index < benefits.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
                        <ChevronRight className="w-5 h-5 text-secondary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                {/* Mobile arrow */}
                {index < benefits.length - 1 && (
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ratkaisut */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Ratkaisut" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {solutions.map((solution) => (
              <div key={solution.title} className="keuda-card-enhanced overflow-hidden p-0">
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={solution.image} 
                    alt={solution.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-2">{solution.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>
                  <a 
                    href="#" 
                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                  >
                    {solution.buttonText} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Miten edetään? - Visual journey steps */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Miten edetään?" />
          <div className="mt-8">
            {/* Desktop: Horizontal arrow flow */}
            <div className="hidden md:flex items-center justify-center gap-0">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  {/* Process step box - chevron shape */}
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
                  {/* Arrow between steps */}
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

            {/* Mobile: Vertical flow */}
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
