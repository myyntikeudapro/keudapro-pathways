import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
      { label: "Osaamisen kehittäminen", href: "#osaaminen" },
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

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
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
        </div>
      </div>
    </section>
  );
}
