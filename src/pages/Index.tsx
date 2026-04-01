import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/shared/HeroSection";
import { RouteCard } from "@/components/cards/RouteCard";
import { Users, Globe, Network, Quote } from "lucide-react";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";
import reititCtaBg from "@/assets/reitit-cta-bg.jpg";

const routes = [
  {
    title: "ÄLY",
    subtitle: "Johtaminen, asiantuntijuus ja tekoäly päätöksenteon tukena",
    clarification: "Sinulle, jos olet johtaja tai asiantuntija ja haluat kehittää osaamistasi, johtamista ja päätöksentekoa – hyödyntäen tekoälyä, vahvistaen asiantuntijuutta ja rakentaen turvallista toimintaa.",
    image: routeAly,
    href: "/aly",
  },
  {
    title: "NOSTE",
    subtitle: "Työelämään, yrittäjyyteen ja muutokseen siirtyminen",
    clarification: "Sinulle, jos olet vaihtamassa suuntaa ja tarvitset uutta osaamista tai polkua.",
    image: routeNoste,
    href: "/noste",
  },
  {
    title: "KASVU",
    subtitle: "Yrityksen kasvu, uudistuminen ja osaaminen käytäntöön",
    clarification: "Sinulle, jos johdat tai kehität organisaatiota ja haluat vauhdittaa kasvua.",
    image: routeKasvu,
    href: "/kasvu",
  },
];

const proofStats = [
  { icon: Users, text: "Yli 1 700 osallistujaa eri koulutuksissa" },
  { icon: Globe, text: "Valtakunnalliset ja kansainväliset verkostot" },
  { icon: Network, text: "Laaja asiantuntijaverkosto toteuttajana" },
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
                clarification={route.clarification}
                image={route.image}
                href={route.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-14 md:py-20 bg-background">
        <div className="keuda-container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Luotettu kumppani osaamisen kehittämisessä
          </h2>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto mb-10">
            {proofStats.map((stat) => (
              <div key={stat.text} className="flex flex-col items-center text-center gap-3 p-6 rounded-xl border border-border/60 bg-muted/30">
                <stat.icon className="w-7 h-7 text-primary" />
                <span className="text-sm font-medium text-foreground">{stat.text}</span>
              </div>
            ))}
          </div>

          <blockquote className="max-w-2xl mx-auto text-center border-l-4 border-primary/40 pl-6 py-2">
            <Quote className="w-5 h-5 text-primary/50 mx-auto mb-2" />
            <p className="text-base italic text-muted-foreground">
              "Koulutus toi heti käytännön hyötyjä – pystyimme ottamaan opit käyttöön saman tien."
            </p>
          </blockquote>
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

      {/* Motivation banner before footer */}
      <section className="py-10 md:py-12 bg-muted/20">
        <div className="keuda-container text-center">
          <p className="text-lg md:text-xl font-medium text-foreground">
            Kasvu syntyy tekemällä – kehitä osaamistasi nyt, jotta pysyt mukana.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
