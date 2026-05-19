import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssessmentModal } from "@/components/growth/AssessmentModal";
import { GrowthCheckup } from "@/components/growth/GrowthCheckup";

import imgKaynistys from "@/assets/growth-kaynistys.jpg";
import imgSkaalaus from "@/assets/growth-skaalaus.jpg";
import imgUudistuminen from "@/assets/growth-uudistuminen.jpg";
import imgOsaaminen from "@/assets/growth-osaaminen.jpg";

/* ─── (poistettu) vanha taso-suodatin korvattu GrowthCheckup-komponentilla ─── */

/* ─── Route cards data ─── */
const routes = [
  {
    id: "kaynistys",
    image: imgKaynistys,
    title: "Kasvu käyntiin",
    subtitle: "Myynti, asiakashankinta ja ensimmäinen skaalaus",
    mindset: "Rohkeus myydä — asiakkaasta kassavirtaan",
    modules: [
      "Myynti ja asiakashankinta",
      "Markkinointi ja näkyvyys",
      "Palvelun kirkastus ja hinnoittelu",
      "Kasvun sparraus (1:1)",
    ],
    ctaText: "Aloita kasvukartoitus",
    transition: "Sinulla on toistuvaa kassavirtaa, vähintään muutama vakioasiakas ja tunnet tarpeesi palkata tai ulkoistaa.",
    hookLine: "Valmis aloittamaan? Katso myös yrittäjyyden mahdollisuudet. ↓",
  },
  {
    id: "skaalaus",
    image: imgSkaalaus,
    title: "Skaalaus ja systematisointi",
    subtitle: "Prosessit, tiimi ja myyntiputki kuntoon",
    mindset: "Johtaja rakentaa — ei tee kaikkea itse",
    modules: [
      "Myyntiputki ja asiakaspolku",
      "Tekoäly ja digitalisaatio arjessa",
      "Prosessit ja tuottavuus",
      "Henkilöstön sitouttaminen ja rekrytointi",
    ],
    ctaText: "Aloita skaalauskartoitus",
    transition: "Liikevaihtosi kasvaa mutta olet itse pullonkaula — tarvitset johtamisrakenteen ja hallitustyön.",
    hookLine: "Onko tiimisi valmis seuraavaan tasoon? Kartoitetaan yhdessä. ↓",
  },
  {
    id: "kasvu-uudistuminen",
    image: imgUudistuminen,
    title: "Teollistuminen ja uudistuminen",
    subtitle: "Omistajan roolin muutos, hallitustyö ja kansainvälistyminen",
    mindset: "Omistaja johtaa — yritys toimii ilman sinua",
    modules: [
      "Omistajanvaihdos ja siirtymät",
      "Hiljaisen tiedon siirto ja dokumentointi",
      "Liiketoiminnan uudelleenfokusointi",
      "Verkostot, TKI ja kansainvälistyminen",
    ],
    ctaText: "Keskustele siirtymästä",
    transition: "Harkitset omistajanvaihdosta, kansainvälistymistä tai liiketoiminnan merkittävää muutosta.",
    hookLine: "Omistajan rooli muuttuu – oletko valmis? Keskustellaan siirtymästä. ↓",
  },
  {
    id: "osaaminen",
    image: imgOsaaminen,
    title: "Osaaminen käytäntöön",
    subtitle: "Koulutukset, kortit ja pätevyydet yrityksille ja henkilöstölle",
    mindset: "Osaaminen on kilpailuetu — ei kulu",
    modules: [
      "Kortit ja pätevyydet (EA, hygieniapassi, työturvallisuus jne.)",
      "Kieli ja viestintä (suomi, englanti, ruotsi)",
      "Toimialakohtaiset koulutukset",
      "Henkilöstön kehittämisohjelmat",
    ],
    ctaText: "Kysy koulutuksista",
    transition: "Osaaminen on jatkuvaa — sopii kaikille vaiheille rinnakkaisesti.",
    hookLine: "Osaaminen on kilpailuetusi – rakennetaan se yhdessä. ↓",
  },
];

/* ─── Training categories for the "Osaaminen" card accordion ─── */
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

/* ─── Training accordion sub-component (for card 4) ─── */
function TrainingAccordion() {
  return (
    <Accordion type="single" collapsible className="mb-4">
      {trainingCategories.map((cat) => (
        <AccordionItem key={cat.id} value={cat.id} className="border-border/50">
          <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-2.5">
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
  );
}

/* ─── Route ID to modal level mapping ─── */
const routeToLevel: Record<string, 1 | 2 | 3 | 4> = {
  "kaynistys": 1,
  "skaalaus": 2,
  "kasvu-uudistuminen": 3,
  "osaaminen": 4,
};

/* ─── Main component ─── */
export function GrowthRoutes() {
  const [modalLevel, setModalLevel] = useState<1 | 2 | 3 | 4 | null>(null);

  const handleLevelClick = (id: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`route-${id}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  };


  return (
    <section id="kasvureitit" className="py-16 md:py-20 bg-muted/30">
      <div className="keuda-container">

        {/* ── Älykäs tilannetsekkaus ── */}
        <GrowthCheckup onSelectRoute={handleLevelClick} />

        {/* Assessment Modal */}
        {modalLevel && (
          <AssessmentModal
            level={modalLevel}
            open={!!modalLevel}
            onOpenChange={(open) => { if (!open) setModalLevel(null); }}
          />
        )}
      </div>
    </section>
  );
}
