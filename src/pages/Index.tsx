import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";

import { RouteCard } from "@/components/cards/RouteCard";
import { Button } from "@/components/ui/button";
import { AnimatedCounters } from "@/components/shared/AnimatedCounters";
import { ShieldCheck, UtensilsCrossed, Briefcase, Sparkles } from "lucide-react";
import { BackgroundMusic } from "@/components/shared/BackgroundMusic";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";


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
                  icon: ShieldCheck,
                  title: "Turvallisuus",
                  items: "Työturvallisuus · Tulityö · Ensiapu",
                },
                {
                  icon: UtensilsCrossed,
                  title: "Hygienia & ravintola",
                  items: "Hygieniapassi · Anniskelupassi · Lääkehoito",
                },
                {
                  icon: Briefcase,
                  title: "Työelämä",
                  items: "LinkedIn-kortti · Työkieli-Suomi · KV-kortti",
                },
                {
                  icon: Sparkles,
                  title: "AI & digi",
                  items: "Tekoälyn ammattiosaaja",
                },
              ].map((cat) => (
                <a
                  key={cat.title}
                  href="/osaaminen"
                  className="group flex flex-col h-full rounded-xl bg-background border border-border p-5 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.items}</p>
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
