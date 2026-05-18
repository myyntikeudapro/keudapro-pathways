import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ArrowRight, ExternalLink, Zap, TrendingUp, Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AssessmentModal } from "@/components/growth/AssessmentModal";

import imgKaynistys from "@/assets/growth-kaynistys.jpg";
import imgSkaalaus from "@/assets/growth-skaalaus.jpg";
import imgUudistuminen from "@/assets/growth-uudistuminen.jpg";
import imgOsaaminen from "@/assets/growth-osaaminen.jpg";

type Category = {
  id: "kaynistys" | "skaalaus" | "kasvu-uudistuminen" | "osaaminen";
  icon: typeof Zap;
  title: string;
  desc: string;
  intro: string;
  mindset: string;
  image: string;
  modules: string[];
  ctaText: string;
  transition: string;
  hookLine: string;
};

const categories: Category[] = [
  {
    id: "kaynistys",
    icon: Zap,
    title: "Kasvu käyntiin",
    desc: "Käynnistys · 40 000 – 120 000 €/v",
    intro:
      "Myynti, asiakashankinta ja ensimmäinen skaalaus — rakenna kassavirta ja vakioasiakkuudet.",
    mindset: "Rohkeus myydä — asiakkaasta kassavirtaan",
    image: imgKaynistys,
    modules: [
      "Rakennat ensimmäisen toimivan myyntiputken ja vakioasiakkuudet",
      "Kirkkastat palvelusi ja hinnoittelet sen kannattavasti",
      "Saat näkyvyyttä oikeille asiakkaille ilman isoa markkinointibudjettia",
      "Kasvun sparraus 1:1 — et jää yksin päätösten kanssa",
    ],
    ctaText: "Aloita kasvukartoitus",
    transition:
      "Sinulla on toistuvaa kassavirtaa, vähintään muutama vakioasiakas ja tunnet tarpeesi palkata tai ulkoistaa.",
    hookLine: "Valmis aloittamaan? Katso myös yrittäjyyden mahdollisuudet.",
  },
  {
    id: "skaalaus",
    icon: TrendingUp,
    title: "Skaalaus ja systematisointi",
    desc: "Skaalaus · 120 000 – 600 000 €/v",
    intro:
      "Prosessit, tiimi ja myyntiputki kuntoon — rakenna johtamisrakenne ja vapaudu pullonkaulasta.",
    mindset: "Johtaja rakentaa — ei tee kaikkea itse",
    image: imgSkaalaus,
    modules: [
      "Vapautat itsesi operatiivisesta työstä rakentamalla toimivat prosessit",
      "Rakennat myyntiputken joka toimii ilman jatkuvaa huomiotasi",
      "Otat tekoälyn ja digitalisaation käyttöön siellä missä ne tuottavat eniten",
      "Rekrytoit ja sitoutat oikeat ihmiset kasvun vauhtiin",
    ],
    ctaText: "Aloita skaalauskartoitus",
    transition:
      "Liikevaihtosi kasvaa mutta olet itse pullonkaula — tarvitset johtamisrakenteen ja hallitustyön.",
    hookLine: "Onko tiimisi valmis seuraavaan tasoon? Kartoitetaan yhdessä.",
  },
  {
    id: "kasvu-uudistuminen",
    icon: Building2,
    title: "Teollistuminen ja uudistuminen",
    desc: "Kasvu ja uudistuminen · 600 000 – 1 200 000 €/v",
    intro:
      "Omistajan roolin muutos, hallitustyö ja kansainvälistyminen — yritys toimii ilman sinua.",
    mindset: "Omistaja johtaa — yritys toimii ilman sinua",
    image: imgUudistuminen,
    modules: [
      "Omistajanvaihdos tai sukupolvenvaihdos suunnitellaan ja toteutetaan hallitusti",
      "Yrityksen tieto ja osaaminen dokumentoidaan — ei jää yhden ihmisen varaan",
      "Liiketoiminta fokusoidaan uudelleen muuttuvan markkinan mukaan",
      "Kansainvälistyminen ja verkostot avaavat uudet kasvumarkkinat",
    ],
    ctaText: "Keskustele siirtymästä",
    transition:
      "Harkitset omistajanvaihdosta, kansainvälistymistä tai liiketoiminnan merkittävää muutosta.",
    hookLine: "Omistajan rooli muuttuu – oletko valmis? Keskustellaan siirtymästä.",
  },
  {
    id: "osaaminen",
    icon: GraduationCap,
    title: "Osaaminen käytäntöön",
    desc: "Osaamisen kehittäminen · Kaikki kokoluokat",
    intro:
      "Osaamisen kehittäminen on investointi joka näkyy suoraan tuloksessa — ei irrallinen koulutuspäivä vaan osa kasvustrategiaa.",
    mindset: "Osaaminen on kilpailuetu — ei kulu",
    image: imgOsaaminen,
    modules: [
      "Henkilöstön pätevyydet ja kortit ajan tasalle — turvallisuus, hygienia, toimialakohtaiset",
      "Kielikoulutukset monikulttuuriselle työpaikalle — suomi, englanti, ruotsi, selkoviestintä",
      "Johtamis- ja esihenkilövalmennus kasvavan tiimin tarpeisiin",
      "Tekoälyosaaminen käytäntöön — tiimi pysyy muutoksen vauhdissa",
    ],
    ctaText: "Kysy koulutuksista",
    transition: "Osaaminen on jatkuvaa — sopii kaikille vaiheille rinnakkaisesti.",
    hookLine: "Osaaminen on kilpailuetusi – rakennetaan se yhdessä.",
  },
];

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

