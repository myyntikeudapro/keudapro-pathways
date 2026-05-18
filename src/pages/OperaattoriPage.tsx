import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { OperaattoriHeroCarousel } from "@/components/operaattori/OperaattoriHeroCarousel";
import { ArrowRightLeft, Search, Users, ShieldCheck, Check } from "lucide-react";

import operatorNetwork from "@/assets/operator-network.jpg";
import operatorTransitions from "@/assets/operator-transitions.jpg";
import operatorPersonal from "@/assets/operator-personal.jpg";
import operatorKuuma from "@/assets/operator-kuuma.jpg";
import operaattoriCtaBg from "@/assets/operaattori-cta-bg.jpg";
import partnerNetwork from "@/assets/operator-partner-network.jpg";
import kasvuVerkosto from "@/assets/kasvu-verkosto.jpg";

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

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-white/15 border border-white/15 rounded-2xl overflow-hidden">
            {[
              {
                num: "01",
                title: "Sujuvat siirtymät",
                description: "Sujuvat siirtymät eri tilanteiden välillä.",
              },
              {
                num: "02",
                title: "Oikea palvelu nopeasti",
                description: "Oikean palvelun löytäminen nopeasti.",
              },
              {
                num: "03",
                title: "Verkostot käyttöön",
                description: "Kumppaniverkoston hyödyntäminen tehokkaasti.",
              },
              {
                num: "04",
                title: "Kokonaisvaltainen tuki",
                description: "Kokonaisvaltainen tuki yksilöille ja organisaatioille.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-black/30 backdrop-blur-sm p-7 md:p-9 flex flex-col"
              >
                <span className="text-sm font-mono tracking-widest text-teal-300/90 mb-4">
                  {item.num}
                </span>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Verkosto ja kumppanit */}
      <section className="py-16 md:py-24">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Verkosto ja kumppanit
            </h2>
            <p className="text-lg text-muted-foreground">
              KeudaPRO toimii osana laajaa asiantuntija- ja kumppaniverkostoa. Mukana on yli 25 organisaatiota koulutuksesta, yrityskehityksestä, työllistymisestä ja tekoälystä — yhdessä rakennamme toimivan osaamisen ekosysteemin KUUMA-seudulla.
            </p>
          </div>
        </div>
      </section>

      {/* Two split-layout CTA cards */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              {
                image: partnerNetwork,
                badge: "Palveluntuottajille ja asiantuntijoille",
                kicker: "ASIANTUNTIJAVERKOSTO",
                title: "Haluatko olla osa KeudaPRO:n palveluntuottajaverkostoa?",
                body: "Verkostomme asiantuntijat ja organisaatiot toteuttavat koulutuksia, valmennuksia ja kehittämishankkeita yhdessä — näkyvyyttä, vaikuttavuutta ja uusia asiakkuuksia.",
                bullets: [
                  "Pääset mukaan oikeisiin hankkeisiin ja koulutuksiin",
                  "Rakennat näkyvyyttäsi ja vaikuttavuuttasi",
                  "Toimit verkostossa jossa ideat viedään käytäntöön",
                ],
                cta: "Hae palveluntuottajaksi",
                href: "/verkosto",
              },
              {
                image: kasvuVerkosto,
                badge: "Opiskelijoille ja kehittäjille",
                kicker: "KEUDAPRO HUB",
                title: "Ideat, osaaminen ja toteutus kohtaavat",
                body: "Hub on avoin kehittämisalusta — tuo ideasi, osaamisesi tai projektisi mukaan ja rakennetaan yhdessä.",
                bullets: [
                  "Osallistuminen on avointa ja maksutonta",
                  "Opinnäytetyöt, harjoittelut ja kehittämisprojektit",
                  "Yhteiskehittäminen ja pilotointi toiminnan ytimessä",
                ],
                cta: "Tutustu Hubiin",
                href: "/verkosto#hub",
              },
            ].map((card) => (
              <div
                key={card.kicker}
                className="rounded-2xl overflow-hidden shadow-lg border border-border grid md:grid-cols-2 bg-card"
              >
                {/* Left: image + overlay */}
                <div className="relative min-h-[200px] md:min-h-[280px]">
                  <img
                    src={card.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/55 to-teal-700/40" />
                  <div className="relative z-10 p-5 md:p-6">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-600 text-white text-xs font-semibold">
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* Right: white content */}
                <div className="p-6 md:p-8 flex flex-col justify-center bg-white min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                    {card.kicker}
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-3 leading-tight break-words hyphens-auto" lang="fi">
                    {card.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                    {card.body}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                        <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-teal-700" />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={card.href}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 text-sm font-semibold transition-colors"
                  >
                    {card.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OperaattoriPage;
