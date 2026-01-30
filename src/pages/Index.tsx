import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { RouteCard } from "@/components/cards/RouteCard";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";

const routes = [
  {
    title: "ÄLY",
    subtitle: "Osaaminen ja rooli uuteen vaiheeseen",
    image: routeAly,
    href: "/aly",
  },
  {
    title: "NOSTE",
    subtitle: "Reitti työhön, yrittäjyyteen ja siirtymiin",
    image: routeNoste,
    href: "/noste",
  },
  {
    title: "KASVU",
    subtitle: "Yritysten ja yhteisöjen uudistuminen",
    image: routeKasvu,
    href: "/kasvu",
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
                image={route.image}
                href={route.href}
              />
            ))}
          </div>

          {/* Bridge Text */}
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              KUUMA-seutu kasvun alustana osaajille ja yrityksille.
            </p>
            <p className="text-muted-foreground">
              KeudaPRO toimii osaamisen ja siirtymien operaattorina näiden reittien välillä.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
