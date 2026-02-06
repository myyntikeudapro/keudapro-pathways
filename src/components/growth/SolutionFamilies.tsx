import { 
  ShoppingCart, 
  TrendingUp, 
  Brain, 
  Cog, 
  Users, 
  RefreshCw,
  Network,
  Leaf
} from "lucide-react";

const families = [
  { icon: ShoppingCart, title: "Myynti, markkinointi ja asiakaskokemus" },
  { icon: TrendingUp, title: "Kasvun johtaminen ja liiketoimintamalli" },
  { icon: Brain, title: "Tekoäly ja digitalisaatio käytäntöön" },
  { icon: Cog, title: "Prosessit, tuottavuus ja tehokkuus" },
  { icon: Users, title: "Osaamisen kehittäminen ja henkilöstön jatkuvuus" },
  { icon: RefreshCw, title: "Omistajanvaihdos ja yritysjärjestelyt" },
  { icon: Network, title: "Verkostot, ekosysteemit ja TKI" },
  { icon: Leaf, title: "Vastuullisuus ja kilpailukyvyn tulevaisuus" }
];

export function SolutionFamilies() {
  return (
    <section className="keuda-section bg-muted/30">
      <div className="keuda-container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ratkaisuperheet – osaaminen on väline, ei päämäärä
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            KeudaPRO ei tarjoa kurssilistaa. Me kokoamme ratkaisut kokonaisuuksiksi, jotka liittyvät suoraan yrityksen tekemiseen ja arkeen.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {families.map((family) => (
            <div key={family.title} className="keuda-card p-5 text-center hover:shadow-md hover:border-primary/30 transition-all">
              <family.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-2">{family.title}</h3>
              <p className="text-xs text-muted-foreground">
                Sparraus – pilotointi – valmennus – projekti
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
          <p className="text-foreground font-medium">
            Yrityksen ei tarvitse osata johtaa osaamista. Me rakennamme sen osaksi tekemistä.
          </p>
        </div>
      </div>
    </section>
  );
}
