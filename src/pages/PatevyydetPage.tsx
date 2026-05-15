import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { PatevyydetHeroCarousel } from "@/components/patevyydet/PatevyydetHeroCarousel";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

import catKaikki from "@/assets/cat-kaikki.jpg";
import catTurvallisuus from "@/assets/cat-turvallisuus.jpg";
import catEnsiapu from "@/assets/cat-ensiapu.jpg";
import catHygienia from "@/assets/cat-hygienia.jpg";
import catTyoelamataidot from "@/assets/cat-tyoelamataidot.jpg";
import catAi from "@/assets/cat-ai.jpg";
import catToimialakohtaiset from "@/assets/cat-toimialakohtaiset.jpg";
import courseTulityo from "@/assets/course-tulityo.jpg";
import courseTyoturvallisuus from "@/assets/course-tyoturvallisuus.jpg";
import courseAkku from "@/assets/course-akku.jpg";
import courseEa1 from "@/assets/course-ea1.jpg";
import courseEa2 from "@/assets/course-ea2.jpg";
import courseHataensi4 from "@/assets/course-hataensi4.jpg";
import courseHataensi8 from "@/assets/course-hataensi8.jpg";
import courseHygienia from "@/assets/course-hygienia.jpg";
import courseAnniskelu from "@/assets/course-anniskelu.jpg";
import courseTyohyvinvointi from "@/assets/course-tyohyvinvointi.jpg";
import courseLinkedin from "@/assets/course-linkedin.jpg";
import courseKv from "@/assets/course-kv.jpg";
import course3t from "@/assets/course-3t.jpg";
import courseToimiala from "@/assets/course-toimiala.jpg";

const courseImageOverrides: Record<string, string> = {
  "Työturvallisuuskortti": courseTyoturvallisuus,
  "Tulityökortti": courseTulityo,
  "Akkuturvallisuuskoulutus": courseAkku,
  "EA1 Ensiapu": courseEa1,
  "EA2 Ensiapu": courseEa2,
  "Hätäensiapu 4 t": courseHataensi4,
  "Hätäensiapu 8 t": courseHataensi8,
  "Hygieniapassi": courseHygienia,
  "Anniskelupassi": courseAnniskelu,
  "Työhyvinvointikortti": courseTyohyvinvointi,
  "LinkedIn-kortti": courseLinkedin,
  "KV-kortti": courseKv,
  "3T: Tehoa työnhakuun tekoälyllä": course3t,
  "Toimialakohtainen pätevyys": courseToimiala,
};

const categories = [
  {
    id: "Turvallisuus",
    image: catTurvallisuus,
    title: "Turvallisuus",
    desc: "Työturvallisuus · Tulityö · Ensiapu · Akkuturvallisuus",
    intro: "Viralliset turvallisuus- ja ensiapukortit yrityksille ja työntekijöille — käytännönläheisesti, lyhyessä ajassa.",
  },
  {
    id: "Hygienia",
    image: catHygienia,
    title: "Hygienia & ravintola",
    desc: "Hygieniapassi · Anniskelupassi",
    intro: "Elintarvike- ja anniskelualan viralliset passit. Sopii ravintola-, kahvila- ja vähittäiskaupan henkilöstölle.",
  },
  {
    id: "Työelämätaidot",
    image: catTyoelamataidot,
    title: "Työelämä",
    desc: "LinkedIn-kortti · Työkieli-Suomi · KV-kortti · Työhyvinvointikortti",
    intro: "Työnhakuun, kansainväliseen työyhteisöön ja oman osaamisen näkyväksi tekemiseen suunnatut valmennukset.",
  },
  {
    id: "AI",
    image: catAi,
    title: "AI & digi",
    desc: "Tekoälyn ammattiosaaja · 3T-kortti",
    intro: "Tekoälyn ja digitaalisten työkalujen hyödyntäminen työnhaussa ja arjen työssä — sertifioidut osaamistodistukset.",
  },
  {
    id: "Toimialakohtaiset",
    image: catToimialakohtaiset,
    title: "Toimialakohtainen osaaminen",
    desc: "Räätälöidyt pätevyydet ja koulutukset",
    intro: "Toimialalle räätälöity pätevyyskoulutus — sisältö, laajuus ja toteutus sovitaan yhdessä organisaation kanssa.",
  },
];

