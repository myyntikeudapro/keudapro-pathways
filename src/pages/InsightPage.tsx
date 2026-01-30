import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { StepsList } from "@/components/shared/StepsList";
import { CTASection } from "@/components/shared/CTASection";
import { Users, Compass, Brain, Target, Sparkles, Route } from "lucide-react";

const audiences = [
  { icon: Users, label: "Asiantuntijoille" },
  { icon: Compass, label: "Esihenkilöille" },
  { icon: Target, label: "Johtajille" },
  { icon: Sparkles, label: "Uudistumista pohtiville osaajille" },
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
    icon: Compass,
    buttonText: "Lue lisää",
  },
  {
    title: "Tekoäly ja uusi työ",
    description: "Käytännön ymmärrys tekoälyn vaikutuksista työhön.",
    icon: Brain,
    buttonText: "Katso palvelu",
  },
  {
    title: "Roolipäivitys ja kehityspolku",
    description: "Rakenna eteneminen osaamisesta vaikuttavaan rooliin.",
    icon: Route,
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
              <div key={item.label} className="keuda-card-static text-center p-6">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mitä saat? */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <SectionHeading title="Mitä saat?" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-foreground">{benefit}</p>
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
              <SolutionCard
                key={solution.title}
                title={solution.title}
                description={solution.description}
                icon={solution.icon}
                buttonText={solution.buttonText}
              />
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

export default InsightPage;
