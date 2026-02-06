import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ShoppingCart, 
  Brain, 
  Users, 
  RefreshCw, 
  Compass,
  Globe,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

const situations = [
  { id: "kasvu", icon: TrendingUp, label: "Kasvu ja skaalaus" },
  { id: "myynti", icon: ShoppingCart, label: "Myynti ja asiakashankinta" },
  { id: "ai", icon: Brain, label: "Tekoäly käyttöön arjessa" },
  { id: "osaaminen", icon: Users, label: "Osaajapula ja henkilöstön kehittäminen" },
  { id: "omistaja", icon: RefreshCw, label: "Omistajanvaihdos / sukupolvenvaihdos" },
  { id: "uudistuminen", icon: Compass, label: "Uudistuminen ja suunnanmuutos" },
  { id: "kv", icon: Globe, label: "Kansainvälistyminen" },
  { id: "vastuullisuus", icon: Leaf, label: "Vastuullisuus ja tulevaisuuden vaatimukset" }
];

export function SituationSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="keuda-section bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Mikä kuvaa tilannettasi parhaiten?
          </h2>
          <p className="text-muted-foreground">
            Valitse yksi. Saat suoraan oikean kasvupolun ja etenemismallin.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {situations.map((situation) => (
            <button
              key={situation.id}
              onClick={() => setSelected(situation.id)}
              className={cn(
                "keuda-card p-4 text-center transition-all hover:shadow-md hover:border-primary/50 cursor-pointer",
                selected === situation.id && "border-primary bg-primary/5 shadow-md"
              )}
            >
              <situation.icon className={cn(
                "w-8 h-8 mx-auto mb-3 transition-colors",
                selected === situation.id ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium block",
                selected === situation.id ? "text-primary" : "text-foreground"
              )}>
                {situation.label}
              </span>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Sinun ei tarvitse tietää ratkaisuja – riittää, että tunnistat tilanteen.
          </p>
          <Button size="lg" disabled={!selected}>
            Valitse polku ja aloita
          </Button>
        </div>
      </div>
    </section>
  );
}
