import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nextCourseStart, formatCourseDate } from "@/data/muutosturvaStarts";

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
    <section className="bg-foreground text-background pt-8 pb-7 md:pt-16 md:pb-10">
      <div className="keuda-container">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-keuda-orange mb-3">Irtisanotulle työntekijälle · myös 55+ muutosturva</p>
          <h1 className="text-3xl md:text-5xl font-bold text-background leading-tight mb-4">Muutosturvasta uusi suunta ja uutta osaamista</h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-background/80 leading-relaxed mb-5">Autamme sinua löytämään tilanteeseesi sopivan koulutuksen ja laatimaan suunnitelman työllisyysaluetta varten. Voit ehdottaa KeudaPRO koulutuksen toteuttajaksi – virallisen hankintapäätöksen tekee oma työllisyysalueesi.</p>
          <Button variant="cta" size="lg" className="keuda-cta-wrap w-full sm:w-auto" onClick={() => onAssessment()}>Tarkista sopivuus ja seuraava aloitus<ArrowRight className="w-4 h-4 shrink-0 ml-2" /></Button>
          <p className="text-xs sm:text-sm text-background/80 mt-3">Maksuton ja ei-sitova kartoitus – vastaaminen vie noin minuutin.</p>
          <p className="text-sm text-background mt-2">Kartoitus ei ole ilmoittautuminen maksulliseen koulutukseen.</p>
          <Button variant="link" className="keuda-cta-wrap text-background underline mt-2" onClick={() => onCourses(false)}>Tutustu koulutusvaihtoehtoihin</Button>
        </div>
        <div className="mt-6 md:mt-9 border-t border-background/25 pt-5 flex flex-col md:flex-row gap-4 md:items-center max-w-5xl mx-auto">
          <CalendarDays className="hidden md:block w-9 h-9 text-keuda-orange shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase text-keuda-orange mb-2">Seuraava aloitus</p>
            <h2 className="text-lg md:text-xl font-semibold text-background">{next ? `Seuraava Tekoälykoordinaattori-koulutus alkaa ${formatCourseDate(next.start)}.` : "Seuraava aloitus sovitaan henkilökohtaisesti."}</h2>
            {next && <p className="text-sm text-background/80 mt-2 leading-relaxed">Ilmoittautuminen maksulliseen toteutukseen päättyy {formatCourseDate(next.deadline)}. Muutosturva-asiakkaan aloitus vahvistetaan erikseen työllisyysalueen kanssa.</p>}
          </div>
          <Button variant="outline" className="keuda-cta-wrap bg-transparent border-background/40 text-background hover:bg-background hover:text-foreground shrink-0" onClick={() => onAssessment(next ? `${next.course} – aloitus ${formatCourseDate(next.start)}` : undefined)}>{next ? "Kysy tästä aloituksesta" : "Kysy seuraavaa aloitusta"}</Button>
        </div>
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
