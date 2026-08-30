import { Button } from "@/components/ui/button";
import { AI_LEVELS } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";

export function AlyDefinition() {
  return (
    <section className="py-14 md:py-20">
      <div className="keuda-container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Tekoälyosaaminen
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
            Mitä tekoälypätevyys tarkoittaa?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            KeudaPROn tekoälypätevyydet ovat työelämälähtöisiä koulutusohjelmia, joissa osaamista
            rakennetaan oman työn ja vastuun näkökulmasta. Tavoitteena ei ole opetella vain yhtä
            työkalua, vaan kehittää kykyä käyttää, soveltaa, kehittää ja johtaa tekoälyä työelämässä.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            Tekoälypätevyydet ovat KeudaPROn omia koulutusohjelmia. Ne eivät ole viranomaisen
            määrittelemiä tai lakisääteisiä pätevyyksiä.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AlyLevels() {
  return (
    <section
      id="tekoalypatevyydet"
      className="py-14 md:py-20 bg-accent/60 border-y border-border/60"
      style={{ scrollMarginTop: 110 }}
    >
      <div className="keuda-container">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Pätevyyspolku
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            Kolme tekoälypätevyyttä
          </h2>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {AI_LEVELS.map((level, i) => (
            <article
              key={level.id}
              id={level.anchor}
              style={{ scrollMarginTop: 110 }}
              className="group rounded-2xl border border-border bg-card overflow-hidden md:flex shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
            >
              <div className="md:w-72 md:shrink-0 relative overflow-hidden">
                <img
                  src={level.image}
                  alt={`${level.name} – ${level.fi} -koulutus`}
                  loading="lazy"
                  className="w-full h-44 md:h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-foreground/85 text-background text-sm font-bold backdrop-blur-sm">
                  {i + 1}
                </span>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  {level.name} – {level.fi}
                </h3>
                <p className="text-primary font-semibold mb-4">{level.promise}</p>
                <p className="text-muted-foreground leading-relaxed mb-5">{level.intro}</p>


                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Kenelle</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      {level.audience.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Mitä osaaminen tarkoittaa</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      {level.content.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <blockquote className="border-l-4 border-primary pl-4 text-sm text-foreground mb-5">
                  Tämä voi olla sinun tasosi, jos ajattelet: <em>”{level.quote}”</em>
                </blockquote>

                <Button variant="cta" asChild>
                  <a
                    href={level.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent(level.event);
                      trackEvent("course_registration_click", { level: level.id });
                    }}
                  >
                    {level.cta} →
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const rows = [
  { label: "Päätehtävä", c: "Käyttää ja soveltaa", m: "Kehittää ja johtaa", d: "Linjaa ja mahdollistaa" },
  { label: "Näkökulma", c: "Oma työ ja tiimi", m: "Prosessit ja organisaatio", d: "Strategia ja johtaminen" },
  { label: "Käytännön AI-ratkaisut", c: "Rakentaa", m: "Kehittää ja skaalaa", d: "Arvioi vaikutuksia" },
  { label: "AI-agentit", c: "Käyttää ja rakentaa", m: "Kehittää kokonaisuuksia", d: "Ymmärtää mahdollisuudet" },
  { label: "Prosessit", c: "Tunnistaa ja kokeilee", m: "Kehittää", d: "Priorisoi" },
  { label: "Osaaminen", c: "Tukee muita", m: "Rakentaa osaamista", d: "Varmistaa kyvykkyydet" },
  { label: "Tyypillinen rooli", c: "Asiantuntija / esihenkilö", m: "Päällikkö / kehittäjä", d: "Johto / johtoryhmä" },
];

export function AlyComparison() {
  return (
    <section id="vertaa-tasoja" className="py-12 md:py-16" style={{ scrollMarginTop: 110 }}>
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Miten tasot eroavat toisistaan?
        </h2>

        {/* Desktop: taulukko */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              AI Coordinator-, AI Manager- ja AI Director -tasojen vertailu
            </caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="text-left p-3 font-bold text-foreground"> </th>
                <th scope="col" className="text-left p-3 font-bold text-foreground">AI Coordinator</th>
                <th scope="col" className="text-left p-3 font-bold text-foreground">AI Manager</th>
                <th scope="col" className="text-left p-3 font-bold text-foreground">AI Director</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "bg-muted/40" : "bg-card"}>
                  <th scope="row" className="text-left p-3 font-semibold text-foreground">
                    {r.label}
                  </th>
                  <td className="p-3 text-muted-foreground">{r.c}</td>
                  <td className="p-3 text-muted-foreground">{r.m}</td>
                  <td className="p-3 text-muted-foreground">{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobiili: kortit */}
        <div className="md:hidden flex flex-col gap-4">
          {AI_LEVELS.map((level) => {
            const key = level.id === "coordinator" ? "c" : level.id === "manager" ? "m" : "d";
            return (
              <div key={level.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-bold text-foreground mb-3">{level.name}</h3>
                <dl className="text-sm space-y-2">
                  {rows.map((r) => (
                    <div key={r.label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{r.label}</dt>
                      <dd className="font-medium text-foreground text-right">
                        {r[key as "c" | "m" | "d"]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button
            variant="outline-primary"
            onClick={() => {
              trackEvent("ai_assessment_start", { source: "comparison" });
              const el = document.getElementById("loyda-oma-tasosi");
              if (el)
                window.scrollTo({
                  top: el.getBoundingClientRect().top + window.scrollY - 110,
                  behavior: "smooth",
                });
            }}
          >
            En tiedä vielä – auta löytämään oikea taso
          </Button>
        </div>
      </div>
    </section>
  );
}
