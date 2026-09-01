import { AlyCategoryAccordion } from "./AlyCategoryAccordion";

export function AlyLeadershipBridge() {
  return (
    <section id="johtaminen" style={{ scrollMarginTop: 110 }} className="py-14 md:py-20">
      <div className="keuda-container">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keuda-orange mb-3">
            Koulutukset
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Tekoäly muuttaa myös johtamista
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            Tekoäly vaikuttaa päätöksentekoon, työn organisointiin, osaamistarpeisiin ja johtajan
            omaan työhön. Valitse alta kategoria — löydät KeudaPROn muun johtamisen, esihenkilötyön
            ja asiantuntijaosaamisen tarjonnan, joka täydentää tekoälypätevyys-polun.
          </p>
        </div>

        <AlyCategoryAccordion embedded />
      </div>
    </section>
  );
}
