import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { ArrowRight, ChevronRight } from "lucide-react";
import { 
  GraduationCap, 
  Brain, 
  Shield, 
  Award,
  Users,
  Cpu,
  Sparkles,
  BookOpen,
  Target,
  Zap
} from "lucide-react";

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

interface SolutionItem {
  title: string;
  description?: string;
  icon: typeof GraduationCap;
  buttonText: string;
  isComingSoon?: boolean;
}

interface SolutionCategory {
  category: string;
  items: SolutionItem[];
}

const solutionCategories: SolutionCategory[] = [
  {
    category: "Johtamisen valmennusohjelmat",
    items: [
      {
        title: "Osaamisen johtamisen valmennusohjelma",
        icon: GraduationCap,
        buttonText: "Katso ohjelma",
      },
      {
        title: "Johtamisen ja esihenkilötyön valmennukset",
        description: "Puitesopimukset",
        icon: Users,
        buttonText: "Lue lisää",
      },
      {
        title: "Räätälöidyt valmennukset kunnille ja yrityksille",
        icon: Target,
        buttonText: "Ota yhteyttä",
      },
    ],
  },
  {
    category: "Tekoälypätevyys-koulutukset",
    items: [
      {
        title: "AI-Director",
        description: "Strateginen tekoälyjohtaminen",
        icon: Brain,
        buttonText: "Katso ohjelma",
      },
      {
        title: "AI-Manager",
        description: "Tekoäly johtamistyössä",
        icon: Cpu,
        buttonText: "Katso ohjelma",
      },
      {
        title: "AI-Coordinator",
        description: "Tekoälyn koordinointi ja käyttöönotto",
        icon: Sparkles,
        buttonText: "Katso ohjelma",
      },
      {
        title: "Hyper Engineering",
        description: "Uusi valmennusohjelma",
        icon: Zap,
        buttonText: "Lue lisää",
      },
      {
        title: "AI-Kaksonen",
        description: "Johtajan ja asiantuntijan AI & uudistuminen",
        icon: Users,
        buttonText: "Katso ohjelma",
      },
      {
        title: "Yrittäjä AI -ohjelma",
        icon: BookOpen,
        buttonText: "Ilmoita kiinnostus",
        isComingSoon: true,
      },
    ],
  },
  {
    category: "Turvallisuusjohtaminen",
    items: [
      {
        title: "Turvallisuuspäällikön valmennusohjelma",
        icon: Shield,
        buttonText: "Katso ohjelma",
      },
      {
        title: "Turvallisuusasiantuntijan valmennusohjelma",
        icon: Shield,
        buttonText: "Katso ohjelma",
      },
      {
        title: "Turvallisuusjohtajan valmennusohjelma (ml. AI)",
        description: "Tulossa syksyllä 2026",
        icon: Shield,
        buttonText: "Ilmoita kiinnostus",
        isComingSoon: true,
      },
    ],
  },
  {
    category: "Tutkintotavoitteiset ratkaisut",
    items: [
      {
        title: "Yrityskohtaiset ratkaisut",
        description: "Osana Johtamisen EAT- ja Lähiesimiestyön AT -tutkintoja",
        icon: Award,
        buttonText: "Lue lisää",
      },
    ],
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
          
          <div className="mt-12 space-y-12">
            {solutionCategories.map((category) => (
              <div key={category.category}>
                <h3 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
                  {category.category}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <div key={item.title} className="keuda-card p-5 flex flex-col h-full">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h4 className="text-base font-semibold text-foreground">
                              {item.title}
                            </h4>
                            {item.isComingSoon && (
                              <span className="keuda-badge text-xs">Tulossa</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <a 
                          href="#" 
                          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {item.buttonText}
                        </a>
                      </div>
                    </div>
                  ))}
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
