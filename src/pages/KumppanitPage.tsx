import { Layout } from "@/components/layout/Layout";
import { KumppanitHeroCarousel } from "@/components/kumppanit/KumppanitHeroCarousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import partnerEducation from "@/assets/partner-education.jpg";
import partnerBusiness from "@/assets/partner-business.jpg";
import partnerPublic from "@/assets/partner-public.jpg";
import partnerNetwork from "@/assets/partner-network.jpg";
import kumppanitCtaBg from "@/assets/kumppanit-cta-bg.jpg";

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
  const navigate = useNavigate();

  return (
    <Layout>
      <KumppanitHeroCarousel />

      {/* Partner Categories */}
      <section className="py-8 md:py-12">
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

      {/* CTA with background image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img
          src={kumppanitCtaBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Haluatko toimijaksi verkostoon?
          </p>
          <Button
            variant="cta"
            size="lg"
            onClick={() => navigate("/yhteystiedot#yhteystiedot")}
          >
            Ota yhteyttä
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default KumppanitPage;
