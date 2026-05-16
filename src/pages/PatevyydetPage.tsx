import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { NeedsBannerCarousel } from "@/components/patevyydet/NeedsBannerCarousel";
import heroOsaaminen from "@/assets/banner-osaaminen-kortit.jpg";
import { useWizard } from "@/contexts/WizardContext";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight } from "lucide-react";
import bannerKortit from "@/assets/banner-osaaminen-kortit.jpg";
import bannerSuunta from "@/assets/banner-osaaminen-suunta.jpg";
import bannerAi from "@/assets/banner-osaaminen-ai.jpg";
import bannerRatkaisee from "@/assets/banner-osaaminen-ratkaisee.jpg";

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
import coachReitti from "@/assets/coach-reitti.png";
import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";

const coachImages = {
  reitti: coachReitti,
  ana: coachAna,
  veli: coachVeli,
} as const;

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

/* ─── Uusi 5-kategorian accordion-rakenne ─── */
type AccordionCard = {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  badge?: string;
  infoUrl?: string;
};
type AccordionCategory = {
  id: string;
  title: string;
  intro: string;
  cards: AccordionCard[];
  bottomCta?: { text: string; href: string };
  bottomBanner?: { text: string; linkText: string; linkHref: string };
};

const accordionCategories: AccordionCategory[] = [
  {
    id: "johtaminen",
    title: "Johtaminen ja asiantuntijuus",
    intro: "Johtamisen, esihenkilötyön ja tekoälyn ohjelmat.",
    cards: [
      {
        title: "Johtamisen ja esihenkilötyön valmennukset",
        description: "Käytännön työkalut esihenkilötyöhön — kehityt johtajana ja tiimisi kehittyy kanssasi.",
        ctaText: "Tutustu",
        ctaHref: "/aly",
      },
      {
        title: "Tekoälypätevyys-ohjelmat",
        description: "AI-Director, AI-Manager, AI-Coordinator — strategisesta johtamisesta käytännön käyttöönottoon.",
        ctaText: "Tutustu",
        ctaHref: "/aly",
      },
      {
        title: "Turvallisuusjohtamisen ohjelmat",
        description: "Turvallisuuspäällikön valmennus ja Turvallisuusjohtaja 2.6 — tee turvallisuudesta kilpailuetu.",
        ctaText: "Tutustu",
        ctaHref: "/aly",
      },
    ],
    bottomCta: { text: "Katso kaikki Äly-reitin ohjelmat", href: "/aly" },
  },
  {
    id: "tyollistyminen",
    title: "Työllistyminen ja urasiirtymät",
    intro: "Valmennus suunnan löytämiseen, työnhakuun ja muutokseen siirtymiseen.",
    cards: [
      {
        title: "Työhönvalmennus",
        description: "Maksuton palvelu työttömille työnhakijoille — saatavilla Helsinki, Keski-Uusimaa, Vantaa, Kerava ja Sipoo.",
        ctaText: "Lue lisää",
        ctaHref: "/noste",
      },
      {
        title: "Henkilökohtainen valmennus",
        description: "Yksilöllistä valmennusta työnhakuun ja suunnan löytämiseen koko Suomessa.",
        ctaText: "Lue lisää",
        ctaHref: "/noste",
      },
      {
        title: "Muutosturva",
        description: "Muutosturva on oikeutesi — autamme sinua hyödyntämään sen täysimääräisesti.",
        ctaText: "Lue lisää",
        ctaHref: "/noste",
      },
    ],
    bottomCta: { text: "Katso kaikki Noste-reitin palvelut", href: "/noste" },
  },
  {
    id: "kasvu",
    title: "Yrityksen kasvu ja kehittäminen",
    intro: "Kasvuohjelmat ja henkilöstön osaamisen kehittäminen — käynnistyksestä uudistumiseen.",
    cards: [
      {
        title: "Kasvu käyntiin",
        description: "Ensimmäiset rakenteet, prosessit ja osaaminen kasvun pohjaksi. Sopii yrityksille 40 000–120 000 €/v.",
        ctaText: "Lue lisää",
        ctaHref: "/kasvu",
      },
      {
        title: "Skaalaus ja systematisointi",
        description: "Systematisoi kasvu ja rakenna skaalautuva toimintamalli. Sopii yrityksille 120 000–600 000 €/v.",
        ctaText: "Lue lisää",
        ctaHref: "/kasvu",
      },
      {
        title: "Osaaminen käytäntöön",
        description: "Räätälöidyt henkilöstökoulutukset ja valmennukset kaikille kokoluokille.",
        ctaText: "Lue lisää",
        ctaHref: "/kasvu",
      },
    ],
    bottomCta: { text: "Katso kaikki Kasvu-reitin ohjelmat", href: "/kasvu" },
  },
  { id: "cat-4", title: "Kategoria 4 (määritellään)", intro: "Tulossa.", cards: [] },
  { id: "cat-5", title: "Kategoria 5 (määritellään)", intro: "Tulossa.", cards: [] },
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
  const { openWizard } = useWizard();

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

      {/* Hero banner — valokuva + otsikko */}
      <section className="relative w-full h-[220px] md:h-[340px] overflow-hidden">
        <img
          src={heroOsaaminen}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 h-full keuda-container flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Osaaminen ja pätevyydet
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl">
            Kortit, valmennukset ja ohjelmat — löydä tilanteesi mukainen ratkaisu.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-foreground">
        <div className="keuda-container">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-3">
              Mistä tarpeesta liikkeelle?
            </h2>
            <p className="text-lg text-background/70">
              Valitse tilanne — ohjaamme sinut oikean AI-valmentajan luo.
            </p>
          </div>

          <NeedsBannerCarousel />

          <div className="text-center mt-6">
            <p className="text-sm text-background/70">
              Ei mikään näistä?{" "}
              <button
                type="button"
                onClick={() => openPanel(null)}
                className="text-teal-300 hover:text-teal-200 underline-offset-4 hover:underline font-medium"
              >
                Kerro tarpeesi omin sanoin
              </button>
            </p>
          </div>
        </div>
      </section>


      {/* Kategoriat — accordion (5 paneelia, vain yksi auki kerrallaan) */}
      <section className="py-16 md:py-20 bg-[#E4F0EE]">
        <div className="keuda-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Selaa osaamisalueita
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Avaa kategoria — näet sisältyvät kortit, valmennukset ja ohjelmat.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-5xl mx-auto">
            {accordionCategories.map((cat) => {
              const isActive = openCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={cn(
                    "rounded-xl border overflow-hidden bg-card transition-all duration-300",
                    isActive
                      ? "border-teal-500 shadow-lg ring-1 ring-teal-500/30"
                      : "border-border hover:border-teal-300"
                  )}
                >
                  <button
                    onClick={() => setOpenCategory((prev) => (prev === cat.id ? null : cat.id))}
                    aria-expanded={isActive}
                    className={cn(
                      "w-full flex items-center justify-between gap-4 p-5 text-left transition-colors",
                      isActive ? "bg-teal-50" : "hover:bg-muted/40"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-lg md:text-xl font-bold mb-1",
                        isActive ? "text-teal-700" : "text-foreground"
                      )}>
                        {cat.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{cat.intro}</p>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                      isActive ? "rotate-180 text-teal-600" : "text-muted-foreground"
                    )} />
                  </button>

                  {isActive && (
                    <div className="animate-accordion-down border-t border-teal-100">
                      <div className="p-5 md:p-6 bg-card">
                        {cat.cards.length > 0 ? (
                          <div className="grid md:grid-cols-3 gap-5 mb-6">
                            {cat.cards.map((card) => {
                              const isExternal = !card.ctaHref.startsWith("/") && !card.ctaHref.startsWith("#");
                              return (
                                <div
                                  key={card.title}
                                  className="rounded-xl border border-border bg-background p-5 flex flex-col"
                                >
                                  {card.badge && (
                                    <span className="self-start inline-block text-[11px] font-semibold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5 mb-2">
                                      {card.badge}
                                    </span>
                                  )}
                                  <h4 className="text-base font-bold text-foreground mb-2 leading-snug">
                                    {card.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                                    {card.description}
                                  </p>
                                  <div className="mt-auto space-y-2">
                                    {card.infoUrl && (
                                      <Button variant="ghost" size="sm" className="w-full" asChild>
                                        <a href={card.infoUrl} target="_blank" rel="noopener noreferrer">
                                          Lue lisää
                                        </a>
                                      </Button>
                                    )}
                                    <Button variant="outline-primary" size="sm" className="w-full" asChild>
                                      {isExternal ? (
                                        <a href={card.ctaHref} target="_blank" rel="noopener noreferrer">
                                          {card.ctaText}
                                        </a>
                                      ) : (
                                        <a href={card.ctaHref}>{card.ctaText}</a>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground mb-6">
                            Sisältö määritellään seuraavaksi.
                          </p>
                        )}
                        {cat.bottomCta && (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                          >
                            {cat.bottomCta.href.startsWith("/") ? (
                              <a href={cat.bottomCta.href} className="inline-flex items-center justify-center gap-2">
                                {cat.bottomCta.text}
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            ) : (
                              <a
                                href={cat.bottomCta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2"
                              >
                                {cat.bottomCta.text}
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            )}
                          </Button>
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
