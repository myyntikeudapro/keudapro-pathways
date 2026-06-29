import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const bullets = [
  "hiljaisen tiedon siirto",
  "uuden yrittäjän startti",
  "sukupolvenvaihdoksen tuki",
  "liiketoiminnan uudelleen fokusoiminen",
  "osaamisen ja henkilöstön jatkuvuus"
];

export function TransitionsSection() {
  return (
    <section className="keuda-section bg-muted/30">
      <div className="keuda-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Siirtymät ratkaisevat elinvoiman
            </h2>
            <p className="text-muted-foreground">
              KUUMA-alueella eläköityminen, omistajanvaihdokset ja hiljaisen tiedon katoaminen ovat kasvun suurimpia riskejä.
              Siksi jatkuvuus ei ole erillinen palvelu – vaan yksi tärkeimmistä kasvupoluista.
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-4">
              Kasvu ei jatku itsestään – se täytyy rakentaa.
            </p>
            <Button size="lg" asChild>
              <a href="/omistajanvaihdos">Aloita siirtymäkartoitus</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
