import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTASection } from "@/components/shared/CTASection";
import { Handshake, School, Building, Globe } from "lucide-react";

const partnerCategories = [
  {
    icon: School,
    title: "Koulutusorganisaatiot",
    description: "Teemme yhteistyötä korkeakoulujen, ammattikorkeakoulujen ja muiden koulutusorganisaatioiden kanssa.",
  },
  {
    icon: Building,
    title: "Yritykset ja yhteisöt",
    description: "Kumppanuudet yritysten kanssa mahdollistavat työelämälähtöisen osaamisen kehittämisen.",
  },
  {
    icon: Globe,
    title: "Julkinen sektori",
    description: "Yhteistyö kuntien ja valtion toimijoiden kanssa alueellisen elinvoiman vahvistamiseksi.",
  },
  {
    icon: Handshake,
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
              Kumppanit
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              KeudaPRO toimii verkostomaisesti – yhdessä kumppaneiden kanssa rakennamme 
              vaikuttavia ratkaisuja osaamiseen ja siirtymiin.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="keuda-section">
        <div className="keuda-container">
          <SectionHeading title="Kumppanuuden muodot" centered />
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {partnerCategories.map((category) => (
              <div key={category.title} className="keuda-card-static flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
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
              title="Haluatko kumppaniksi?" 
              subtitle="Olemme aina kiinnostuneita uusista kumppanuuksista. Ota yhteyttä ja keskustellaan, miten voimme tehdä yhteistyötä."
              centered 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection title="Kiinnostaako kumppanuus?" buttonText="Ota yhteyttä" />
    </Layout>
  );
};

export default KumppanitPage;
