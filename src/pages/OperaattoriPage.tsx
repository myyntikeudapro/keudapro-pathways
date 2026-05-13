import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { OperaattoriHeroCarousel } from "@/components/operaattori/OperaattoriHeroCarousel";
import { ArrowRightLeft, Search, Users, ShieldCheck } from "lucide-react";

import operatorNetwork from "@/assets/operator-network.jpg";
import operatorTransitions from "@/assets/operator-transitions.jpg";
import operatorPersonal from "@/assets/operator-personal.jpg";
import operatorKuuma from "@/assets/operator-kuuma.jpg";
import operaattoriCtaBg from "@/assets/operaattori-cta-bg.jpg";

const features = [
  {
    image: operatorNetwork,
    title: "Osaamisen verkosto",
    description: "Yhdistämme osaajat, yritykset ja koulutusorganisaatiot toimivaksi ekosysteemiksi.",
  },
  {
    image: operatorTransitions,
    title: "Siirtymien tuki",
    description: "Autamme navigoimaan työelämän muutoksissa – oli kyse uramuutoksesta tai organisaation kehityksestä.",
  },
  {
    image: operatorPersonal,
    title: "Yksilölliset reitit",
    description: "Jokainen tilanne on erilainen. Räätälöimme ratkaisut tarpeiden mukaan.",
  },
  {
    image: operatorKuuma,
    title: "KUUMA-seudun vahvuus",
    description: "Toimimme osana kasvavaa KUUMA-seutua, lähellä pääkaupunkiseutua.",
  },
];

const OperaattoriPage = () => {
  return (
    <Layout>
      <SEO title={"Operaattori – Osaamisen verkosto KUUMA-seudulla | KeudaPRO"} description={"KeudaPRO yhdistää osaajat, yritykset ja koulutusorganisaatiot toimivaksi ekosysteemiksi KUUMA-seudulla."} path="/operaattori" />
      <OperaattoriHeroCarousel />

      {/* Features */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="keuda-card-enhanced overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mitä operaattori tarkoittaa */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <img
          src={operaattoriCtaBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 keuda-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mitä operaattori tarkoittaa?
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Perinteisesti osaamisen kehittäminen, työllistymisen tuki ja yritysten 
              kehityspalvelut toimivat erillisinä siiloina. KeudaPRO toimii näiden 
              välillä operaattorina – yhdistäen palvelut, verkostot ja resurssit 
              asiakkaan tilanteen mukaan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: ArrowRightLeft,
                title: "Sujuvat siirtymät",
                description: "Sujuvat siirtymät eri tilanteiden välillä",
              },
              {
                icon: Search,
                title: "Oikea palvelu nopeasti",
                description: "Oikean palvelun löytäminen nopeasti",
              },
              {
                icon: Users,
                title: "Verkostot käyttöön",
                description: "Kumppaniverkoston hyödyntäminen tehokkaasti",
              },
              {
                icon: ShieldCheck,
                title: "Kokonaisvaltainen tuki",
                description: "Kokonaisvaltainen tuki yksilöille ja organisaatioille",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm md:text-base">{item.title}</h3>
                <p className="text-xs md:text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OperaattoriPage;
