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
  Shield,
  Sparkles,
  Award,
  HeartHandshake,
  Target,
  BookOpen,
  Briefcase,
  RefreshCcw,
  Compass,
} from "lucide-react";
import { MuutosturvaFormModal } from "@/components/noste/MuutosturvaFormModal";
import imgAlle55 from "@/assets/muutosturva-alle55.jpg";
import imgYli55 from "@/assets/muutosturva-yli55.jpg";
import imgTyonantaja from "@/assets/muutosturva-tyonantaja.jpg";

/* ============================================================
   /muutosturva — laajennettu muutosturvapalvelusivu
   Yhtenäinen KeudaPRO-ilme (Inter, keuda-tokenit, keuda-container)
   ============================================================ */

const TYONTEKIJA_ALLE55 = [
  "Henkilökohtainen muutosturvakoulutuksen suunnitelma",
  "Tekoälyn (AI) ammattiosaajakoulutus oman alasi näkökulmasta",
  "Digiosaaminen: M365, Teams, tietoturva",
  "Työnhakuvalmennus, CV ja LinkedIn-profiilin päivitys",
  "Mahdollisuus uudelleenkouluttautua KUUMA-seudun ammattialoille",
];

const TYONTEKIJA_YLI55 = [
  "Laajennettu muutosturva — koulutusbudjetti vastaa 2 kk bruttopalkkaa",
  "Henkilökohtainen uravalmennus ja osaamiskartoitus",
  "Digitaidot kokeneille — rauhallisella tempolla",
  "Työnhakuvalmennus: CV, haastattelut, LinkedIn",
  "Henkinen tuki ja jaksaminen muutoksessa",
];

const TYONANTAJA_BENEFITS = [
  "Yksi yhteyshenkilö koko muutosturvaprosessiin",
  "Räätälöity koulutuspaketti irtisanottaville työntekijöille",
  "Tekoälykoordinaattori-koulutus alakohtaisena vaihtoehtona",
  "Lakisääteisen muutosturvakoulutuksen toteutus avaimet käteen",
  "Selkeä raportointi ja dokumentaatio työnantajan tarpeisiin",
];

const SERVICE_FAMILIES = [
  {
    icon: Shield,
    title: "Muutosturva",
    body: "Irtisanotuille tuotannollisista tai taloudellisista syistä. Koulutus tukee uuden työn löytymistä ja osaamisen päivittämistä.",
    badge: "Lakisääteinen",
  },
  {
    icon: Target,
    title: "TäsmäKoulutus",
    body: "Kun työpaikka säilyy mutta osaamista täytyy päivittää. Suunnittelemme vaikuttavan, työnantajan ja henkilöstön tarpeisiin räätälöidyn kokonaisuuden.",
    badge: "Työssä jatkaville",
  },
  {
    icon: RefreshCcw,
    title: "MuutosKoulutus",
    body: "Fuusioiden, uudelleenorganisointien ja digitalisaation yhteydessä. Valmennuspolku, joka auttaa henkilöstöä onnistumaan uudessa tehtävässä.",
    badge: "Organisaatiomuutoksiin",
  },
  {
    icon: Compass,
    title: "Outplacement",
    body: "Henkilökohtaista tukea uuden työn löytämiseen — sparrauksesta työnhakuun, verkostoihin ja koulutukseen. Yhden luukun periaatteella.",
    badge: "Uudelleensijoitus",
  },
];

