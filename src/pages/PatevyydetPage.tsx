import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { PatevyydetHeroCarousel } from "@/components/patevyydet/PatevyydetHeroCarousel";

import catKaikki from "@/assets/cat-kaikki.jpg";
import catTurvallisuus from "@/assets/cat-turvallisuus.jpg";
import catEnsiapu from "@/assets/cat-ensiapu.jpg";
import catHygienia from "@/assets/cat-hygienia.jpg";
import catTyoelamataidot from "@/assets/cat-tyoelamataidot.jpg";
import catAi from "@/assets/cat-ai.jpg";
import catToimialakohtaiset from "@/assets/cat-toimialakohtaiset.jpg";
import courseTulityo from "@/assets/course-tulityo.jpg";

const courseImageOverrides: Record<string, string> = {
  "Tulityökortti": courseTulityo,
};

const categories = [
  { id: "Turvallisuus", image: catTurvallisuus, title: "Turvallisuus", desc: "Työturvallisuuskortti, tulityö, sähköturvallisuus" },
  { id: "Ensiapu", image: catEnsiapu, title: "Ensiapu", desc: "EA1, EA2, hätäensiapu" },
  { id: "Hygienia", image: catHygienia, title: "Hygienia ja ravintola", desc: "Hygieniapassi, anniskelupassi" },
  { id: "Työelämätaidot", image: catTyoelamataidot, title: "Työelämätaidot", desc: "LinkedIn, työnhaku, urasuunnittelu" },
  { id: "AI", image: catAi, title: "AI ja tulevaisuustaidot", desc: "Tekoäly työssä, 3T-ohjelma" },
  { id: "Toimialakohtaiset", image: catToimialakohtaiset, title: "Toimialakohtaiset", desc: "Räätälöidyt pätevyydet" },
];

type Course = {
  name: string;
  category: string;
  description: string;
  infoUrl?: string;
  signupUrl?: string;
};

const courses: Course[] = [
  {
    name: "Työturvallisuuskortti",
    category: "Turvallisuus",
    description: "Yhteisten työpaikkojen perustason turvallisuuskoulutus. Voimassa 5 vuotta ja vaaditaan yleisesti rakennus- ja teollisuusaloilla.",
  },
  {
    name: "Tulityökortti",
    category: "Turvallisuus",
    description: "Pakollinen kortti kaikille, jotka tekevät tulitöitä tilapäisillä tulityöpaikoilla. Voimassa 5 vuotta.",
  },
  {
    name: "Akkuturvallisuuskoulutus",
    category: "Turvallisuus",
    description: "Litiumioniakkujen turvallinen käsittely, varastointi ja riskienhallinta työpaikalla. Sopii kaikille akkujen kanssa työskenteleville.",
    infoUrl: "https://www.keuda.fi/koulutus/akkuturvallisuuskoulutus/",
    signupUrl: "https://www.lyyti.fi/reg/Akkuturvallisuuskoulutuslanding_page_6706",
  },
  {
    name: "EA1 Ensiapu",
    category: "Ensiapu",
    description: "Ensiavun peruskurssi (16 h). Antaa valmiudet auttaa hätätilanteissa ja yleisimmissä sairaus- ja tapaturmatilanteissa.",
  },
  {
    name: "Hygieniapassi",
    category: "Hygienia",
    description: "Pakollinen elintarvikkeita käsitteleville. Osoittaa elintarvikehygienian perusosaamisen ja on voimassa toistaiseksi.",
  },
  {
    name: "Anniskelupassi",
    category: "Hygienia",
    description: "Anniskeluravintolan vastaavan hoitajan pätevyystodistus. Tarvitaan alkoholijuomien anniskelutehtävissä.",
  },
  {
    name: "LinkedIn-kortti",
    category: "Työelämätaidot",
    description: "Opit rakentamaan ammattimaisen LinkedIn-profiilin, verkostoitumaan ja hyödyntämään palvelua työnhaussa sekä asiantuntijabrändäyksessä.",
  },
  {
    name: "KV-kortti",
    category: "Työelämätaidot",
    description: "Kansainvälisen työelämän valmiuksia kehittävä kortti — kulttuurienvälinen viestintä, monikulttuurinen työyhteisö ja globaalin työelämän taidot.",
    infoUrl: "https://kvkortti.fi",
    signupUrl: "https://www.lyyti.fi/reg/KVkorttikoulutus_2530",
  },
  {
    name: "3T: Tehoa työnhakuun tekoälyllä",
    category: "AI",
    description: "Käytännönläheinen koulutus, jossa opit hyödyntämään tekoälyä CV:n, hakemusten ja haastatteluiden valmistelussa.",
  },
  {
    name: "Toimialakohtainen pätevyys",
    category: "Toimialakohtaiset",
    description: "Räätälöity pätevyyskoulutus organisaation tarpeisiin — sisältö, laajuus ja toteutus sovitaan yhdessä.",
  },
];

