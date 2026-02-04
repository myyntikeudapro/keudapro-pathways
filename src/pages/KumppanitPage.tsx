import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";

import partnerEducation from "@/assets/partner-education.jpg";
import partnerBusiness from "@/assets/partner-business.jpg";
import partnerPublic from "@/assets/partner-public.jpg";
import partnerNetwork from "@/assets/partner-network.jpg";

const partnerCategories = [
  {
    image: partnerEducation,
    title: "Koulutusorganisaatiot",
    description: "Teemme yhteistyötä korkeakoulujen, ammattikorkeakoulujen ja muiden koulutusorganisaatioiden kanssa.",
  },
  {
    image: partnerBusiness,
    title: "Yritykset ja yhteisöt",
    description: "Kumppanuudet yritysten kanssa mahdollistavat työelämälähtöisen osaamisen kehittämisen.",
  },
  {
    image: partnerPublic,
    title: "Julkinen sektori",
    description: "Yhteistyö kuntien ja valtion toimijoiden kanssa alueellisen elinvoiman vahvistamiseksi.",
  },
  {
    image: partnerNetwork,
    title: "Verkostot",
    description: "Olemme osa laajempia osaamisen ja työllisyyden verkostoja KUUMA-seudulla ja valtakunnallisesti.",
  },
];

const KumppanitPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-accent/50 to-background">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Toimijaverkosto
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              KeudaPRO toimii verkostomaisesti – yhdessä kumppaneiden kanssa rakennamme 
              vaikuttavia ratkaisuja osaamiseen ja siirtymiin.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-12 md:py-16">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-6">
            {partnerCategories.map((category) => (
              <div key={category.title} className="keuda-card-enhanced overflow-hidden">
                <div className="aspect-[2/1] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner */}
      <section className="keuda-section bg-muted/30">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading 
              title="Haluatko toimijaksi verkostoon?" 
              subtitle="Olemme aina kiinnostuneita uusista toimijoista. Ota yhteyttä ja keskustellaan, miten voit liittyä osaksi verkostoamme."
              centered 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection title="Kiinnostaako verkostoon liittyminen?" buttonText="Ota yhteyttä" />
    </Layout>
  );
};

export default KumppanitPage;
