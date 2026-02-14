import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { PartnersSection } from "@/components/shared/PartnersSection";
import { HeroCarousel } from "@/components/noste/HeroCarousel";

import pathDirectionImg from "@/assets/noste-path-direction.jpg";
import pathClarityImg from "@/assets/noste-path-clarity.jpg";
import pathWorkImg from "@/assets/noste-path-work.jpg";
import nosteCTABg from "@/assets/noste-cta-bg.jpg";

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
      { label: "Muutosturvakoulutuksella suunta kirkkaaksi", href: "#muutosturva-kirkkaaksi" },
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
      { label: "Muutosturvakoulutuksella takaisin työelämään", href: "#muutosturva-tyoelamaan" },
    ],
    ctaText: "Tavoittele työtä nyt",
    ctaHref: "#tavoittele-tyota",
  },
];

const WorkPlusPage = () => {

  return (
    <Layout>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* POLUT */}
      <section className="py-16 md:py-20 bg-muted/30">
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
      <section className="relative w-full">
        {/* Background image + dark overlay */}
        <div className="absolute inset-0">
          <img
            src={nosteCTABg}
            alt="Urasuunnittelu ja ohjaus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-20 md:py-32">
          <div className="keuda-container text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
              15 minuuttia
            </p>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Etkö tiedä mistä aloittaa?
            </h3>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-8 mx-auto">
              Tee nopea reittikartoitus ja löydä tilanteeseesi sopivat ratkaisut.
            </p>
            <Button variant="cta" size="lg" asChild>
              <a href="https://example.com/kartoitus" target="_blank" rel="noopener noreferrer">
                Tee 15 min reittikartoitus
              </a>
            </Button>
          </div>
        </div>
      </section>

       {/* TOIMIJAT */}
       <PartnersSection />
     </Layout>
   );
 };
 
 export default WorkPlusPage;
