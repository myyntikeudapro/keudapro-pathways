import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWizard } from "@/contexts/WizardContext";
import { Info, Sparkles, Briefcase, Rocket, Home, GraduationCap, Landmark } from "lucide-react";
import industriesBg from "@/assets/growth-industries-bg.jpg";

type Industry = {
  id: string;
  label: string;
  tooltip?: string;
  description: string;
  stats: { label: string; value: string }[];
};

type Tier = {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  items: Industry[];
};

const tiers: Tier[] = [
  {
    id: "ydinmoottorit",
    label: "Ydinmoottorit",
    subtitle: "Kasvun kärki",
    accent: "#4FA3E8",
    items: [
      {
        id: "logistiikka",
        label: "Logistiikka",
        description:
          "KUUMA-alue on Suomen logistiikan ydin – E75-käytävä, Vuosaaren satama ja Helsinki-Vantaa luovat ainutlaatuisen sijainnin. Toimiala kasvaa automaation ja vihreän siirtymän vauhdissa.",
        stats: [
          { label: "Yrityksiä KUUMA-alueella", value: "1 700+" },
          { label: "Avoimet työpaikat / kk", value: "350+" },
        ],
      },
      {
        id: "energia",
        label: "Energia & vihreä siirtymä",
        description:
          "Vihreä siirtymä luo täysin uusia ammatteja ja liiketoimintamalleja. KUUMA-kunnat investoivat puhtaaseen energiaan ja kiertotalouteen ennätystahtia.",
        stats: [
          { label: "Investointiputki 2025–2030", value: "1.2 mrd €" },
          { label: "Uusia työpaikkoja", value: "2 000+" },
        ],
      },
      {
        id: "teollisuus",
        label: "Moderni teollisuus",
        description:
          "Automaatio, robotiikka ja teollinen tekoäly muuttavat tuotannon. KUUMA-alueen teollisuus uudistuu ja tarvitsee uutta osaamista joka tasolla.",
        stats: [
          { label: "Teollisuuden yrityksiä", value: "900+" },
          { label: "Osaajatarve 2030 mennessä", value: "+3 500" },
        ],
      },
      {
        id: "koulutus",
        label: "Koulutus & osaaminen",
        tooltip: "Keudan ydintehtävä — alueen kriittisin kilpailutekijä 2030",
        description:
          "Osaaminen on KUUMA-alueen kriittisin kilpailutekijä 2030. Keuda toimii alueen osaamisveturina ja yhdistää oppilaitokset, yritykset ja kunnat saman pöydän ääreen.",
        stats: [
          { label: "Opiskelijoita Keudassa", value: "10 000+" },
          { label: "Yrityskumppaneita", value: "2 500+" },
        ],
      },
    ],
  },
  {
    id: "mahdollistajat",
    label: "Kasvun mahdollistajat",
    subtitle: "Rakenteellinen voima",
    accent: "#4ED9A4",
    items: [
      {
        id: "rakentaminen",
        label: "Rakentaminen & MAL-investoinnit",
        tooltip: "MAL-rahoitus prioriteetti 9.6/10 KUUMA-kunnissa",
        description:
          "MAL-sopimukset ohjaavat KUUMA-alueen asunto-, maankäyttö- ja liikenneinvestoinnit. Rakentaminen on yksi alueen suurimmista työllistäjistä ja kasvun mahdollistajista.",
        stats: [
          { label: "MAL-prioriteetti", value: "9.6 / 10" },
          { label: "Investoinnit 2025–2031", value: "2.4 mrd €" },
        ],
      },
      {
        id: "ict",
        label: "ICT & digipalvelut",
        description:
          "Digitalisaatio ja tekoäly ovat kaikkien toimialojen kasvun selkäranka. KUUMA-alueen ICT-yritykset palvelevat sekä paikallista että pääkaupunkiseudun markkinaa.",
        stats: [
          { label: "ICT-yrityksiä", value: "600+" },
          { label: "Osaajapulan koko", value: "+1 200" },
        ],
      },
      {
        id: "kv-rekry",
        label: "Kansainvälinen rekrytointi & kotouttaminen",
        tooltip:
          "Osaajapula ja kotouttamisaste suoraan kytköksissä kuntien sakkomaksuihin — KeudaPRO:n strateginen etulyöntiasema",
        description:
          "Osaajapula ratkaistaan vain kansainvälisellä rekrytoinnilla ja toimivalla kotouttamisella. KeudaPRO:lla on strateginen etulyöntiasema kuntien kotouttamistyössä.",
        stats: [
          { label: "KV-rekrytarve / vuosi", value: "1 500+" },
          { label: "Kotouttamisaste-tavoite", value: "85 %" },
        ],
      },
      {
        id: "hyvinvointi",
        label: "Hyvinvointi & lapsipalvelut",
        tooltip:
          "KUUMA-kuntien strategioissa lapset ja nuoret 7.9/10 — vetovoimatekijä, ei vain peruspalvelu",
        description:
          "Lapset ja nuoret ovat KUUMA-kuntien strategioiden ytimessä. Hyvinvointipalvelut ovat alueen vetovoimatekijä – eivät vain peruspalvelu vaan kasvun mahdollistaja.",
        stats: [
          { label: "Strateginen painoarvo", value: "7.9 / 10" },
          { label: "Hyvinvointialan työpaikat", value: "8 500+" },
        ],
      },
    ],
  },
  {
    id: "perusrakenne",
    label: "Perusrakenne",
    subtitle: "Vakaa pohja",
    accent: "#F0B45C",
    items: [
      {
        id: "kauppa",
        label: "Kauppa & palvelut",
        description:
          "Kauppa ja palvelut työllistävät laajasti ja muodostavat alueen arjen perustan. Verkkokauppa ja palvelumuotoilu muuttavat kenttää nopeasti.",
        stats: [
          { label: "Yrityksiä KUUMA-alueella", value: "3 200+" },
          { label: "Työllistää", value: "12 000+" },
        ],
      },
      {
        id: "ruoka",
        label: "Ruoka-ala",
        description:
          "Lähiruoka, ravintolat ja elintarviketeollisuus luovat alueelle sekä työpaikkoja että identiteettiä. Ruoka-alalla on iso uudistumistarve ja -mahdollisuus.",
        stats: [
          { label: "Ruoka-alan yrityksiä", value: "450+" },
          { label: "Kasvuvauhti", value: "+4 % / v" },
        ],
      },
    ],
  },
];