type Course = {
  name: string;
  category: string;
  description: string;
  infoUrl?: string;
  signupUrl?: string;
  tags?: string[];
};

const courseTags: Record<string, string[]> = {
  "Työturvallisuuskortti": ["kortti", "yritys", "nopea", "lähi"],
  "Hygieniapassi": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "EA1 Ensiapu": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "EA2 Ensiapu": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "Hätäensiapu 4 t": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "Hätäensiapu 8 t": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "Tulityökortti": ["kortti", "yritys", "nopea", "lähi"],
  "Anniskelupassi": ["kortti", "yksilö", "yritys", "nopea", "lähi"],
  "Akkuturvallisuuskoulutus": ["kortti", "yritys", "nopea", "lähi"],
  "Työhyvinvointikortti": ["osaaminen", "yritys", "tiimi", "räätälöity"],
  "KV-kortti": ["kortti", "osaaminen", "yritys", "nopea", "verkko"],
  "3T: Tehoa työnhakuun tekoälyllä": ["tekoäly", "yksilö", "nopea", "verkko"],
  "LinkedIn-kortti": ["osaaminen", "yksilö", "työnhaku", "nopea", "verkko"],
  "Toimialakohtainen pätevyys": ["osaaminen", "yritys", "räätälöity", "tiimi"],
};

type WhoOption = { id: string; label: string; tag: string };
type GoalOption = { id: string; label: string; tags: string[] };
type FormatOption = { id: string; label: string; tag: string };

const whoOptions: WhoOption[] = [
  { id: "yksilo", label: "👤 Yksilö tai työnhakija", tag: "yksilö" },
  { id: "yritys", label: "🏢 Yritys tai organisaatio", tag: "yritys" },
  { id: "muutos", label: "🔄 Muutostilanteessa", tag: "muutos" },
];

const goalOptions: GoalOption[] = [
  { id: "kortti", label: "🪪 Virallinen kortti tai pätevyys", tags: ["kortti"] },
  { id: "osaaminen", label: "💡 Kehittää osaamistani", tags: ["osaaminen"] },
  { id: "tekoaly", label: "🤖 Oppia tekoälyn hyödyntämistä", tags: ["tekoäly"] },
  { id: "suunta", label: "🧭 Löytää uusi suunta", tags: ["muutos", "työnhaku"] },
  { id: "tiimi", label: "👥 Kehittää tiimiä tai henkilöstöä", tags: ["tiimi"] },
];

const formatOptions: FormatOption[] = [
  { id: "nopea", label: "⚡ Nopea (1 pv tai alle)", tag: "nopea" },
  { id: "ohjelma", label: "📅 Lyhyt ohjelma", tag: "ohjelma" },
  { id: "verkko", label: "🌐 Verkossa", tag: "verkko" },
  { id: "lahi", label: "🏫 Lähitoteutus", tag: "lähi" },
  { id: "raataloity", label: "🔧 Räätälöity ryhmälle", tag: "räätälöity" },
];

