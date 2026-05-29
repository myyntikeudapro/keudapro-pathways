import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HubLoginModal } from "@/components/hub/HubLoginModal";
import imgAiTransform from "@/assets/hub-ai-transform.png";
import keudaLogo from "@/assets/keuda-logo.png";
import imgArpro from "@/assets/hub-arpro.jpg";
import imgAukee from "@/assets/hub-aukee.jpg";
import imgKuuma from "@/assets/hub-kuuma.jpg";
import imgAiDirector from "@/assets/hub-ai-director.jpg";

type ProjectStatus = "live" | "pilot" | "prep" | "coming";

interface Customer {
  initials: string;
  name: string;
  tone?: "blue" | "teal" | "amber" | "violet" | "rose" | "lime";
}

interface Project {
  id: string;
  icon: string;
  status: ProjectStatus;
  statusLabel: string;
  name: string;
  description: string;
  customers: Customer[];
  meta: string;
  ctaLabel: string;
  image: string;
}

const toneClasses: Record<NonNullable<Customer["tone"]>, string> = {
  blue: "bg-[hsl(var(--keuda-blue))] text-white",
  teal: "bg-[hsl(var(--keuda-teal))] text-white",
  amber: "bg-amber-500 text-white",
  violet: "bg-violet-600 text-white",
  rose: "bg-rose-500 text-white",
  lime: "bg-lime-600 text-white",
};

const standardProjects: Project[] = [
  {
    id: "arpro",
    icon: "",
    status: "pilot",
    statusLabel: "Pilotti käynnissä",
    name: "ARPRO 2.0 -pilotti",
    description:
      "Tekoälyyn ja dataan perustuva työllisyyden edistämisen työkalu kunnalle (tarkentuu kun sopimus valmis). ARPRO tunnistaa työnhakijan vahvuudet, osaamisvajeet ja optimaalisen työllistymisreitin sekä aktivoi piilotyöpaikkamarkkinaa — oikea tuki, oikealle ihmiselle, oikeaan aikaan.",
    customers: [{ initials: "K", name: "Kunta (tarkentuu)", tone: "blue" }],
    meta: "Päättyy 5/2026",
    ctaLabel: "Kirjaudu →",
    image: imgArpro,
  },
  {
    id: "arpro-2",
    icon: "",
    status: "prep",
    statusLabel: "Neuvottelussa",
    name: "ARPRO 2.0 -pilotti",
    description:
      "Tekoälyyn ja dataan perustuva työllisyyden edistämisen työkalu toiselle kunnalle (tarkentuu kun sopimus valmis). Sama dataperusteinen arviointi- ja ohjausmalli, joka yhdistää työnhakijoiden osaamisprofiilit avoimiin ja piilotyöpaikkoihin alueellisen työllisyysstrategian tueksi.",
    customers: [{ initials: "K", name: "Kunta (tarkentuu)", tone: "teal" }],
    meta: "Sopimusneuvottelu",
    ctaLabel: "Ilmoittaudu jonoon",
    image: imgArpro,
  },
  {
    id: "aukee",
    icon: "",
    status: "prep",
    statusLabel: "Valmisteilla",
    name: "Aukee – Mahis -pilotti",
    description:
      "Uudenlainen kohtaamispinta henkilöiden ja yritysten välille. Pilotti valmisteilla — henkilö- ja yritysrajapinta avautuu elokuussa 2026.",
    customers: [{ initials: "AU", name: "Aukee", tone: "violet" }],
    meta: "Avautuu 8/2026",
    ctaLabel: "Ilmoittaudu jonoon",
    image: imgAukee,
  },
  {
    id: "kuuma",
    icon: "",
    status: "prep",
    statusLabel: "Pilotti rakentuu",
    name: "KUUMA-tilannekuva",
    description:
      "Alueellinen Dashboard KUUMA-seudulle — uudenlainen tilannekuva päätöksenteon tueksi. 1.0-julkaisu syksyllä 2026, erillinen julkinen Foorumi-tilaisuus valmisteilla.",
    customers: [{ initials: "KU", name: "KUUMA-seutu", tone: "teal" }],
    meta: "1.0 syksyllä 2026",
    ctaLabel: "Ilmoittaudu jonoon",
    image: imgKuuma,
  },
  {
    id: "hallitusraportointi",
    icon: "",
    status: "coming",
    statusLabel: "Tulossa",
    name: "Hallitusraportointi",
    description:
      "Johdon raporttien automatisointi ja hallitusesitysten rakentaminen KeudaPRO-brändin mukaisesti.",
    customers: [{ initials: "—", name: "Avautuu 2026", tone: "amber" }],
    meta: "Q3 2026",
    ctaLabel: "Ilmoittaudu jonoon",
    image: imgAiDirector,
  },
  {
    id: "koulutussivut",
    icon: "",
    status: "coming",
    statusLabel: "Tulossa",
    name: "Koulutussivujen rakentaja",
    description:
      "Koulutuskuvausten automaattinen muuntaminen verkkosivuiksi — yhtenäinen rakenne, asiakaslähtöinen teksti.",
    customers: [{ initials: "—", name: "Avautuu 2026", tone: "lime" }],
    meta: "Q4 2026",
    ctaLabel: "Ilmoittaudu jonoon",
    image: imgArpro,
  },
];

