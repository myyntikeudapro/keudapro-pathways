import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { RouteCard } from "@/components/cards/RouteCard";
import { CTASection } from "@/components/shared/CTASection";
import { Lightbulb, Briefcase, TrendingUp } from "lucide-react";

const routes = [
  {
    title: "Insight+",
    subtitle: "Osaaminen ja rooli uuteen vaiheeseen",
    icon: Lightbulb,
    href: "/insight",
  },
  {
    title: "Work+",
    subtitle: "Reitti työhön, yrittäjyyteen ja siirtymiin",
    icon: Briefcase,
    href: "/workplus",
  },
  {
    title: "Growth+",
    subtitle: "Yritysten ja yhteisöjen uudistuminen",
    icon: TrendingUp,
    href: "/growth",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection
        title="Valitse reitti muutoksessa"
        description="Kolme reittiä – yksi operaattori. Löydä tilanteeseesi sopiva tapa vahvistaa markkina-arvoa ja suuntaa."
        variant="home"
      />

      {/* Route Cards Section */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {routes.map((route) => (
              <RouteCard
                key={route.href}
                title={route.title}
                subtitle={route.subtitle}
                icon={route.icon}
                href={route.href}
              />
            ))}
          </div>

          {/* Bridge Text */}
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground mb-3">
              KUUMA-seutu kasvun alustana osaajille ja yrityksille.
            </p>
            <p className="text-muted-foreground">
              KeudaPRO toimii osaamisen ja siirtymien operaattorina näiden reittien välillä.
            </p>
          </div>
        </div>
      </section>

      {/* Wide CTA Section */}
      <CTASection />
    </Layout>
  );
};

export default Index;
