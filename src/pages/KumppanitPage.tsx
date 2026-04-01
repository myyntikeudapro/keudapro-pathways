import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { KumppanitHeroCarousel } from "@/components/kumppanit/KumppanitHeroCarousel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/contexts/WizardContext";
import {
  GraduationCap,
  Building2,
  Users,
  Network,
  Lightbulb,
  Cog,
  Bot,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Quote,
  BookOpen,
  Rocket,
  Calendar,
  Wrench,
  Trophy,
  UserPlus,
  BriefcaseBusiness,
  Mail,
} from "lucide-react";

import partnerEducation from "@/assets/partner-education.jpg";
import partnerBusiness from "@/assets/partner-business.jpg";
import partnerPublic from "@/assets/partner-public.jpg";
import partnerNetwork from "@/assets/partner-network.jpg";
import kumppanitCtaBg from "@/assets/kumppanit-cta-bg.jpg";

/* ── Data ── */

const roleCards = [
  { icon: UserPlus, label: "Asiantuntija tai kouluttaja", anchor: "#ketkä-mukana" },
  { icon: Building2, label: "Yritys tai organisaatio", anchor: "#ketkä-mukana" },
  { icon: GraduationCap, label: "Opiskelija tai kehittäjä", anchor: "#sisääntuloreitit" },
];

const whyBullets = [
  "Pääset mukaan oikeisiin kehittämishankkeisiin ja koulutuksiin",
  "Rakennat osaamistasi, näkyvyyttäsi ja vaikuttavuuttasi",
  "Toimit verkostossa, jossa ideat viedään käytäntöön",
];

const partnerCategories = [
  {
    image: partnerEducation,
    icon: GraduationCap,
    title: "Koulutusorganisaatiot",
    value: "Yhdessä rakennamme polkuja osaamisesta työelämään.",
    description:
      "Teemme yhteistyötä korkeakoulujen, ammattikorkeakoulujen ja muiden koulutusorganisaatioiden kanssa.",
    forYou: "Sinulle, jos haluat kehittää koulutusta työelämälähtöisesti.",
  },
  {
    image: partnerBusiness,
    icon: BriefcaseBusiness,
    title: "Yritykset ja yhteisöt",
    value: "Kumppanuus, joka tuottaa mitattavaa osaamista ja kasvua.",
    description:
      "Kumppanuudet yritysten kanssa mahdollistavat työelämälähtöisen osaamisen kehittämisen.",
    forYou: "Sinulle, jos etsit konkreettisia tapoja kehittää henkilöstösi osaamista.",
  },
  {
    image: partnerPublic,
    icon: Building2,
    title: "Julkinen sektori",
    value: "Alueellista elinvoimaa rakennetaan yhdessä.",
    description:
      "Yhteistyö kuntien ja valtion toimijoiden kanssa alueellisen elinvoiman vahvistamiseksi.",
    forYou: "Sinulle, jos haluat vahvistaa alueesi osaamista ja vetovoimaa.",
  },
  {
    image: partnerNetwork,
    icon: Network,
    title: "Asiantuntijaverkosto ja kumppanit",
    value: "Laaja verkosto, jossa osaaminen ja vaikuttavuus kasvavat.",
    description:
      "Olemme osa laajempia osaamisen ja työllisyyden verkostoja KUUMA-seudulla ja valtakunnallisesti.",
    forYou: "Sinulle, jos haluat jakaa osaamistasi ja kasvaa asiantuntijana.",
  },
];

const processSteps = [
  { icon: Lightbulb, label: "Jätä idea tai hakemus" },
  { icon: Users, label: "Arviointi ja sparraus" },
  { icon: Cog, label: "Toteutus yhdessä" },
  { icon: Trophy, label: "Tulokset ja näkyvyys" },
];

const devSteps = [
  { icon: Lightbulb, label: "Ajattelu", text: "Näet ja johdat eri tavalla" },
  { icon: Cog, label: "Toiminta", text: "Viet opit suoraan omaan työhösi" },
  { icon: Bot, label: "Työkalut", text: "Otat modernit työkalut – myös tekoälyn – käyttöön" },
  { icon: Sprout, label: "Kulttuuri", text: "Vaikutat tiimiin ja koko organisaatioon" },
];

const themes = [
  "Johtaminen ja esihenkilötyö",
  "Tekoäly ja digitalisaatio",
  "Turvallisuus ja vastuullisuus",
  "Osaamisen johtaminen",
  "Työelämän siirtymät",
  "Kestävä kehitys",
];

const participationForms = [
  { icon: Calendar, title: "Tapahtumat ja webinaarit", text: "Ajankohtaisia tilaisuuksia verkostossa." },
  { icon: Wrench, title: "Työpajat ja yhteiskehittäminen", text: "Konkreettista kehittämistä yhdessä." },
  { icon: Network, title: "Verkosto ja jatkuva oppiminen", text: "Pysy mukana ja kasva jatkuvasti." },
];

