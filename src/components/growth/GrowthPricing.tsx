import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const packages = [
  {
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
    prefill: "Kiinnostaa: Käynnistys-kasvupaketti (290 €/kk)",
  },
  {
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
    prefill: "Kiinnostaa: Skaalaus-kasvupaketti (590 €/kk)",
  },
  {
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
    prefill: "Kiinnostaa: Uudistuminen-kasvupaketti (990 €/kk)",
  },
];

export function GrowthPricing() {
  const navigate = useNavigate();

  const handleCta = (prefill: string) => {
    navigate("/yhteystiedot?prefill=" + encodeURIComponent(prefill) + "#lomake");
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.title}
              className={cn(
                "keuda-card-enhanced flex flex-col h-full relative transition-all",
                pkg.featured && "ring-2 ring-primary shadow-xl lg:scale-[1.03]"
              )}
            >
              {/* Featured label */}
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 shadow-md">
                    Suositelluin
                  </Badge>
                </div>
              )}

              {/* Badge */}
              <span className="text-xs font-medium text-muted-foreground mb-2">
                {pkg.badge}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-4">
                {pkg.title}
              </h3>

              {/* Price */}
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-foreground">
                  {pkg.price} €
                </span>
                <span className="text-muted-foreground text-sm ml-1">/ kk</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {pkg.annual}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
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