type Persona = {
  id: string;
  label: string;
  icon: typeof Briefcase;
  headline: string;
  body: string;
  cta: string;
};

const personas: Persona[] = [
  {
    id: "yrittaja",
    label: "Yrittäjä alueelle muuttamassa",
    icon: Briefcase,
    headline: "Tervetuloa KUUMA-alueelle yrittäjänä",
    body: "Saat suoran kontaktin kuntien elinkeinopalveluihin, toimitilakumppaneihin ja Keudan kasvuvalmennukseen. Reittikartoituksessa tunnistamme tilanteesi ja sopivimmat ensiaskeleet.",
    cta: "Aloita kasvukartoitus",
  },
  {
    id: "perustaja",
    label: "Uuden yrityksen perustaja",
    icon: Rocket,
    headline: "Käynnistä yritys oikealta polulta",
    body: "Käynnistys-reitti tukee liikeidean kirkastusta, ensimmäisiä asiakkuuksia ja rahoituksen hakemista. Saat sparrausta ja konkreettiset työkalut ensimmäiseen vuoteen.",
    cta: "Katso käynnistyspolku",
  },
  {
    id: "perhe",
    label: "Perhe / muuttamista harkitseva",
    icon: Home,
    headline: "Hyvä elämä KUUMA-alueella",
    body: "Lapsipalvelut, koulut, harrastukset ja työmahdollisuudet yhdellä alueella. Ohjaamme oikean kunnan elinkeino- ja perhepalveluihin sekä mahdollisiin työnantajiin.",
    cta: "Ota yhteyttä",
  },
  {
    id: "osaaja",
    label: "Osaaja tai työnhakija",
    icon: GraduationCap,
    headline: "Löydä paikkasi alueen kasvualoilla",
    body: "KUUMA-alueella avautuu tuhansia paikkoja logistiikassa, teollisuudessa, hyvinvointialalla ja ICT:ssä. Keuda kouluttaa, täydentää osaamista ja yhdistää työnantajiin.",
    cta: "Tutustu koulutuspolkuihin",
  },
  {
    id: "paattaja",
    label: "Kunnan tai alueen päättäjä",
    icon: Landmark,
    headline: "Edistä KUUMA-alueen sektoria päättäjänä",
    body: "Saat alueen elinkeino-, MAL- ja osaamisdatan päätöksenteon tueksi sekä suoran yhteyden KeudaPRO:n strategiseen tiimiin. Yhdistämme kuntien tavoitteet alueen yrityksiin.",
    cta: "Varaa keskustelu",
  },
];

