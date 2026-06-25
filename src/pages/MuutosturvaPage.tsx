import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { HeroSection } from "@/components/shared/HeroSection";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  ExternalLink,
  Users,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { MuutosturvaFormModal } from "@/components/noste/MuutosturvaFormModal";

/* ============================================================
   /muutosturva — additive page
   Yhtenäinen KeudaPRO-ilme (Inter, keuda-tokenit, keuda-container)
   ============================================================ */

const TYONTEKIJA_BENEFITS = [
  "Henkilökohtainen muutosturvakoulutuksen suunnitelma",
  "Tekoälyn (AI) ammattiosaajakoulutus oman alasi näkökulmasta",
  "Tukea CV:n, LinkedIn-profiilin ja työnhakutaitojen päivittämiseen",
  "Mahdollisuus uudelleenkouluttautua KUUMA-seudun ammattialoille",
  "Yli 55-vuotiaille räätälöity polku ja pidempi tuki",
];

const TYONANTAJA_BENEFITS = [
  "Yksi yhteyshenkilö koko muutosturvaprosessiin",
  "Räätälöity koulutuspaketti irtisanottaville työntekijöille",
  "Tekoälykoordinaattori-koulutus alakohtaisena vaihtoehtona",
  "Lakisääteisen muutosturvakoulutuksen toteutus avaimet käteen",
  "Selkeä raportointi ja dokumentaatio työnantajan tarpeisiin",
];

