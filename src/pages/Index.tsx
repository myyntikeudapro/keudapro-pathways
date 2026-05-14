import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";

import { RouteCard } from "@/components/cards/RouteCard";
import { Button } from "@/components/ui/button";
import { AnimatedCounters } from "@/components/shared/AnimatedCounters";
import { BackgroundMusic } from "@/components/shared/BackgroundMusic";

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

const Index = () => {
  return (
    <Layout>
      <SEO title={"KeudaPRO – Osaamisen ja siirtymien operaattori KUUMA-seudulla"} description={"Johtamiskoulutukset (ÄLY), työhönvalmennus (NOSTE) ja yritysten kasvuohjelmat (KASVU) KUUMA-seudulla – yksi reitti, kolme suuntaa."} path="/" />
      <BackgroundMusic />
      {/* Hero Section */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-14 bg-gradient-to-b from-accent/50 to-background">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Valitse reitti muutoksessa
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Kolme reittiä – yksi operaattori. Löydä omaan tai yrityksesi tilanteeseen sopiva tapa vahvistaa osaamista, markkina-arvoa ja suuntaa.
            </p>
          </div>
        </div>
      </section>

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

      {/* Pätevyydet – kevyt viittausosio */}
      <section className="py-10 md:py-14 bg-[#F0F7F6] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Pätevyydet ja osaamiskortit
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Nopeat, tunnustetut kortit ja osaamispätevyydet — yrityksille ja yksittäisille osallistujille.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                "Työturvallisuuskortti",
                "Hygieniapassi",
                "Ensiapu",
                "Tulityökortti",
                "Anniskelupassi",
                "LinkedIn-kortti",
                "Tekoälyn ammattiosaaja",
                "KV-kortti",
                "Työkieli-Suomi",
                "Lääkehoito",
              ].map((tag) => (
                <a
                  key={tag}
                  href="/patevyydet"
                  className="inline-flex items-center rounded-full border-2 border-primary text-primary px-3 py-1 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
            <Button variant="outline-primary" size="lg" asChild>
              <a href="/patevyydet">Katso kaikki koulutukset →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Animated Counters / Social Proof */}
      <AnimatedCounters />

      {/* KUUMA Mission Block */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <img
          src={reititCtaBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75" />

        <div className="relative z-10 keuda-container flex flex-col items-center gap-6">
          <p className="text-xl md:text-2xl font-semibold text-white text-center mb-2">
            KUUMA-seutu kasvun alustana osaajille ja yrityksille.
          </p>
          <p className="text-sm md:text-base text-white/70 text-center max-w-2xl">
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
