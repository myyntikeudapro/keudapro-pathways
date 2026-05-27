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
  dotStyle: { backgroundColor: string };
  items: Industry[];
};

const tiers: Tier[] = [
  {
    id: "ydinmoottorit",
    label: "YDINMOOTTORIT",
    subtitle: "Kasvun kärki",
    dotStyle: { backgroundColor: "#1A5F9E" },
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
        tooltip:
          "Keudan ydintehtävä — alueen kriittisin kilpailutekijä 2030",
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
    label: "KASVUN MAHDOLLISTAJAT",
    subtitle: "Rakenteellinen voima",
    dotStyle: { backgroundColor: "#1A7A4E" },
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
    label: "PERUSRAKENNE",
    subtitle: "Vakaa pohja",
    dotStyle: { backgroundColor: "#B85C00" },
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

export function GrowthIndustries() {
  const { openWizard } = useWizard();
  const [selected, setSelected] = useState<Industry | null>(null);

  return (
    <TooltipProvider delayDuration={150}>
      <section id="toimialakartta" className="relative w-full">
        {/* Background image + dark overlay */}
        <div className="absolute inset-0">
          <img
            src={industriesBg}
            alt="KUUMA-alueen yritysympäristö"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-20 md:py-32">
          <div className="keuda-container text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
              Kasvun kartta
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              KUUMA-alueen kasvualat
            </h2>

            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-2">
              Kasvu ei jakaudu tasaisesti – siksi kohdistamme kehittämisen
              toimialoihin, joissa murros ja potentiaali ovat suurimmat.
            </p>

            <p className="text-white font-semibold text-sm tracking-wide mb-12">
              Dataan perustuva suunta.
            </p>

            <div className="space-y-8">
              {tiers.map((tier) => (
                <div key={tier.id}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={tier.dotStyle}
                    />
                    <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/70">
                      {tier.label}
                    </span>
                    <span className="text-xs text-white/80 ml-1">
                      — {tier.subtitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                    {tier.items.map((item) => {
                      const chip = (
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-foreground px-4 py-2 text-sm font-medium shadow-sm border border-white/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                          {item.label}
                        </button>
                      );
                      return item.tooltip ? (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>{chip}</TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-xs text-center"
                          >
                            {item.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span key={item.id} className="contents">
                          {chip}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <p className="text-white/70 italic text-sm max-w-lg mx-auto mb-5">
                Toimialasi on listattu kasvun kärkeen? Katso miten KASVU-reitti
                tukee juuri teidän toimialanne kehitystä.
              </p>
              <Button variant="cta" size="lg" onClick={openWizard}>
                Aloita kasvukartoitus →
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

                <div className="mt-8">
                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setSelected(null);
                      openWizard();
                    }}
                  >
                    Katso kasvupolku tällä toimialalla →
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </section>
    </TooltipProvider>
  );
}
