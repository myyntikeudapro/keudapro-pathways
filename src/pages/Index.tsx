import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";

import { RouteCard } from "@/components/cards/RouteCard";
import { Button } from "@/components/ui/button";
import { AnimatedCounters } from "@/components/shared/AnimatedCounters";

import categoryTurvallisuus from "@/assets/category-turvallisuus.jpg";
import categoryHygienia from "@/assets/category-hygienia.jpg";
import categoryTyoelama from "@/assets/category-tyoelama.jpg";
import categoryAi from "@/assets/category-ai.jpg";
import { BackgroundMusic } from "@/components/shared/BackgroundMusic";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";


const routes = [
  {
    title: "ÄLY",
    subtitle: "Johtaminen, asiantuntijuus ja tekoäly päätöksenteon tukena",
    clarification: "Johtajille ja asiantuntijoille: johtamis-, AI- ja muutosvalmennukset.",
    image: routeAly,
    href: "/aly",
  },
  {
    title: "NOSTE",
    subtitle: "Työelämään, yrittäjyyteen ja muutokseen siirtyminen",
    clarification: "Suunnanvaihtajille: uudelleenkoulutus, yrittäjyys, työllistyminen ja kotoutuminen.",
    image: routeNoste,
    href: "/noste",
  },
  {
    title: "KASVU",
    subtitle: "Yrityksen kasvu, uudistuminen ja osaaminen käytäntöön",
    clarification: "Yrityksille: osaamisen kehittäminen, rekrytointi ja liiketoiminnan uudistaminen.",
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
      <section className="py-10 md:py-14 bg-[#E4F0EE]">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Pätevyydet ja osaamiskortit
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Nopeat, tunnustetut kortit ja osaamispätevyydet — yrityksille ja yksittäisille osallistujille.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
              {[
                {
                  image: categoryTurvallisuus,
                  title: "Turvallisuus",
                  items: "Työturvallisuuskortti · Tulityökortti · Sähkötyöturvallisuus · Akkuturvallisuus · EA1 & EA2 Ensiapu",
                },
                {
                  image: categoryHygienia,
                  title: "Hygienia & ravintola",
                  items: "Hygieniapassi · Anniskelupassi · Lääkehoitopassi · Allergeenikoulutus",
                },
                {
                  image: categoryTyoelama,
                  title: "Työelämä & kieli",
                  items: "Työhyvinvointikortti · LinkedIn-kortti · KV-kortti · Suomi työkielenä · Selkosuomi",
                },
                {
                  image: categoryAi,
                  title: "AI & digi",
                  items: "3T-kortti · Tekoälyn ammattiosaaja · AI työnhaussa · Digitaidot työelämässä",
                },
              ].map((cat) => (
                <a
                  key={cat.title}
                  href="/osaaminen"
                  className="group flex flex-col h-full rounded-xl bg-background border border-border overflow-hidden hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      width={800}
                      height={512}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-foreground mb-1">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.items}</p>
                  </div>
                </a>
              ))}
            </div>
            <Button variant="outline-primary" size="lg" asChild>
              <a href="/osaaminen">Katso kaikki koulutukset →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Animated Counters / Social Proof */}
      <AnimatedCounters />

      {/* KUUMA Mission / Motivation banner */}
      <section className="py-10 md:py-12 bg-muted/20">
        <div className="keuda-container flex flex-col items-center gap-4 text-center">
          <p className="text-xl md:text-2xl font-semibold text-foreground">
            KUUMA-seutu kasvun alustana osaajille ja yrityksille.
          </p>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            KeudaPRO toimii osaamisen ja siirtymien operaattorina KUUMA-seudulla, Uudellamaalla ja koko Suomessa — kansainvälisen rekrytoinnin osalta yhdessä kumppaneiden kanssa Euroopassa ja sen ulkopuolella.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
