import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StepsList } from "@/components/shared/StepsList";
import { CTASection } from "@/components/shared/CTASection";
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
  "Tavoite ja nykytila",
  "Ohjelma ja toteutus (Keuda + kumppanit)",
  "Käyttöönotto ja vaikuttavuus",
];

const GrowthPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <HeroSection
        tagline="Yritysten ja yhteisöjen uudistuminen"
        title="KASVU"
        description="Kestävä kasvu syntyy ihmisistä, osaamisesta ja toimivista rakenteista."
      />

      {/* Intro */}
      <section className="py-12 bg-accent/30">
        <div className="keuda-container">
          <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
            Kehitämme johtajuutta ja organisaatioiden kykyä hyödyntää tekoälyä strategisesti. 
            Tarjoamme valmennuksia johtamisesta tekoälypätevyyksiin.
          </p>
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

      {/* Miten edetään? */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Miten edetään?" />
          <div className="mt-8">
            <StepsList steps={steps} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </Layout>
  );
};

export default GrowthPage;
