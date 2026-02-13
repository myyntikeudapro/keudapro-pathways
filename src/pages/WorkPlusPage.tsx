import { useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, Clock, ArrowRight } from "lucide-react";
import { PartnersSection } from "@/components/shared/PartnersSection";

import pathDirectionImg from "@/assets/noste-path-direction.jpg";
import pathClarityImg from "@/assets/noste-path-clarity.jpg";
import pathWorkImg from "@/assets/noste-path-work.jpg";

const paths = [
  {
    id: "polku1",
    title: "Etsin suuntaa",
    image: pathDirectionImg,
    description: "Etsitkö selkeää suuntaa työelämällesi ja kaipaat valmentajan tukea työnhakuun? Tämä reitti sopii, kun haluat sparrausta ja rinnalla kulkevan tuen.",
    modules: [
      { label: "Valmentajan tuki", href: "#valmentajan-tuki" },
      { label: "Työelämätaidot", href: "#tyoelamataidot" },
      { label: "Uraohjaus ja suunnan selkeytys", href: "#uraohjaus" },
      { label: "Osaamisen tunnistaminen ja sanoittaminen", href: "#osaaminen" },
      { label: "Työnhakutaidot (CV, työhaastattelu, piilotyöpaikat, työnhaku)", href: "#tyonhakutaidot" },
    ],
    ctaText: "Aloita valmennus",
    ctaHref: "#aloita-valmennus",
  },
  {
    id: "polku2",
    title: "Suunta kirkkaaksi",
    image: pathClarityImg,
    description: "Tarvitsetko apua osaamisesi sanoittamiseen ja profiilin kirkastamiseen? Tämä polku auttaa sinua erottumaan ja hyödyntämään tekoälyä työnhaussa.",
    modules: [
      { label: "CV, LinkedIn ja oman osaamisen hissipuhe", href: "#cv-linkedin" },
      { label: "AI-avusteinen työnhaku", href: "#ai-tyonhaku" },
      { label: "Osaamisen tunnistaminen ja sanoittaminen", href: "#osaaminen-kirkastus" },
      { label: "Valmentajan tuki tarvittaessa", href: "#valmentaja" },
    ],
    ctaText: "Kirkasta profiilisi",
    ctaHref: "#kirkasta-profiili",
  },
  {
    id: "polku3",
    title: "Suoraan työelämään",
    image: pathWorkImg,
    description: "Onko tavoitteenasi nopea työllistyminen? Tämä reitti tarjoaa käytännön työkalut ja väylät työelämään.",
    modules: [
      { label: "AI-avusteinen osaamiskartoitus", href: "#ai-kartoitus" },
      { label: "CV:n ja työhakemuksen pikapäivitys (30 min)", href: "#cv-pikapaivitys" },
      { label: "Henkilöstövuokrausyhteistyö", href: "#henkilostovuokraus" },
      { label: "Haastattelusparraus", href: "#haastattelusparraus" },
    ],
    ctaText: "Tavoittele työtä nyt",
    ctaHref: "#tavoittele-tyota",
  },
];

const WorkPlusPage = () => {
  const pathsSectionRef = useRef<HTMLElement>(null);

  const scrollToPaths = () => {
    pathsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-accent/60 via-accent/30 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="keuda-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Reitti työhön ja uuteen suuntaan</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">NOSTE</h1>
            <p className="text-xl md:text-2xl font-medium text-foreground mb-4">
              Löydä tilanteeseesi sopiva reitti työhön tai uuteen suuntaan
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Valitse polku ja löydä valmiit ratkaisut. Nopea tapa löytää tuki, työkalut ja toteuttajat.
            </p>
            <Button variant="cta" size="xl" onClick={scrollToPaths} className="group">
              Aloita valitsemalla polku
              <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* POLUT */}
      <section ref={pathsSectionRef} className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Valitse siirtymäreitti</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kolme polkua erilaisiin tilanteisiin – valitse omasi ja löydä sopivat ratkaisut.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {paths.map((path) => (
              <div
                key={path.id}
                className="keuda-card-enhanced flex flex-col h-full"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mb-4">
                  <img src={path.image} alt={path.title} className="w-full h-full object-cover" />
                </div>

                {/* Title & description */}
                <h3 className="text-xl font-bold text-foreground mb-2">{path.title}</h3>
                <p className="text-muted-foreground text-sm mb-5">{path.description}</p>

                {/* Module links */}
                <div className="flex flex-col gap-2 mb-6 flex-1">
                  {path.modules.map((mod, idx) => (
                    <a
                      key={idx}
                      href={mod.href}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      {mod.label}
                    </a>
                  ))}
                </div>

                {/* CTA */}
                <Button variant="cta" size="lg" asChild className="w-full">
                  <a href={path.ctaHref}>{path.ctaText}</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-accent/50">
        <div className="keuda-container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">15 minuuttia</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Etkö tiedä mistä aloittaa?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Tee nopea reittikartoitus ja löydä tilanteeseesi sopivat ratkaisut.
          </p>
          <Button variant="cta" size="lg" asChild>
            <a href="https://example.com/kartoitus" target="_blank" rel="noopener noreferrer">
              Tee 15 min reittikartoitus
            </a>
           </Button>
         </div>
       </section>

       {/* TOIMIJAT */}
       <PartnersSection />
     </Layout>
   );
 };
 
 export default WorkPlusPage;
