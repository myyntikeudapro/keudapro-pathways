import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { OperaattoriHeroCarousel } from "@/components/operaattori/OperaattoriHeroCarousel";

import operatorNetwork from "@/assets/operator-network.jpg";
import operatorTransitions from "@/assets/operator-transitions.jpg";
import operatorPersonal from "@/assets/operator-personal.jpg";
import operatorKuuma from "@/assets/operator-kuuma.jpg";

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
      <section className="py-8 md:py-12">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="Mitä operaattori tarkoittaa?" />
            <div className="mt-8 space-y-6 text-muted-foreground">
              <p>
                Perinteisesti osaamisen kehittäminen, työllistymisen tuki ja yritysten 
                kehityspalvelut toimivat erillisinä siiloina. KeudaPRO toimii näiden 
                välillä operaattorina – yhdistäen palvelut, verkostot ja resurssit 
                asiakkaan tilanteen mukaan.
              </p>
              <p>
                Operaattorimalli mahdollistaa:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Sujuvat siirtymät eri tilanteiden välillä</li>
                <li>Oikean palvelun löytämisen nopeasti</li>
                <li>Kumppaniverkoston hyödyntämisen tehokkaasti</li>
                <li>Kokonaisvaltaisen tuen yksilöille ja organisaatioille</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OperaattoriPage;
