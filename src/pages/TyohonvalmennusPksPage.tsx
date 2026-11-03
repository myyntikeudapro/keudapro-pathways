import { ArrowLeft, ArrowRight, Check, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import photo from "@/assets/tyohonvalmennus-pks.jpg.asset.json";
import brochure from "@/assets/tyohonvalmennus-pks-esite.pdf.asset.json";
import service from "@/data/tyohonvalmennusPks.json";

export default function TyohonvalmennusPksPage() {
  return (
    <Layout>
      <SEO title={`${service.title} | KeudaPRO`} description={service.description} path={service.path} jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description, url: `https://keudapro.fi${service.path}`, provider: { "@type": "Organization", name: "KeudaPRO" }, areaServed: service.cities.map(name => ({ "@type": "City", name })), offers: { "@type": "Offer", price: service.priceEuros, priceCurrency: "EUR" } }} />
      <section className="pks-coaching-hero relative isolate overflow-hidden">
        <img src={photo.url} alt="Työnhakija keskustelee oman valmentajan kanssa" width={2250} height={2250} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-top" />
        <div className="pks-coaching-shade absolute inset-0 -z-10" />
        <div className="keuda-container py-8 md:py-12">
          <Button variant="link" asChild className="text-primary-foreground px-0 mb-10 md:mb-16"><Link to="/noste"><ArrowLeft aria-hidden="true" /> Noste</Link></Button>
          <div className="max-w-xl">
            <p className="text-primary-foreground font-semibold text-lg mb-3">Kohti työtä</p>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">Työnhakijan yksilövalmennus</h1>
            <p className="text-primary-foreground mt-4 text-lg font-semibold">Pääkaupunkiseutu · Helsinki, Espoo ja Vantaa</p>
            <p className="text-primary-foreground mt-5 text-base md:text-lg leading-relaxed max-w-md">Oma valmentaja, selkeä suunnitelma ja tukea työn alkuun. Maksuton palvelu oman työllisyyspalvelusi kautta.</p>
            <Button variant="cta" size="lg" asChild className="mt-7 max-w-full px-5"><a href="#mukaan">Näin pääset mukaan <ArrowRight aria-hidden="true" /></a></Button>
          </div>
        </div>
      </section>
      <section className="bg-keuda-teal-light border-b border-border">
        <dl className="keuda-container grid grid-cols-2 md:grid-cols-4 gap-6 py-7 md:py-9">
          {[['Hinta', `${service.priceEuros} € – maksuton`], ['Kesto', `${service.durationMonths.min}–${service.durationMonths.max} kuukautta`], ['Hakuaika', 'Jatkuva'], ['Tapaamiset', 'Etänä tai lähitapaamisina']].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground mb-1">{label}</dt><dd className="font-semibold text-foreground">{value}</dd></div>)}
        </dl>
      </section>
      <section className="py-14 md:py-20">
        <div className="keuda-container grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-20">
          {service.sections.slice(0, 2).map(section => <div key={section.title}><h2 className="text-2xl md:text-3xl text-primary font-bold mb-5 leading-tight">{section.title}</h2>{section.paragraphs.map(text => <p key={text} className="text-muted-foreground leading-relaxed mb-4">{text}</p>)}</div>)}
        </div>
      </section>
      <section className="bg-muted py-14 md:py-20">
        <div className="keuda-container grid lg:grid-cols-2 gap-10 lg:gap-20">
          <div><h2 className="text-2xl md:text-3xl font-bold text-primary mb-5">{service.sections[2].title}</h2>{service.sections[2].paragraphs.map(text => <p key={text} className="text-muted-foreground leading-relaxed mb-4">{text}</p>)}</div>
          <div><h3 className="text-xl font-bold text-foreground mb-5">Valmennuksen teemat</h3><ul className="space-y-4">{service.themes.map(theme => <li key={theme} className="flex gap-3 text-foreground"><Check className="text-primary h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span>{theme}</span></li>)}</ul></div>
        </div>
      </section>
      <section id="mukaan" className="scroll-mt-24 bg-keuda-teal-section py-14 md:py-20">
        <div className="keuda-container">
          <p className="text-primary font-semibold text-sm mb-3">Jatkuva haku · Ei omaa ilmoittautumislomaketta</p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-9">Näin pääset mukaan</h2>
          <ol className="grid md:grid-cols-3 gap-8 md:gap-10">{service.steps.map((step, index) => <li key={step.title} className="border-t border-primary/30 pt-5"><span className="text-3xl font-bold text-primary">0{index + 1}</span><h3 className="text-xl font-bold mt-4 mb-3 text-foreground">{step.title}</h3><p className="text-foreground leading-relaxed">{step.text}</p></li>)}</ol>
          <div className="mt-10 pt-7 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <Button variant="outline" size="lg" asChild className="self-start max-w-full px-5"><a href={brochure.url} target="_blank" rel="noopener noreferrer"><FileDown aria-hidden="true" /> Avaa palvelun esite (PDF)</a></Button>
            <p className="text-sm text-foreground">Esite suomeksi, ruotsiksi ja englanniksi.</p>
          </div>
        </div>
      </section>
      <section className="py-14 md:py-20">
        <div className="keuda-container grid md:grid-cols-2 gap-x-16 gap-y-9">{service.sections.slice(3, 6).map(section => <div key={section.title}><h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>{section.paragraphs.map(text => <p key={text} className="text-muted-foreground leading-relaxed mb-3">{text}</p>)}</div>)}</div>
      </section>
      <section className="bg-muted py-12 md:py-16">
        <div className="keuda-container"><h2 className="text-2xl font-bold text-primary mb-5">Palvelun toteuttajat</h2><p className="text-xl font-semibold text-foreground mb-6">KeudaPRO · Valo-Valmennusyhdistys · Wulff Pro</p>{service.sections[6].paragraphs.map(text => <p key={text} className="max-w-3xl text-muted-foreground leading-relaxed mb-3">{text}</p>)}</div>
      </section>
    </Layout>
  );
}