function statusClasses(status: ProjectStatus) {
  switch (status) {
    case "live":
      return "bg-[hsl(var(--keuda-teal))]/15 text-[hsl(var(--keuda-teal))] border border-[hsl(var(--keuda-teal))]/30";
    case "pilot":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "prep":
      return "bg-violet-100 text-violet-800 border border-violet-200";
    case "coming":
      return "bg-muted text-muted-foreground border border-border";
  }
}

function CustomerLogo({ customer, size = "md" }: { customer: Customer; size?: "sm" | "md" }) {
  const tone = customer.tone ?? "blue";
  const dim = size === "sm" ? "w-8 h-8 text-[10px]" : "w-10 h-10 text-xs";
  return (
    <div className="flex items-center gap-2" title={customer.name}>
      <div
        className={cn(
          "rounded-md flex items-center justify-center font-bold tracking-wide shadow-sm ring-1 ring-black/5",
          dim,
          toneClasses[tone]
        )}
        aria-hidden
      >
        {customer.initials}
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[160px]">{customer.name}</span>
    </div>
  );
}

const HubPage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const contactRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
    interest: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openLogin = (project: { id: string; name: string }) => {
    setActiveProject(project);
    setLoginOpen(true);
  };

  const handleCardCta = (p: Project) => {
    if (p.status === "coming" || p.status === "prep") {
      scrollToContact();
    } else {
      openLogin({ id: p.id, name: p.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`KeudaPRO HUB – yhteydenotto: ${form.interest || "yleinen"}`);
    const body = encodeURIComponent(
      `Nimi: ${form.firstName} ${form.lastName}\nOrganisaatio: ${form.organization}\nSähköposti: ${form.email}\nKiinnostus: ${form.interest}\n\n${form.message}`
    );
    window.location.href = `mailto:heikki.kallunki@keuda.fi?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <Layout>
      <SEO
        title="KeudaPRO HUB — Kehitysalusta"
        description="KeudaPRO HUB on kehitysalusta organisaatioille, jotka rakentavat tekoälymuutostaan ohjatusti. AI-transformaationäkymä, ARPRO 2.0, Aukee ja KUUMA-tilannekuva."
        path="/hub"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[hsl(var(--keuda-blue-light))] via-background to-[hsl(var(--keuda-teal-light))]">
        {/* Decorative grid + glow */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--keuda-blue)/0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--keuda-blue)/0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[hsl(var(--keuda-teal))]/15 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[hsl(var(--keuda-blue))]/15 blur-3xl pointer-events-none" aria-hidden />

        <div className="keuda-container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[hsl(var(--keuda-blue))] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--keuda-teal))] animate-pulse" />
              Kehitysalusta
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              KeudaPRO <span className="bg-gradient-to-r from-[hsl(var(--keuda-blue))] to-[hsl(var(--keuda-teal))] bg-clip-text text-transparent">HUB</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Digitaaliset kehitysprojektit organisaatioille — yksi portti, omat projektit. Olemassa olevat asiakkaat kirjautuvat suoraan omaan projektiinsa.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <Button variant="cta" size="lg" onClick={() => openLogin({ id: null, name: "Kirjaudu sisään" })}>
                Kirjaudu sisään
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToContact}>
                Varaa demo
              </Button>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center">
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">1</div>
                  <div className="text-xs text-muted-foreground mt-1">Live-projekti</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">1</div>
                  <div className="text-xs text-muted-foreground mt-1">Pilotti käynnissä</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">3</div>
                  <div className="text-xs text-muted-foreground mt-1">Pilottia valmisteilla</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">53</div>
                  <div className="text-xs text-muted-foreground mt-1">Osallistujaa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 md:py-24">
        <div className="keuda-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--keuda-teal))] mb-3">
                Projektit
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Kehitysprojektit & palvelut
              </h2>
            </div>
            <p className="text-sm text-muted-foreground md:text-right md:max-w-xs">
              Jokaisella asiakkaalla oma kirjautuminen omaan kehitysprojektiin.
            </p>
          </div>

          {/* Featured */}
          <div className="group relative rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden mb-8 hover:shadow-[var(--shadow-card-hover)] transition-all">
            <div className="grid md:grid-cols-[180px_1.4fr_1fr]">
              {/* Edge image */}
              <div className="relative h-40 md:h-auto overflow-hidden">
                <img
                  src={imgAiTransform}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={1024}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 md:to-card" aria-hidden />
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusClasses("live"))}>
                    Live — pilotti
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  AI-transformaationäkymä
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Strateginen kojelauta organisaation tekoälytransformaatiolle. Käyttötapausten hallinta, prosessikartta, AI-analyysi ja johdon ROI-näkymä.
                </p>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={keudaLogo}
                    alt="Keuda"
                    className="h-7 w-auto object-contain"
                    loading="lazy"
                  />
                  <span className="text-xs text-muted-foreground">Keuda-konserni</span>
                </div>
                <Button variant="cta" size="lg" onClick={() => openLogin({ id: "ai-transform", name: "AI-transformaationäkymä" })}>
                  Kirjaudu →
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Keuda · pilotti käynnissä</p>
              </div>

              <div className="bg-muted/50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-border">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">
                  Pilotin tila
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-3xl font-bold text-foreground">53</div>
                    <div className="text-xs text-muted-foreground mt-1">osallistujaa koulutuksessa</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">18</div>
                    <div className="text-xs text-muted-foreground mt-1">prosessia kartoitettu</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">4</div>
                    <div className="text-xs text-muted-foreground mt-1">starttia 2026</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[hsl(var(--keuda-teal))]">↑ live</div>
                    <div className="text-xs text-muted-foreground mt-1">pilotti aktiivisena</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standard grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {standardProjects.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "group relative rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all",
                  p.status === "coming" && "opacity-90"
                )}
              >
                <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[120px_1fr]">
                  {/* Edge image strip */}
                  <div className="relative overflow-hidden">
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      width={512}
                      height={1024}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card" aria-hidden />
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusClasses(p.status))}>
                        {p.statusLabel}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">{p.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mb-5">
                      {p.customers.map((c) => (
                        <CustomerLogo key={c.name} customer={c} size="sm" />
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-auto">
                      <Button
                        variant={p.status === "coming" || p.status === "prep" ? "outline" : "cta"}
                        size="default"
                        onClick={() => handleCardCta(p)}
                        className="min-h-[44px]"
                      >
                        {p.ctaLabel}
                      </Button>
                      <span className="text-xs text-muted-foreground text-right">{p.meta}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="py-16 md:py-24 bg-[#0B0B0B] text-white scroll-mt-20">
        <div className="keuda-container">
          <div className="text-xs font-bold uppercase tracking-wider text-keuda-orange mb-10">
            Ota yhteyttä
          </div>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
                Kiinnostuitko?<br />Jutellaan.
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Varaa 30 minuutin demo tai ota yhteyttä suoraan. Kerromme miten KeudaPRO HUB sopii teidän organisaatiollenne.
              </p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-keuda-orange flex items-center justify-center font-bold text-[#0B0B0B] text-lg shrink-0">
                  HK
                </div>
                <div>
                  <div className="font-semibold">Heikki Kallunki</div>
                  <div className="text-sm text-white/60">Toimitusjohtaja, KeudaPRO</div>
                  <a href="tel:+358401906912" className="text-sm text-keuda-orange hover:underline">
                    040 190 6912
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="hub-fn">Etunimi</label>
                  <input id="hub-fn" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-keuda-orange" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="hub-ln">Sukunimi</label>
                  <input id="hub-ln" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-keuda-orange" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-org">Organisaatio</label>
                <input id="hub-org" required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-keuda-orange" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-em">Sähköposti</label>
                <input id="hub-em" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-keuda-orange" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-int">Mistä haluaisit kuulla enemmän?</label>
                <select id="hub-int" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white focus:outline-none focus:ring-2 focus:ring-keuda-orange">
                  <option value="" className="bg-[#0B0B0B]">Valitse...</option>
                  <option className="bg-[#0B0B0B]">AI-transformaationäkymä</option>
                  <option className="bg-[#0B0B0B]">AI-Manager-ohjelma</option>
                  <option className="bg-[#0B0B0B]">AI-Director-ohjelma</option>
                  <option className="bg-[#0B0B0B]">ARPRO 2.0 -pilotti</option>
                  <option className="bg-[#0B0B0B]">Aukee – Mahis -pilotti</option>
                  <option className="bg-[#0B0B0B]">KUUMA-tilannekuva</option>
                  <option className="bg-[#0B0B0B]">Kaikki palvelut — yleinen demo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-msg">Lisätietoja tai kysymyksiä...</label>
                <textarea id="hub-msg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-keuda-orange" />
              </div>
              <Button type="submit" variant="cta" size="lg" className="w-full sm:w-auto bg-keuda-orange text-[#0B0B0B] hover:bg-keuda-orange/90">
                {sent ? "Kiitos!" : "Lähetä viesti →"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <HubLoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        projectId={activeProject.id}
        projectName={activeProject.name}
        onContactClick={scrollToContact}
      />
    </Layout>
  );
};

export default HubPage;