const AI_COORDINATOR_COURSES: { ala: string; href: string }[] = [
  { ala: "Tuote- ja palvelukehitys", href: "https://www.keuda.fi/koulutus/tuote-ja-palvelukehitys-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Turvallisuusala", href: "https://www.keuda.fi/koulutus/turvallisuusala-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Työturvallisuus", href: "https://www.keuda.fi/koulutus/tyoturvallisuus-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Yrittäjät", href: "https://www.keuda.fi/koulutus/yrittajat-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
];

const STEPS = [
  { n: "01", title: "Yhteydenotto", body: "Täytä lyhyt kartoituslomake tai soita. Saat henkilökohtaisen yhteyshenkilön." },
  { n: "02", title: "Kartoitus", body: "Käymme yhdessä läpi tilanteesi, tavoitteesi ja muutosturvabudjettisi." },
  { n: "03", title: "Koulutussuunnitelma", body: "Laadimme sinulle/yrityksellesi konkreettisen, alakohtaisen koulutussuunnitelman." },
  { n: "04", title: "Toteutus", body: "Aloitat koulutuksen joustavasti ja saat tukea koko polun ajan." },
];

const FAQ = [
  {
    q: "Mikä on muutosturvakoulutus?",
    a: "Muutosturvakoulutus on irtisanotulle työntekijälle kuuluva, työnantajan kustantama koulutus, jonka tavoitteena on auttaa uudelleentyöllistymisessä. Sen arvo on enintään kahden kuukauden palkka tai keskimääräinen kuukausiansio.",
  },
  {
    q: "Kenelle muutosturva kuuluu?",
    a: "Muutosturva kuuluu yli 55-vuotiaille, vähintään 5 vuotta saman työnantajan palveluksessa olleille työntekijöille, jotka on irtisanottu tuotannollisista ja taloudellisista syistä.",
  },
  {
    q: "Voiko muutosturvakoulutuksen toteuttaa tekoälykoulutuksena?",
    a: "Kyllä. KeudaPRO tarjoaa alakohtaisia Tekoälyn ammattiosaaja / Tekoälykoordinaattori (AI-Coordinator) -koulutuksia, jotka soveltuvat erinomaisesti muutosturvakoulutukseksi monilla aloilla.",
  },
  {
    q: "Milloin koulutus voi alkaa?",
    a: "Koulutus voidaan käynnistää joustavasti — usein jo muutaman viikon kuluessa yhteydenotosta.",
  },
];

export default function MuutosturvaPage() {
  const [formOpen, setFormOpen] = useState(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Muutosturvakoulutus – KeudaPRO",
    provider: { "@type": "Organization", name: "KeudaPRO", url: "https://keudapro.fi" },
    areaServed: "KUUMA-seutu, Suomi",
    description:
      "Muutosturvakoulutukset työntekijöille ja työnantajille. Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset alakohtaisesti.",
  };

  return (
    <Layout>
      <SEO
        title="Muutosturvakoulutus | KeudaPRO"
        description="Muutosturvakoulutukset KUUMA-seudulla: alakohtaiset Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset työntekijöille ja työnantajille. Avaimet käteen -toteutus."
        path="/muutosturva"
        jsonLd={jsonLd}
      />

      {/* HERO – yhtenäinen muiden sivujen kanssa */}
      <HeroSection
        tagline="KeudaPRO · Muutosturva"
        title="Muutosturvakoulutus — tekoälyosaaminen seuraavaan työhön"
        description="Olitpa irtisanottu työntekijä tai muutostilanteessa oleva työnantaja — KeudaPRO toteuttaa muutosturvakoulutuksen, joka todella vie eteenpäin. Alakohtaiset Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset."
        ctaText="Pyydä koulutussuunnitelma"
        onCtaClick={() => setFormOpen(true)}
      />

      {/* AUDIENCE SPLIT */}
      <section id="kohderyhmat" className="keuda-section">
        <div className="keuda-container">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* TYÖNTEKIJÄ */}
            <article className="keuda-card flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-keuda-blue-light text-primary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Sinulle työntekijä
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Sinut on irtisanottu — mitä seuraavaksi?
                  </h2>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                Saat henkilökohtaisen yhteyshenkilön ja koulutussuunnitelman, joka tähtää uuteen
                työhön — usein tekoälyosaamisen avulla.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {TYONTEKIJA_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button variant="cta" onClick={() => setFormOpen(true)} className="w-full sm:w-auto self-start">
                Aloita kartoitus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </article>

            {/* TYÖNANTAJA */}
            <article className="keuda-card flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-keuda-teal-light text-secondary flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Sinulle työnantaja
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Hoidamme muutosturvan puolestasi
                  </h2>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                Toteutamme lakisääteisen muutosturvakoulutuksen avaimet käteen — yhden
                yhteyshenkilön kautta, selkeällä dokumentaatiolla.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {TYONANTAJA_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button variant="cta" onClick={() => setFormOpen(true)} className="w-full sm:w-auto self-start">
                Pyydä tarjous
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </article>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="keuda-section bg-accent/40 border-y border-border">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Näin etenemme — neljä askelta
            </h2>
            <p className="text-muted-foreground text-lg">
              Selkeä prosessi yhteydenotosta valmiiseen koulutukseen.
            </p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <li key={s.n} className="keuda-card-static">
                <div className="text-3xl font-bold text-primary mb-2">{s.n}</div>
                <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI COORDINATOR COURSES */}
      <section className="keuda-section">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-keuda-blue-light text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              Alakohtaiset koulutukset
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Tekoälyn ammattiosaaja / AI-Coordinator
            </h2>
            <p className="text-muted-foreground text-lg">
              Valitse oma alasi — koulutus räätälöidään juuri sen näkökulmasta. Soveltuu
              erinomaisesti muutosturvakoulutukseksi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {AI_COORDINATOR_COURSES.map((c) => (
              <a
                key={c.href}
                href={c.href}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between gap-3 bg-card border border-border rounded-xl px-5 py-4 hover:border-primary hover:shadow-card transition-all"
              >
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                    Ala
                  </div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {c.ala}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="keuda-section bg-accent/40 border-t border-border">
        <div className="keuda-container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Usein kysyttyä
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-5"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="keuda-section bg-primary text-primary-foreground">
        <div className="keuda-container text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Aloitetaan yhdessä.
          </h2>
          <p className="text-primary-foreground/85 text-lg mb-8">
            Yksi yhteyshenkilö hoitaa muutosturvakoulutuksesi alusta loppuun.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="cta" size="lg" onClick={() => setFormOpen(true)}>
              Pyydä koulutussuunnitelma
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="tel:+358401906912">
                <Phone className="w-4 h-4 mr-2" />
                Soita Heikki Kallunki
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="mailto:heikki.kallunki@keuda.fi">
                <Mail className="w-4 h-4 mr-2" />
                Lähetä sähköpostia
              </a>
            </Button>
          </div>
        </div>
      </section>

      <MuutosturvaFormModal open={formOpen} onOpenChange={setFormOpen} />
    </Layout>
  );
}