const courses: Course[] = [
  {
    name: "Työturvallisuuskortti",
    category: "Turvallisuus",
    description: "Yhteisten työpaikkojen työturvallisuuden parantamiseen kehitetty kortti. Voimassa viisi vuotta hyväksytysti suoritetun kurssin jälkeen.",
    infoUrl: "https://www.keuda.fi/koulutus/tyoturvallisuuskortti-koulutus/",
  },
  {
    name: "Tulityökortti",
    category: "Turvallisuus",
    description: "Käsitellään tulitöiden turvallista tekemistä, riskitekijöitä ja toimintaa onnettomuustilanteissa — sisältää käytännön suojaus- ja alkusammutusharjoituksen. Kortti voimassa viisi vuotta.",
    infoUrl: "https://www.keuda.fi/koulutus/tulityokortti-koulutus/",
  },
  {
    name: "Akkuturvallisuuskoulutus",
    category: "Turvallisuus",
    description: "Litiumioniakkujen turvallinen käsittely, varastointi ja riskienhallinta — suunnattu erityisesti autokorjaamoille ja ajoneuvoalan toimijoille.",
    infoUrl: "https://www.keuda.fi/koulutus/akkuturvallisuuskoulutus/",
    signupUrl: "https://www.lyyti.fi/reg/Akkuturvallisuuskoulutuslanding_page_6706",
  },
  {
    name: "EA1 Ensiapu",
    category: "Turvallisuus",
    description: "Ensiavun peruskurssi (16 h), joka antaa valmiudet auttaa onnettomuus- ja hätätilanteissa sekä yleisimmissä sairaus- ja tapaturmatilanteissa.",
    infoUrl: "https://www.keuda.fi/koulutus/spr-ensiapukurssi-ea-1/",
  },
  {
    name: "EA2 Ensiapu",
    category: "Turvallisuus",
    description: "Ensiavun jatkokurssi (16 h), joka syventää EA1:n osaamista vakavampien tapaturmien ja sairauskohtausten ensiapuun. Edellyttää voimassa olevaa EA1-koulutusta.",
    infoUrl: "https://www.keuda.fi/koulutus/spr-ensiapukurssi-ea-2/",
  },
  {
    name: "Hätäensiapu 4 t",
    category: "Turvallisuus",
    description: "Lyhyt 4 tunnin hätäensiapukurssi, joka antaa perusvalmiudet toimia onnettomuus- ja hätätilanteessa. Sopii hyvin työpaikan ensiapuvalmiuden ylläpitoon.",
    infoUrl: "https://www.keuda.fi/koulutus/spr-hataensiapukurssi-4-t/",
  },
  {
    name: "Hätäensiapu 8 t",
    category: "Turvallisuus",
    description: "Laajempi 8 tunnin hätäensiapukurssi, joka antaa kattavammat valmiudet auttaa hätä- ja sairauskohtaustilanteissa työpaikalla ja arjessa.",
    infoUrl: "https://www.keuda.fi/koulutus/spr-hataensiapukurssi-8-t/",
  },
  {
    name: "Hygieniapassi",
    category: "Hygienia",
    description: "Hyväksytysti suoritettu hygieniapassitesti osoittaa elintarvikehygienian perusosaamisen. Virallinen passi on voimassa toistaiseksi.",
    infoUrl: "https://www.keuda.fi/koulutus/hygieniapassitestit-ja-koulutukset/",
  },
  {
    name: "Anniskelupassi",
    category: "Hygienia",
    description: "Hyväksytysti suoritettu anniskelupassi osoittaa alkoholilainsäädännön hallinnan ja oikeuttaa toimimaan anniskeluravintolan vastaavana hoitajana.",
    infoUrl: "https://www.keuda.fi/koulutus/anniskelupassikoulutukset-ja-testit/",
  },
  {
    name: "Työhyvinvointikortti",
    category: "Työelämätaidot",
    description: "Innostaa ja ohjaa johtoa sekä henkilöstöä kehittämään työpaikan hyvinvointia yhteisvoimin. Toteutetaan tilauksesta yrityksille ja ryhmille.",
    infoUrl: "https://www.keuda.fi/koulutus/tyohyvinvointikortti-koulutus/",
  },
  {
    name: "LinkedIn-kortti",
    category: "Työelämätaidot",
    description: "Verkkovalmennus, jossa rakennat ammattimaisen LinkedIn-profiilin ja opit hyödyntämään palvelua työnhaussa tai asiantuntijaroolin vahvistamisessa.",
    infoUrl: "https://www.keuda.fi/koulutus/linkedin-tyonhakukortti/",
    signupUrl: "https://www.lyyti.fi/reg/LinkedIn_Tyonhakukorttilanding_page_5313?_gl=1*1kgcoya*_gcl_aw*R0NMLjE3Nzg3ODMxNDkuQ2p3S0NBanc1WlhRQmhCZEVpd0FJNVhWV2FJcEJ1aktZT2YyazVQcFpQaEtIYzJfbkM0ajZMQzJvRUJxSXpfSDAtUE9GYk8wT2lqdEtCb0NKUUFRQXZEX0J3RQ..*_gcl_au*Njg1NTgwMTQzLjE3NzUwMjk0NzY.*_ga*MTAzNDAxMTI5NC4xNzc1MDI5NDc3*_ga_EWEWG37T54*czE3Nzg4NzUwNDQkbzE1NSRnMSR0MTc3ODg3NTM1NyRqNDEkbDAkaDA.",
  },
  {
    name: "KV-kortti",
    category: "Työelämätaidot",
    description: "Tiivis ja käytännönläheinen koulutus, joka antaa varmuuden toimia oikein, eettisesti ja hallitusti kansainvälisten työntekijöiden ja työyhteisöjen kanssa.",
    infoUrl: "https://www.keuda.fi/koulutus/kv-korttikoulutus/",
    signupUrl: "https://www.lyyti.fi/reg/KVkorttikoulutus_2530",
  },
  {
    name: "3T: Tehoa työnhakuun tekoälyllä",
    category: "AI",
    description: "Sertifioitu osaamistodistus tekoälyn hyödyntämisestä työnhaun eri vaiheissa — hakemuksissa, CV:ssä ja piilotyöpaikkojen löytämisessä.",
    infoUrl: "https://www.keuda.fi/koulutus/3t-kortti/",
  },
  {
    name: "Toimialakohtainen pätevyys",
    category: "Toimialakohtaiset",
    description: "Räätälöity pätevyyskoulutus organisaation tarpeisiin — sisältö, laajuus ja toteutus sovitaan yhdessä.",
  },
];

