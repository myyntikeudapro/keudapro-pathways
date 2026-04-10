import { Button } from "@/components/ui/button";
import { useWizard } from "@/contexts/WizardContext";
import { Target, Map, CheckCircle } from "lucide-react";

const highlights = [
  {
    icon: Target,
    text: "Tunnistetaan nykytaso ja pullonkaulat",
  },
  {
    icon: Map,
    text: "Valitaan sopiva reitti – Mindset, Toolset ja Verkostot",
  },
  {
    icon: CheckCircle,
    text: "Selkeä seuraava askel – ei yleistä, vaan juuri sinulle",
  },
];

export function GrowthMotivationBanner() {
  const { openWizard } = useWizard();

  return (
    <section id="aloita" className="bg-foreground py-16 md:py-20">
      <div className="keuda-container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-background mb-10">
          Haluatko tietää yrityksesi seuraavan askeleen?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {highlights.map((h) => (
            <div key={h.text} className="flex flex-col items-center gap-3">
              <h.icon className="w-8 h-8 text-primary" />
              <p className="text-sm text-background/80 leading-relaxed">{h.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Button variant="cta" size="lg" onClick={openWizard}>
            Tee 15 min reittikartoitus
          </Button>
          <Button
            size="lg"
            variant="outline-primary"
            className="border-background/40 text-background hover:bg-background/10 hover:text-background hover:border-background/60"
          >
            Liity mukaan pilottiin →
          </Button>
        </div>

        <p className="text-sm text-background/50">
          Kartoitus ei sido mihinkään. Se voi kuitenkin avata uuden suunnan.
        </p>
      </div>
    </section>
  );
}
