import { ArrowLeft, ArrowRight, Check, FileDown, FileText, Compass, MessageCircle, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PksEmploymentContact } from "@/components/noste/PksEmploymentContact";
import photo from "@/assets/tyohonvalmennus-pks.jpg.asset.json";
import brochure from "@/assets/tyohonvalmennus-pks-esite.pdf.asset.json";
import service from "@/data/tyohonvalmennusPks.json";

const exampleIcons = [FileText, BriefcaseBusiness, MessageCircle, Compass];
const anchorClass = "max-w-full whitespace-normal h-auto min-h-12 px-5 py-3";

export default function TyohonvalmennusPksPage() {
  return <Layout>
    <SEO title={`${service.title} | KeudaPRO`} description={service.description} path={service.path} jsonLd={[
      { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description, url: `https://keudapro.fi${service.path}`, provider: { "@type": "Organization", name: "KeudaPRO" }, areaServed: service.cities.map(name => ({ "@type": "City", name })), offers: { "@type": "Offer", price: service.priceEuros, priceCurrency: "EUR" } },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: service.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ]} />
    <section className="pks-coaching-hero relative isolate overflow-hidden">
      <img src={photo.url} alt="Työnhakija keskustelee oman valmentajan kanssa" width={2250} height={2250} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-top" />
      <div className="pks-coaching-shade absolute inset-0 -z-10" />
      <div className="keuda-container py-8 md:py-12">
        <Button variant="link" asChild className="text-primary-foreground px-0 mb-8 md:mb-12"><Link to="/noste"><ArrowLeft aria-hidden="true" /> Noste</Link></Button>
        <div className="max-w-xl">
          <p className="text-primary-foreground font-semibold text-lg mb-3">Kohti työtä</p>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">{service.title}</h1>
          <p className="text-primary-foreground mt-4 text-lg font-semibold">Pääkaupunkiseutu · Helsinki, Espoo ja Vantaa</p>
          <p className="text-primary-foreground mt-5 text-base md:text-lg leading-relaxed max-w-lg">{service.intro}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Button variant="cta" size="lg" asChild className={anchorClass}><a href="#mukaan">Näin pääset mukaan <ArrowRight aria-hidden="true" /></a></Button>
            <Button variant="outline" size="lg" asChild className={`${anchorClass} bg-background text-foreground`}><a href="#ukk">Kysy valmennuksesta <MessageCircle aria-hidden="true" /></a></Button>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-keuda-gray-section border-b border-border">
      <dl className="keuda-container grid sm:grid-cols-2 lg:grid-cols-4 gap-6 py-7 md:py-9">{service.facts.map(fact => <div key={fact.label}><dt className="text-sm text-muted-foreground mb-2">{fact.label}</dt><dd className="font-semibold text-foreground leading-relaxed">{fact.value}</dd></div>)}</dl>
    </section>
    <PksEmploymentContact />
    <section className="bg-keuda-blue-light py-14 md:py-20">
      <div className="keuda-container grid lg:grid-cols-2 gap-9 lg:gap-16">
        <div><h2 className="text-3xl font-bold text-primary mb-5">Voisiko tästä olla apua sinulle?</h2><p className="text-foreground leading-relaxed">{service.audience}</p></div>
        <ul className="space-y-4">{service.situations.map(text => <li key={text} className="flex gap-3 text-foreground leading-relaxed"><Check className="h-5 w-5 shrink-0 text-primary mt-1" aria-hidden="true" /><span>{text}</span></li>)}</ul>
      </div>
    </section>
    <section className="bg-background py-14 md:py-20">
      <div className="keuda-container">
        <h2 className="text-3xl font-bold text-primary mb-9">Mitä valmentajan kanssa tehdään?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">{service.examples.map((item, index) => {
          const Icon = exampleIcons[index] ?? FileText;
          return <div key={item.title} className="border-t border-border pt-6"><Icon className="text-primary h-7 w-7 mb-4" aria-hidden="true" /><h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3><p className="text-foreground leading-relaxed">{item.text}</p></div>;
        })}</div>
        <p className="mt-9 max-w-3xl text-foreground leading-relaxed">{service.examplesNote}</p>
      </div>
    </section>
    <section className="bg-keuda-gray-section py-14 md:py-20">
      <div className="keuda-container"><h2 className="text-3xl font-bold text-primary mb-9">Miten valmennus sopii arkeesi?</h2><div className="grid md:grid-cols-2 gap-x-16 gap-y-9">{service.everyday.map(item => <div key={item.title}><h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3><p className="text-foreground leading-relaxed">{item.text}</p></div>)}</div></div>
    </section>
    <section id="ukk" className="scroll-mt-24 bg-keuda-blue-light py-14 md:py-20">
      <div className="keuda-container max-w-4xl">
        <h2 className="text-3xl font-bold text-primary mb-5">Usein kysytyt kysymykset</h2>
        <Accordion type="multiple">{service.faq.map((item, index) => <AccordionItem key={item.question} value={`faq-${index}`} className="border-primary/20"><AccordionTrigger className="text-left text-base text-foreground gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{item.question}</AccordionTrigger><AccordionContent className="text-base text-foreground leading-relaxed">{item.answer}</AccordionContent></AccordionItem>)}</Accordion>
        {/* Future member uses this same versioned public content. No chat CTA until ready. */}
        <div id="palveluneuvoja" className="border-t border-primary/20 pt-7 mt-7"><Button variant="cta" asChild className={anchorClass}><a href="#mukaan">Näin pääset mukaan <ArrowRight aria-hidden="true" /></a></Button></div>
      </div>
    </section>
    <section className="bg-keuda-teal-section py-14 md:py-20">
      <div className="keuda-container grid lg:grid-cols-[1.2fr_0.8fr] gap-9 lg:gap-16">
        <div><h2 className="text-3xl font-bold text-primary mb-5">Oma valmentaja ja toteuttajat</h2><p className="text-foreground leading-relaxed max-w-2xl">{service.ownCoach}</p><p className="text-foreground font-semibold text-lg mt-5">{service.providers.join(" · ")}</p></div>
        <div className="flex flex-col items-start justify-center gap-4"><Button variant="outline" size="lg" asChild className={anchorClass}><a href={brochure.url} target="_blank" rel="noopener noreferrer"><FileDown aria-hidden="true" /> Avaa palvelun esite (PDF)</a></Button><p className="text-sm text-foreground">Esite suomeksi, ruotsiksi ja englanniksi.</p><Button variant="cta" size="lg" asChild className={anchorClass}><a href="#mukaan">Näin pääset mukaan <ArrowRight aria-hidden="true" /></a></Button></div>
      </div>
    </section>
  </Layout>;
}
