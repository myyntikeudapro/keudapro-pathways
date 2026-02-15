import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "@/contexts/WizardContext";

import heroImg1 from "@/assets/contact-hero-1.jpg";
import heroImg2 from "@/assets/contact-hero-2.jpg";
import heroImg3 from "@/assets/contact-hero-3.jpg";
import ctaBg from "@/assets/contact-cta-bg.jpg";
import teamBg from "@/assets/contact-team-bg.jpg";

/* ─── HERO CAROUSEL DATA ─── */
const heroSlides = [
  {
    image: heroImg1,
    subtitle: "OTA YHTEYTTÄ",
    title: "Keskustellaan tilanteestasi",
    text: "Löydetään yhdessä sopiva reitti ja ratkaisu.",
    cta: "Varaa keskusteluaika",
    href: "#lomake",
  },
  {
    image: heroImg2,
    subtitle: "OTA YHTEYTTÄ",
    title: "Etkö tiedä mistä aloittaa?",
    text: "Aloita lyhyellä kartoituksella – se ei sido mihinkään.",
    cta: "Tee nopea kartoitus",
    href: "https://example.com/kartoitus",
  },
  {
    image: heroImg3,
    subtitle: "OTA YHTEYTTÄ",
    title: "Haluatko yhteistyökumppaniksi?",
    text: "",
    cta: "Ota yhteyttä tiimiin",
    href: "#lomake",
  },
];

/* ─── SELECTION CARDS ─── */
const helpCards = [
  {
    title: "Haluan keskustella kasvusta",
    text: "Kasvu, uudistuminen tai digiloikka yrityksessä.",
    cta: "Varaa kasvukartoitus",
    href: "/kasvu",
  },
  {
    title: "Tarvitsen tukea työnhakuun",
    text: "Valmennus, osaamisen kirkastus tai reittikartoitus.",
    cta: "Siirry NOSTE-reitille",
    href: "/noste",
  },
  {
    title: "Haluamme valmennus- tai AI-ratkaisun",
    text: "Johtaminen, tekoäly tai osaamisen kehittäminen.",
    cta: "Tutustu ÄLY-ratkaisuihin",
    href: "/aly",
  },
  {
    title: "Haluamme kumppaniksi",
    text: "Yhteistyö, verkostot tai pilotit.",
    cta: "Ota yhteyttä tiimiin",
    href: "#lomake",
  },
];

/* ─── TEAM / CONTACT PERSONS ─── */
const team = [
  {
    name: "Heikki Kallunki",
    role: "Myynti ja asiakkuudet",
    email: "heikki.kallunki@keuda.fi",
    phone: "+358 40 190 6912",
    linkedin: "https://linkedin.com/in/heikkikallunki",
  },
  {
    name: "Satu Vainio",
    role: "Koulutus- ja valmennuspalveluiden toteutukset",
    email: "satu.vainio@keuda.fi",
    phone: "+358 40 120 9723",
    linkedin: "https://linkedin.com/in/satuvainio",
  },
];

/* ─── COMPONENT ─── */
const YhteystiedotPage = () => {
  const { openWizard } = useWizard();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <Layout>
      {/* ════════ HERO CAROUSEL ════════ */}
      <section className="relative w-full h-[70vh] min-h-[420px] max-h-[700px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ))}

        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl">
            <p className="text-sm md:text-base font-semibold tracking-widest uppercase text-white/80 mb-3">
              {heroSlides[current].subtitle}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {heroSlides[current].title}
            </h1>
            {heroSlides[current].text && (
              <p className="text-lg md:text-xl text-white/80 mb-8">
                {heroSlides[current].text}
              </p>
            )}
            {heroSlides[current].href.includes("example.com/kartoitus") ? (
              <Button variant="cta" size="xl" onClick={openWizard}>
                {heroSlides[current].cta}
              </Button>
            ) : (
              <Button variant="cta" size="xl" asChild>
                <a href={heroSlides[current].href}>{heroSlides[current].cta}</a>
              </Button>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ════════ VALINTAOSIO ════════ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Miten voimme auttaa?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Valitse tilanne – ohjaamme sinut oikeaan paikkaan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCards.map((card) => (
              <div
                key={card.title}
                className="keuda-card-enhanced flex flex-col h-full"
              >
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  {card.text}
                </p>
                <Button variant="cta" size="default" asChild className="w-full">
                  <a href={card.href}>{card.cta}</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ YHTEYSTIEDOT ════════ */}
      <section className="relative w-full">
        <div className="absolute inset-0">
          <img
            src={teamBg}
            alt="Yhteystiedot tausta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-16 md:py-24">
          <div className="keuda-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Yhteystiedot
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {team.map((person) => (
                <div
                  key={person.name}
                  className="flex flex-col items-center text-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">
                      {person.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{person.name}</h3>
                  <p className="text-sm text-white/70 mb-4">{person.role}</p>
                  <div className="space-y-2 text-sm">
                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition-colors justify-center"
                    >
                      <Mail className="w-4 h-4" />
                      {person.email}
                    </a>
                    <a
                      href={`tel:${person.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition-colors justify-center"
                    >
                      <Phone className="w-4 h-4" />
                      {person.phone}
                    </a>
                    {person.linkedin && (
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors justify-center"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* General contact info */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <a
                href="mailto:info@keudapro.fi"
                className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Sähköposti</p>
                  <p className="font-medium text-white">info@keudapro.fi</p>
                </div>
              </a>
              <a
                href="tel:+358912345567"
                className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Puhelin</p>
                  <p className="font-medium text-white">+358 (0)9 123 4567</p>
                </div>
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 hover:bg-white/15 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Osoite</p>
                  <p className="font-medium text-white">
                    Sibeliuksenväylä 55, 04400 Järvenpää
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ YHTEYDENOTTOLOMAKE ════════ */}
      <section id="lomake" className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Lähetä viesti
            </h2>

            <form className="keuda-card-enhanced space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nimi *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Etunimi Sukunimi"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                  Yritys
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Yritys tai organisaatio"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Sähköposti *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="nimi@esimerkki.fi"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Puhelin
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+358 40 123 4567"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Mihin asia liittyy? *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Valitse aihe</option>
                  <option value="kasvu">Kasvu</option>
                  <option value="tekoaly">Tekoäly</option>
                  <option value="tyollistyminen">Työllistyminen</option>
                  <option value="yhteistyo">Yhteistyö</option>
                  <option value="muu">Muu</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Viesti *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Kerro, miten voimme auttaa..."
                />
              </div>

              <Button type="submit" variant="cta" size="lg" className="w-full">
                Lähetä viesti
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative w-full">
        <div className="absolute inset-0">
          <img
            src={ctaBg}
            alt="Uusi suunta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-20 md:py-32">
          <div className="keuda-container text-center">
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Yksi keskustelu voi muuttaa suunnan.
            </h3>
            <Button variant="cta" size="xl" asChild>
              <a href="#lomake">Varaa aika nyt</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default YhteystiedotPage;
