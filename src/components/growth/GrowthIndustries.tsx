import { 
  Factory, 
  Building2, 
  Truck, 
  ShoppingBag, 
  Briefcase, 
  Heart, 
  Monitor, 
  UtensilsCrossed, 
  Leaf
} from "lucide-react";

const industries = [
  { icon: Factory, label: "Teollisuus ja tuotanto" },
  { icon: Building2, label: "Rakentaminen ja kiinteistöpalvelut" },
  { icon: Truck, label: "Logistiikka ja kuljetus" },
  { icon: ShoppingBag, label: "Kauppa ja palvelut" },
  { icon: Briefcase, label: "Asiantuntijapalvelut" },
  { icon: Heart, label: "Hyvinvointi ja sote" },
  { icon: Monitor, label: "ICT ja digipalvelut" },
  { icon: UtensilsCrossed, label: "Ruoka- ja elintarvikeala" },
  { icon: Leaf, label: "Energia ja vihreä siirtymä" }
];

export function GrowthIndustries() {
  return (
    <section className="keuda-section">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Kasvun kartta: KUUMA-alueen kasvualat
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kasvu ei jakaudu tasaisesti. Siksi KeudaPRO kohdistaa kehittämisen toimialoihin, joissa murros ja potentiaali ovat suurimmat.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {industries.map((industry) => (
            <div 
              key={industry.label} 
              className="keuda-card p-4 text-center hover:shadow-md hover:border-primary/30 transition-all"
            >
              <industry.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-xs font-medium text-foreground block">{industry.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-accent/50 rounded-lg text-center">
          <p className="text-foreground font-medium text-sm">
            Kasvuala ei ole trendisana – se on dataan perustuva suunta.
          </p>
        </div>
      </div>
    </section>
  );
}
