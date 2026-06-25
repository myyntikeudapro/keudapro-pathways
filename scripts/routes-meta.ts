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
    path: "/",
    title: "KeudaPRO – Osaamisen ja siirtymien operaattori",
    description:
      "Johtamiskoulutukset (ÄLY), työhönvalmennus (NOSTE) ja yritysten kasvuohjelmat (KASVU) KUUMA-seudulla – yksi reitti, kolme suuntaa.",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/aly",
    title: "ÄLY – Johtamisen, asiantuntijuuden ja tekoälyn koulutukset | KeudaPRO",
    description:
      "Johtajille, esihenkilöille ja asiantuntijoille: johtamisen koulutukset, tekoälypätevyys-ohjelmat (AI-Director, AI-Manager, AI-Coordinator) ja turvallisuusjohtaminen.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/noste",
    title: "NOSTE – Työhönvalmennus ja muutosturva KUUMA-seudulla | KeudaPRO",
    description:
      "Työhönvalmennus, muutosturvakoulutukset ja uudelleenkouluttautumisen polut työttömille, työnhakijoille ja työpaikkaa vaihtaville KUUMA-seudulla.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/kasvu",
    title: "KASVU – Yritysten kasvuohjelmat ja ELY-rahoitus | KeudaPRO",
    description:
      "Yritysten kasvuohjelmat, johtamisen kehittäminen ja ELY-rahoitteiset koulutukset. Neljä kasvutasoa pk-yrityksille KUUMA-seudulla.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/muutosturva",
    title: "Muutosturvakoulutus | KeudaPRO",
    description:
      "Muutosturvakoulutukset KUUMA-seudulla: alakohtaiset Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset työntekijöille ja työnantajille. Avaimet käteen -toteutus.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/osaaminen",
    title: "Osaaminen ja pätevyydet | KeudaPRO",
    description:
      "Ammatilliset pätevyydet, kortit ja sertifikaatit työelämään – KUUMA-seudun ammattikoulutuksen täysi tarjonta.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/operaattori",
    title: "Operaattorimalli – Yksi yhteyshenkilö, koko verkosto | KeudaPRO",
    description:
      "KeudaPRO operoi osaamisen, työllistymisen ja yrittäjyyden palvelut yhden yhteyshenkilön kautta KUUMA-seudulla.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/kumppanit",
    title: "Kumppanit ja verkosto | KeudaPRO",
    description:
      "KeudaPRO-verkosto: kunnat, oppilaitokset, yritykset ja kehittämisyhtiöt KUUMA-seudulla yhteistyössä.",
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