const reittiCards: Course[] = [
  {
    name: "Reitit: Äly · Noste · Kasvu",
    category: "Reitit",
    description: "KeudaPRO:n ohjelmalliset kehityspolut yksilöille ja muutostilanteisiin — Äly (osaamisen kehittäminen), Noste (työn murros) ja Kasvu (yritysten kehittäminen).",
    infoUrl: "/kasvu",
    tags: ["osaaminen", "yksilö", "muutos", "ohjelma"],
  },
];

const PatevyydetPage = () => {
  const [active, setActive] = useState<string>("Kaikki");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [who, setWho] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [wizardActive, setWizardActive] = useState(false);
  const { toast } = useToast();
  const { openPanel } = useCoachPanel();

  const baseCourses: Course[] = courses.map((c) => ({ ...c, tags: courseTags[c.name] }));
  const allCourses: Course[] = [...baseCourses, ...reittiCards];

  const wizardSelectedTags: string[] = [];
  if (who) {
    const w = whoOptions.find((o) => o.id === who);
    if (w) wizardSelectedTags.push(w.tag);
  }
  goals.forEach((g) => {
    const o = goalOptions.find((x) => x.id === g);
    if (o) wizardSelectedTags.push(...o.tags);
  });
  formats.forEach((f) => {
    const o = formatOptions.find((x) => x.id === f);
    if (o) wizardSelectedTags.push(o.tag);
  });

  const wizardFiltered = wizardActive && wizardSelectedTags.length > 0
    ? allCourses.filter((c) => (c.tags ?? []).some((t) => wizardSelectedTags.includes(t)))
    : null;

  const filtered = wizardFiltered
    ? wizardFiltered
    : active === "Kaikki"
      ? baseCourses
      : baseCourses.filter((c) => c.category === active);
  const inlineCourses = openCategory ? baseCourses.filter((c) => c.category === openCategory) : [];

  const toggleCategory = (id: string) => {
    setWizardActive(false);
    setActive(id);
    if (id === "Kaikki") {
      setOpenCategory(null);
    } else {
      setOpenCategory((prev) => (prev === id ? null : id));
    }
  };

  const toggleInArray = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const resetWizard = () => {
    setWho(null);
    setGoals([]);
    setFormats([]);
    setWizardActive(false);
  };

  const runWizard = () => {
    setWizardActive(true);
    setActive("Kaikki");
    setOpenCategory(null);
    setTimeout(() => {
      document.getElementById("koulutukset")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
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
              {c.infoUrl.startsWith("/") ? (
                <a href={c.infoUrl}>Lue lisää</a>
              ) : (
                <a href={c.infoUrl} target="_blank" rel="noopener noreferrer">Lue lisää</a>
              )}
            </Button>
          )}
          {c.signupUrl ? (
            <Button variant="outline-primary" className="w-full" asChild>
              <a href={c.signupUrl} target="_blank" rel="noopener noreferrer">Ilmoittaudu</a>
            </Button>
          ) : (
            <Button variant="outline-primary" className="w-full" asChild>
              <a href="/yhteystiedot#lomake">Kysy lisää</a>
            </Button>
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
        title="Osaaminen ja pätevyydet | KeudaPRO"
        description="Kortit, valmennukset ja ohjelmat — nopeat ja käytännönläheiset ratkaisut yrityksille ja yksilöille."
        path="/osaaminen"
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

      {/* Mistä tarpeesta liikkeelle? */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "#F0F7F6" }}>
        <div className="keuda-container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Mistä tarpeesta liikkeelle?
              </h2>
              <p className="text-lg text-muted-foreground">
                Valitse tilanne — ohjaamme sinut oikean AI-valmentajan luo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Tarvitsen kortin tai pätevyyden",
                  desc: "Työturvallisuus, ensiapu, hygienia tai muu virallinen pätevyys itselleni tai tiimilleni.",
                  coach: "reitti" as const,
                },
                {
                  title: "Etsin uutta suuntaa",
                  desc: "Uramuutos, työnhaku tai uusi ammatillinen polku.",
                  coach: "ana" as const,
                },
                {
                  title: "Kehitän osaamista",
                  desc: "Tekoäly, digitaaliset taidot tai tiimin osaamisen kehittäminen.",
                  coach: "veli" as const,
                },
              ].map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => openPanel(card.coach)}
                  aria-label={`${card.title} — avaa AI-valmentajan`}
                  className="keuda-card-enhanced p-6 text-left flex flex-col h-full transition-all hover:border-teal-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </button>
              ))}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Ei mikään näistä?{" "}
                <button
                  type="button"
                  onClick={() => openPanel(null)}
                  className="text-teal-600 hover:text-teal-700 underline-offset-4 hover:underline font-medium"
                >
                  Kerro tarpeesi omin sanoin
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {/* Categories — NOSTE-style chips + accordion */}
      <section className="py-16 md:py-20 bg-[#E4F0EE]">
        <div className="keuda-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mitä osaamista etsit?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Valitse kategoria — näet suoraan siihen kuuluvat kortit ja koulutukset.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200",
                    openCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-primary/30 hover:bg-primary/10 hover:border-primary/60"
                  )}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => {
              const isActive = openCategory === cat.id;
              const isExpanded = isActive || openCategory === null;
              const catCourses = baseCourses.filter((c) => c.category === cat.id);
              return (
                <div
                  key={cat.id}
                  className={cn(
                    "rounded-xl border overflow-hidden bg-card transition-all duration-300",
                    isActive ? "border-primary shadow-lg" : "border-border",
                    !isExpanded && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{cat.title}</span>
                      <span className="hidden sm:inline text-xs text-muted-foreground">{cat.desc}</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300",
                      isActive && "rotate-180"
                    )} />
                  </button>

                  {isActive && (
                    <div className="animate-accordion-down">
                      <div className="relative h-[140px] overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={576}
                        />
                        <div className="absolute inset-0 bg-black/25" />
                      </div>
                      <div className="p-5 md:p-6">
                        <p className="italic text-muted-foreground text-sm mb-5">{cat.intro}</p>
                        {catCourses.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            {catCourses.map(renderCourseCard)}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Ei tulevia koulutuksia tällä hetkellä — kysy lisää lomakkeen kautta.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tutkintopolku-banneri */}
      <section className="py-6" style={{ backgroundColor: "#F5F5F5" }}>
        <div className="keuda-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-base text-foreground">
              Etsitkö tutkintotavoitteista koulutusta tai pidempää ammatillista polkua?
            </p>
            <div className="flex flex-col md:items-end">
              <a
                href="https://www.keuda.fi/koulutukset/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Tutustu Keudan tutkintokoulutuksiin →
              </a>
              <span className="text-xs text-muted-foreground mt-1">
                Keuda tarjoaa ammatillisia tutkintoja KUUMA-seudulla.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="koulutukset" className="py-12 md:py-16">
        <div className="keuda-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            {wizardActive && wizardSelectedTags.length > 0 ? "Sinulle sopivat ratkaisut" : "Tulevat koulutukset"}
          </h2>
          {filtered.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center keuda-card-enhanced p-8">
              <p className="text-lg text-foreground mb-4">
                Ei tarkkaa osumaa — kerro tarpeesi ja räätälöimme ratkaisun.
              </p>
              <Button variant="cta" asChild>
                <a href="#tarvelomake">Kerro tarpeesi</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(renderCourseCard)}
            </div>
          )}
        </div>
      </section>

      {/* Need form */}
      <section id="tarvelomake" className="py-12 md:py-20">
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
