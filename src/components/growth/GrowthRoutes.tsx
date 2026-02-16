import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowRight, ExternalLink } from "lucide-react";

const routes = [
  {
    id: "kasvu-kayntiin",
    title: "Kasvu käyntiin",
    description: "Myynti, asiakashankinta ja kasvun perusta käytäntöön.",
    modules: [
      { label: "Myynti ja asiakashankinta", href: "#myynti" },
      { label: "Markkinointi ja asiakaskokemus", href: "#markkinointi" },
      { label: "Palvelun kirkastus ja konseptointi", href: "#konseptointi" },
      { label: "Kasvun sparraus ja pilotointi", href: "#sparraus" },
    ],
    ctaText: "Aloita kasvukartoitus",
    ctaHref: "#kasvukartoitus",
  },
  {
    id: "tehostus-digiloikka",
    title: "Tehostus ja digiloikka",
    description: "Tuottavuus, prosessit ja tekoäly käyttöön arjessa.",
    modules: [
      { label: "Tekoäly ja digitalisaatio", href: "#tekoaly" },
      { label: "Prosessit ja tuottavuus", href: "#prosessit" },
      { label: "Automaatio ja työkalut", href: "#automaatio" },
      { label: "Henkilöstön sitouttaminen", href: "#sitouttaminen" },
    ],
    ctaText: "Aloita AI-polku",
    ctaHref: "#ai-polku",
  },
  {
    id: "jatkuvuus-uudistuminen",
    title: "Jatkuvuus ja uudistuminen",
    description: "Omistajanvaihdos, murros ja uuden suunnan rakentaminen.",
    modules: [
      { label: "Omistajanvaihdos ja siirtymät", href: "#omistajanvaihdos" },
      { label: "Hiljaisen tiedon siirto", href: "#hiljainen-tieto" },
      { label: "Liiketoiminnan uudelleenfokusointi", href: "#uudelleenfokusointi" },
      { label: "Verkostot ja TKI-yhteistyö", href: "#verkostot" },
    ],
    ctaText: "Keskustele siirtymästä",
    ctaHref: "#siirtyma",
  },
];

/* ─── 4th block: tabbed training categories ─── */
const trainingCategories = [
  {
    id: "kortit",
    label: "Kortit ja pätevyydet",
    items: [
      { label: "Työturvallisuuskorttikoulutus", href: "https://www.keuda.fi/koulutus/tyoturvallisuuskortti-koulutus/" },
      { label: "Tulityökorttikoulutus", href: "https://www.keuda.fi/koulutus/tulityokortti-koulutus/" },
      { label: "Akkuturvallisuuskoulutus", href: "https://www.keuda.fi/koulutus/akkuturvallisuuskoulutus/" },
      { label: "Työhyvinvointikorttikoulutus", href: "https://www.keuda.fi/koulutus/tyohyvinvointikortti-koulutus/" },
      { label: "Hygieniapassi", href: "https://www.keuda.fi/koulutus/hygieniapassitestit-ja-koulutukset/" },
      { label: "Anniskelupassi", href: "https://www.keuda.fi/koulutus/anniskelupassikoulutukset-ja-testit/" },
      { label: "SPR Hätäensiapukurssi 4h", href: "https://www.keuda.fi/koulutus/spr-hataensiapukurssi-4-t/" },
      { label: "SPR Hätäensiapukurssi 8h", href: "https://www.keuda.fi/koulutus/spr-hataensiapukurssi-8-t/" },
      { label: "SPR Ensiapukurssi EA1", href: "https://www.keuda.fi/koulutus/spr-ensiapukurssi-ea-1/" },
      { label: "SPR Ensiapukurssi EA2", href: "https://www.keuda.fi/koulutus/spr-ensiapukurssi-ea-2/" },
    ],
  },
  {
    id: "kieli",
    label: "Kieli ja viestintä",
    items: [
      { label: "Suomi työkielenä -koulutukset", href: "https://www.keuda.fi/koulutus/suomi-tyokielena-koulutukset/" },
      { label: "Sote-suomi kielikoulutus", href: "https://www.keuda.fi/koulutus/sote-suomi-kielikoulutus/" },
      { label: "Työpaikkasuomi-koulutus", href: "https://www.keuda.fi/koulutukset/" },
      { label: "Englanti työkielenä -koulutus", href: "https://www.keuda.fi/koulutukset/" },
      { label: "Ruotsi työkielenä -koulutus", href: "https://www.keuda.fi/koulutukset/" },
    ],
  },
  {
    id: "toimiala",
    label: "Toimialakohtaiset koulutukset",
    items: [
      { label: "Viheralan koulutukset", href: "https://www.keuda.fi/koulutus/viheralan-koulutukset/" },
      { label: "Turvallinen kattotyöskentely", href: "https://www.keuda.fi/koulutukset/" },
      { label: "Ajoneuvoalan täydennyskoulutukset", href: "https://www.keuda.fi/koulutukset/" },
    ],
  },
];

function TrainingBlock() {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate("/yhteystiedot?prefill=" + encodeURIComponent("Kiinnostaa: Lyhytkoulutukset, kortit ja pätevyydet") + "#lomake");
  };

  return (
    <div className="keuda-card-enhanced flex flex-col h-full">
      <h3 className="text-xl font-bold text-foreground mb-2">
        Osaaminen käytäntöön
      </h3>
      <p className="text-muted-foreground text-sm mb-5">
        Lyhytkoulutukset, kortit ja pätevyydet ammattitaidon ja kasvun tueksi.
      </p>

      <Accordion type="single" collapsible className="flex-1 mb-6">
        {trainingCategories.map((cat) => (
          <AccordionItem key={cat.id} value={cat.id} className="border-border/50">
            <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-3">
              {cat.label}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 pt-1">
                {cat.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-accent text-foreground text-sm transition-colors group"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button variant="cta" size="lg" className="w-full" onClick={handleCtaClick}>
        Kysy koulutuksista
      </Button>
    </div>
  );
}

export function GrowthRoutes() {
  return (
    <section id="kasvureitit" className="py-16 md:py-20 bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse kasvureitti
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Valitse polku – näet suoraan sopivat ratkaisut ja etenemismallin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {routes.map((route) => (
            <div
              key={route.id}
              className="keuda-card-enhanced flex flex-col h-full"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                {route.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                {route.description}
              </p>

              <div className="flex flex-col gap-2 mb-6 flex-1">
                {route.modules.map((mod, idx) => (
                  <a
                    key={idx}
                    href={mod.href}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 hover:bg-accent text-foreground text-sm font-medium transition-colors border border-border/50 hover:border-primary/30 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {mod.label}
                  </a>
                ))}
              </div>

              <Button variant="cta" size="lg" asChild className="w-full">
                <a href={route.ctaHref}>{route.ctaText}</a>
              </Button>
            </div>
          ))}

          {/* 4th block: Osaaminen käytäntöön */}
          <TrainingBlock />
        </div>
      </div>
    </section>
  );
}