/* ── Component ── */

const KumppanitPage = () => {
  const navigate = useNavigate();
  const { openWizard } = useWizard();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <Layout>
      {/* 1. Hero */}
      <KumppanitHeroCarousel />

      {/* Role selection cards */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="keuda-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleCards.map((r) => (
              <a
                key={r.label}
                href={r.anchor}
                className="keuda-card-enhanced p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200"
              >
                <r.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <span className="font-semibold text-foreground">{r.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Why join */}
      <section className="py-10 md:py-14">
        <div className="keuda-container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Miksi tulla mukaan</h2>
          <ul className="space-y-3 text-left max-w-xl mx-auto mb-8">
            {whyBullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <div className="bg-accent/50 rounded-xl p-6 flex items-start gap-3 max-w-xl mx-auto">
            <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <p className="text-foreground italic text-sm md:text-base">
              "Koulutuksemme syntyvät tässä verkostossa – yhdessä kehittäen, kokeillen ja vaikuttaen."
            </p>
          </div>
        </div>
      </section>

      {/* 3. Who's involved */}
      <section id="ketkä-mukana" className="py-10 md:py-14 bg-muted/30 scroll-mt-20">
        <div className="keuda-container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Ketkä ovat mukana
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {partnerCategories.map((cat) => (
              <div key={cat.title} className="keuda-card-enhanced overflow-hidden">
                <div className="aspect-[2/1] overflow-hidden">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{cat.title}</h3>
                  </div>
                  <p className="text-sm font-medium text-secondary mb-1">{cat.value}</p>
                  <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                  <p className="text-xs text-primary italic">{cat.forYou}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KeudaPRO Hub */}
      <section className="py-10 md:py-14">
        <div className="keuda-container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            KeudaPRO Hub – kehittämisen alusta
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Hub on paikka, jossa ideat, osaaminen ja toteutus kohtaavat. Osallistuminen on avointa ja
            maksutonta – yhteiskehittäminen ja pilotointi ovat toiminnan ytimessä. Tule mukaan
            rakentamaan uutta yhdessä.
          </p>
        </div>
      </section>

      {/* 5. Two entry routes */}
      <section id="sisääntuloreitit" className="py-10 md:py-14 bg-muted/30 scroll-mt-20">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1 */}
            <div className="keuda-card-enhanced p-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Kehitä ja opi</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Opiskelijat ja kehittäjät</p>
              <ul className="space-y-2 mb-6">
                {["Opinnäytetyöt", "Harjoittelut", "Kehittämisprojektit"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <ArrowRight className="w-3 h-3 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="cta"
                className="w-full"
                onClick={() => navigate("/yhteystiedot#yhteystiedot")}
              >
                Hae mukaan projektiin
              </Button>
            </div>
            {/* Card 2 */}
            <div className="keuda-card-enhanced p-8">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-7 h-7 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Rakenna ja vaikuta</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Asiantuntijat ja yritykset</p>
              <ul className="space-y-2 mb-6">
                {["Koulutusideat", "Valmennukset", "Yhteiskehittäminen"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <ArrowRight className="w-3 h-3 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="cta"
                className="w-full"
                onClick={() => navigate("/yhteystiedot#yhteystiedot")}
              >
                Tarjoa idea tai osaaminen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Process */}
      <section className="py-10 md:py-14">
        <div className="keuda-container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Näin pääset mukaan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {processSteps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {i + 1}.
                  </span>
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Themes */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="keuda-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Teemat</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {themes.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Development logic */}
      <section className="py-10 md:py-14 bg-foreground">
        <div className="keuda-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-2">
            Näin kehitys tapahtuu
          </h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto text-sm">
            Kehitys etenee sisältä ulospäin – yksilöstä tiimiin ja organisaatioon.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 max-w-3xl mx-auto">
            {devSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center gap-2 bg-background/10 rounded-xl px-6 py-5 min-w-[140px]">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="font-semibold text-background text-sm">{step.label}</p>
                  <p className="text-xs text-background/70">{step.text}</p>
                </div>
                {i < devSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-background/50 hidden md:block flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Participation forms */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="keuda-container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Osallistumisen muodot
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {participationForms.map((f) => (
              <div key={f.title} className="keuda-card-enhanced p-6 text-center">
                <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img src={kumppanitCtaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Valitse oma tapasi tulla mukaan
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate("/yhteystiedot#yhteystiedot")}
            >
              Hae mukaan projektiin
            </Button>
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate("/yhteystiedot#yhteystiedot")}
            >
              Tarjoa idea tai koulutus
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              className="border-white text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate("/yhteystiedot#yhteystiedot")}
            >
              Liity asiantuntijaverkostoon
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default KumppanitPage;
