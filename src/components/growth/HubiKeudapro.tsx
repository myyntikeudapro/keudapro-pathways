import { CheckCircle2 } from "lucide-react";

const hubiPoints = [
  "tunnistaa ilmiöt ja tarpeet",
  "analysoi oman talousalueen yrityskannan",
  "kokoaa kasvun ja osaamisen kartan",
  "ohjaa oikeaan polkuun"
];

const keudaproPoints = [
  "vie kehittämisen käytäntöön",
  "rakentaa osaamista ja toimintamalleja",
  "toteuttaa pilotit ja projektit",
  "tuo oikeat osaajat ja verkostot"
];

export function HubiKeudapro() {
  return (
    <section className="keuda-section bg-muted/30">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Hubi kartoittaa. KeudaPRO toteuttaa.
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="keuda-card p-6">
            <h3 className="font-semibold text-foreground text-lg mb-4">
              Teknologiahubi (tilannekuva ja reititys)
            </h3>
            <ul className="space-y-3">
              {hubiPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="keuda-card p-6 border-primary/30">
            <h3 className="font-semibold text-foreground text-lg mb-4">
              KeudaPRO (toteutus ja ratkaisut)
            </h3>
            <ul className="space-y-3">
              {keudaproPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
          <p className="text-foreground font-medium">
            Tämä on osaamisen operaattorin rooli: reitittää ja varmistaa, että muutos tapahtuu.
          </p>
        </div>
      </div>
    </section>
  );
}
