import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HubLoginModal } from "@/components/hub/HubLoginModal";

type ProjectStatus = "live" | "pilot" | "coming";

interface Project {
  id: string;
  icon: string;
  status: ProjectStatus;
  statusLabel: string;
  name: string;
  description: string;
  tags: { label: string; muted?: boolean }[];
  meta: string;
  ctaLabel: string;
  featured?: boolean;
}

const standardProjects: Project[] = [
  {
    id: "ai-manager",
    icon: "🎓",
    status: "pilot",
    statusLabel: "Pilotti",
    name: "AI-Manager-ohjelma",
    description: "Esihenkilöiden ja päälliköiden tekoälyvalmennusohjelma. 8 ohjattua päivää, 3 workshopia, henkilökohtainen sparraus.",
    tags: [{ label: "Keuda-konserni" }],
    meta: "4 starttia 2026",
    ctaLabel: "Kirjaudu →",
  },
  {
    id: "ai-director",
    icon: "🏛",
    status: "pilot",
    statusLabel: "Pilotti",
    name: "AI-Director-ohjelma",
    description: "Johtoryhmätason valmennus tekoälyn strategiseen hyödyntämiseen. Konkretiaa johtajille — ei teknisiä osuuksia.",
    tags: [{ label: "Keuda-konserni" }],
    meta: "Syksy 2026",
    ctaLabel: "Kirjaudu →",
  },
  {
    id: "hallitusraportointi",
    icon: "📊",
    status: "coming",
    statusLabel: "Tulossa",
    name: "Hallitusraportointi",
    description: "Johdon raporttien automatisointi ja hallitusesitysten rakentaminen KeudaPRO-brändin mukaisesti.",
    tags: [{ label: "Avautuu 2026", muted: true }],
    meta: "Q3 2026",
    ctaLabel: "Ilmoittaudu jonoon",
  },
  {
    id: "koulutussivut",
    icon: "🌐",
    status: "coming",
    statusLabel: "Tulossa",
    name: "Koulutussivujen rakentaja",
    description: "Koulutuskuvausten automaattinen muuntaminen verkkosivuiksi — yhtenäinen rakenne, asiakaslähtöinen teksti.",
    tags: [{ label: "Avautuu 2026", muted: true }],
    meta: "Q4 2026",
    ctaLabel: "Ilmoittaudu jonoon",
  },
];

function statusClasses(status: ProjectStatus) {
  switch (status) {
    case "live":
      return "bg-[hsl(var(--keuda-teal))]/15 text-[hsl(var(--keuda-teal))] border border-[hsl(var(--keuda-teal))]/30";
    case "pilot":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "coming":
      return "bg-muted text-muted-foreground border border-border";
  }
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
    if (p.status === "coming") {
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
        description="KeudaPRO HUB on kehitysalusta organisaatioille, jotka rakentavat tekoälymuutostaan ohjatusti. AI-transformaationäkymä, AI-Manager- ja AI-Director-ohjelmat."
        path="/hub"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[hsl(var(--keuda-blue-light))] via-background to-[hsl(var(--keuda-teal-light))] overflow-hidden">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(var(--keuda-blue))] mb-4">
              Kehitysalusta
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              KeudaPRO HUB
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left sm:text-center">
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">1</div>
                  <div className="text-sm text-muted-foreground mt-1">Live-projekti</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--keuda-blue))]">53</div>
                  <div className="text-sm text-muted-foreground mt-1">Osallistujaa pilotissa</div>
                </div>
                <div className="flex items-center sm:justify-center">
                  <div className="text-sm text-muted-foreground italic">
                    Keuda-konserni ensimmäisenä pilottiasiakkaana
                  </div>
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
          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden mb-6 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="grid md:grid-cols-[1.4fr_1fr]">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl" aria-hidden>🧭</div>
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
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--keuda-blue-light))] text-[hsl(var(--keuda-blue))]">
                    Keuda-konserni
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground">
                    + tulossa
                  </span>
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
                  "rounded-xl border border-border bg-card shadow-[var(--shadow-card)] p-6 md:p-7 flex flex-col hover:shadow-[var(--shadow-card-hover)] transition-shadow",
                  p.status === "coming" && "opacity-80"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl" aria-hidden>{p.icon}</div>
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusClasses(p.status))}>
                    {p.statusLabel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tags.map((t) => (
                    <span
                      key={t.label}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        t.muted
                          ? "border border-dashed border-border text-muted-foreground"
                          : "bg-[hsl(var(--keuda-blue-light))] text-[hsl(var(--keuda-blue))]"
                      )}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 mt-auto">
                  <Button
                    variant={p.status === "coming" ? "outline" : "cta"}
                    size="default"
                    onClick={() => handleCardCta(p)}
                    className="min-h-[44px]"
                  >
                    {p.ctaLabel}
                  </Button>
                  <span className="text-xs text-muted-foreground">{p.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="py-16 md:py-24 bg-[#0B0B0B] text-white scroll-mt-20">
        <div className="keuda-container">
          <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--keuda-teal))] mb-10">
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
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--keuda-teal))] flex items-center justify-center font-bold text-white text-lg shrink-0">
                  HK
                </div>
                <div>
                  <div className="font-semibold">Heikki Kallunki</div>
                  <div className="text-sm text-white/60">Toimitusjohtaja, KeudaPRO</div>
                  <a href="tel:+358401906912" className="text-sm text-[hsl(var(--keuda-teal))] hover:underline">
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
                    className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="hub-ln">Sukunimi</label>
                  <input id="hub-ln" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-org">Organisaatio</label>
                <input id="hub-org" required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-em">Sähköposti</label>
                <input id="hub-em" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-int">Mistä haluaisit kuulla enemmän?</label>
                <select id="hub-int" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}
                  className="w-full h-11 rounded-md bg-white/5 border border-white/15 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]">
                  <option value="" className="bg-[#0B0B0B]">Valitse...</option>
                  <option className="bg-[#0B0B0B]">AI-transformaationäkymä</option>
                  <option className="bg-[#0B0B0B]">AI-Manager-ohjelma</option>
                  <option className="bg-[#0B0B0B]">AI-Director-ohjelma</option>
                  <option className="bg-[#0B0B0B]">Kaikki palvelut — yleinen demo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="hub-msg">Lisätietoja tai kysymyksiä...</label>
                <textarea id="hub-msg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-md bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--keuda-teal))]" />
              </div>
              <Button type="submit" variant="cta" size="lg" className="w-full sm:w-auto">
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
