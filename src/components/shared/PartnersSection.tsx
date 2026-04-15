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
  ctaText: string;
  ctaLink: string;
  ctaType: "link" | "mailto";
}

const partners: Partner[] = [
  {
    name: "Keuda",
    tagline: "Ammatillinen koulutus KUUMA-seudulla",
    hover: "Keski-Uudenmaan koulutuskuntayhtymä – ammatillista koulutusta ja osaamisen kehittämistä.",
    infoTitle: "Keuda – Keski-Uudenmaan koulutuskuntayhtymä",
    infoText: "Keuda on KUUMA-seudun ammatillinen oppilaitos ja KeudaPRO:n emoorganisaatio. Tarjoaa tutkintotavoitteista koulutusta, lyhytkoulutuksia ja osaamisen täsmäkehittämistä yrityksille ja yksilöille.",
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
    infoText: "RTK on erikoistunut henkilöstövuokraukseen ja rekrytointiin. Palvelee sekä työnhakijoita että yrityksiä monipuolisesti – teollisuudesta palvelualaan.",
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
    tagline: "Ura- ja muutosturvavalmennus",
    hover: "Suomalainen tulevaisuustalo – ura-, muutosturva- ja yksilövalmennuksia sekä tilauskoulutuksia.",
    infoTitle: "Cleodia Group – suomalainen tulevaisuustalo",
    infoText: "Cleodia tuottaa valmennus- ja konsultointipalveluja. Erikoistunut ura- ja muutosturvavalmennukseen sekä monipuolisiin yksilövalmennuksiin. Toimii osana Uudenmaan työhönvalmentajien ryhmittymää yhdessä KeudaPRO:n ja Valo-valmennuksen kanssa.",
    role: "Yrittäjyyden ja liiketoiminnan käynnistämisen tuki sekä muutosturvavalmennus.",
    ctaText: "Tutustu Cleodiaan →",
    ctaLink: "https://www.cleodia.fi",
    ctaType: "link",
  },
  {
    name: "Pohjamonni",
    tagline: "Verkostot ja mahdollisuudet",
    hover: "Verkostot ja alustat kevytyrittäjille ja toimeksiantojen tekijöille.",
    infoTitle: "Pohjamonni – verkostot ja mahdollisuudet",
    infoText: "Pohjamonni toimii KeudaPRO:n kumppanina erityisesti kevytyrittäjyyteen ja toimeksiantoihin liittyvissä poluissa. Auttaa rakentamaan verkostoja ja löytämään mahdollisuuksia.",
    role: "Verkostot ja väylät omaan polkuun – kevytyrittäjyys ja toimeksiannot.",
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
    role: "Työllistymisvalmennus ja tuki muutostilanteissa.",
    ctaText: "Tutustu Wulff PRO:hon →",
    ctaLink: "https://wulffpro.fi",
    ctaType: "link",
  },
  {
    name: "Linduistics",
    tagline: "Kielikoulutus työelämään",
    hover: "Räätälöity kielikoulutus suomi, ruotsi ja saksa – yrityksille ja yksilöille.",
    infoTitle: "Linduistics – asiantunteva kielikoulutus",
    infoText: "Linduistics tarjoaa laadukasta ja räätälöityä kielikoulutusta suomessa, ruotsissa ja saksassa sekä aloittelijoille että edistyneemmille oppijoille. Koulutukset toteutetaan yksilöille tai ryhmille – etänä tai lähiopetuksena.",
    role: "Kieli- ja viestintäosaaminen työelämään ja työnhakuun.",
    ctaText: "Tutustu Linduisticsiin →",
    ctaLink: "https://linduistics.fi",
    ctaType: "link",
  },
  {
    name: "GrowthMindsetBuilder",
    tagline: "AI-johtajuus ja transformaatio",
    hover: "Auttaa johtajia ja organisaatioita menestymään tekoälyn aikakaudella – Mindsets, Skillsets, Toolsets, Culture ja AI Twins.",
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
    infoText: "Tekoälykeskus kouluttaa, konsultoi ja puhuu uudesta ajattelusta joka luo uusia toimintatapoja. Ihminen tekoälyhyödyntämisen keskiössä – human-in-the-loop. Tarjoaa räätälöityä tekoälykonsultointia, osaamiskoulutuksia, workshoppeja ja keynote-puhujia yrityksille ja organisaatioille.",
    role: "Tekoälyosaamisen kouluttaja ÄLY-reitin AI-Manager ja AI-Coordinator -ohjelmissa yhteistyössä Keudan kanssa.",
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
    role: "Tekoälyosaamisen kouluttaja ÄLY-reitin ohjelmissa yhteistyössä Tekoälykeskuksen ja Keudan kanssa.",
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
    role: "Tekoälyosaamisen ja innovaatiosuojan asiantuntija ÄLY-reitin ohjelmissa yhteistyössä Tekoälykeskuksen kanssa.",
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
    <div
      ref={panelRef}
      className="col-span-full animate-accordion-down overflow-hidden"
    >
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
            Rooli NOSTE-reitillä:
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
          <a
            href={partner.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
          >
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

function PartnerGrid({ cols, className }: { cols: number; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Build rows with panels inserted after the correct row
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

    // After last card in each row, insert panel if open card is in this row
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
    <section className="py-16 md:py-20 bg-accent/30">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Asiantuntijaverkosto ja kumppanit
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ratkaisut toteutetaan yhteistyössä kokeneiden toimijoiden kanssa.
            Klikkaa organisaatiota ja tutustu.
          </p>
        </div>

        <PartnerGrid cols={4} />
        <PartnerGrid cols={2} />
        <PartnerGrid cols={1} />
      </div>
    </section>
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
        <TooltipContent
          side="top"
          className="max-w-[260px] text-center"
        >
          <p className="text-sm">{partner.hover}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
