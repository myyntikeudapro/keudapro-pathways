import { 
  ShoppingCart, 
  TrendingUp, 
  Brain, 
  Cog, 
  Users, 
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

const families = [
  { icon: ShoppingCart, title: "Myynti ja asiakashankinta" },
  { icon: TrendingUp, title: "Markkinointi ja asiakaskokemus" },
  { icon: Brain, title: "Tekoäly ja digitalisaatio" },
  { icon: Cog, title: "Prosessit ja tuottavuus" },
  { icon: Users, title: "Osaamisen kehittäminen" },
  { icon: RefreshCw, title: "Omistajanvaihdos ja siirtymät" }
];

export function SolutionFamilies() {
  return (
    <section className="keuda-section bg-muted/30">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Ratkaisuperheet
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {families.map((family) => (
            <div key={family.title} className="keuda-card-enhanced p-6 text-center flex flex-col items-center">
              <family.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{family.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Sparraus – pilotointi – valmennus – projekti
              </p>
              <Button variant="outline" size="sm" className="mt-auto">
                Lue lisää
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
