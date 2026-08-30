// Plain-JS mirror of routes-meta.ts so .mjs scripts and the Vite plugin can
// import route metadata without needing a TS loader in the build container.
// Keep in sync with scripts/routes-meta.ts.

export const BASE_URL = "https://keudapro.fi";

export const routes = [
  {
    path: "/",
    title: "KeudaPRO – Osaamisen ja siirtymien operaattori",
    description:
      "Johtamiskoulutukset (ÄLY), työhönvalmennus (NOSTE) ja yritysten kasvuohjelmat (KASVU) KUUMA-seudulla – yksi reitti, kolme suuntaa.",
    changefreq: "weekly",
    priority: "1.0",
    h1: "KeudaPRO – Osaamisen ja siirtymien operaattori KUUMA-seudulla",
    intro:
      "KeudaPRO on KUUMA-seudun operaattori, joka yhdistää johtamiskoulutukset (ÄLY), työhönvalmennuksen (NOSTE) ja yritysten kasvuohjelmat (KASVU) yhden yhteyshenkilön kautta. Yksi reitti, kolme suuntaa – tekoäly, työllistyminen ja kasvu.",
  },
  {
    path: "/aly",
    title: "Tekoälypätevyydet | AI Coordinator, Manager & Director | KeudaPRO",
    description:
      "KeudaPROn AI Coordinator-, AI Manager- ja AI Director -koulutukset muodostavat työelämän tekoälyosaamisen polun käytännön hyödyntämisestä sen kehittämiseen ja johtamiseen.",
    changefreq: "weekly",
    priority: "0.9",
    h1: "Tekoälypätevyydet työelämään",
    intro:
      "KeudaPROn tekoälypätevyydet muodostavat porrastetun polun: AI Coordinator (tekoälykoordinaattori) keskittyy tekoälyn käytännön hyödyntämiseen ja soveltamiseen omassa työssä, AI Manager (tekoälypäällikkö) käyttöönoton ja kehittämisen johtamiseen ja AI Director tekoälyn strategiseen johtamiseen. Mallia voidaan hyödyntää myös koko organisaation tekoälyosaamisen rakentamiseen.",
  },
  {
    path: "/noste",
    title: "NOSTE – Työhönvalmennus ja muutosturva KUUMA-seudulla | KeudaPRO",
    description:
      "Työhönvalmennus, muutosturvakoulutukset ja uudelleenkouluttautumisen polut työttömille, työnhakijoille ja työpaikkaa vaihtaville KUUMA-seudulla.",
    changefreq: "weekly",
    priority: "0.9",
    h1: "NOSTE – Työhönvalmennus ja muutosturva KUUMA-seudulla",
    intro:
      "NOSTE tarjoaa työhönvalmennusta, muutosturvakoulutuksia ja uudelleenkouluttautumisen polkuja työttömille, työnhakijoille ja työpaikkaa vaihtaville. Autamme löytämään uuden suunnan tekoälyavusteisilla ammattikoulutuksilla KUUMA-seudulla.",
  },
  {
    path: "/kasvu",
    title: "KASVU – Yritysten kasvuohjelmat ja ELY-rahoitus | KeudaPRO",
    description:
      "Yritysten kasvuohjelmat, johtamisen kehittäminen ja ELY-rahoitteiset koulutukset. Neljä kasvutasoa pk-yrityksille KUUMA-seudulla.",
    changefreq: "weekly",
    priority: "0.9",
    h1: "KASVU – Yritysten kasvuohjelmat ja ELY-rahoitus",
    intro:
      "KASVU-palvelu tarjoaa pk-yrityksille neljä kasvutasoa, johtamisen kehittämistä ja ELY-rahoitteisia koulutuksia. Rakennamme kasvupolut liikevaihdon, henkilöstön ja markkinoiden mukaan KUUMA-seudulla.",
  },
  {
    path: "/muutosturva",
    title: "Muutosturvakoulutus | KeudaPRO",
    description:
      "Muutosturvakoulutukset KUUMA-seudulla: alakohtaiset Tekoälyn ammattiosaaja / AI-Coordinator -koulutukset työntekijöille ja työnantajille. Avaimet käteen -toteutus.",
    changefreq: "monthly",
    priority: "0.8",
    h1: "Muutosturvakoulutus – Tekoälyn ammattiosaaja",
    intro:
      "KeudaPROn muutosturvakoulutukset tarjoavat alakohtaiset Tekoälyn ammattiosaaja- ja AI-Coordinator-koulutukset työntekijöille ja työnantajille. Avaimet käteen -toteutus KUUMA-seudulla 50 eri alalle.",
  },
  {
    path: "/osaaminen",
    title: "Osaaminen ja pätevyydet | KeudaPRO",
    description:
      "Ammatilliset pätevyydet, kortit ja sertifikaatit työelämään – KUUMA-seudun ammattikoulutuksen täysi tarjonta.",
    changefreq: "monthly",
    priority: "0.8",
    h1: "Osaaminen ja pätevyydet työelämään",
    intro:
      "KeudaPROn kautta saat KUUMA-seudun ammattikoulutuksen täyden tarjonnan: ammatilliset pätevyydet, työturvallisuuskortit ja sertifikaatit yhden yhteyshenkilön kautta.",
  },
  {
    path: "/operaattori",
    title: "Operaattorimalli – Yksi yhteyshenkilö, koko verkosto | KeudaPRO",
    description:
      "KeudaPRO operoi osaamisen, työllistymisen ja yrittäjyyden palvelut yhden yhteyshenkilön kautta KUUMA-seudulla.",
    changefreq: "monthly",
    priority: "0.7",
    h1: "Operaattorimalli – Yksi yhteyshenkilö, koko verkosto",
    intro:
      "KeudaPROn operaattorimalli yhdistää osaamisen, työllistymisen ja yrittäjyyden palvelut yhden yhteyshenkilön kautta. Verkostomme kattaa KUUMA-seudun kunnat, oppilaitokset ja kehittämisyhtiöt.",
  },
  {
    path: "/kumppanit",
    title: "Kumppanit ja verkosto | KeudaPRO",
    description:
      "KeudaPRO-verkosto: kunnat, oppilaitokset, yritykset ja kehittämisyhtiöt KUUMA-seudulla yhteistyössä.",
    changefreq: "monthly",
    priority: "0.7",
    h1: "Kumppanit ja verkosto",
    intro:
      "KeudaPRO-verkosto kokoaa yhteen KUUMA-seudun kunnat, oppilaitokset, yritykset ja kehittämisyhtiöt. Yhteistyö varmistaa, että osaamisen ja siirtymien palvelut toimivat saumattomasti.",
  },
  {
    path: "/yhteystiedot",
    title: "Yhteystiedot | KeudaPRO",
    description:
      "Ota yhteyttä KeudaPROon – yksi yhteyshenkilö johdattaa oikeaan palveluun: ÄLY, NOSTE tai KASVU.",
    changefreq: "monthly",
    priority: "0.6",
    h1: "Yhteystiedot – Ota yhteyttä KeudaPROon",
    intro:
      "Ota yhteyttä KeudaPROon – yksi yhteyshenkilö johdattaa sinut oikeaan palveluun: ÄLY (johtaminen ja tekoäly), NOSTE (työhönvalmennus) tai KASVU (yritysten kasvuohjelmat).",
  },
];
