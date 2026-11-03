import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import training from "@/data/aseptiikka.json";
import photo from "@/assets/course-aseptiikka.jpg";

export default function AseptiikkaPage() {
  const mailHref = `mailto:${training.contactEmail}?subject=${encodeURIComponent("Tarjouspyyntö: Aseptiikka hoitotyössä")}&body=${encodeURIComponent("Hei,\n\nPyydän tarjouksen Aseptiikka hoitotyössä -koulutuksesta.\n\nOrganisaatio ja yksiköt:\nArvio osallistujamäärästä:\nToiveajankohdat:\nErityistoiveet ja kysymykset:\n\nYhteyshenkilö ja puhelinnumero:\n")}`;
  const renderSection = (section: typeof training.sections[number]) => <div key={section.title}><h2 className="text-2xl md:text-3xl font-bold text-primary mb-5">{section.title}</h2>{section.paragraphs.map(text => <p key={text} className="text-foreground leading-relaxed mb-4">{text}</p>)}</div>;
  return <Layout>
    <SEO title={`${training.title} – etäkoulutus | KeudaPRO`} description={training.description} path={training.path} jsonLd={{ "@context": "https://schema.org", "@type": "Course", name: training.title, description: training.description, url: `https://keudapro.fi${training.path}`, provider: { "@type": "Organization", name: "KeudaPRO" }, timeRequired: "PT2H", courseMode: "online", inLanguage: "fi" }} />
    <section className="relative isolate overflow-hidden">
      <img src={photo} alt="Hoitohenkilöstö harjoittelee käsihygieniaa hoivaympäristössä" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
      <div className="pks-coaching-shade absolute inset-0 -z-10" />
      <div className="keuda-container py-10 md:py-14">
        <Button variant="link" asChild className="text-primary-foreground px-0 mb-12"><Link to="/osaaminen#patevyyskoulutukset"><ArrowLeft aria-hidden="true" /> Osaaminen</Link></Button>
        <div className="max-w-xl pb-6 md:pb-10">
          <p className="text-primary-foreground font-semibold mb-4">Sosiaali- ja terveysala · Tilauskoulutus</p>
          <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-foreground">{training.title}</h1>
          <p className="text-xl text-primary-foreground mt-5 font-semibold">Etäkoulutus hoiva- ja hoitohenkilöstölle</p>
          <p className="text-primary-foreground text-lg leading-relaxed mt-5 max-w-lg">Käsihygienia, suojaimet ja turvallinen toiminta tartuntavaaratilanteissa – yhteinen osaaminen koko henkilöstölle kahdessa tunnissa.</p>
          <Button variant="cta" size="lg" asChild className="mt-8"><a href="#tarjous">Pyydä tarjous <ArrowRight aria-hidden="true" /></a></Button>
        </div>
      </div>
    </section>
    <section className="bg-keuda-teal-section border-b border-border"><dl className="keuda-container grid grid-cols-2 md:grid-cols-4 gap-6 py-8">{[["Kesto", `${training.durationHours} tuntia`], ["Toteutus", "Microsoft Teams"], ["Osallistujat", "Ei osallistujarajaa"], ["Ajankohta", "Sovitaan organisaatiolle"]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground mb-2">{label}</dt><dd className="text-foreground font-semibold">{value}</dd></div>)}</dl></section>
    <section className="py-14 md:py-20"><div className="keuda-container grid lg:grid-cols-2 gap-10 lg:gap-20">{training.sections.slice(0, 2).map(renderSection)}</div></section>
    <section className="bg-muted py-14 md:py-20"><div className="keuda-container"><h2 className="text-3xl font-bold text-primary mb-9">Tietoa koulutuksesta</h2><div className="grid lg:grid-cols-2 gap-10 lg:gap-20">{renderSection(training.sections[2])}<div><h3 className="text-xl font-bold text-foreground mb-5">Koulutuksen teemat</h3><ul className="space-y-4">{training.themes.map(theme => <li key={theme} className="flex gap-3"><Check className="h-5 w-5 text-primary shrink-0 mt-1" aria-hidden="true" /><span className="leading-relaxed">{theme}</span></li>)}</ul></div></div></div></section>
    <section className="py-14 md:py-20"><div className="keuda-container grid lg:grid-cols-2 gap-10 lg:gap-20">{training.sections.slice(3, 5).map(renderSection)}</div></section>
    <section className="bg-keuda-teal-section py-14 md:py-20"><div className="keuda-container max-w-3xl">{renderSection(training.sections[5])}{renderSection(training.sections[6])}</div></section>
    <section id="tarjous" className="scroll-mt-24 py-14 md:py-20"><div className="keuda-container"><p className="text-primary font-semibold mb-3">Maksullinen koulutus yrityksille ja organisaatioille</p><h2 className="text-3xl md:text-4xl font-bold text-primary mb-9">Tilaa koulutus organisaatiollesi</h2><ol className="grid md:grid-cols-3 gap-8">{training.steps.map((step, index) => <li key={step.title} className="border-t border-border pt-5"><span className="text-3xl font-bold text-primary">0{index + 1}</span><h3 className="text-xl font-bold mt-4 mb-3">{step.title}</h3><p className="leading-relaxed">{step.text}</p></li>)}</ol><div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row sm:items-center gap-5"><Button variant="cta" size="lg" asChild className="self-start"><a href={mailHref} target="_blank" rel="noopener noreferrer"><Mail aria-hidden="true" /> Pyydä tarjous sähköpostilla</a></Button><a href={`mailto:${training.contactEmail}`} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{training.contactEmail}</a></div></div></section>
  </Layout>;
}