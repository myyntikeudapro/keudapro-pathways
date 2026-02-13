import { Button } from "@/components/ui/button";

import iconMyynti from "@/assets/icon-myynti.png";
import iconMarkkinointi from "@/assets/icon-markkinointi.png";
import iconTekoaly from "@/assets/icon-tekoaly.png";
import iconProsessit from "@/assets/icon-prosessit.png";
import iconOsaaminen from "@/assets/icon-osaaminen.png";
import iconOmistajanvaihdos from "@/assets/icon-omistajanvaihdos.png";

const families = [
  { image: iconMyynti, title: "Myynti ja asiakashankinta" },
  { image: iconMarkkinointi, title: "Markkinointi ja asiakaskokemus" },
  { image: iconTekoaly, title: "Tekoäly ja digitalisaatio" },
  { image: iconProsessit, title: "Prosessit ja tuottavuus" },
  { image: iconOsaaminen, title: "Osaamisen kehittäminen" },
  { image: iconOmistajanvaihdos, title: "Omistajanvaihdos ja siirtymät" }
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
              <img src={family.image} alt={family.title} className="w-16 h-16 mb-4 object-contain" />
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
