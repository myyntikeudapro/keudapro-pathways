import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

export function GrowthElyInfo() {
  const { openWizard } = useWizard();

  return (
    <section className="py-8 md:py-10">
      <div className="keuda-container">
        <div className="rounded-xl border-2 border-primary/40 bg-card p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-bold text-foreground">
              Tiesitkö? Paketteihin voi hakea ELY-tukea tai yritysrahoitusta.
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 ml-9">
            Moniin KeudaPRO:n kasvupaketteihin on mahdollista hakea ulkopuolista rahoitusta.
            Selvitämme yhdessä sopivat vaihtoehdot reittikartoituksen yhteydessä – se ei sido mihinkään.
          </p>
          <div className="ml-9">
            <Button variant="cta" size="lg" onClick={openWizard}>
              Tee 15 min reittikartoitus →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
