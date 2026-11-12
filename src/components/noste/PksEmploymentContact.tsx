import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import service from "@/data/tyohonvalmennusPks.json";
import { employmentChoices, getEmploymentRoute, pksEmploymentLinks, type EmploymentChoice } from "@/data/pksEmploymentLinks";

const linkClass = "h-auto min-h-12 whitespace-normal text-left justify-between gap-3 px-5 py-3 max-w-full";

function ExternalAction({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return <Button variant={primary ? "cta" : "outline"} size="lg" asChild className={linkClass}><a href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight className="shrink-0 h-4 w-4" aria-hidden="true" /></a></Button>;
}

export function PksEmploymentContact() {
  const [choice, setChoice] = useState<EmploymentChoice | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const route = getEmploymentRoute(choice);
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(service.entry.message);
      setCopyStatus("Viesti kopioitu");
    } catch {
      setCopyStatus("Automaattinen kopiointi ei onnistunut. Voit valita viestin ja kopioida sen käsin.");
    }
  };
  const guidance = route.city ? service.entry.city : choice === "Muu" ? service.entry.other : choice === "En tiedä" ? service.entry.unknown : choice === "En ole vielä asiakas" ? service.entry.notCustomer : null;

  return <section id="mukaan" className="scroll-mt-24 bg-keuda-teal-section py-14 md:py-20">
    <div className="keuda-container">
      <p className="text-primary font-semibold text-sm mb-3">Oman työllisyyspalvelun kautta</p>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5">{service.entry.title}</h2>
      <p className="max-w-3xl text-foreground leading-relaxed text-lg">{service.entry.intro}</p>
      <div className="mt-9 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-14 border-t border-primary/20 pt-8">
        <div>
          <label id="employment-label" className="block text-lg font-semibold text-foreground mb-4">Minkä työllisyyspalvelun asiakas olet?</label>
          <Select value={choice ?? ""} onValueChange={value => {
            const next = employmentChoices.find(item => item === value);
            if (next) { setChoice(next); setCopyStatus(""); }
          }}>
            <SelectTrigger aria-labelledby="employment-label" className="h-12 max-w-md"><SelectValue placeholder="Valitse työllisyyspalvelu" /></SelectTrigger>
            <SelectContent>{employmentChoices.map(item => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="min-w-0 space-y-5" aria-live="polite">
          {guidance && <p className="text-foreground leading-relaxed">{guidance}</p>}
          {route.showAsiointi ? <>
            <div className="flex flex-col items-start gap-3">
              <ExternalAction href={pksEmploymentLinks.asiointi} primary>Avaa Työmarkkinatorin Asiointi</ExternalAction>
              <p className="text-sm leading-relaxed text-foreground max-w-xl">{service.entry.requirementText}</p>
              <ExternalAction href={route.contactUrl}>Katso oman työllisyyspalvelusi yhteystiedot</ExternalAction>
            </div>
            <div className="border-t border-primary/20 pt-5">
              <label htmlFor="pks-message" className="block font-semibold mb-3 text-foreground">Viesti omalle asiantuntijallesi</label>
              <textarea id="pks-message" readOnly value={service.entry.message} rows={5} className="w-full resize-y rounded-md border border-input bg-background p-4 text-foreground leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <Button variant="outline" onClick={copyMessage} className="mt-3">{copyStatus === "Viesti kopioitu" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}Kopioi viesti</Button>
              <p role="status" className="mt-2 text-sm text-foreground">{copyStatus}</p>
              <p className="text-sm text-foreground mt-2">Viestiä ei lähetetä tältä sivulta.</p>
            </div>
          </> : <div className="flex flex-col items-start gap-3">
            <ExternalAction href={pksEmploymentLinks.regions} primary>Etsi oman alueesi yhteystiedot</ExternalAction>
            {route.showRegistration && <ExternalAction href={pksEmploymentLinks.registration}>Lue työnhakijaksi ilmoittautumisen ohje</ExternalAction>}
            {route.showCityAlternatives && <div className="flex flex-wrap gap-x-5 gap-y-3 pt-2">{Object.entries(pksEmploymentLinks.cities).map(([city, href]) => <a href={href} key={city} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{city}: yhteystiedot</a>)}</div>}
          </div>}
        </div>
      </div>
      <Accordion type="single" collapsible className="mt-8 border-t border-primary/20">
        <AccordionItem value="contact-help" className="border-primary/20">
          <AccordionTrigger className="text-left gap-4 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">Miten jätän yhteydenottopyynnön Työmarkkinatorilla?</AccordionTrigger>
          <AccordionContent className="text-base text-foreground leading-relaxed max-w-3xl"><p>{service.entry.help}</p><a href={pksEmploymentLinks.contactHelp} target="_blank" rel="noopener noreferrer" className="inline-block text-primary underline underline-offset-4 mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">Lue yhteydenottopyynnön ohje<ArrowUpRight className="inline ml-1 h-4 w-4" aria-hidden="true" /></a></AccordionContent>
        </AccordionItem>
      </Accordion>
      <ol className="mt-10 grid md:grid-cols-3 gap-8">{service.steps.map((step, index) => <li key={step.title} className="border-t border-primary/30 pt-5"><span className="text-3xl font-bold text-primary">0{index + 1}</span><h3 className="text-xl font-bold mt-4 mb-3 text-foreground">{step.title}</h3><p className="text-foreground leading-relaxed">{step.text}</p></li>)}</ol>
    </div>
  </section>;
}