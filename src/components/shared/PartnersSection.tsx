import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface Partner {
  name: string;
  tagline: string;
  hover: string;
  infoTitle: string;
  infoText: string;
  role: string;
  roleLabel?: string;
  ctaText: string;
  ctaLink: string;
  ctaType: "link" | "mailto";
}

const partners: Partner[] = [
  {
    name: "Keuda",
    tagline: "Ammatillinen koulutus omalla talousalueella",
    hover: "Keski-Uudenmaan koulutuskuntayhtymä – ammatillista koulutusta ja osaamisen kehittämistä.",
    infoTitle: "Keuda – Keski-Uudenmaan koulutuskuntayhtymä",
    infoText: "Keuda on oman talousalueen ammatillinen oppilaitos ja KeudaPRO:n emoorganisaatio. Tarjoaa laajasti eri aloille tutkintotavoitteista koulutusta, lyhytkoulutuksia ja osaamisen täsmäkehittämistä yrityksille ja yksilöille.",
    role: "Koulutus ja osaamisen kehittäminen siirtymän tueksi.",
    ctaText: "Tutustu Keudaan →",
    ctaLink: "https://www.keuda.fi",
    ctaType: "link",
  },
  {
    name: "RTK Henkilöstöpalvelut",
    tagline: "Työllistymisväylät ja rekrytointi",
    hover: "Valtakunnallinen henkilöstöpalvelutalo – yhdistää työnhakijat ja työnantajat nopeasti.",
    infoTitle: "RTK Henkilöstöpalvelut – valtakunnallinen henkilöstöpalvelutalo",
    infoText: "RTK on erikoistunut niin valtakunnalliseen kuin kansainväliseen henkilöstövuokraukseen ja rekrytointiin. Palvelee sekä työnhakijoita että yrityksiä monipuolisesti – teollisuudesta palvelualaan.",
    role: "Työllistymisväylät ja henkilöstövuokrausratkaisut työnhakijoille.",
    ctaText: "Tutustu RTK:hon →",
    ctaLink: "https://rtkhenkilostopalvelu.fi",
    ctaType: "link",
  },
  {
    name: "Valo-Valmennusyhdistys",
    tagline: "Osaaminen, työllisyys ja hyvinvointi",
    hover: "Kolmannen sektorin toimija – yksilöllistä tukea ja ohjausta kohti työelämää.",
    infoTitle: "Valo-Valmennusyhdistys ry – ihmisen tukena elämän eri tilanteissa",
    infoText: "Valo työskentelee osaamisen, työllisyyden, hyvinvoinnin ja osallisuuden edistämiseksi. Tarjoaa työhönvalmennusta, uravalmennusta ja etsivää nuorisotyötä. Toimipisteitä yhdeksän maakunnan alueella.",
    role: "Yksilöllinen valmennus ja tuki työelämäsiirtymissä.",
    ctaText: "Tutustu Valoon →",
    ctaLink: "https://valo-valmennus.fi",
    ctaType: "link",
  },
  {
    name: "Cleodia Group",
    tagline: "Ura- ja työhönvalmennus",
    hover: "Suomalainen tulevaisuustalo – ura-, muutosturva- ja yksilövalmennuksia.",
    infoTitle: "Cleodia Group – suomalainen tulevaisuustalo",
    infoText: "Cleodia tuottaa valmennus- ja konsultointipalveluja. Erikoistunut monipuolisiin yksilö- ja ryhmävalmennuksiin. Toimii osana Uudenmaan työhönvalmentajien ryhmittymää yhdessä KeudaPRO:n ja Valo-valmennuksen kanssa.",
    role: "Yksilö- ja ryhmävalmennusten asiantuntija.",
    ctaText: "Tutustu Cleodiaan →",
    ctaLink: "https://www.cleodia.fi",
    ctaType: "link",
  },
  {
    name: "Pohjamonni",
    tagline: "Verkostot ja mahdollisuudet",
    hover: "Asiantuntijapalvelut työelämän kehittämiseen.",
    infoTitle: "Pohjamonni – verkostot ja mahdollisuudet",
    infoText: "Pohjamonni toimii KeudaPRO:n kumppanina erityisesti tekoälypohjaisissa työllisyyden kehittämisen palveluissa. Auttaa rakentamaan verkostoja ja löytämään uusia mahdollisuuksia niin valtakunnallisesti kuin kansainvälisesti.",
    role: "Verkostot ja väylät omaan polkuun – kansainvälistyvässä Suomessa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Wulff PRO",
    tagline: "Kohtaamisia jotka muuttavat elämäsi suunnan",
    hover: "Työllistymiseen tähtäävä valmennustalo – yksilöllistä tukea ja laaja työnantajaverkosto.",
    infoTitle: "Wulff PRO – työllistymiseen tähtäävät valmennukset",
    infoText: "Wulff PRO on työllistymiseen tähtääviin valmennuksiin erikoistunut yhtiö, osa Wulff-konsernia. Tarjoaa henkilöasiakkaille työnhakuvalmennusta ja tukea muutostilanteeseen sekä työnantajille muutosturva- ja uudelleensijoituspalveluja. Toimii valtakunnallisesti.",
    role: "Työllistymisen valmennus ja tuki muutostilanteissa.",
    ctaText: "Tutustu Wulff PRO:hon →",
    ctaLink: "https://wulffpro.fi",
    ctaType: "link",
  },
  {
    name: "Linduistics",
    tagline: "Kielikoulutus työelämään",
    hover: "Räätälöity kielikoulutus suomi, ruotsi ja saksa – yrityksille ja yksilöille.",
    infoTitle: "Linduistics – asiantunteva kielikoulutus",
    infoText: "Linduistics tarjoaa laadukasta ja räätälöityä kielikoulutusta aloittelijoille että edistyneemmille oppijoille. Koulutukset toteutetaan yksilöille tai ryhmille – etänä tai lähiopetuksena.",
    role: "Kieli- ja viestintäosaaminen työelämään ja työnhakuun.",
    ctaText: "Tutustu Linduisticsiin →",
    ctaLink: "https://linduistics.fi",
    ctaType: "link",
  },
  {
    name: "GrowthMindsetBuilder",
    tagline: "AI-johtajuus ja transformaatio",
    hover: "Auttaa johtajia ja organisaatioita menestymään tekoälyn aikakaudella.",
    infoTitle: "GrowthMindsetBuilder – AI Leadership & Transformation Partner",
    infoText: "GrowthMindsetBuilder auttaa johtajia ja organisaatioita kehittymään tekoälyn aikakaudella. Viiden pilarin viitekehys kattaa ajattelutavan muutoksen, osaamisen rakentamisen, tekoälytyökalujen hallinnan, kulttuurin kehittämisen ja digitaalisen AI Twin -kaksosen rakentamisen.",
    role: "Tekoälyjohtajuuden ja transformaation tuki ÄLY-reitin ohjelmissa.",
    ctaText: "Tutustu GrowthMindsetBuilderiin →",
    ctaLink: "https://www.growthmindsetbuilder.com",
    ctaType: "link",
  },
  {
    name: "Tekoälykeskus",
    tagline: "Suomi nousuun tekoälyn avulla",
    hover: "Tekoälykoulutuksia, konsultointia, workshoppeja ja puhujia – käytännönläheisesti ja vastuullisesti.",
    infoTitle: "Tekoälykeskus Oy – tekoälyn tehokäyttöön",
    infoText: "Tekoälykeskus kouluttaa, konsultoi ja puhuu uudesta ajattelusta, joka luo uusia toimintatapoja. Ihminen tekoälyhyödyntämisen keskiössä – human-in-the-loop. Tarjoaa räätälöityä tekoälykonsultointia, osaamiskoulutuksia, workshoppeja ja keynote-puhujia yrityksille ja organisaatioille.",
    role: "Tekoälyosaamisen kouluttaja ÄLY-reitin AI-ammattiosaaja-ohjelmissa.",
    ctaText: "Tutustu Tekoälykeskukseen →",
    ctaLink: "https://www.tekoalykeskus.fi",
    ctaType: "link",
  },
  {
    name: "Tekoälykonsultit",
    tagline: "Lähes kaikki pelisäännöt muuttuvat",
    hover: "Konsultointia ja koulutuksia tekoälystä ilman turhaa puhetta – keskitytään asiaan ja käytännön osaamiseen.",
    infoTitle: "Tekoälykonsultit – käytännönläheistä tekoälyosaamista",
    infoText: "Tekoälykonsultit tarjoaa konsultointia ja koulutuksia tekoälystä ilman turhaa puhetta. Erikoistunut tekoälysovelluksiin, tekoälyapureihin, tekoälyagentteihin ja uusiin tekoälyammatteihin. Koulutusohjelmat esihenkilöille, koordinaattoreille ja organisaatioille.",
    role: "Tekoälyosaamisen kouluttaja ÄLY-reitin ohjelmissa.",
    ctaText: "Tutustu Tekoälykonsultteihin →",
    ctaLink: "https://tekoalykonsultit.fi",
    ctaType: "link",
  },
  {
    name: "Berggren",
    tagline: "Immateriaalioikeus ja innovaatiosuoja",
    hover: "Pohjoismainen täyden palvelun IP-toimisto – patentit, tavaramerkit ja innovaatioiden suojaaminen.",
    infoTitle: "Berggren Oy – Full-Service Intellectual Property Law Firm",
    infoText: "Berggren on johtava pohjoismainen immateriaalioikeuden toimisto. Auttaa yrityksiä rakentamaan vahvempaa liiketoimintaa luomalla, hallinnoimalla, suojaamalla ja kaupallistamalla IP-omaisuutta. Toimistot Helsingissä, kuudessa kaupungissa Suomessa, Münchenissä ja Alicantessa.",
    role: "Immateriaalioikeusalan asiantuntijuus ÄLY-reitin ohjelmissa.",
    ctaText: "Tutustu Berggreniin →",
    ctaLink: "https://www.berggren.eu",
    ctaType: "link",
  },
  {
    name: "NeuralMux",
    tagline: "The Hyper Engineering Company",
    hover: "Muuttaa insinöörit, tiimit ja yritykset rakentamaan tuotantoohjelmistoja äärimmäisellä nopeudella – ihmisluovuus ja AI-orkestrointi yhdistettynä.",
    infoTitle: "NeuralMux – The Hyper Engineering Company",
    infoText: "NeuralMux muuttaa insinöörejä, tiimejä ja yrityksiä rakentamaan tuotantoohjelmistoja äärimmäisellä nopeudella yhdistämällä ihmisluovuuden ja AI-orkestroinnin. Tarjoaa yksilöille Hyper Engineer -polun, tiimeille AI-natiivit työnkulut ja yrityksille täyden Hyper Engineering -kyvykkyyden viikoittaisella ominaisuustoimittamisella.",
    role: "Hyper Engineering (FI) ja (EN) -koulutusohjelmien toteuttaja ÄLY-reitin Tekoälypätevyys-kokonaisuudessa.",
    ctaText: "Tutustu NeuralMuxiin →",
    ctaLink: "https://neuralmux.com",
    ctaType: "link",
  },
  {
    name: "Orla ohjaus- ja valmennuspalvelut",
    tagline: "Yksilöllistä tukea työllistymiseen",
    hover: "Työllistymiseen tähtäävää ohjaus- ja valmennuspalvelua – toimii työhönvalmentajana Uudenmaan alueella.",
    infoTitle: "Orla ohjaus- ja valmennuspalvelut",
    infoText: "Orla ohjaus- ja valmennuspalvelut tuottaa yksilöllistä ohjaus- ja valmennuspalvelua työllistymisen tueksi. Toimii KeudaPRO:n Uudenmaan työhönvalmennuspalvelun alihankkijana.",
    role: "Työhönvalmennus Uudenmaan alueella – työllistymisen yksilöllinen tuki.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "NüHR",
    tagline: "Ihmisläheistä valmennusta",
    hover: "Yksilöllistä valmennusta ja tukea – nuorten NUOTTI-valmennus ja työhönvalmennuspalvelut.",
    infoTitle: "NüHR – henkilöstöpalvelu ja valmennus",
    infoText: "NüHR tarjoaa yksilöllistä valmennusta ja tukea elämän eri tilanteissa. Erikoistunut nuorten NUOTTI-valmennukseen sekä työllistymistä tukeviin palveluihin. Ihminen kokonaisuutena – valmennus räätälöidään jokaisen omista lähtökohdista.",
    role: "Työhönvalmennus Uudenmaan alueella – työllistymisen yksilöllinen tuki.",
    ctaText: "Tutustu NüHR:iin →",
    ctaLink: "https://www.nuhr.fi",
    ctaType: "link",
  },
  {
    name: "Motivaatiotekijä",
    tagline: "Motivaatiosta voimaa työllistymiseen",
    hover: "Yksilöllistä ohjausta ja valmennusta – työllistymisen tuki Uudenmaan alueella.",
    infoTitle: "Motivaatiotekijä – valmennusta työllistymiseen",
    infoText: "Motivaatiotekijä tuottaa yksilöllistä ohjaus- ja valmennuspalvelua työllistymisen tueksi. Toimii KeudaPRO:n Uudenmaan työhönvalmennuspalvelun alihankkijana.",
    role: "Työhönvalmennus Uudenmaan alueella – työllistymisen yksilöllinen tuki.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Digitrainer",
    tagline: "Digitaalinen liiketoiminta ja markkinointi",
    hover: "Digitaalisen liiketoiminnan ja markkinoinnin valmennus- ja koulutusohjelma pk-yrityksille.",
    infoTitle: "Digitrainer – digitaalisen markkinoinnin valmennus",
    infoText: "Digitrainer on digitaalisen liiketoiminnan ja markkinoinnin valmennus- ja koulutusohjelma pk-yritysten markkinointihenkilöstölle ja päättäjille. Sisältää henkilökohtaisen valmennuksen ja räätälöidyn opintosuunnitelman.",
    role: "Digitaalisen osaamisen kehittäminen KeudaPRO:n ohjelmissa.",
    ctaText: "Tutustu Digitraineriin →",
    ctaLink: "https://digitrainer.fi",
    ctaType: "link",
  },
  {
    name: "Growth Resilience",
    tagline: "Kasvumyönteisyys ja jatkuva oppiminen",
    hover: "Johtamisen, yhteisöllisyyden ja kasvumyönteisen kulttuurin kehittämistä – myös GrowthMindsetBuilder ja AI-Twin.",
    infoTitle: "Growth Resilience Oy – oppimista, kasvua ja rohkeaa johtamista",
    infoText: "Growth Resilience Oy:n toiminnan ytimessä on intohimo johtamisen, yhteisöllisyyden ja kasvumyönteisen kulttuurin kehittämiseen. Mahdollistaa kasvun ja jatkuvan oppimisen kautta resilientin toimintakulttuurin kehittämisen. Toimii myös GrowthMindsetBuilder-alustan taustalla.",
    role: "Kasvumyönteisyyden ja johtamisen kehittäminen KeudaPRO:n ohjelmissa.",
    ctaText: "Tutustu Growth Resilienceen →",
    ctaLink: "https://growthresilience.com",
    ctaType: "link",
  },
  {
    name: "Haituva Innovations",
    tagline: "Innoduel – osallistamisalusta",
    hover: "Ohjelmisto- ja konsultointiyritys – Innoduel-osallistamisalusta päätöksenteon tueksi.",
    infoTitle: "Haituva Innovations Oy – Innoduel",
    infoText: "Haituva Innovations Oy kehittää Innoduel-osallistamisalustaa, joka tehostaa henkilöstön osallistamista ja nopeuttaa päätöksentekoa. ATK- ja ohjelmistokonsultointia Vantaalta.",
    role: "Digitaaliset osallistamisratkaisut KeudaPRO:n ohjelmissa.",
    ctaText: "Tutustu Innodueliin →",
    ctaLink: "https://innoduel.com",
    ctaType: "link",
  },
  {
    name: "Into Factory",
    tagline: "Innovaatiot ja kehittäminen",
    hover: "Kirkkonummella toimiva kehittämis- ja konsultointipalvelu.",
    infoTitle: "Into Factory Oy – kehittämistä käytännössä",
    infoText: "Into Factory Oy toimii KeudaPRO:n kumppanina Uudenmaan alueella. Kirkkonummilainen yritys joka tukee osaamisen ja toiminnan kehittämistä.",
    role: "Kumppani KeudaPRO:n Uudenmaan palveluissa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Kotisi Energia Nordic",
    tagline: "Energia ja kestävä kehitys",
    hover: "Oululainen energia-alan toimija KeudaPRO:n asiantuntijaverkostossa.",
    infoTitle: "Kotisi Energia Nordic Oy",
    infoText: "Kotisi Energia Nordic Oy on energia-alan yritys joka toimii KeudaPRO:n asiantuntijaverkostossa. Kotipaikka Oulu.",
    role: "Energia-alan asiantuntijuus KeudaPRO:n verkostossa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Patera",
    tagline: "Valmennusta ja kehittämistä",
    hover: "Vaajakoskelainen valmennus- ja konsultointiyritys KeudaPRO:n verkostossa.",
    infoTitle: "Patera Oy – valmennus ja kehittäminen",
    infoText: "Patera Oy toimii KeudaPRO:n kumppanina turvallisuuden valmennusohjelmissa. Kotipaikka Vaajakoski.",
    role: "Valmennuspalvelut KeudaPRO:n turvallisuuden ohjelmissa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Saatellen",
    tagline: "Saatellen eteenpäin",
    hover: "Keravalainen valmennus- ja ohjauspalvelu KeudaPRO:n verkostossa.",
    infoTitle: "Saatellen Oy – ohjausta ja tukea",
    infoText: "Saatellen Oy toimii KeudaPRO:n kumppanina Keravan alueella tarjoten ohjaus- ja valmennuspalveluja työllistymisen tueksi.",
    role: "Ohjaus- ja valmennuspalvelut Uudenmaan alueella.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Staffroom",
    tagline: "Henkilöstö ja valmennus",
    hover: "Hyvinkääläinen henkilöstöpalvelu- ja valmennusyritys.",
    infoTitle: "Staffroom Oy – henkilöstöpalvelut",
    infoText: "Staffroom Oy tarjoaa henkilöstö- ja valmennuspalveluja KeudaPRO:n kumppanina.",
    role: "Henkilöstöpalvelut ja valmennus Uudenmaan alueella.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Suomen Turvavalmennus",
    tagline: "Turvallisuusosaaminen",
    hover: "Tuusulalainen turvallisuuskoulutuksen asiantuntija.",
    infoTitle: "Suomen Turvavalmennus – turvallisuuskoulutus",
    infoText: "Suomen Turvavalmennus tarjoaa turvallisuusalan koulutusta ja valmennusta. Toimii KeudaPRO:n asiantuntijaverkostossa Tuusulan alueella.",
    role: "Turvallisuusosaamisen koulutus KeudaPRO:n ohjelmissa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "White Ventures",
    tagline: "Yrittäjyys ja kasvu",
    hover: "Vantaalainen yrittäjyyden ja kasvun asiantuntija KeudaPRO:n verkostossa.",
    infoTitle: "White Ventures Oy – yrittäjyyden tuki",
    infoText: "White Ventures Oy toimii KeudaPRO:n kumppanina yrittäjyyden ja kasvun kehittämisessä Vantaan alueella.",
    role: "Yrittäjyyden ja kasvun tuki KeudaPRO:n ohjelmissa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
  {
    name: "Viabest",
    tagline: "Osaaminen ja kehittyminen",
    hover: "Riihimäkeläinen valmennus- ja kehittämispalvelu KeudaPRO:n verkostossa.",
    infoTitle: "Viabest Oy – valmennus ja kehittäminen",
    infoText: "Viabest Oy toimii KeudaPRO:n kumppanina valmennus- ja kehittämispalveluissa.",
    role: "Lähiesihenkilö- ja työnjohdon valmennus- ja kehittämispalvelut KeudaPRO:n ohjelmissa.",
    ctaText: "Ota yhteyttä →",
    ctaLink: "mailto:keudapro@keuda.fi",
    ctaType: "mailto",
  },
];

function PartnerInfoPanel({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={panelRef} className="col-span-full animate-accordion-down overflow-hidden">
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 border-l-4 border-l-primary relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Sulje"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 pr-8">
          {partner.infoTitle}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {partner.infoText}
        </p>

        <div className="bg-accent/50 rounded-lg p-4 mb-5">
          <p className="text-xs font-semibold text-foreground mb-1">
            Rooli KeudaPRO:ssa:
          </p>
          <p className="text-sm text-muted-foreground">{partner.role}</p>
        </div>

        {partner.ctaType === "mailto" ? (
          <a href={partner.ctaLink}>
            <Button variant="cta" size="sm" className="gap-2">
              <Mail className="w-4 h-4" />
              {partner.ctaText}
            </Button>
          </a>
        ) : (
          <a href={partner.ctaLink} target="_blank" rel="noopener noreferrer">
            <Button variant="cta" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              {partner.ctaText}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function PartnerCard({
  partner,
  isActive,
  onClick,
}: {
  partner: Partner;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex flex-col items-center justify-center p-5 md:p-6 text-center min-h-[120px] rounded-xl border bg-card transition-all duration-250 cursor-pointer w-full",
              isActive
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/50 hover:shadow-sm"
            )}
          >
            <p className="text-sm md:text-base font-bold text-foreground mb-1">
              {partner.name}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">
              {partner.tagline}
            </p>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-center">
          <p className="text-sm">{partner.hover}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PartnerGrid({ cols }: { cols: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const elements: React.ReactNode[] = [];
  for (let i = 0; i < partners.length; i++) {
    elements.push(
      <PartnerCard
        key={partners[i].name}
        partner={partners[i]}
        isActive={openIndex === i}
        onClick={() => handleCardClick(i)}
      />
    );

    const isEndOfRow = (i + 1) % cols === 0 || i === partners.length - 1;
    if (isEndOfRow && openIndex !== null) {
      const rowStart = Math.floor(i / cols) * cols;
      const rowEnd = Math.min(rowStart + cols - 1, partners.length - 1);
      if (openIndex >= rowStart && openIndex <= rowEnd) {
        elements.push(
          <PartnerInfoPanel
            key={`panel-${openIndex}`}
            partner={partners[openIndex]}
            onClose={() => setOpenIndex(null)}
          />
        );
      }
    }
  }

  const gridClass =
    cols === 4
      ? "hidden lg:grid grid-cols-4 gap-4 md:gap-6"
      : cols === 2
        ? "hidden sm:grid lg:hidden grid-cols-2 gap-4"
        : "grid sm:hidden grid-cols-1 gap-4";

  return <div className={gridClass}>{elements}</div>;
}

export function PartnersSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/40">
      <div className="keuda-container">
        {/* Sub-heading */}
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Tutustu verkostoomme
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ratkaisut toteutetaan yhteistyössä kokeneiden toimijoiden kanssa.
            Klikkaa organisaatiota ja tutustu.
          </p>
        </div>

        <PartnerGrid cols={4} />
        <PartnerGrid cols={2} />
        <PartnerGrid cols={1} />

        {/* DataFisher mention */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Digitaalinen oppimisalusta: Keuda Learn -alustan asiantuntijaorganisaationa toimii DataFisher Oy.
        </p>
      </div>
    </section>
  );
}
