import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { RouteCard } from "@/components/cards/RouteCard";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";
import reititCtaBg from "@/assets/reitit-cta-bg.jpg";

const routes = [
  {
    title: "ÄLY",
    subtitle: "Johtaminen, asiantuntijuus ja tekoäly päätöksenteon tukena",
    image: routeAly,
    href: "/aly",
  },
  {
    title: "NOSTE",
    subtitle: "Työelämään, yrittäjyyteen ja muutokseen siirtyminen",
    image: routeNoste,
    href: "/noste",
  },
  {
    title: "KASVU",
    subtitle: "Yrityksen kasvu, uudistuminen ja osaaminen käytäntöön",
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
        description="Kolme reittiä – yksi operaattori. Löydä omaan tai yrityksesi tilanteeseen sopiva tapa vahvistaa osaamista, markkina-arvoa ja suuntaa."
        variant="home"
      />

      {/* Route Cards Section */}
      <section className="py-10 md:py-16 bg-muted/30">
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

        </div>
      </section>

      {/* Bridge Text with background image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img
          src={reititCtaBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <p className="text-2xl md:text-3xl font-semibold text-white mb-3">
            KUUMA-seutu kasvun alustana osaajille ja yrityksille.
          </p>
          <p className="text-white/80">
            KeudaPRO toimii osaamisen ja siirtymien operaattorina näiden reittien välillä.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
