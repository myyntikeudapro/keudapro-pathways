import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { StepsList } from "@/components/shared/StepsList";
import { CTASection } from "@/components/shared/CTASection";
import { RefreshCw, Search, ArrowRightLeft, Rocket, FileText, Cpu, MessageSquare } from "lucide-react";

const audiences = [
  { icon: RefreshCw, label: "Muutoksessa oleville" },
  { icon: Search, label: "Työnhakijoille" },
  { icon: ArrowRightLeft, label: "Alanvaihtajille" },
  { icon: Rocket, label: "Yrittäjyyttä pohtiville" },
];

const benefits = [
  "Konkreettisen työllistymis- tai siirtymäpolun",
  "Osaamisen näkyväksi tekemisen",
  "Seuraavat askeleet ja rytmin",
];

const solutions = [
  {
    title: "Työnhaun ja työllistymisen tuki",
    description: "CV, LinkedIn, hakeminen ja työnhaun käytännöt.",
    icon: FileText,
    buttonText: "Lue lisää",
  },
  {
    title: "Perustaidot ja AI arjessa",
    description: "Varmuutta uuden työn ja arjen vaatimuksiin.",
    icon: Cpu,
    buttonText: "Katso palvelu",
  },
  {
    title: "Work+ sparraus",
    description: "Ohjattu suunnitelma seuraavaan siirtymään.",
    icon: MessageSquare,
    buttonText: "Varaa sparraus",
  },
];

const steps = [
  "Osaaminen näkyväksi",
  "Polku ja kontaktit",
  "Tuki toteutukseen",
];

const WorkPlusPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <HeroSection
        tagline="Reitti työhön, yrittäjyyteen ja siirtymiin"
        title="Work+"
        description="Kun tärkeintä on päästä liikkeelle – Work+ auttaa rakentamaan konkreettisen polun."
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

export default WorkPlusPage;
