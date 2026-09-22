import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nextCourseStart, formatCourseDate, deadlinePassed } from "@/data/muutosturvaStarts";

interface Props {
  onAssessment: (course?: string) => void;
  onCourses: (paid?: boolean) => void;
}
const steps = [
  "Täytä maksuton kartoitus.",
  "KeudaPRO auttaa valitsemaan sopivan koulutuksen ja laatimaan suunnitelman.",
  "Ehdota suunnitelmaa ja KeudaPRO toteuttajaksi omalle työllisyysalueellesi.",
  "Työllisyysalue tekee hankintapäätöksen ja aloitus vahvistetaan.",
];
export function MuutosturvaEntry({ onAssessment, onCourses }: Props) {
  const [next, setNext] = useState(() => nextCourseStart());
  useEffect(() => {
    const timer = window.setInterval(() => setNext(nextCourseStart()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <>
    <section className="relative overflow-hidden bg-keuda-hero-surface font-editorial text-background">
      <div aria-hidden="true" className="absolute -right-28 top-16 size-72 rounded-full border border-keuda-amber/15 md:right-[8%] md:top-24 md:size-[28rem]" />
      <div className="keuda-container relative grid gap-10 py-10 sm:py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] md:items-end md:gap-12 md:py-20 lg:gap-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 font-display text-xs font-semibold text-keuda-amber sm:text-sm">Irtisanotulle työntekijälle <span aria-hidden="true" className="mx-1.5 text-background/35">·</span> myös 55+ muutosturva</p>
          <h1 className="mb-5 max-w-[18ch] font-display text-[2.35rem] font-bold leading-[1.12] text-background sm:text-5xl md:text-[3.4rem] lg:text-[4rem]">Muutosturvasta uusi suunta ja uutta osaamista</h1>
          <p className="mb-7 max-w-[62ch] text-[1.0625rem] leading-7 text-keuda-hero-muted md:text-lg md:leading-8">Autamme sinua löytämään tilanteeseesi sopivan koulutuksen ja laatimaan suunnitelman työllisyysaluetta varten. Voit ehdottaa KeudaPRO koulutuksen toteuttajaksi – virallisen hankintapäätöksen tekee oma työllisyysalueesi.</p>

          <div className="max-w-md">
            <Button variant="cta" size="lg" className="group keuda-cta-wrap min-h-16 w-full justify-between rounded-xl px-5 text-left font-display text-base shadow-none hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-keuda-amber sm:px-6 sm:text-lg" onClick={() => onAssessment()}>
              <span>Tarkista sopivuus ja seuraava aloitus</span>
              <ArrowRight aria-hidden="true" className="ml-3 size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
            <div className="mt-4 space-y-2 text-sm leading-6 text-keuda-hero-muted">
              <p className="flex gap-3"><span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-secondary" />Maksuton ja ei-sitova kartoitus – vastaaminen vie noin minuutin.</p>
              <p className="flex gap-3"><span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-keuda-amber" /><strong className="font-medium text-background">Kartoitus ei ole ilmoittautuminen maksulliseen koulutukseen.</strong></p>
            </div>
            <Button variant="link" className="mt-5 h-auto justify-start px-0 py-1 font-semibold text-keuda-amber underline decoration-keuda-amber/40 decoration-2 underline-offset-8 hover:text-keuda-amber hover:decoration-keuda-amber" onClick={() => onCourses(false)}>Tutustu koulutusvaihtoehtoihin</Button>
          </div>
        </div>

        <aside className="relative border-t border-background/15 bg-background/[0.035] px-0 pb-1 pt-7 md:border-l md:border-t-0 md:px-8 md:py-8" aria-labelledby="next-start-heading">
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-keuda-amber" />
            <p className="font-display text-xs font-bold uppercase text-keuda-amber">Seuraava aloitus</p>
          </div>
          <h2 id="next-start-heading" className="text-xl font-semibold leading-snug text-background md:text-2xl">{next ? `Seuraava Tekoälykoordinaattori-koulutus alkaa ${formatCourseDate(next.start)}.` : "Seuraava aloitus sovitaan henkilökohtaisesti."}</h2>
          {next && <p className="mt-4 text-sm leading-6 text-keuda-hero-muted">Ilmoittautuminen maksulliseen toteutukseen {deadlinePassed(next.deadline) ? "päättyi" : "päättyy"} {formatCourseDate(next.deadline)}. Muutosturva-asiakkaan aloitus vahvistetaan erikseen työllisyysalueen kanssa.</p>}
          <Button variant="outline" className="keuda-cta-wrap mt-6 w-full border-background/30 bg-transparent text-background hover:border-background hover:bg-background hover:text-foreground" onClick={() => onAssessment(next ? `${next.course} – aloitus ${formatCourseDate(next.start)}` : undefined)}>{next ? "Kysy tästä aloituksesta" : "Kysy seuraavaa aloitusta"}</Button>
        </aside>
      </div>
    </section>
    <nav aria-label="Muutosturvasivun osiot" className="border-b border-border bg-background">
      <div className="keuda-container grid grid-cols-2 sm:flex sm:justify-center gap-x-2 py-2">
        {[["Olen työntekijä", "tyontekija"], ["Olen 55+", "yli55"], ["Olen työnantaja", "tyonantaja"], ["Katso koulutukset", "ai-course-finder"]].map(([label, id]) => <Button key={id} variant="link" asChild className="min-h-11 text-primary whitespace-normal text-center"><a href={`#${id}`}>{label}</a></Button>)}
      </div>
    </nav>
    <section className="py-10 md:py-16 bg-muted/50">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl text-primary mb-6">Miten haluat edetä?</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <article className="keuda-card-static border-2 border-secondary flex flex-col">
            <p className="flex gap-2 items-center text-sm text-primary font-semibold mb-4"><CheckCircle2 className="w-5 h-5 shrink-0" />Suositeltu muutosturva-asiakkaalle</p>
            <h3 className="text-xl md:text-2xl mb-3">Haen koulutukseen muutosturvan kautta</h3>
            <p className="text-muted-foreground mb-6 flex-1">Autamme löytämään sopivan koulutuksen ja laatimaan ehdotuksen omalle työllisyysalueellesi. Älä tee vielä maksullista ilmoittautumista.</p>
            <Button variant="cta" className="keuda-cta-wrap self-start w-full sm:w-auto" onClick={() => onAssessment()}>Aloita maksuton kartoitus</Button>
          </article>
          <article className="keuda-card-static flex flex-col">
            <h3 className="text-xl md:text-2xl mb-3">Maksan itse tai työnantajani maksaa</h3>
            <p className="text-muted-foreground mb-6 flex-1">Voit valita koulutuksen, tarkistaa alkavat ryhmät ja siirtyä tavalliseen maksulliseen ilmoittautumiseen.</p>
            <Button variant="outline-primary" className="keuda-cta-wrap self-start w-full sm:w-auto" onClick={() => onCourses(true)}>Katso koulutukset ja ilmoittaudu</Button>
          </article>
        </div>
      </div>
    </section>
    <section className="py-10 md:py-12 border-b border-border">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl text-primary mb-6">Näin muutosturvapolku etenee</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{steps.map((step, index) => <li key={step} className="flex gap-3"><span className="text-3xl text-primary font-bold leading-none">{index + 1}.</span><p className="text-sm leading-relaxed">{step}</p></li>)}</ol>
        <p className="mt-7 border-l-4 border-keuda-orange pl-4 text-sm text-muted-foreground">Jos olet vähintään 55-vuotias, ilmoittaudu työnhakijaksi oman työllisyysalueesi ohjeiden mukaisesti 60 päivän kuluessa irtisanomisesta.</p>
      </div>
    </section>
  </>;
}
