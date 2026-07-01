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
import { EmployerMuutosturvaFormModal } from "@/components/noste/EmployerMuutosturvaFormModal";
import { AiCourseFinder } from "@/components/noste/AiCourseFinder";
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
  "Mahdollisuus uudelleenkouluttautua oman talousalueen ammattialoille",
];

const TYONTEKIJA_YLI55 = [
  "Laajennettu muutosturva — koulutusbudjetti vastaa 2 kk bruttopalkkaa",
  "Tekoälyn (AI) ammattiosaajakoulutus oman alasi näkökulmasta",
  "Henkilökohtainen uravalmennus ja osaamiskartoitus",
  "Digitaidot kokeneille — rauhallisella tempolla",
  "Työnhakuvalmennus: CV, haastattelut, LinkedIn",
  "Henkinen tuki ja jaksaminen muutoksessa",
];

const TYONANTAJA_BENEFITS = [
  "Yksi yhteyshenkilö koko muutosturvaprosessin ajan",
  "Lakisääteinen muutosvalmennus irtisanotuille (työnantajan velvoite ≥30 hlön yrityksissä)",
  "Tekoälyn ammattiosaaja -koulutus muutosvalmennuksen sisältönä (Tekoälykoordinaattori / -päällikkö / -johtaja)",
  "Tuki 55 vuotta täyttäneiden ohjaukseen työllisyysalueen muutosturvakoulutukseen",
  "Selkeä raportointi ja dokumentaatio HR:n tarpeisiin",
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
  { icon: Shield, tint: "bg-keuda-blue-light text-primary", title: "Luotettava julkinen toimija", body: "Keuda on Keski-Uudenmaan johtava ammatillinen kouluttaja ja työelämän kehittäjä — ja yksi Suomen suurimmista ammatillisen koulutuksen toteuttajista. Tarjoamme monipuolisia ja laadukkaita koulutuksia ympäri Suomen, etänä ja paikan päällä." },
  { icon: Sparkles, tint: "bg-keuda-teal-light text-secondary", title: "Tekoälyosaaminen ytimessä", body: "Alakohtaiset Tekoälyn ammattiosaaja -koulutukset (Tekoälykoordinaattori, Tekoälypäällikkö, Tekoälyjohtaja) antavat aitoa kilpailuetua seuraavaan työhön." },
  { icon: HeartHandshake, tint: "bg-orange-100 text-orange-700", title: "Yksi yhteyshenkilö", body: "Heikki Kallunki hoitaa muutosturvaprosessisi alusta loppuun — ei pompottelua luukulta toiselle." },
  { icon: GraduationCap, tint: "bg-purple-100 text-purple-700", title: "Laaja koulutustarjonta", body: "Muutosturvakoulutuksen jälkeen sinulle voi avautua luonteva jatkopolku Keudan tutkintotavoitteiseen koulutukseen — tutkintoa ei voi suorittaa muutosturvakoulutuksena, mutta autamme löytämään seuraavan askeleen." },
  { icon: Briefcase, tint: "bg-amber-100 text-amber-700", title: "Työelämälähtöinen", body: "Sisällöt rakennetaan oman talousalueesi työnantajien todellisten tarpeiden pohjalta — olitpa Keski-Uudellamaalla, Oulussa, Tampereella tai muualla Suomessa." },
  { icon: Award, tint: "bg-rose-100 text-rose-700", title: "Virallinen todistus", body: "Saat osaamisestasi virallisen todistuksen, jolla erotut työnhaussa." },
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
    a: "Muutosturvakoulutus on tuotannollis-taloudellisin syin irtisanotun työntekijän uudelleentyöllistymistä tukeva, yksilöllisesti räätälöity koulutus. Se kestää enintään 6 kuukautta ja on osallistujalle maksuton ja vapaaehtoinen. KeudaPRO toteuttaa muutosturvakoulutuksia KUUMA-seudulla, muualla Uudellamaalla ja koko Suomessa.",
  },
  {
    q: "Kuka on oikeutettu 55 vuotta täyttäneiden muutosturvakoulutukseen?",
    a: "Oikeus on henkilöllä, joka on täyttänyt 55 vuotta viimeistään irtisanomispäivänä, on irtisanottu tuotannollis-taloudellisista syistä 1.1.2023 tai sen jälkeen, on ollut saman työnantajan palveluksessa vähintään 5 vuotta ja on ilmoittautunut työnhakijaksi 60 päivän kuluessa irtisanomisesta. Kaikkien neljän ehdon on täytyttävä.",
  },
  {
    q: "Kuka maksaa muutosturvakoulutuksen ja mikä on sen arvo?",
    a: "Koulutuksen hankkii ja rahoittaa asuinpaikkasi työllisyysalue. Koulutuksen arvo on enintään irtisanotun kahden kuukauden palkkaa vastaava summa. Osallistujalle koulutus on maksuton – kustannuksia ei peritä työntekijältä eikä työnantajalta.",
  },
  {
    q: "Kauanko muutosturvakoulutus kestää ja milloin sen on alettava?",
    a: "Koulutus kestää enintään 6 kuukautta. Sen tulee lähtökohtaisesti alkaa 3 kuukauden kuluessa työsuhteen päättymisestä. Aikataulusta sovitaan työllisyysalueen ja koulutuksen toteuttajan kanssa – KeudaPRO pystyy usein käynnistämään koulutuksen muutamassa viikossa yhteydenotosta.",
  },
  {
    q: "Miten pääsen muutosturvakoulutukseen ja voinko valita toteuttajan?",
    a: "Ilmoittaudu työnhakijaksi 60 päivän kuluessa irtisanomisesta ja sovi koulutuksesta oman asuinpaikkasi työllisyysalueen kanssa. Voit ehdottaa koulutuksen sisältöä ja toteuttajaa, esimerkiksi KeudaPRO:ta. Virallisen päätöksen koulutuksen hankinnasta tekee työllisyysalue.",
  },
  {
    q: "Mitä muutosturvakoulutus voi sisältää?",
    a: "Sisältö räätälöidään yksilöllisesti ja se voi kattaa esimerkiksi tekoäly- ja digitaitoja, uraohjausta, ammatillista täydennys- tai tutkintotavoitteista koulutusta tai yrittäjyysvalmiuksia. KeudaPRO:n toteuttamissa koulutuksissa suosittu valinta on alakohtainen Tekoälyn ammattiosaaja -koulutus (Tekoälykoordinaattori, Tekoälypäällikkö tai Tekoälyjohtaja).",
  },
  {
    q: "Mitä eroa on muutosvalmennuksella ja muutosturvakoulutuksella?",
    a: "Muutosvalmennus on työnantajan lakisääteinen velvoite vähintään 30 henkilön yrityksissä: työnantaja rahoittaa ja hankkii sen kaikille tuotannollis-taloudellisin syin irtisanotuille (arvo n. 1 kk palkka). Muutosturvakoulutus taas on 55 vuotta täyttäneiden laajennettuun muutosturvaan kuuluva erillinen etu, jonka hankkii ja rahoittaa työllisyysalue (arvo enintään 2 kk palkka, kesto enintään 6 kk). Sama palveluntarjoaja, kuten KeudaPRO, voi toteuttaa molemmat.",
  },
  {
    q: "Mitä eroa on yleisellä muutosturvalla ja laajennetulla (55+) muutosturvalla?",
    a: "Yleinen muutosturva koskee kaikenikäisiä muutosneuvottelujen kautta tuotannollis-taloudellisin syin irtisanottuja; siihen kuuluva muutosvalmennus järjestetään työnantajan kustantamana. Laajennettu 55 vuotta täyttäneiden muutosturva puolestaan sisältää muutosturvarahan, työllisyysalueen kustantaman muutosturvakoulutuksen ja laajennetun työllistymisvapaan (5, 15 tai 25 päivää työsuhteen pituudesta riippuen).",
  },
  {
    q: "Tarjoaako KeudaPRO muutosturvakoulutusta KUUMA-seudulla?",
    a: "Kyllä. KeudaPRO toteuttaa muutosturvakoulutuksia KUUMA-seudulla (Hyvinkää, Järvenpää, Kerava, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula) sekä muualla Uudellamaalla ja Suomessa. Sinut kytketään yhteen yhteyshenkilöön, joka rakentaa henkilökohtaisen koulutussuunnitelman yhdessä työllisyysalueen kanssa.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function MuutosturvaPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [employerFormOpen, setEmployerFormOpen] = useState(false);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Muutosturva – KeudaPRO",
    provider: { "@type": "EducationalOrganization", name: "KeudaPRO", url: "https://keudapro.fi" },
    areaServed: "KUUMA-seutu, Suomi",
    description:
      "Muutosturvakoulutukset työntekijöille ja työnantajille — myös laajennettu muutosturva yli 55-vuotiaille. Tekoälyn ammattiosaaja -koulutukset alakohtaisesti (Tekoälykoordinaattori, Tekoälypäällikkö, Tekoälyjohtaja).",
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Muutosturvakoulutus – Tekoälyn ammattiosaaja",
    description:
      "Alakohtainen muutosturvakoulutus muutosneuvottelujen kautta irtisanotuille ja 55 vuotta täyttäneille laajennetun muutosturvan piirissä oleville. Tekoälyn ammattiosaaja -koulutus tasoilla Tekoälykoordinaattori, Tekoälypäällikkö ja Tekoälyjohtaja.",
    provider: { "@type": "EducationalOrganization", name: "KeudaPRO", url: "https://keudapro.fi" },
    educationalCredentialAwarded: "Tekoälyn ammattiosaaja -osaamismerkki",
    availableLanguage: "fi",
  };

  return (
    <Layout>
      <SEO
        title="Muutosturva | KeudaPRO"
        description="Muutosturvakoulutukset KUUMA-seudulla: alle 55- ja yli 55-vuotiaille, työntekijöille ja työnantajille. Alakohtaiset Tekoälyn ammattiosaaja -koulutukset (koordinaattori, päällikkö, johtaja). Avaimet käteen -toteutus."
        path="/muutosturva"
        jsonLd={[serviceJsonLd, courseJsonLd, FAQ_JSONLD]}
      />


      {/* HERO */}
      <section className="py-16 md:py-20 bg-foreground text-background">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6">

              Muutosturva — uusi suunta, uusi osaaminen
            </h1>
            <p className="text-lg md:text-xl text-background/75 mb-8 leading-relaxed">
              Olitpa irtisanottu työntekijä tai muutostilanteessa oleva työnantaja — KeudaPRO toteuttaa muutosturvakoulutuksen, joka todella vie eteenpäin. Sisältää myös laajennetun muutosturvan yli 55-vuotiaille.
            </p>
            <Button variant="cta" size="lg" onClick={() => setFormOpen(true)}>
              Pyydä koulutussuunnitelma
            </Button>
          </div>
        </div>
      </section>

      {/* AUDIENCE SPLIT — alle 55 / yli 55 / työnantaja */}
      <section id="kohderyhmat" className="keuda-section bg-muted text-foreground">
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
            <article className="keuda-card flex flex-col overflow-hidden p-0">
              <div className="relative h-44 w-full">
                <img
                  src={imgAlle55}
                  alt="Työntekijä uuden suunnan äärellä"
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-secondary drop-shadow-md">
                    Työntekijä
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
                    Muutosturva alle 55-vuotiaille
                  </h3>
                </div>


              </div>
              <div className="flex flex-col flex-1 p-6">
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
              </div>
            </article>

            {/* YLI 55 */}
            <article className="keuda-card flex flex-col overflow-hidden p-0 border-2 border-primary/30">
              <div className="relative h-44 w-full">
                <img
                  src={imgYli55}
                  alt="Kokenut työntekijä oppimassa uutta"
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-secondary drop-shadow-md">
                    Laajennettu muutosturva
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
                    Muutosturva yli 55-vuotiaille
                  </h3>
                </div>


              </div>
              <div className="flex flex-col flex-1 p-6">
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
              </div>
            </article>

            {/* TYÖNANTAJA */}
            <article className="keuda-card flex flex-col overflow-hidden p-0">
              <div className="relative h-44 w-full">
                <img
                  src={imgTyonantaja}
                  alt="HR-tiimi suunnittelee muutosturvaa"
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-secondary drop-shadow-md">
                    Työnantaja
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
                    Tuemme muutosturvaprosessianne
                  </h3>
                </div>


              </div>
              <div className="flex flex-col flex-1 p-6">
                <p className="text-muted-foreground mb-5 leading-relaxed text-sm">
                  Toteutamme lakisääteisen muutosvalmennuksen irtisanotuille ja tuemme HR:ää koko muutosturvaprosessin ajan — yhden yhteyshenkilön kautta, selkeällä dokumentaatiolla.
                </p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {TYONANTAJA_BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="cta" onClick={() => setEmployerFormOpen(true)} className="w-full sm:w-auto self-start">
                  Pyydä tarjous
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </article>

          </div>

          {/* Työnantajan velvoitteet – selventävä laatikko */}
          <div className="mt-8 max-w-4xl mx-auto bg-card border border-border rounded-xl p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-2">
              Työnantajan muutosturvavelvoitteet
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Työnantaja vastaa muutosneuvotteluista (yhteistoimintalaki 1333/2021), tiedottamisvelvollisuudesta, muutosvalmennuksesta (≥30 hlön yrityksissä), työllistymisvapaan mahdollistamisesta ja ilmoituksesta työllisyysalueelle. KeudaPRO toteuttaa muutosvalmennuksen ja tukee koko prosessia — muutosneuvottelut ja viranomaisilmoitukset ovat työnantajan omalla vastuulla. 55 vuotta täyttäneiden muutosturvakoulutuksen hankkii työllisyysalue, ei työnantaja.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICE FAMILIES */}
      <section className="keuda-section bg-foreground text-background border-y border-border">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-3">
              Ratkaisut kaikkiin muutostilanteisiin
            </h2>
            <p className="text-background/75 text-lg">
              Muutosturva on vain yksi osa — rakennamme tarvittaessa kokonaisuuden, joka kattaa
              koko organisaatiomuutoksen.
            </p>


          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_FAMILIES.map((s) => (
              <article
                key={s.title}
                className="bg-card border border-border rounded-2xl p-6 shadow-card flex flex-col"
              >
                <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold mb-2">
                  {s.badge}
                </div>
                <h3 className="font-bold text-foreground text-2xl md:text-3xl mb-3 leading-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </article>
            ))}
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
            {WHY_KEUDAPRO.map((w, i) => {
              return (
                <div key={w.title} className="keuda-card-static">
                  <div className="text-5xl md:text-6xl font-bold text-primary leading-none mb-4">
                    {String(i + 1).padStart(2, "0")}
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
      <section className="keuda-section bg-foreground text-background border-y border-border">
        <div className="keuda-container">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-3">
              Näin etenemme — neljä askelta
            </h2>
            <p className="text-background/75 text-lg">
              Selkeä prosessi yhteydenotosta valmiiseen koulutukseen.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <li key={s.n} className="keuda-card-static">
                <div className="text-5xl md:text-6xl font-bold text-primary leading-none mb-4">{s.n}</div>
                <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI COURSE FINDER — älykäs koulutuksen suunnittelu */}
      <section id="ai-course-finder" className="keuda-section bg-foreground text-background scroll-mt-24">
        <div className="keuda-container">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-background text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Älykäs koulutuksen suunnittelu
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-3">
              Valitse oma alasi ja pätevyysohjelma
            </h2>
            <p className="text-background/75 text-lg">
              Valitse ensin sopiva pätevyystaso — Tekoälykoordinaattori, Tekoälypäällikkö tai
              Tekoälyjohtaja — ja hae oma alasi. Tekoälyn ammattiosaaja -koulutus räätälöidään sen
              näkökulmasta. Lähes 50 alakohtaista koulutusta suoraan Keudan koulutussivuille.
            </p>
          </div>

          <AiCourseFinder />
        </div>
      </section>

      {/* MUUTOSTURVAN TASOT – yleinen vs. laajennettu (55+) vs. KeudaPRO:n rooli */}
      <section className="keuda-section bg-background border-t border-border">
        <div className="keuda-container max-w-4xl space-y-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Yleinen muutosturva
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Yleinen muutosturva koskee kaikenikäisiä työntekijöitä, jotka on irtisanottu
              muutosneuvottelujen kautta tuotannollis-taloudellisista syistä. Työnantaja vastaa
              muutosturvaan liittyvästä tiedottamisesta, muutosneuvotteluista ja työnantajan
              kustantamasta muutosvalmennuksesta. KeudaPRO toteuttaa työnantajan tilaamia
              muutosvalmennuksia ja -koulutuksia KUUMA-seudulla, Uudellamaalla ja koko Suomessa.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              55 vuotta täyttäneiden laajennettu muutosturva
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Laajennettu muutosturva on 1.1.2023 alkaen voimassa oleva erillinen kokonaisuus, joka
              on tarkoitettu 55 vuotta täyttäneille vähintään 5 vuotta saman työnantajan
              palveluksessa olleille irtisanotuille. Se sisältää muutosturvarahan (noin kuukauden
              palkka), työllisyysalueen hankkiman muutosturvakoulutuksen (enintään 2 kk palkkaa
              vastaava arvo, kesto enintään 6 kk) ja laajennetun työllistymisvapaan (5, 15 tai
              25 päivää). Osallistujalle koulutus on maksuton ja vapaaehtoinen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              KeudaPRO:n rooli toteuttajana
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              KeudaPRO on julkinen ammatillinen kouluttaja, joka toteuttaa sekä yleistä
              muutosvalmennusta (työnantajan tilaamana) että 55 vuotta täyttäneiden laajennettua
              muutosturvakoulutusta (työllisyysalueen hankkimana) KUUMA-seudulla, Uudellamaalla ja
              muualla Suomessa. Rakennamme koulutussuunnitelman yhden yhteyshenkilön kautta ja
              hoidamme sekä sisällön (mm. alakohtaiset Tekoälyn ammattiosaaja -koulutukset) että
              raportoinnin työllisyysalueelle tai työnantajalle. Osallistuja tai työnantaja voi
              ehdottaa työllisyysalueelle KeudaPRO:ta koulutuksen toteuttajaksi; virallisen
              hankintapäätöksen tekee työllisyysalue.
            </p>
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
      <section className="keuda-section bg-keuda-orange text-foreground">
        <div className="keuda-container text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Aloitetaan yhdessä.
          </h2>
          <p className="text-foreground/80 text-lg mb-8">
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
              className="bg-transparent text-foreground border-foreground/40 hover:bg-foreground/10 hover:text-foreground"
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
              className="bg-transparent text-foreground border-foreground/40 hover:bg-foreground/10 hover:text-foreground"
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
      <EmployerMuutosturvaFormModal open={employerFormOpen} onOpenChange={setEmployerFormOpen} />
    </Layout>
  );
}