const PatevyydetPage = () => {
  const [active, setActive] = useState<string>("Kaikki");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = active === "Kaikki" ? courses : courses.filter((c) => c.category === active);
  const inlineCourses = openCategory ? courses.filter((c) => c.category === openCategory) : [];

  const toggleCategory = (id: string) => {
    setActive(id);
    if (id === "Kaikki") {
      setOpenCategory(null);
    } else {
      setOpenCategory((prev) => (prev === id ? null : id));
    }
  };

  const renderCourseCard = (c: Course) => {
    const courseImage = courseImageOverrides[c.name] ?? categories.find((cat) => cat.id === c.category)?.image;
    return (
      <div key={c.name} className="keuda-card-enhanced p-6 flex flex-col overflow-hidden">
        {courseImage && (
          <div className="relative h-40 -mx-6 -mt-6 mb-5 overflow-hidden">
            <img src={courseImage} alt={c.name} loading="lazy" width={1024} height={640} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">{c.category}</Badge>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{c.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.description}</p>
        <div className="mt-auto space-y-2">
          {c.infoUrl && (
            <Button variant="ghost" className="w-full" asChild>
              <a href={c.infoUrl} target="_blank" rel="noopener noreferrer">Lue lisää</a>
            </Button>
          )}
          {c.signupUrl ? (
            <Button variant="outline-primary" className="w-full" asChild>
              <a href={c.signupUrl} target="_blank" rel="noopener noreferrer">Ilmoittaudu</a>
            </Button>
          ) : (
            <Button variant="outline-primary" className="w-full">Kysy lisää</Button>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    toast({ title: msg });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <SEO
        title="Pätevyydet ja osaamiskortit | KeudaPRO"
        description="Tunnustetut osaamiskortit ja pätevyyskoulutukset KUUMA-seudulla — ryhmille, tiimeille ja yksittäisille osallistujille."
        path="/patevyydet"
      />

      <PatevyydetHeroCarousel />

      {/* Intro + CTAs */}
      <section className="py-10 md:py-14">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Nopeat, tunnustetut kortit — ryhmille, tiimeille ja yksittäisille osallistujille. Löydä tarvitsemasi koulutus ja ilmoittaudu suoraan.
            </p>
            <div className="flex justify-center">
              <Button variant="cta" size="lg" asChild>
                <a href="#koulutukset">Selaa koulutuksia</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 bg-muted/30">
        <div className="keuda-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[{ id: "Kaikki", image: catKaikki, title: "Kaikki", desc: "Näytä kaikki koulutukset" }, ...categories].map((cat) => (
              <React.Fragment key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`keuda-card-enhanced p-6 text-left transition-all overflow-hidden flex flex-col ${
                    active === cat.id ? "ring-2 ring-primary border-primary" : ""
                  }`}
                >
                  <div className="relative h-40 -mx-6 -mt-6 mb-5 overflow-hidden">
                    <img src={cat.image} alt={cat.title} loading="lazy" width={1024} height={640} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <h3 className="absolute bottom-3 left-6 text-xl font-bold text-white">{cat.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                </button>
                {openCategory === cat.id && cat.id !== "Kaikki" && (
                  <div className="col-span-full animate-accordion-down">
                    <div className="keuda-card-enhanced p-6 md:p-8 bg-background">
                      <div className="flex items-center justify-between mb-6 gap-4">
                        <h3 className="text-2xl font-bold text-foreground">
                          Tulevat {cat.title.toLowerCase()}-koulutukset
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setOpenCategory(null)}>Sulje</Button>
                      </div>
                      {inlineCourses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {inlineCourses.map(renderCourseCard)}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Ei tulevia koulutuksia tällä hetkellä.</p>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="koulutukset" className="py-12 md:py-16">
        <div className="keuda-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            Tulevat koulutukset
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(renderCourseCard)}
          </div>
        </div>
      </section>

      {/* Need form */}
      <section className="py-12 md:py-20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Et löydä sopivaa toteutusta?
              </h2>
              <p className="text-lg text-muted-foreground">
                Kerro tarpeesi — räätälöimme toteutuksen tai etsimme sopivan ajankohdan.
              </p>
            </div>
            <form
              onSubmit={(e) => handleSubmit(e, "Kiitos! Palaamme asiaan.")}
              className="keuda-card-enhanced p-6 md:p-8 space-y-4"
            >
              <div>
                <Label htmlFor="course">Koulutus tai kortti</Label>
                <Input id="course" required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="count">Osallistujamäärä</Label>
                  <Input id="count" type="number" min={1} required />
                </div>
                <div>
                  <Label htmlFor="when">Toivottu ajankohta</Label>
                  <Input id="when" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email2">Sähköposti</Label>
                <Input id="email2" type="email" required />
              </div>
              <Button type="submit" variant="cta" className="w-full">Lähetä toive</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PatevyydetPage;
