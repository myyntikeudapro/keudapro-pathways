import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const highlights = [
  {
    title: "Johtaminen ja esihenkilötyö",
    text: "Käytännön valmennukset esihenkilöille ja johtajille.",
    id: "esihenkilo-johtaminen",
  },
  {
    title: "Strateginen johtaminen ja turvallisuusjohtaminen",
    text: "Turvallisuuspäällikön, turvallisuusjohtajan ja vastuullisuuden ohjelmat.",
    id: "turvallisuusjohtaminen",
  },
  {
    title: "Osaamisen johtaminen ja tutkinnot",
    text: "Osaamisen johtaminen, tutkintotavoitteiset ratkaisut ja räätälöidyt valmennukset.",
    id: "muut-asiantuntija",
  },
];

export function AlyLeadershipBridge() {
  const open = (id: string) => {
    trackEvent("leadership_crosslink_click", { category: id });
    window.dispatchEvent(new CustomEvent("aly-category-open", { detail: { id } }));
  };

  return (
    <section id="johtaminen" style={{ scrollMarginTop: 110 }} className="py-12 md:py-16">
      <div className="keuda-container max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Tekoäly muuttaa myös johtamista
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
          Tekoäly vaikuttaa päätöksentekoon, työn organisointiin, osaamistarpeisiin ja johtajan
          omaan työhön. AI Director käsittelee johtamista tekoälyaikakaudella. Jos
          kehittämistarpeesi liittyy laajemmin johtamiseen, esihenkilötyöhön, strategiaan tai
          muutoksen johtamiseen, tutustu myös KeudaPROn muuhun johtamisen tarjontaan.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {highlights.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => open(h.id)}
              className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <h3 className="font-bold text-foreground mb-1">{h.title}</h3>
              <p className="text-sm text-muted-foreground">{h.text}</p>
            </button>
          ))}
        </div>

        <Button variant="outline-primary" size="lg" onClick={() => open("esihenkilo-johtaminen")}>
          Tutustu johtamisen koulutuksiin ja valmennuksiin →
        </Button>
      </div>
    </section>
  );
}
