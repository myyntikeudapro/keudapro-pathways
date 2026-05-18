import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Check, Users, Lightbulb, Handshake, Rocket, Network, GraduationCap } from "lucide-react";

import partnerNetwork from "@/assets/operator-partner-network.jpg";
import kasvuVerkosto from "@/assets/kasvu-verkosto.jpg";

const providerBenefits = [
  {
    icon: Network,
    title: "Pääset mukaan oikeisiin hankkeisiin",
    text: "Tarjoamme reitin koulutuksiin, valmennuksiin ja kehittämishankkeisiin, joissa osaamisesi pääsee käyttöön.",
  },
  {
    icon: Users,
    title: "Rakennat näkyvyyttä ja vaikuttavuutta",
    text: "Toimit osana KUUMA-seudun tunnistettua osaamisen operaattoria ja saat näkyvyyttä luotettavassa verkostossa.",
  },
  {
    icon: Handshake,
    title: "Saat uusia asiakkuuksia",
    text: "Yhdistämme palveluntuottajat yritysten ja organisaatioiden tarpeisiin – jatkuvasti ja ohjatusti.",
  },
  {
    icon: Rocket,
    title: "Olet osa toimivaa ekosysteemiä",
    text: "Verkosto, jossa ideat viedään käytäntöön yhdessä – ei pelkkiä puheita vaan toteutusta.",
  },
];

const providerCriteria = [
  "Asiantuntijuus koulutuksessa, valmennuksessa, kehittämisessä, tekoälyssä, työllistymisessä tai johtamisessa",
  "Halu tehdä yhteistyötä verkoston muiden toimijoiden kanssa",
  "Kyky toimia laadukkaasti ja asiakaslähtöisesti",
  "Sitoutuminen KeudaPRO:n yhteisiin pelisääntöihin ja laatukriteereihin",
];

const hubFeatures = [
  {
    icon: Lightbulb,
    title: "Ideoista pilotteihin",
    text: "Tuo ideasi, opinnäytetyösi tai projektiajatuksesi mukaan – kehitämme niistä toimivia ratkaisuja.",
  },
  {
    icon: GraduationCap,
    title: "Opinnäytetyöt ja harjoittelut",
    text: "Tarjoamme oppilaitoksille ja opiskelijoille konkreettisia toimeksiantoja ja kehittämisaihioita.",
  },
  {
    icon: Users,
    title: "Yhteiskehittäminen",
    text: "Yritykset, asiantuntijat, opiskelijat ja julkiset toimijat ratkomassa yhdessä konkreettisia haasteita.",
  },
  {
    icon: Rocket,
    title: "Pilotointi ja kokeilut",
    text: "Tarjoamme alustan, jolla uudet konseptit testataan käytännössä – nopeasti ja matalalla kynnyksellä.",
  },
];

const VerkostoPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#hub") {
      const el = document.getElementById("hub");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <Layout>
      <SEO
        title={"HUB-verkosto – Liity KeudaPRO:n verkostoon | KeudaPRO"}
        description={"HUB-verkosto kokoaa KeudaPRO:n palveluntuottajat, asiantuntijat, opiskelijat ja kehittäjät yhteen KUUMA-seudulla. Hae palveluntuottajaksi tai tule mukaan Hubiin."}
        path="/verkosto"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img src={partnerNetwork} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-teal-900/60" />
        <div className="relative z-10 keuda-container text-center">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-600 text-white text-xs font-semibold mb-5">
            HUB-verkosto
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
            HUB-verkosto – KUUMA-seudun osaamisen ekosysteemi
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            KeudaPRO yhdistää palveluntuottajat, asiantuntijat, opiskelijat ja kehittäjät yhdeksi toimivaksi ekosysteemiksi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild variant="cta" size="lg">
              <a href="#palveluntuottaja">Hae palveluntuottajaksi</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/40 text-white hover:bg-white hover:text-foreground">
              <a href="#hub">Tutustu Hubiin</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Palveluntuottajaverkosto */}
      <section id="palveluntuottaja" className="py-16 md:py-24 scroll-mt-24">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">
              Asiantuntijaverkosto
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hae KeudaPRO:n palveluntuottajaksi
            </h2>
            <p className="text-lg text-muted-foreground">
              Verkostomme asiantuntijat ja organisaatiot toteuttavat koulutuksia, valmennuksia ja
              kehittämishankkeita yhdessä. Mukana saat näkyvyyttä, vaikuttavuutta ja uusia asiakkuuksia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {providerBenefits.map((b) => (
              <div key={b.title} className="keuda-card-enhanced p-6 flex gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-muted/40 rounded-2xl p-6 md:p-8 border border-border">
            <h3 className="font-semibold text-foreground mb-4 text-lg">Kenelle verkosto sopii?</h3>
            <ul className="space-y-3 mb-6">
              {providerCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-teal-700" />
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
              <Link to="/yhteystiedot?aihe=palveluntuottaja">Jätä hakemus →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KeudaPRO Hub */}
      <section id="hub" className="py-16 md:py-24 bg-[#E4F0EE] scroll-mt-24">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3">
                KeudaPRO Hub
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ideat, osaaminen ja toteutus kohtaavat
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Hub on avoin kehittämisalusta – tuo ideasi, osaamisesi tai projektisi mukaan ja
                rakennetaan yhdessä. Osallistuminen on avointa ja maksutonta.
              </p>
              <p className="text-base text-muted-foreground">
                Hub tunnistaa ilmiöt ja tarpeet, ja KeudaPRO vie kehittämisen käytäntöön yhdessä
                verkoston kanssa.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={kasvuVerkosto} alt="KeudaPRO Hub" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-10">
            {hubFeatures.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-border shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <Button asChild variant="cta" size="lg">
              <Link to="/yhteystiedot?aihe=hub">Tule mukaan Hubiin →</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VerkostoPage;