const routeToLevel: Record<Category["id"], 1 | 2 | 3 | 4> = {
  "kaynistys": 1,
  "skaalaus": 2,
  "kasvu-uudistuminen": 3,
  "osaaminen": 4,
};

export function KasvuCategoryAccordion() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [modalLevel, setModalLevel] = useState<1 | 2 | 3 | 4 | null>(null);

  const toggle = (id: string) => setOpenCategory((prev) => (prev === id ? null : id));

  return (
    <section id="kasvupolut" className="py-16 md:py-20 bg-[#E4F0EE]">
      <div className="keuda-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse kasvureitti
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Valitse polku — näet siihen kuuluvat ratkaisut ja etenemismallin.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {categories.map((cat) => {
            const isActive = openCategory === cat.id;
            const isExpanded = isActive || openCategory === null;
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={cn(
                  "rounded-xl border overflow-hidden bg-card transition-all duration-300",
                  isActive ? "border-primary shadow-lg" : "border-border",
                  !isExpanded && "opacity-60"
                )}
              >
                <button
                  onClick={() => toggle(cat.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  aria-expanded={isActive}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-bold text-foreground">{cat.title}</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">
                      {cat.desc}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0",
                      isActive && "rotate-180"
                    )}
                  />
                </button>

                {isActive && (
                  <div className="animate-accordion-down">
                    <div className="relative h-[140px] overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        width={1024}
                        height={576}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25" />
                    </div>
                    <div className="p-5 md:p-6">
                      <p className="italic text-muted-foreground text-sm mb-4">{cat.intro}</p>

                      <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 mb-5">
                        {cat.mindset}
                      </span>

                      <div className="grid sm:grid-cols-2 gap-2 mb-5">
                        {cat.modules.map((mod) => (
                          <div
                            key={mod}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/60 text-foreground text-sm font-medium border border-border/50"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            {mod}
                          </div>
                        ))}
                      </div>

                      {cat.id === "osaaminen" && (
                        <Link
                          to="/osaaminen"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
                        >
                          Katso kaikki koulutukset ja pätevyydet
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}

                      <Accordion type="single" collapsible className="mb-3">
                        <AccordionItem value="transition" className="border-border/40">
                          <AccordionTrigger className="text-xs font-semibold text-muted-foreground text-left hover:no-underline py-2">
                            Milloin olet valmis seuraavalle tasolle?
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {cat.transition}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <p className="text-xs italic text-muted-foreground mb-4">
                        {cat.hookLine}
                      </p>

                      {cat.id === "kaynistys" && (
                        <p className="text-sm mb-4">
                          <Link to="/aly" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                            Tarvitsetko johtamisosaamista kasvun tueksi? Tutustu Äly-reittiin →
                          </Link>
                        </p>
                      )}

                      {cat.id === "skaalaus" && (
                        <p className="text-sm mb-4">
                          <Link to="/operaattori" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                            Rekrytoitko kansainvälisesti? Kysy kumppanuudesta →
                          </Link>
                        </p>
                      )}

                      {cat.id === "kasvu-uudistuminen" && (
                        <p className="text-sm mb-4">
                          <Link to="/aly" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                            Johdon ja hallituksen osaamisen kehittäminen? Tutustu Äly-reittiin →
                          </Link>
                        </p>
                      )}

                      {cat.id === "osaaminen" && (
                        <p className="text-sm mb-4">
                          <Link to="/aly" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                            Tarvitsetko johtamisohjelman kasvavan tiimisi tueksi? Tutustu Äly-reittiin →
                          </Link>
                        </p>
                      )}

                      <Button
                        variant="cta"
                        size="lg"
                        className="w-full"
                        onClick={() => setModalLevel(routeToLevel[cat.id])}
                      >
                        {cat.ctaText}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
