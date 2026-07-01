import { useEffect, useState } from "react";
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

import heroAly from "@/assets/hero-aly-1.jpg";
import heroKasvu from "@/assets/hero-kasvu-1.jpg";
import heroKumppanit from "@/assets/hero-kumppanit-1.jpg";

import routeAly from "@/assets/route-aly.jpg";
import routeNoste from "@/assets/route-noste.jpg";
import routeKasvu from "@/assets/route-kasvu.jpg";


const routes = [
  {
    title: "ÄLY",
    subtitle: "Vahvista päätöksentekoa ja ota tekoäly käytännön työkaluksi johtamiseen ja asiantuntijatyöhön.",
    clarification: "Johtajille ja asiantuntijoille, jotka haluavat vahvistaa päätöksentekoa, muutoskyvykkyyttä ja tekoälyn käytännön hyödyntämistä.",
    image: routeAly,
    href: "/aly",
  },
  {
    title: "NOSTE",
    subtitle: "Löydä käytännön reitti työhön, yrittäjyyteen tai opintoihin – myös uudessa maassa.",
    clarification: "Suuntaa vaihtaville, työllistymistä hakeville ja kotoutujille, jotka tarvitsevat rohkaisua ja käytännön reitin eteenpäin.",
    image: routeNoste,
    href: "/noste",
  },
  {
    title: "KASVU",
    subtitle: "Muuta osaamisen kehittäminen liiketoiminnan kasvuksi ja onnistuneiksi rekrytoinneiksi.",
    clarification: "Yrityksille, jotka tarvitsevat henkilöstön kehittämistä, rekrytoinnin tukea ja uusia ratkaisuja liiketoiminnan uudistamiseen.",
    image: routeKasvu,
    href: "/kasvu",
  },
];

const bannerImages = [heroAly, heroKasvu, heroKumppanit, routeNoste];

const Index = () => {
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBannerIdx((i) => (i + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Layout>
      <SEO title={"KeudaPRO – Osaamisen ja siirtymien operaattori KUUMA-seudulla"} description={"Johtamiskoulutukset (ÄLY), työhönvalmennus (NOSTE) ja yritysten kasvuohjelmat (KASVU) KUUMA-seudulla – yksi reitti, kolme suuntaa."} path="/" />
      <BackgroundMusic />

      {/* Photo Banner Carousel */}
      <section
        aria-label="KeudaPRO banneri"
        className="relative w-full overflow-hidden mt-16 h-[300px] md:h-[480px]"
      >
        {bannerImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === bannerIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl">
            Osaamisen ja siirtymien operaattori
          </h1>
          <p className="text-base md:text-xl text-gray-200 max-w-2xl leading-relaxed">
            Autamme ihmisiä, yrityksiä ja organisaatioita vahvistamaan osaamista tilanteissa, joissa työ muuttuu, suunta vaihtuu tai kasvu vaatii uutta osaamista.
          </p>
          <p className="text-base md:text-xl text-gray-200 max-w-2xl leading-relaxed mt-2">
            Toimimme Suomessa ja kansainvälisesti yhdessä kumppaneidemme kanssa.
          </p>
        </div>
      </section>

      {/* Compact anchor intro */}
      <section className="pt-10 pb-6 md:pt-14 md:pb-8 bg-background">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Valitse reitti muutoksessa
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Kolme reittiä kokoaa KeudaPRO:n palvelut eri tilanteisiin. Valitse reitti sen mukaan, tarvitsetko tukea johtamiseen ja tekoälyyn, uuteen työelämäsuuntaan vai yrityksen kasvuun ja osaamisen kehittämiseen.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-3">
              Rakennamme koulutus- ja valmennusratkaisuja tilanteisiin, joissa osaamisen pitää muuttua nopeasti käytännön tekemiseksi.
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

      {/* Pätevyydet – kevyt oikopolku, hakemistomainen */}
      <section className="py-8 md:py-10 bg-muted/30 border-y border-border/40">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto bg-background border border-border/60 rounded-xl p-5 md:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              {/* Typografinen "30+" -lohko */}
              <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0 flex-shrink-0">
                <span className="text-5xl md:text-6xl font-extrabold text-primary leading-none tracking-tight tabular-nums">
                  60+
                </span>
                <span className="text-xs md:text-sm uppercase tracking-[0.15em] text-muted-foreground sm:mt-1">
                  koulutusta
                </span>
              </div>

              {/* Erotin */}
              <div className="hidden sm:block w-px self-stretch bg-border" aria-hidden="true" />

              {/* Sisältö */}
              <div className="flex-1 text-left">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70 font-semibold mb-1">
                  Koulutushakemisto
                </p>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-1.5 leading-snug">
                  Kortit, pätevyydet ja lyhytkoulutukset
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Selaa työelämän kortteja ja pätevyyksiä yhdestä paikasta.
                </p>
                <Button variant="default" size="default" asChild className="w-full sm:w-auto">
                  <a href="/osaaminen">Avaa koulutushakemisto →</a>
                </Button>
              </div>
            </div>
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
            KeudaPRO toimii osaamisen ja siirtymien operaattorina KUUMA-seudulla, Uudellamaalla ja koko Suomessa. Kansainvälisen rekrytoinnin osalta teemme yhteistyötä kumppaneidemme kanssa Euroopassa ja sen ulkopuolella.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
