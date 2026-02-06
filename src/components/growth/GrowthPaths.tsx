import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  TrendingUp, 
  Monitor, 
  Brain, 
  Lightbulb, 
  RefreshCw,
  Globe,
  Compass
} from "lucide-react";

const paths = [
  {
    icon: Rocket,
    title: "Aloittava yrittäjä",
    desc: "Perustukset, rohkeus ja ensimmäiset asiakkaat."
  },
  {
    icon: TrendingUp,
    title: "Pk-yrityksen kasvu",
    desc: "Skaalaus, prosessit ja myynnin vahvistaminen."
  },
  {
    icon: Monitor,
    title: "Digiloikka",
    desc: "Toimintatapojen modernisointi ja työkalut."
  },
  {
    icon: Brain,
    title: "Tekoälypolku",
    desc: "AI käytäntöön, pilotit ja uudet toimintamallit."
  },
  {
    icon: Lightbulb,
    title: "Tuote- ja palvelukehitys",
    desc: "Konseptointi, testaus ja markkinakelpoisuus."
  },
  {
    icon: RefreshCw,
    title: "Omistajanvaihdos ja jatkuvuus",
    desc: "Hiljaisen tiedon siirto ja uusi vaihe."
  },
  {
    icon: Globe,
    title: "Kansainvälistyminen",
    desc: "Uudet markkinat ja myyntikanavat."
  },
  {
    icon: Compass,
    title: "Uudistuminen ja suunnanmuutos",
    desc: "Murroksesta uuteen kasvuun."
  }
];

export function GrowthPaths() {
  return (
    <section className="keuda-section">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Kasvun polut – koska yritykset ovat eri vaiheissa
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kasvu ei tarkoita kaikille samaa. Siksi KeudaPRO:n malli perustuu selkeisiin kasvupolkuihin.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map((path) => (
            <div key={path.title} className="keuda-card-enhanced p-5 text-center">
              <path.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{path.title}</h3>
              <p className="text-sm text-muted-foreground">{path.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-lg font-semibold text-foreground mb-4">
            Kasvu ei ole yksi reitti. Siksi meillä on polkuja.
          </p>
          <Button size="lg">Näytä suositeltu polku</Button>
        </div>
      </div>
    </section>
  );
}
