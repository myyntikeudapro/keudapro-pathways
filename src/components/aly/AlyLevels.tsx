import { Button } from "@/components/ui/button";
import { AI_LEVELS } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";

export function AlyDefinition() {
  return (
    <section className="py-12 md:py-16">
      <div className="keuda-container max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Mitä tekoälypätevyys tarkoittaa?
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          KeudaPROn tekoälypätevyydet ovat työelämälähtöisiä koulutusohjelmia, joissa osaamista
          rakennetaan oman työn ja vastuun näkökulmasta. Tavoitteena ei ole opetella vain yhtä
          työkalua, vaan kehittää kykyä käyttää, soveltaa, kehittää ja johtaa tekoälyä työelämässä.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Tekoälypätevyydet ovat KeudaPROn omia koulutusohjelmia. Ne eivät ole viranomaisen
          määrittelemiä tai lakisääteisiä pätevyyksiä.
        </p>
      </div>
    </section>
  );
}

export function AlyLevels() {
  return (
    <section id="tekoalypatevyydet" className="py-12 md:py-16 bg-[#E4F0EE]" style={{ scrollMarginTop: 110 }}>
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Kolme tekoälypätevyyttä
        </h2>

        <div className="flex flex-col gap-6">
          {AI_LEVELS.map((level) => (
            <article
              key={level.id}
              id={level.anchor}
              style={{ scrollMarginTop: 110 }}
              className="rounded-2xl border border-border bg-card overflow-hidden md:flex"
            >
              <div className="md:w-64 md:shrink-0">
                <img
                  src={level.image}
                  alt={`${level.name} – ${level.fi} -koulutus`}
                  loading="lazy"
                  className="w-full h-40 md:h-full object-cover"
                />
              </div>
              <div className="p-5 md:p-7 flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {level.name} – {level.fi}
                </h3>
                <p className="text-primary font-semibold mb-3">{level.promise}</p>
                <p className="text-muted-foreground leading-relaxed mb-4">{level.intro}</p>

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
