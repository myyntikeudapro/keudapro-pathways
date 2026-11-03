import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import photo from "@/assets/tyohonvalmennus-pks.jpg.asset.json";
import service from "@/data/tyohonvalmennusPks.json";

export function PksCoachingCard() {
  return (
    <section className="pb-12 md:pb-16" aria-labelledby="pks-coaching-title">
      <div className="keuda-container">
        <article className="grid md:grid-cols-[0.85fr_1.15fr] overflow-hidden rounded-lg border border-border bg-card shadow-sm max-w-5xl mx-auto">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-96">
            <img src={photo.url} alt="Työnhakija ja valmentaja keskustelevat pöydän ääressä – kuva palvelun esitteestä" width={2250} height={2250} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
            <span className="absolute top-5 left-5 rounded-md bg-foreground/90 text-background px-4 py-2 text-lg font-bold">Kohti työtä</span>
          </div>
          <div className="min-w-0 p-6 md:p-9 flex flex-col justify-center">
            <p className="text-primary text-sm font-semibold flex items-center gap-2 mb-3"><MapPin className="h-4 w-4" aria-hidden="true" />Helsinki · Espoo · Vantaa</p>
            <h2 id="pks-coaching-title" className="text-2xl md:text-3xl font-bold leading-tight text-primary">Työnhakijan yksilövalmennus</h2>
            <p className="mt-3 text-foreground font-semibold">Oma valmentaja. Oma suunnitelma. Kohti työtä.</p>
            <p className="mt-3 text-muted-foreground leading-relaxed">Maksuton palvelu pääkaupunkiseudun työllisyyspalveluiden asiakkaille. Saat henkilökohtaista tukea työnhakuun ja uuden työn alkuun.</p>
            <p className="mt-4 text-sm font-medium text-foreground">{service.priceEuros} € · {service.durationMonths.min}–{service.durationMonths.max} kuukautta · Jatkuva haku</p>
            <Button variant="cta" size="lg" asChild className="mt-6 self-start max-w-full whitespace-normal h-auto min-h-12 py-3 px-4 text-sm sm:text-base">
              <Link to={service.path}>Tutustu yksilövalmennukseen <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">Palveluun oman työllisyyspalvelun asiantuntijan kautta.</p>
          </div>
        </article>
      </div>
    </section>
  );
}