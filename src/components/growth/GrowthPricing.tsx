import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssessmentModal } from "@/components/growth/AssessmentModal";

const packages = [
  {
    level: 1 as const,
    badge: "Taso 1 · 40 000–120 000 €/v",
    title: "Kasvu käyntiin",
    price: "290",
    annual: "12 kk sopimus — 3 480 €/v",
    featured: false,
    features: [
      "Perusvalmennus: myynti ja asiakashankinta (4 sessiota/v)",
      "Tekoälytyökalupaketti: asiakasviestintä ja markkinointi",
      "Pääsy digitaaliselle oppimisalustalle",
      "Vertaisryhmä (10–15 saman tason yrittäjää)",
      "Reittikartoitus kerran vuodessa",
    ],
    ctaText: "Aloita kasvukartoitus",
  },
  {
    level: 2 as const,
    badge: "Taso 2 · 120 000–600 000 €/v",
    title: "Skaalaus ja systematisointi",
    price: "590",
    annual: "12 kk sopimus — 7 080 €/v",
    featured: true,
    features: [
      "Kaikki Taso 1:n sisällöt",
      "Johtamisvalmennus: tiimi, prosessit ja myyntiputki (6 sessiota/v)",
      "Laajennettu AI-alusta: automaatio, CRM-integraatiot, raportointi",
      "1 × henkilökohtainen sparraussessio per kuukausi",
      "Verkostoklubi: alihankkijat, kumppanit, rekrytointiverkosto",
      "Puolivuosittainen reittikatselmus ja siirtymäsuunnitelma",
    ],
    ctaText: "Aloita skaalauskartoitus",
  },
  {
    level: 3 as const,
    badge: "Taso 3 · 600 000–1 200 000 €/v",
    title: "Teollistuminen ja uudistuminen",
    price: "990",
    annual: "12 kk sopimus — 11 880 €/v",
    featured: false,
    features: [
      "Kaikki Taso 1–2:n sisällöt",
      "Omistaja-valmennus: hallitustyö, strategia ja siirtymäsuunnitelma",
      "Täysi AI-integraatiopaketti: BI, ERP-yhteydet, henkilöstöanalytiikka",
      "Nimetty asiantuntija — oma sparrari koko sopimusvuodeksi",
      "TKI- ja kansainvälistymisverkosto",
      "Hiljaisen tiedon siirto-ohjelma ja dokumentointi",
    ],
    ctaText: "Keskustele siirtymästä",
  },
];

/* Comparison table rows: [taso1, taso2, taso3] */
const comparisonRows = [
  { label: "Perusvalmennus: myynti ja asiakashankinta", tiers: [true, true, true] },
  { label: "Tekoälytyökalupaketti (viestintä & markkinointi)", tiers: [true, true, true] },
  { label: "Digitaalinen oppimisalusta", tiers: [true, true, true] },
  { label: "Vertaisryhmä (10–15 yrittäjää)", tiers: [true, true, true] },
  { label: "Reittikartoitus", tiers: [true, true, true] },
  { label: "Johtamisvalmennus (tiimi, prosessit, myyntiputki)", tiers: [false, true, true] },
  { label: "Laajennettu AI-alusta (automaatio, CRM, raportointi)", tiers: [false, true, true] },
  { label: "Henkilökohtainen sparraussessio (1×/kk)", tiers: [false, true, true] },
  { label: "Verkostoklubi (alihankkijat, kumppanit, rekry)", tiers: [false, true, true] },
  { label: "Puolivuosittainen reittikatselmus", tiers: [false, true, true] },
  { label: "Omistaja-valmennus (hallitustyö, strategia)", tiers: [false, false, true] },
  { label: "Täysi AI-integraatio (BI, ERP, HR-analytiikka)", tiers: [false, false, true] },
  { label: "Nimetty asiantuntija koko sopimusvuodeksi", tiers: [false, false, true] },
  { label: "TKI- ja kansainvälistymisverkosto", tiers: [false, false, true] },
  { label: "Hiljaisen tiedon siirto-ohjelma", tiers: [false, false, true] },
];

export function GrowthPricing() {
  const [modalLevel, setModalLevel] = useState<1 | 2 | 3 | null>(null);

  return (
    <section className="py-16 md:py-20">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valitse kasvupakettisi
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            12 kuukauden sopimuksella saat käyttöösi valmennuksen, tuen ja
            tekoälytyökalut — kuukausimaksulla ilman suuria kertainvestointeja.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.title}
              className={cn(
                "keuda-card-enhanced flex flex-col h-full relative transition-all",
                pkg.featured && "ring-2 ring-primary shadow-xl lg:scale-[1.03]"
              )}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 shadow-md">
                    Suositelluin
                  </Badge>
                </div>
              )}

              <span className="text-xs font-medium text-muted-foreground mb-2">
                {pkg.badge}
              </span>

              <h3 className="text-xl font-bold text-foreground mb-4">
                {pkg.title}
              </h3>

              <div className="mb-1">
                <span className="text-4xl font-extrabold text-foreground">
                  {pkg.price} €
                </span>
                <span className="text-muted-foreground text-sm ml-1">/ kk</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {pkg.annual}
              </p>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="cta"
                size="lg"
                className="w-full mt-auto"
                onClick={() => handleCta(pkg.prefill)}
              >
                {pkg.ctaText}
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-16 overflow-x-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Vertaa paketteja
          </h3>
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[40%]">
                  Ominaisuus
                </th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.title}
                    className={cn(
                      "py-3 px-4 text-center font-semibold text-foreground",
                      pkg.featured && "bg-primary/5"
                    )}
                  >
                    {pkg.title}
                    <div className="text-xs font-normal text-muted-foreground mt-0.5">
                      {pkg.price} €/kk
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-border/50",
                    i % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <td className="py-3 px-4 text-foreground">{row.label}</td>
                  {row.tiers.map((has, ti) => (
                    <td
                      key={ti}
                      className={cn(
                        "py-3 px-4 text-center",
                        packages[ti].featured && "bg-primary/5"
                      )}
                    >
                      {has ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info note */}
        <div className="mt-8 flex items-start gap-3 bg-accent/60 border border-border/50 rounded-xl p-5 max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Paketteihin voi hakea ELY-tukea tai yritysrahoitusta — kysymme tästä
            reittikartoituksessa. Laskutus kuukausittain tai kvartaaleittain.
            Tasojen välillä voi siirtyä joustavasti sopimusvuoden aikana.
          </p>
        </div>
      </div>
    </section>
  );
}
