// Shared route metadata for sitemap generation and meta-prerender.
// Keep this in sync with <SEO> calls in src/pages/*.

export const BASE_URL = "https://keudapro.fi";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const routes: RouteMeta[] = [
  {
    path: "/koulutukset/aseptiikka-hoitotyossa",
    title: "Aseptiikka hoitotyössä – etäkoulutus | KeudaPRO",
    description: "Kahden tunnin Teams-koulutus hoiva- ja hoitohenkilöstölle. Yhteinen aseptinen osaaminen koko organisaatiolle ilman osallistujarajaa.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/tyohonvalmennus-pks",
    title: "Työnhakijan yksilövalmennus | KeudaPRO",
    description: "Maksuton työnhakijan yksilövalmennus Helsingin, Espoon ja Vantaan työllisyyspalveluiden asiakkaille. Tukea työnhakuun 1–9 kuukaudeksi oman asiantuntijan ohjauksella.",
    changefreq: "monthly",
    priority: "0.8",
  },
  { path: "/tyohonvalmennus-pks/en", title: "Individual coaching for jobseekers | KeudaPRO", description: "Free individual coaching for clients of the employment services in Helsinki, Espoo and Vantaa. Support for job searching for 1–9 months through a referral from your own specialist.", changefreq: "monthly", priority: "0.8" },
  { path: "/tyohonvalmennus-pks/sv", title: "Individuell coachning för arbetssökande | KeudaPRO", description: "Kostnadsfri individuell coachning för kunder hos sysselsättningstjänsterna i Helsingfors, Esbo och Vanda. Stöd i arbetssökandet i 1–9 månader genom hänvisning av din egen sakkunniga.", changefreq: "monthly", priority: "0.8" },
  {
    path: "/",
    title: "KeudaPRO – Osaamisen ja siirtymien operaattori",
    description:
      "Johtamiskoulutukset (ÄLY), työhönvalmennus (NOSTE) ja yritysten kasvuohjelmat (KASVU) koko Suomessa – yksi reitti, kolme suuntaa.",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/aly",
    title: "Tekoälypätevyydet | AI Coordinator, Manager & Director | KeudaPRO",
    description:
      "KeudaPROn AI Coordinator-, AI Manager- ja AI Director -koulutukset muodostavat työelämän tekoälyosaamisen polun käytännön hyödyntämisestä sen kehittämiseen ja johtamiseen.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/noste",
    title: "NOSTE – Työhönvalmennus ja muutosturva koko Suomessa | KeudaPRO",
    description:
      "Työhönvalmennus, muutosturvakoulutukset ja uudelleenkouluttautumisen polut työttömille, työnhakijoille ja työpaikkaa vaihtaville koko Suomessa.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/kasvu",
    title: "KASVU – Yritysten kasvuohjelmat ja ELY-rahoitus | KeudaPRO",
    description:
      "Yritysten kasvuohjelmat, johtamisen kehittäminen ja ELY-rahoitteiset koulutukset. Neljä kasvutasoa pk-yrityksille koko Suomessa.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/muutosturva",
    title: "Muutosturvakoulutus | KeudaPRO",
    description:
      "Muutosturvakoulutukset koko Suomessa: alakohtaiset Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset työntekijöille ja työnantajille. Avaimet käteen -toteutus.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/osaaminen",
    title: "Osaaminen ja pätevyydet | KeudaPRO",
    description:
      "Ammatilliset pätevyydet, kortit ja sertifikaatit työelämään – Keudan ammattikoulutuksen täysi tarjonta.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/operaattori",
    title: "Operaattorimalli – Yksi yhteyshenkilö, koko verkosto | KeudaPRO",
    description:
      "KeudaPRO operoi osaamisen, työllistymisen ja yrittäjyyden palvelut yhden yhteyshenkilön kautta koko Suomessa.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/kumppanit",
    title: "Kumppanit ja verkosto | KeudaPRO",
    description:
      "KeudaPRO-verkosto: kunnat, oppilaitokset, yritykset ja kehittämisyhtiöt koko Suomessa yhteistyössä.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/yhteystiedot",
    title: "Yhteystiedot | KeudaPRO",
    description:
      "Ota yhteyttä KeudaPROon – yksi yhteyshenkilö johdattaa oikeaan palveluun: ÄLY, NOSTE tai KASVU.",
    changefreq: "monthly",
    priority: "0.6",
  },
];