const AI_COORDINATOR_COURSES: { ala: string; href: string }[] = [
  { ala: "Tuote- ja palvelukehitys", href: "https://www.keuda.fi/koulutus/tuote-ja-palvelukehitys-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Turvallisuusala", href: "https://www.keuda.fi/koulutus/turvallisuusala-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Työturvallisuus", href: "https://www.keuda.fi/koulutus/tyoturvallisuus-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
  { ala: "Yrittäjät", href: "https://www.keuda.fi/koulutus/yrittajat-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/" },
];

const WHY_KEUDAPRO = [
  { icon: Award, title: "Luotettava julkinen toimija", body: "Keuda on KUUMA-seudun johtava ammatillinen kouluttaja — vahva alueellinen verkosto ja kokemus." },
  { icon: Sparkles, title: "Tekoälyosaaminen ytimessä", body: "Alakohtaiset AI-Coordinator-koulutukset antavat aitoa kilpailuetua seuraavaan työhön." },
  { icon: HeartHandshake, title: "Yksi yhteyshenkilö", body: "Heikki Kallunki hoitaa muutosturvaprosessisi alusta loppuun — ei pompottelua luukulta toiselle." },
  { icon: BookOpen, title: "Laaja koulutustarjonta", body: "Pääset käsiksi Keudan koko ammatilliseen tarjontaan — myös tutkintotavoitteiseen koulutukseen." },
  { icon: Briefcase, title: "Työelämälähtöinen", body: "Sisällöt rakennetaan KUUMA-seudun työnantajien todellisten tarpeiden pohjalta." },
  { icon: CheckCircle2, title: "Virallinen todistus", body: "Saat osaamisestasi virallisen todistuksen, jolla erotut työnhaussa." },
];

const STEPS = [
  { n: "01", title: "Yhteydenotto", body: "Täytä lyhyt kartoituslomake tai soita. Saat henkilökohtaisen yhteyshenkilön." },
  { n: "02", title: "Kartoitus", body: "Käymme yhdessä läpi tilanteesi, tavoitteesi ja muutosturvabudjettisi." },
  { n: "03", title: "Koulutussuunnitelma", body: "Laadimme sinulle/yrityksellesi konkreettisen, alakohtaisen koulutussuunnitelman." },
  { n: "04", title: "Toteutus", body: "Aloitat koulutuksen joustavasti ja saat tukea koko polun ajan." },
];

const FAQ = [
  {
    q: "Mitä muutosturva tarkoittaa?",
    a: "Muutosturva on palvelukokonaisuus, joka auttaa tuotannollisista tai taloudellisista syistä irtisanottuja työntekijöitä työllistymään uudelleen mahdollisimman nopeasti. Se sisältää neuvontaa, ohjausta ja koulutusta.",
  },
  {
    q: "Mitä laajennettu muutosturva (yli 55-vuotiaat) sisältää?",
    a: "Laajennettu muutosturva on suunnattu yli 55-vuotiaille, vähintään 5 vuotta saman työnantajan palveluksessa olleille työntekijöille. Se sisältää muutosturvarahan (keskimääräinen kuukausipalkka), muutosturvakoulutuksen, jonka budjetti vastaa kahden kuukauden bruttopalkkaa, sekä työllistymisvapaan (5, 15 tai 25 päivää).",
  },
  {
    q: "Kenelle muutosturva (alle 55-vuotiaat) kuuluu?",
    a: "Muutosturva kuuluu tuotannollisista ja taloudellisista syistä irtisanotuille työntekijöille. Koulutuksen järjestämisessä voidaan hyödyntää työllisyysalueiden tukea.",
  },
  {
    q: "Voiko muutosturvakoulutuksen toteuttaa tekoälykoulutuksena?",
    a: "Kyllä. KeudaPRO tarjoaa alakohtaisia Tekoälyn ammattiosaaja / Tekoälykoordinaattori (AI-Coordinator) -koulutuksia, jotka soveltuvat erinomaisesti muutosturvakoulutukseksi monilla aloilla.",
  },
  {
    q: "Onko muutosturva pakollinen työnantajalle?",
    a: "Yli 30 työntekijän työllistävillä yrityksillä on lakisääteisiä velvoitteita, kuten työllistymistä edistävän toimintasuunnitelman laatiminen ja koulutuksen tarjoaminen irtisanomisaikana.",
  },
  {
    q: "Miten muutosturva liittyy yt-neuvotteluihin?",
    a: "Muutosturva on osa prosessia, jossa työnantaja neuvottelee henkilöstön irtisanomisista. Muutosturvakoulutukset tarjoavat työntekijöille tukea siirtymisessä uuteen työhön yt-neuvotteluiden jälkeen.",
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
      "Muutosturvakoulutukset työntekijöille ja työnantajille — myös laajennettu muutosturva yli 55-vuotiaille. Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset alakohtaisesti.",
  };

  return (
    <Layout>
      <SEO
        title="Muutosturvakoulutus | KeudaPRO"
        description="Muutosturvakoulutukset KUUMA-seudulla: alle 55- ja yli 55-vuotiaille, työntekijöille ja työnantajille. Alakohtaiset AI-Coordinator-koulutukset. Avaimet käteen -toteutus."
        path="/muutosturva"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <HeroSection
        tagline="KeudaPRO · Muutosturva"
        title="Muutosturvakoulutus — uusi suunta, uusi osaaminen"
        description="Olitpa irtisanottu työntekijä tai muutostilanteessa oleva työnantaja — KeudaPRO toteuttaa muutosturvakoulutuksen, joka todella vie eteenpäin. Sisältää myös laajennetun muutosturvan yli 55-vuotiaille."
        ctaText="Pyydä koulutussuunnitelma"
        onCtaClick={() => setFormOpen(true)}
      />

      {/* AUDIENCE SPLIT — alle 55 / yli 55 / työnantaja */}
      <section id="kohderyhmat" className="keuda-section">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Kenelle muutosturva on tarkoitettu?
            </h2>
            <p className="text-muted-foreground text-lg">
              Räätälöimme polun tilanteesi mukaan — niin yksilölle kuin organisaatiolle.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ALLE 55 */}
            <article className="keuda-card flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-keuda-blue-light text-primary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Työntekijä
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Muutosturva alle 55-vuotiaille
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed text-sm">
                Irtisanotuille tuotannollisista tai taloudellisista syistä. Koulutus tukee uuden työn löytymistä ja osaamisen päivittämistä.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {TYONTEKIJA_ALLE55.map((b) => (
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

            {/* YLI 55 */}
            <article className="keuda-card flex flex-col border-2 border-primary/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                    Laajennettu muutosturva
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Muutosturva yli 55-vuotiaille
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed text-sm">
                Yli 55-vuotiailla on oikeus laajennettuun muutosturvaan, jonka koulutusbudjetti vastaa kahden kuukauden bruttopalkkaa. Sisältää henkilökohtaisen uravalmennuksen.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {TYONTEKIJA_YLI55.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button variant="cta" onClick={() => setFormOpen(true)} className="w-full sm:w-auto self-start">
                Selvitä oikeutesi
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
                    Työnantaja
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Hoidamme muutosturvan puolestasi
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed text-sm">
                Toteutamme lakisääteisen muutosturvakoulutuksen avaimet käteen — yhden yhteyshenkilön kautta, selkeällä dokumentaatiolla.
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

      {/* SERVICE FAMILIES */}
      <section className="keuda-section bg-accent/40 border-y border-border">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Ratkaisut kaikkiin muutostilanteisiin
            </h2>
            <p className="text-muted-foreground text-lg">
              Muutosturva on vain yksi osa — rakennamme tarvittaessa kokonaisuuden, joka kattaa
              koko organisaatiomuutoksen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_FAMILIES.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.title} className="keuda-card-static">
                  <div className="w-11 h-11 rounded-lg bg-keuda-blue-light text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    {s.badge}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY KEUDAPRO */}
      <section className="keuda-section">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-keuda-blue-light text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              Miksi KeudaPRO
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Kuusi syytä valita KeudaPRO:n muutosturvakoulutus
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_KEUDAPRO.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="keuda-card-static">
                  <div className="w-10 h-10 rounded-lg bg-keuda-teal-light text-secondary flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.body}</p>
                </div>
              );
            })}
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
            Usein kysyttyä muutosturvasta
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