export function GrowthIndustries() {
  const [selected, setSelected] = useState<Industry | null>(null);
  const [selected, setSelected] = useState<Industry | null>(null);
  const [persona, setPersona] = useState<string>("yrittaja");
  const activePersona = personas.find((p) => p.id === persona) ?? personas[0];

  return (
    <TooltipProvider delayDuration={150}>
      <section
        id="toimialakartta"
        className="keuda-section relative overflow-hidden"
      >
        {/* Dark background with image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={industriesBg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0B1220]/85" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(26,95,158,0.25), transparent 60%)",
            }}
          />
        </div>

        <div className="keuda-container relative">
          {/* Section header */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4FA3E8] mb-3">
              Kasvun kartta
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
              KUUMA-alueen kasvualat
            </h2>
            <p className="text-white/75 text-base md:text-lg max-w-2xl mx-auto">
              Kasvu ei jakaudu tasaisesti – kohdistamme kehittämisen toimialoihin,
              joissa murros ja potentiaali ovat suurimmat.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-white/85 mt-5">
              <Sparkles className="w-3.5 h-3.5 text-[#4FA3E8]" />
              Tulossa syksyllä 2026: KUUMA-alueen Dashboard 1.0
            </div>
          </div>

          {/* Three tier cards */}
          <div className="grid gap-5 md:gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-xl bg-white p-6 md:p-7 flex flex-col shadow-lg min-w-0"
              >
                {/* Tier header */}
                <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-2"
                    style={{ backgroundColor: tier.accent }}
                    aria-hidden="true"
                  />
                  <div className="text-left min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
                      {tier.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier.subtitle}
                    </p>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-col gap-2">
                  {tier.items.map((item) => {
                    const chip = (
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="group w-full inline-flex items-center justify-between gap-2 rounded-lg bg-background hover:bg-accent text-foreground px-4 py-3 text-sm font-medium border border-border transition-all duration-200 hover:border-primary/40 hover:shadow-sm text-left min-w-0"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.tooltip && (
                            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                        </span>
                        <span
                          className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    );
                    return item.tooltip ? (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>{chip}</TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-center">
                          {item.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div key={item.id}>{chip}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Persona selector */}
          <div className="max-w-5xl mx-auto mt-12 md:mt-16">
            <div className="text-center mb-6">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#4FA3E8] mb-2">
                Kuka olet?
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Räätälöity polku tilanteeseesi
              </h3>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {personas.map((p) => {
                const Icon = p.icon;
                const isActive = p.id === persona;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-medium border transition-all ${
                      isActive
                        ? "bg-white text-foreground border-white shadow-md"
                        : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              key={activePersona.id}
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 md:p-8 text-center animate-in fade-in duration-300"
            >
              <h4 className="text-lg md:text-xl font-bold text-white mb-2">
                {activePersona.headline}
              </h4>
              <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-5 leading-relaxed">
                {activePersona.body}
              </p>
              <Button variant="cta" size="lg" asChild>
                <a
                  href="#alykas-tilannekatsaus"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("alykas-tilannekatsaus");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", "#alykas-tilannekatsaus");
                    }
                  }}
                >
                  Avaa Älykäs tilannekatsaus →
                </a>
              </Button>

            </div>
          </div>
        </div>

        <Sheet
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md overflow-y-auto"
          >
            {selected && (
              <>
                <SheetHeader className="text-left">
                  <SheetTitle className="text-2xl">{selected.label}</SheetTitle>
                  <SheetDescription className="text-base leading-relaxed">
                    {selected.description}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {selected.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg border border-border bg-muted/40 p-4"
                    >
                      <div className="text-lg font-bold text-foreground">
                        {s.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </section>
    </TooltipProvider>
  );
}
